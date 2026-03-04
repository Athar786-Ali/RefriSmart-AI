import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const app = express();
const PORT = process.env.PORT || 5001;

// Prisma 7 Driver Adapter Setup
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL 
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

// Basic Routes
app.get('/', (req, res) => {
  res.send('RefriSmart AI Backend is Live! 🚀');
});

// Database Test Route
app.get('/api/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ message: "DB Connected!", users: userCount });
  } catch (error) {
    res.status(500).json({ error: "DB Error", details: error });
  }
});

// Error handling to prevent sudden exits
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Server initialization
app.listen(PORT, () => {
  console.log(`✅ Server is ACTIVE on http://localhost:${PORT}`);
});


process.stdin.resume();


