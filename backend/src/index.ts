import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from 'cloudinary'; // 🔥 Added Cloudinary

import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'golden_ref_secret_123';

// 1. Prisma Connection Setup
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 2. Gemini 3.1 Setup
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 🔥 Cloudinary Config
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

app.use(cors());
app.use(express.json());

// --- 3. AI DIAGNOSIS ROUTE (With History Saving) ---
app.post('/api/ai/diagnose', async (req, res) => {
  try {
    const { appliance, issue, userId } = req.body;
    if (!appliance || !issue) return res.status(400).json({ error: "Details dalo bhai!" });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview", 
      contents: `You are an expert technician for 'Golden Refrigeration'. 
      Diagnose this ${appliance} issue: ${issue}. 
      Give a professional diagnosis in Hinglish under 80 words.`,
    });

    const aiDiagnosis = response.text;

    if (userId) {
      await prisma.serviceBooking.create({
        data: {
          appliance,
          issue,
          aiDiagnosis,
          scheduledAt: new Date(),
          customer: { connect: { id: userId } }
        }
      });
    }

    res.json({ diagnosis: aiDiagnosis }); 
  } catch (error: any) {
    console.error("AI/DB Error:", error.message);
    res.status(500).json({ error: "AI logic failed", details: error.message });
  }
});

// 🔥 User History Route
app.get('/api/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await prisma.serviceBooking.findMany({
      where: { customerId: userId },
      orderBy: { scheduledAt: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "History fetch fail" });
  }
});

// --- AUTH & PRODUCTS ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { name, email, password: hashedPassword } });
    res.status(201).json({ message: "User created!" });
  } catch (error) { res.status(500).json({ error: "Registration failed" }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) { res.status(500).json({ error: "Login failed" }); }
});

// 🔥 Fixed Get Products Route
app.get('/api/products', async (req, res) => {
  try {
    // Note: Schema update ke baad hi 'createdAt' chalega
    const products = await prisma.product.findMany({
      orderBy: { id: 'desc' } // Temporary fallback if schema not updated
    });
    res.json(products);
  } catch (error) { res.status(500).json({ error: "Database error" }); }
});

// --- ADMIN ROUTES ---

// 1. Saare customers ki AI history
app.get('/api/admin/all-diagnoses', async (req, res) => {
  try {
    const allData = await prisma.serviceBooking.findMany({
      include: {
        customer: { select: { name: true, email: true } }
      },
      orderBy: { scheduledAt: 'desc' }
    });
    res.json(allData);
  } catch (error) {
    res.status(500).json({ error: "Data laane mein dikkat hui bhai!" });
  }
});

// 2. Dashboard Stats (Original Version)
app.get('/api/admin/stats-basic', async (req, res) => {
  try {
    const totalBookings = await prisma.serviceBooking.count();
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    res.json({ totalBookings, totalUsers, totalProducts });
  } catch (error) {
    res.status(500).json({ error: "Stats fetch failed" });
  }
});

// 3. Upgrade Stats with Latest Products & Appliance Pulse
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [totalBookings, totalUsers, totalProducts, latestUsers, latestProducts] = await Promise.all([
      prisma.serviceBooking.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      prisma.product.findMany({ take: 10, orderBy: { id: 'desc' } }) // 🔥 For Delete List
    ]);

    const applianceStats = await prisma.serviceBooking.groupBy({
      by: ['appliance'],
      _count: { _all: true }
    });
   
    res.json({ totalBookings, totalUsers, totalProducts, latestUsers, latestProducts, applianceStats });
  } catch (error) {
    res.status(500).json({ error: "Stats fetch failed" });
  }
});

// --- ADMIN: Inventory Actions ---

app.post('/api/admin/add-product', async (req, res) => {
  try {
    const { title, description, price, sellerId, imageUrl } = req.body;
    if (!title || !price || !sellerId) return res.status(400).json({ error: "Missing details!" });

    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        sellerId, 
        images: imageUrl ? [imageUrl] : [],
        status: 'AVAILABLE'
      }
    });
    res.status(201).json({ message: "Product added!", product: newProduct });
  } catch (error: any) {
    res.status(500).json({ error: "Product save fail" });
  }
});

app.delete('/api/admin/delete-product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: "Bhai, product nikaal diya gaya! 🗑️" });
  } catch (error) {
    res.status(500).json({ error: "Delete nahi ho paya bhai." });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is ACTIVE on http://localhost:${PORT}`);
});
