import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const demoProducts = [
  {
    title: "LG Dual Inverter AC 1.5 Ton",
    description: "Energy-efficient split AC with fast cooling and low-noise operation. Fully inspected and service-ready.",
    price: 32999,
    images: ["https://images.unsplash.com/photo-1581275288322-5c7d07120d97?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    title: "Samsung Double Door Refrigerator 324L",
    description: "Spacious family refrigerator with digital inverter technology and excellent cooling performance.",
    price: 28900,
    images: ["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    title: "Whirlpool Top Load Washing Machine 7.5kg",
    description: "Reliable top-load washing machine with multiple wash programs and strong build quality.",
    price: 16990,
    images: ["https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    title: "IFB Front Load Washing Machine 8kg",
    description: "Premium front-load machine with gentle fabric care and efficient water usage.",
    price: 24999,
    images: ["https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    title: "Voltas Window AC 1.5 Ton",
    description: "Heavy-duty window AC suitable for medium rooms with quick temperature pull-down.",
    price: 23900,
    images: ["https://images.unsplash.com/photo-1514661821986-6884ecf4f796?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    title: "Godrej Single Door Refrigerator 190L",
    description: "Compact refrigerator ideal for small families or office spaces with stable cooling.",
    price: 13499,
    images: ["https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    title: "Panasonic Microwave Oven 27L",
    description: "Convection microwave with multiple presets, perfect for reheating, grilling, and baking.",
    price: 12990,
    images: ["https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    title: "Blue Star Deep Freezer 300L",
    description: "Large-capacity deep freezer for commercial and home use with strong cooling retention.",
    price: 27900,
    images: ["https://images.unsplash.com/photo-1616628182509-6cd4f6b2f701?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    title: "Haier Side-by-Side Refrigerator 565L",
    description: "Premium side-by-side model with smart storage, elegant design, and uniform cooling.",
    price: 55900,
    images: ["https://images.unsplash.com/photo-1610018556010-6a11691bc905?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    title: "Daikin Split AC 1 Ton",
    description: "Compact and efficient split AC designed for bedrooms and small office spaces.",
    price: 27490,
    images: ["https://images.unsplash.com/photo-1521651201144-634f700b36ef?q=80&w=1200&auto=format&fit=crop"],
  },
];

async function main() {
  const fallbackEmail = "mdatharsbr@gmail.com";
  const seller =
    (await prisma.user.findUnique({ where: { email: fallbackEmail } })) ||
    (await prisma.user.findFirst());

  if (!seller) {
    throw new Error("No seller user found. Please create/login at least one user first.");
  }

  let created = 0;
  let skipped = 0;

  for (const product of demoProducts) {
    const existing = await prisma.product.findFirst({
      where: { title: product.title },
      select: { id: true },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.product.create({
      data: {
        ...product,
        sellerId: seller.id,
        status: "AVAILABLE",
      },
    });
    created++;
  }

  console.log(`Demo products completed. Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
