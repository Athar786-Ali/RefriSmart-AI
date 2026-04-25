// One-time DB cleanup — run with: TS_NODE_TRANSPILE_ONLY=1 node --loader ts-node/esm clear-data.ts
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/client/client.js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🗑️  Clearing service bookings and orders...");
  try { await prisma.$executeRaw`DELETE FROM "ServiceOtp"`;        console.log("  ✓ ServiceOtp"); }        catch (e: any) { console.log("  – ServiceOtp:", e.message); }
  try { await prisma.$executeRaw`DELETE FROM "ServiceEvent"`;      console.log("  ✓ ServiceEvent"); }      catch (e: any) { console.log("  – ServiceEvent:", e.message); }
  try { await prisma.$executeRaw`DELETE FROM "ServiceAssignment"`; console.log("  ✓ ServiceAssignment"); } catch (e: any) { console.log("  – ServiceAssignment:", e.message); }
  try { await prisma.$executeRaw`DELETE FROM "ServiceRating"`;     console.log("  ✓ ServiceRating"); }     catch (e: any) { console.log("  – ServiceRating:", e.message); }
  try { await prisma.$executeRaw`DELETE FROM "ServiceBooking"`;    console.log("  ✓ ServiceBooking"); }    catch (e: any) { console.log("  – ServiceBooking:", e.message); }
  try { await prisma.$executeRaw`DELETE FROM "OrderItem"`;         console.log("  ✓ OrderItem"); }         catch (e: any) { console.log("  – OrderItem:", e.message); }
  try { await prisma.$executeRaw`DELETE FROM "Order"`;             console.log("  ✓ Order"); }             catch (e: any) { console.log("  – Order:", e.message); }
  console.log("\n✅ All cleared!");
  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
