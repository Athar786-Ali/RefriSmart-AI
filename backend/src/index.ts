import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'golden_ref_secret_123';

// Prisma Setup
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Signup Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already exists!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });
    res.status(201).json({ message: "User created!" });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return res.status(401).json({ error: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid Credentials" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Get Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- AI DIAGNOSIS ROUTE ---
app.post('/api/ai/diagnose', async (req, res) => {
  try {
    const { appliance, issue } = req.body;

    if (!appliance || !issue) {
      return res.status(400).json({ error: "Appliance aur issue batana zaroori hai bhai!" });
    }

    // AI ko context dena ki wo ek expert technician hai
    const prompt = `You are an expert home appliance technician for 'Golden Refrigeration'. 
    A customer is reporting an issue with their ${appliance}.
    Issue: ${issue}.
    Provide a professional diagnosis in simple Hinglish (Hindi + English). 
    Tell them:
    1. Possible cause of the problem.
    2. Can they fix it themselves? (Safety first!)
    3. Estimated repair difficulty.
    Keep it concise and helpful.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ diagnosis: text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI ne jawab dene se mana kar diya, baad mein try karo." });
  }
});


app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));
