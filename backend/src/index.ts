
// import 'dotenv/config'; 
// import express from 'express';
// import cors from 'cors';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import pg from 'pg';
// import { PrismaPg } from '@prisma/adapter-pg';
// import { GoogleGenAI } from "@google/genai"; // Latest SDK

// // Prisma v7 Import Fix: Extension lagana zaroori hai
//  import { PrismaClient } from '@prisma/client';

// const app = express();
// const PORT = 5001;
// const JWT_SECRET = process.env.JWT_SECRET || 'golden_ref_secret_123';

// // 1. Prisma Connection Setup
// const pool = new pg.Pool({ 
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false } 
// });
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

// // 2. Latest Gemini AI Client
// // Documentation ke hisaab se apiKey property pass karni hai
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// app.use(cors());
// app.use(express.json());

// // --- 3. AI DIAGNOSIS ROUTE (Gemini 3.1 Flash-Lite) ---
// app.post('/api/ai/diagnose', async (req, res) => {
//   try {
//     const { appliance, issue } = req.body;
//     if (!appliance || !issue) return res.status(400).json({ error: "Details missing!" });

//     // Documentation wala naya syntax
//     const response = await ai.models.generateContent({
//       model: "gemini-3.1-flash-lite-preview", 
//       contents: `You are an expert technician for 'Golden Refrigeration'. Diagnose: ${appliance}, Issue: ${issue}. Hinglish reply under 80 words.`,
//     });

//     res.json({ diagnosis: response.text }); 
//   } catch (error: any) {
//     console.error("AI Error:", error.message);
//     res.status(500).json({ error: "AI diagnosis fail ho gaya.", details: error.message });
//   }
// });

// // --- AUTH & PRODUCTS ROUTES ---
// app.post('/api/auth/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await prisma.user.create({ data: { name, email, password: hashedPassword } });
//     res.status(201).json({ message: "User created!" });
//   } catch (error) { res.status(500).json({ error: "Signup failed" }); }
// });

// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ error: "Invalid Credentials" });
//     }
//     const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
//     res.json({ token, user: { id: user.id, name: user.name } });
//   } catch (error) { res.status(500).json({ error: "Login failed" }); }
// });

// app.get('/api/products', async (req, res) => {
//   try {
//     const products = await prisma.product.findMany();
//     res.json(products);
//   } catch (error) { res.status(500).json({ error: "Database error" }); }
// });

// // 4. Start Server
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`✅ Server is ACTIVE on http://localhost:${PORT}`);
// });





import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { GoogleGenAI } from "@google/genai";

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

app.use(cors());
app.use(express.json());

// --- 3. AI DIAGNOSIS ROUTE (With History Saving) ---
app.post('/api/ai/diagnose', async (req, res) => {
  try {
    const { appliance, issue, userId } = req.body;
    if (!appliance || !issue) return res.status(400).json({ error: "Details dalo bhai!" });

    // Latest Gemini 3 syntax
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview", 
      contents: `You are an expert technician for 'Golden Refrigeration'. 
      Diagnose this ${appliance} issue: ${issue}. 
      Give a professional diagnosis in Hinglish under 80 words.`,
    });

    const aiDiagnosis = response.text;

    // 🔥 Save to DB if user is logged in
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

    // 🔥 Fix: 'role' aur 'email' dono bhej rahe hain taaki security check fail na ho
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



app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) { res.status(500).json({ error: "Database error" }); }
});

// --- ADMIN ROUTES ---

// 1. Saare customers ki AI history aur details laane ke liye
app.get('/api/admin/all-diagnoses', async (req, res) => {
  try {
    const allData = await prisma.serviceBooking.findMany({
      include: {
        customer: {
          select: { name: true, email: true } // Sirf zaroori details le rahe hain
        }
      },
      orderBy: { scheduledAt: 'desc' }
    });
    res.json(allData);
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    res.status(500).json({ error: "Data laane mein dikkat hui bhai!" });
  }
});

// 2. Dashboard ke upar summary cards ke liye data (Optional but cool)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalBookings = await prisma.serviceBooking.count();
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    res.json({ totalBookings, totalUsers, totalProducts });
  } catch (error) {
    res.status(500).json({ error: "Stats fetch failed" });
  }
});

// backend/src/index.ts mein existing stats route ko upgrade karo
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [totalBookings, totalUsers, totalProducts, latestUsers] = await Promise.all([
      prisma.serviceBooking.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
    ]);

    // Appliance wise breakdown (Luxury analytic logic)
    const applianceStats = await prisma.serviceBooking.groupBy({
      by: ['appliance'],
      _count: { _all: true }
    });

    res.json({ totalBookings, totalUsers, totalProducts, latestUsers, applianceStats });
  } catch (error) {
    res.status(500).json({ error: "Stats fetch failed" });
  }
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is ACTIVE on http://localhost:${PORT}`);
});

