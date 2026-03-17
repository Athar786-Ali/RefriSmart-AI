import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/client/client.js";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const stockUpdated = await prisma.$executeRaw`UPDATE "Product" SET "stockQty" = 1 WHERE "stockQty" IS NULL`;
  const deletedUpdated = await prisma.$executeRaw`UPDATE "Product" SET "isDeleted" = FALSE WHERE "isDeleted" IS NULL`;

  console.log(
    `Backfill complete. stockQty set on ${stockUpdated} rows, isDeleted set on ${deletedUpdated} rows.`,
  );
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
