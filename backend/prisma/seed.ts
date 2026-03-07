import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'mdatharsbr@gmail.com' },
    update: {},
    create: {
      email: 'mdatharsbr@gmail.com',
      name: 'Md Athar Ali',
      role: 'ADMIN',
    },
  });

  await prisma.product.createMany({
    data: [
      { title: 'LG Double Door Fridge', description: 'Refurbished, 5 star', price: 15000, sellerId: admin.id },
      { title: 'Samsung AC 1.5 Ton', description: 'Second hand, copper coil', price: 22000, sellerId: admin.id },
    ],
  });
  console.log("✅ Data seeded successfully!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());

