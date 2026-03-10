import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from 'cloudinary';

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

const demoProducts = [
  { title: "LG Dual Inverter AC 1.5 Ton", description: "Energy-efficient split AC with fast cooling and low-noise operation.", price: 32999, images: ["https://images.unsplash.com/photo-1581275288322-5c7d07120d97?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Samsung Double Door Refrigerator 324L", description: "Spacious refrigerator with digital inverter and stable cooling.", price: 28900, images: ["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Whirlpool Top Load Washing Machine 7.5kg", description: "Reliable top-load washer with quick and heavy wash programs.", price: 16990, images: ["https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=1200&auto=format&fit=crop"] },
  { title: "IFB Front Load Washing Machine 8kg", description: "Premium front-load machine with fabric care and low vibration.", price: 24999, images: ["https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Voltas Window AC 1.5 Ton", description: "Heavy-duty window AC suitable for medium-size rooms.", price: 23900, images: ["https://images.unsplash.com/photo-1514661821986-6884ecf4f796?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Godrej Single Door Refrigerator 190L", description: "Compact refrigerator ideal for office and small family use.", price: 13499, images: ["https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Panasonic Microwave Oven 27L", description: "Convection microwave for baking, grilling, and reheating.", price: 12990, images: ["https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Blue Star Deep Freezer 300L", description: "Large-capacity deep freezer with strong temperature retention.", price: 27900, images: ["https://images.unsplash.com/photo-1616628182509-6cd4f6b2f701?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Haier Side-by-Side Refrigerator 565L", description: "Premium side-by-side model with smart storage layout.", price: 55900, images: ["https://images.unsplash.com/photo-1610018556010-6a11691bc905?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Daikin Split AC 1 Ton", description: "Compact and efficient split AC for smaller rooms.", price: 27490, images: ["https://images.unsplash.com/photo-1521651201144-634f700b36ef?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Hitachi Split AC 1.5 Ton", description: "Powerful cooling with low noise and durable compressor.", price: 34990, images: ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Bosch Front Load Washing Machine 7kg", description: "Efficient front-load washer with anti-vibration build.", price: 29900, images: ["https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Lloyd Inverter AC 1 Ton", description: "Inverter split AC optimized for low power consumption.", price: 26490, images: ["https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Electrolux Refrigerator 260L", description: "Double-door refrigerator with odor control and cooling balance.", price: 23990, images: ["https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Carrier Window AC 1 Ton", description: "Stable cooling AC with strong airflow and easy servicing.", price: 21490, images: ["https://images.unsplash.com/photo-1591721346271-82c9d7f4eede?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Siemens Dishwasher 12 Place", description: "Compact dishwasher with eco wash and sanitization mode.", price: 38490, images: ["https://images.unsplash.com/photo-1586208958839-06c17cacdf08?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Kelvinator Chest Freezer 200L", description: "Commercial-grade freezer for long-duration storage.", price: 21900, images: ["https://images.unsplash.com/photo-1536353284924-9220c464e262?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Midea Microwave Grill 30L", description: "Large microwave grill with digital quick-cook presets.", price: 14990, images: ["https://images.unsplash.com/photo-1626808642875-0aa545482dfb?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Panasonic Refrigerator 420L", description: "Frost-free refrigerator with humidity control drawers.", price: 40990, images: ["https://images.unsplash.com/photo-1556910096-6f5e72db6803?q=80&w=1200&auto=format&fit=crop"] },
  { title: "Onida Top Load Washing Machine 6.5kg", description: "Affordable washer with quick wash and gentle spin cycle.", price: 13990, images: ["https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=1200&auto=format&fit=crop"] },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateFallbackDiagnosis = (appliance: string, issue: string) => {
  const normalized = issue.toLowerCase();
  let likelyCause = "power fluctuation ya internal component wear";
  let safetyStep = "machine ko turant off karke plug nikaal dein";
  let fixStep = "basic inspection ke baad on-site technician visit schedule karein";
  let estimate = "₹700 - ₹2,500";

  if (normalized.includes("cool") || normalized.includes("thanda") || normalized.includes("gas")) {
    likelyCause = "gas pressure low, condenser choke, ya compressor load issue";
    safetyStep = "appliance ko rest mode pe rakhein aur back-side ventilation clear karein";
    fixStep = "gas pressure + compressor amp check karwana best rahega";
    estimate = "₹1,200 - ₹4,500";
  } else if (normalized.includes("noise") || normalized.includes("awaz") || normalized.includes("fan")) {
    likelyCause = "fan motor imbalance, bearing wear, ya loose mounting";
    safetyStep = "machine ko zyada load pe use na karein";
    fixStep = "fan assembly aur motor alignment service karwana hoga";
    estimate = "₹900 - ₹3,200";
  } else if (normalized.includes("leak") || normalized.includes("pani") || normalized.includes("water")) {
    likelyCause = "drain blockage, pipe crack, ya inlet valve issue";
    safetyStep = "water supply temporarily band karein";
    fixStep = "drain line cleaning + seal replacement karwana chahiye";
    estimate = "₹800 - ₹2,800";
  } else if (normalized.includes("not working") || normalized.includes("band") || normalized.includes("start")) {
    likelyCause = "starter relay, PCB, ya power board fault";
    safetyStep = "extension board use na karein, direct socket use karein";
    fixStep = "multimeter diagnostic aur relay/board inspection required hai";
    estimate = "₹1,000 - ₹5,500";
  }

  return `Golden Refrigeration Technician se quick diagnosis:
Likely issue: ${likelyCause}.
Safety step: ${safetyStep}.
Recommended fix: ${fixStep}.
Estimated cost range: ${estimate} (final inspection ke baad confirm hoga).
Appliance: ${appliance}.`;
};

// 2. Gemini 3.1 Setup
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 3. Cloudinary Setup
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '12mb' }));

// --- AI DIAGNOSIS ROUTE (With History Saving) ---
app.post('/api/ai/diagnose', async (req, res) => {
  try {
    const { appliance, issue, userId } = req.body;
    if (!appliance || !issue) return res.status(400).json({ error: "Please provide appliance details and issue description." });

    const prompt = `You are a senior Golden Refrigeration Technician.
Customer appliance: ${appliance}
Customer issue: ${issue}
Give practical diagnosis and solution in simple Hinglish.
Keep response clear, friendly, and under 120 words.
Include: likely cause, quick safety step, and recommended next fix.`;

    const preferredModels = [
      process.env.GEMINI_MODEL,
      "gemini-3.1-flash-lite-preview",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ].filter(Boolean) as string[];

    let aiDiagnosis = "";
    let lastModelError = "";

    for (const model of preferredModels) {
      try {
        const response = await Promise.race([
          ai.models.generateContent({
            model,
            contents: prompt,
          }),
          wait(3500).then(() => {
            throw new Error(`Timeout for model: ${model}`);
          }),
        ]) as { text?: string };
        aiDiagnosis = response.text?.trim() || "";
        if (aiDiagnosis) break;
      } catch (modelError: any) {
        lastModelError = modelError?.message || "Unknown model error";
      }
    }

    if (!aiDiagnosis) {
      aiDiagnosis = generateFallbackDiagnosis(appliance, issue);
      console.warn("AI fallback used:", lastModelError);
    }

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
    res.status(500).json({ error: "AI request failed.", details: error.message });
  }
});

// User History Route
app.get('/api/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await prisma.serviceBooking.findMany({
      where: { customerId: userId },
      orderBy: { scheduledAt: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history." });
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

app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(products);
  } catch (error) { res.status(500).json({ error: "Database error" }); }
});

// --- ADMIN ROUTES ---

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
    res.status(500).json({ error: "Failed to fetch diagnosis data." });
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
      prisma.product.findMany({ orderBy: { id: 'desc' } })
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

app.post('/api/admin/upload-image', async (req, res) => {
  try {
    const { fileData } = req.body;
    if (!fileData || typeof fileData !== 'string' || !fileData.startsWith('data:image/')) {
      return res.status(400).json({ error: "Invalid image payload." });
    }

    const uploaded = await cloudinary.uploader.upload(fileData, {
      folder: 'refri-smart/products',
      resource_type: 'image'
    });

    res.status(201).json({ imageUrl: uploaded.secure_url });
  } catch (error: any) {
    console.error("Upload Error:", error.message);
    res.status(500).json({ error: "Image upload failed." });
  }
});

app.post('/api/admin/add-product', async (req, res) => {
  try {
    const { title, description, price, sellerId, imageUrl } = req.body;

    if (!title || !price || !sellerId) {
      return res.status(400).json({ error: "Missing details!" });
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        description: description || "",
        price: parseFloat(price),
        sellerId,
        images: imageUrl ? [imageUrl] : [],
        status: 'AVAILABLE'
      }
    });

    res.status(201).json({ message: "Product added!", product: newProduct });
  } catch (error: any) {
    console.error("Add Product Error:", error.message);
    res.status(500).json({ error: "Failed to save product." });
  }
});

app.post('/api/admin/seed-demo-products', async (req, res) => {
  try {
    const { sellerId } = req.body as { sellerId?: string };
    const seller = sellerId
      ? await prisma.user.findUnique({ where: { id: sellerId } })
      : await prisma.user.findFirst();

    if (!seller) {
      return res.status(400).json({ error: "No seller account found." });
    }

    let created = 0;
    let skipped = 0;

    for (const product of demoProducts) {
      const exists = await prisma.product.findFirst({
        where: { title: product.title },
        select: { id: true },
      });

      if (exists) {
        skipped++;
        continue;
      }

      await prisma.product.create({
        data: {
          ...product,
          sellerId: seller.id,
          status: 'AVAILABLE',
        },
      });
      created++;
    }

    res.json({ message: "Demo products seeded.", created, skipped });
  } catch (error: any) {
    console.error("Seed Error:", error.message);
    res.status(500).json({ error: "Failed to seed demo products." });
  }
});



app.delete('/api/admin/delete-product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product." });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is ACTIVE on http://localhost:${PORT}`);
});
