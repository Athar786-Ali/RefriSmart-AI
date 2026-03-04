import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 5000;

// Prisma 7 Client Initialization
const prisma = new PrismaClient({
  // @ts-ignore - Temporary ignore if VS Code types are lagging
  datasourceUrl: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('RefriSmart AI Backend is Live! 🚀');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
