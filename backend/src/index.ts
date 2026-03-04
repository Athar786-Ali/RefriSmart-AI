import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Home Route (Check karne ke liye ki server chal raha hai)
app.get('/', (req, res) => {
  res.send('RefriSmart AI Backend is Live! 🚀');
});

// 2. Route: Saare Products get karne ke liye
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Database se products lane mein dikkat hui." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
