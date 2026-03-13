import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import nodemailer from 'nodemailer';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from './generated/client/client.js';
const app = express();
const PORT = 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'golden_ref_secret_123';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});
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
const cloudinaryOptimizeUrl = (rawUrl) => {
    if (!rawUrl || !rawUrl.includes("res.cloudinary.com") || !rawUrl.includes("/upload/")) {
        return rawUrl;
    }
    return rawUrl.replace("/upload/", "/upload/f_webp,q_auto:good,c_limit,w_1400/");
};
const inferMediaTypeFromUrl = (url) => {
    const clean = (url || "").toLowerCase().split("?")[0];
    if (clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov") || clean.endsWith(".mkv")) {
        return "video";
    }
    return "image";
};
const parseFlexibleDate = (value) => {
    if (!value || typeof value !== "string")
        return null;
    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime()))
        return direct;
    const ddmmyyyy = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (!ddmmyyyy)
        return null;
    const day = Number(ddmmyyyy[1]);
    const month = Number(ddmmyyyy[2]) - 1;
    const year = Number(ddmmyyyy[3]);
    const normalized = new Date(year, month, day);
    return Number.isNaN(normalized.getTime()) ? null : normalized;
};
const parseOptionalNumber = (value) => {
    if (value === undefined || value === null)
        return null;
    const raw = String(value).trim();
    if (!raw)
        return null;
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? Number.NaN : parsed;
};
const tokenize = (value) => value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !["the", "and", "with", "for", "from"].includes(token));
const median = (values) => {
    if (!values.length)
        return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0)
        return (sorted[mid - 1] + sorted[mid]) / 2;
    return sorted[mid];
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const PRODUCT_META_MARKER = "__GR_META__";
const encodeCompatMetaInDescription = (description, meta) => {
    const clean = description.includes(PRODUCT_META_MARKER)
        ? description.split(PRODUCT_META_MARKER)[0].trim()
        : description.trim();
    return `${clean}\n\n${PRODUCT_META_MARKER}${JSON.stringify(meta)}`;
};
const decodeCompatMetaFromDescription = (description) => {
    if (!description || typeof description !== "string") {
        return { cleanDescription: "", meta: {} };
    }
    const idx = description.indexOf(PRODUCT_META_MARKER);
    if (idx === -1) {
        return { cleanDescription: description, meta: {} };
    }
    const cleanDescription = description.slice(0, idx).trim();
    const rawMeta = description.slice(idx + PRODUCT_META_MARKER.length).trim();
    try {
        const parsed = JSON.parse(rawMeta);
        return { cleanDescription, meta: parsed || {} };
    }
    catch {
        return { cleanDescription, meta: {} };
    }
};
let phase1SchemaEnsured = false;
const ensurePhase1ProductSchema = async () => {
    if (phase1SchemaEnsured)
        return;
    await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductType') THEN
        CREATE TYPE "ProductType" AS ENUM ('NEW', 'REFURBISHED');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WarrantyType') THEN
        CREATE TYPE "WarrantyType" AS ENUM ('BRAND', 'SHOP');
      END IF;
    END $$;
  `);
    await prisma.$executeRawUnsafe(`
    ALTER TABLE "Product"
    ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS "productType" "ProductType" NOT NULL DEFAULT 'NEW',
    ADD COLUMN IF NOT EXISTS "conditionScore" INTEGER,
    ADD COLUMN IF NOT EXISTS "ageMonths" INTEGER,
    ADD COLUMN IF NOT EXISTS "warrantyType" "WarrantyType",
    ADD COLUMN IF NOT EXISTS "warrantyExpiry" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "warrantyCertificateUrl" TEXT;
  `);
    await prisma.$executeRawUnsafe(`
    UPDATE "Product"
    SET "productType" = CASE WHEN "isUsed" = true THEN 'REFURBISHED'::"ProductType" ELSE 'NEW'::"ProductType" END
    WHERE ("isUsed" = true AND "productType" <> 'REFURBISHED'::"ProductType")
       OR ("isUsed" = false AND "productType" <> 'NEW'::"ProductType");
  `);
    phase1SchemaEnsured = true;
};
let phase2SchemaEnsured = false;
const ensurePhase2Schema = async () => {
    if (phase2SchemaEnsured)
        return;
    await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Status') THEN
        ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'ASSIGNED';
        ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'OUT_FOR_REPAIR';
        ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'REPAIRING';
        ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'FIXED';
      END IF;
    END $$;
  `);
    await prisma.$executeRawUnsafe(`
    ALTER TABLE "ServiceBooking"
    ADD COLUMN IF NOT EXISTS "address" TEXT,
    ADD COLUMN IF NOT EXISTS "contactName" TEXT,
    ADD COLUMN IF NOT EXISTS "contactPhone" TEXT,
    ADD COLUMN IF NOT EXISTS "locationLat" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "locationLng" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "finalCost" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "paymentQR" TEXT,
    ADD COLUMN IF NOT EXISTS "invoiceUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "rating" INTEGER;
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Gallery" (
      "id" TEXT PRIMARY KEY,
      "imageUrl" TEXT NOT NULL,
      "mediaType" TEXT NOT NULL DEFAULT 'image',
      "caption" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
    await prisma.$executeRawUnsafe(`
    ALTER TABLE "Gallery"
    ADD COLUMN IF NOT EXISTS "mediaType" TEXT NOT NULL DEFAULT 'image';
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Technician" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "phone" TEXT NOT NULL UNIQUE,
      "role" TEXT NOT NULL DEFAULT 'TECHNICIAN',
      "pincode" TEXT NOT NULL,
      "active" BOOLEAN NOT NULL DEFAULT TRUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ServiceAssignment" (
      "bookingId" TEXT PRIMARY KEY,
      "technicianId" TEXT NOT NULL,
      "pincode" TEXT,
      "routeNote" TEXT,
      "assignedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ServiceEvent" (
      "id" TEXT PRIMARY KEY,
      "bookingId" TEXT NOT NULL,
      "status" TEXT NOT NULL,
      "note" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ServiceOtp" (
      "id" TEXT PRIMARY KEY,
      "bookingId" TEXT NOT NULL,
      "otp" TEXT NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "verified" BOOLEAN NOT NULL DEFAULT FALSE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SellRequest" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "applianceType" TEXT NOT NULL,
      "brandModel" TEXT NOT NULL,
      "conditionNote" TEXT NOT NULL,
      "expectedPrice" DOUBLE PRECISION,
      "pincode" TEXT,
      "imageUrl" TEXT,
      "status" TEXT NOT NULL DEFAULT 'REQUESTED',
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SellOffer" (
      "id" TEXT PRIMARY KEY,
      "requestId" TEXT NOT NULL,
      "offerPrice" DOUBLE PRECISION NOT NULL,
      "pickupSlot" TIMESTAMP,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "DocumentLog" (
      "id" TEXT PRIMARY KEY,
      "docType" TEXT NOT NULL,
      "bookingId" TEXT,
      "meta" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ProductOrder" (
      "id" TEXT PRIMARY KEY,
      "productId" TEXT NOT NULL,
      "customerId" TEXT NOT NULL,
      "productTitle" TEXT NOT NULL,
      "productImageUrl" TEXT,
      "price" DOUBLE PRECISION NOT NULL,
      "customerName" TEXT,
      "deliveryPhone" TEXT NOT NULL,
      "deliveryAddress" TEXT NOT NULL,
      "orderStatus" TEXT NOT NULL DEFAULT 'ORDER_PLACED',
      "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
      "paymentQR" TEXT,
      "invoiceUrl" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
    const existingTech = await prisma.$queryRaw `SELECT "id" FROM "Technician" LIMIT 1`;
    if (!existingTech.length) {
        await prisma.$executeRawUnsafe(`
      INSERT INTO "Technician" ("id", "name", "phone", "role", "pincode", "active")
      VALUES
      ('tech-1', 'Ravi Kumar', '9060877595', 'TECHNICIAN', '800001', TRUE),
      ('tech-2', 'Anil Singh', '9060877596', 'TECHNICIAN', '800020', TRUE)
      ON CONFLICT DO NOTHING;
    `);
    }
    phase2SchemaEnsured = true;
};
let authSchemaEnsured = false;
const ensureAuthSchema = async () => {
    if (authSchemaEnsured)
        return;
    await prisma.$executeRawUnsafe(`
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "verifyOtp" TEXT,
    ADD COLUMN IF NOT EXISTS "verifyOtpExpiryAt" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "isAccountVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS "resetOtp" TEXT,
    ADD COLUMN IF NOT EXISTS "resetOtpExpiryAt" DOUBLE PRECISION;
  `);
    authSchemaEnsured = true;
};
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const sendEmail = async (to, subject, html, text) => {
    if (!SMTP_USER || !SMTP_PASS) {
        throw new Error("SMTP credentials are missing. Set SMTP_USER and SMTP_PASS.");
    }
    await mailTransporter.sendMail({
        from: `"Golden Refrigeration" <${SMTP_USER}>`,
        to,
        subject,
        text: text || "Golden Refrigeration notification",
        html,
    });
};
const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token)
            return res.status(401).json({ error: "Unauthorized. Login required." });
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded?.userId)
            return res.status(401).json({ error: "Invalid token." });
        req.userId = decoded.userId;
        next();
    }
    catch {
        return res.status(401).json({ error: "Unauthorized. Invalid or expired token." });
    }
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const TECHNICIAN_PHONE = "9060877595";
const SHOP_UPI_ID = "9060877595-2@ybl";
const ORDER_STATUS_FLOW = ["ORDER_PLACED", "DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED"];
const detectInputLanguage = (text) => {
    if (/[\u0900-\u097F]/.test(text))
        return "HINDI";
    const lower = text.toLowerCase();
    const hinglishHints = [
        "nahi",
        "nhi",
        "hai",
        "kar",
        "karo",
        "chal",
        "chalu",
        "band",
        "problem",
        "thanda",
        "garam",
        "awaz",
        "pani",
        "kaise",
        "kya",
    ];
    const hits = hinglishHints.reduce((count, token) => (lower.includes(token) ? count + 1 : count), 0);
    return hits >= 2 ? "HINGLISH" : "ENGLISH";
};
const formatSlotLabel = (date) => date.toLocaleString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
});
const extractJsonObject = (input) => {
    const start = input.indexOf("{");
    const end = input.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start)
        return null;
    return input.slice(start, end + 1);
};
const fallbackStructuredDiagnosis = (appliance, issue, language) => {
    const normalized = issue.toLowerCase();
    let probableFault = "Power fluctuation or internal component wear";
    let urgency = "MEDIUM";
    let partsList = ["General wiring check", "Relay inspection"];
    let estimatedCostMin = 700;
    let estimatedCostMax = 2500;
    let actionPlan = "Switch off the appliance and schedule a technician visit for full inspection.";
    if (normalized.includes("thanda") || normalized.includes("cool") || normalized.includes("gas")) {
        probableFault = "Low refrigerant gas, condenser choke, or compressor load issue";
        urgency = "HIGH";
        partsList = ["Gas leak test", "Condenser cleaning", "Compressor amp check"];
        estimatedCostMin = 1200;
        estimatedCostMax = 4500;
        actionPlan = "Keep vents clear, reduce door opening, and arrange on-site gas/compressor diagnostics.";
    }
    else if (normalized.includes("noise") || normalized.includes("awaz") || normalized.includes("fan")) {
        probableFault = "Fan motor imbalance or bearing wear";
        urgency = "MEDIUM";
        partsList = ["Fan motor inspection", "Bearing set", "Mounting alignment"];
        estimatedCostMin = 900;
        estimatedCostMax = 3200;
        actionPlan = "Avoid heavy use and get fan assembly checked before motor damage increases.";
    }
    else if (normalized.includes("leak") || normalized.includes("pani")) {
        probableFault = "Drain blockage or pipe seal damage";
        urgency = "MEDIUM";
        partsList = ["Drain pipe cleaning", "Seal kit", "Inlet valve check"];
        estimatedCostMin = 800;
        estimatedCostMax = 2800;
        actionPlan = "Stop water flow, clean visible drain path, and schedule technician for seal and valve checks.";
    }
    else if (normalized.includes("spark") || normalized.includes("burn")) {
        probableFault = "Electrical short risk in relay/PCB path";
        urgency = "HIGH";
        partsList = ["PCB diagnostics", "Relay replacement", "Insulation check"];
        estimatedCostMin = 1500;
        estimatedCostMax = 6000;
        actionPlan = "Do not power on repeatedly. Keep appliance unplugged until technician inspection.";
    }
    if (language === "HINDI") {
        return {
            probableFault: "संभावित कारण: " + probableFault,
            urgency,
            partsList,
            estimatedCostMin,
            estimatedCostMax,
            actionPlan: "तुरंत उपयोग रोकें और तकनीशियन विज़िट शेड्यूल करें। " + actionPlan,
        };
    }
    if (language === "HINGLISH") {
        return {
            probableFault: probableFault,
            urgency,
            partsList,
            estimatedCostMin,
            estimatedCostMax,
            actionPlan: "Machine ko safe mode me rakhkar technician visit schedule karein. " + actionPlan,
        };
    }
    return { probableFault, urgency, partsList, estimatedCostMin, estimatedCostMax, actionPlan };
};
const generateSuggestedSlots = (startDate) => {
    const now = new Date();
    const base = startDate && !Number.isNaN(startDate.getTime()) ? startDate : now;
    const slots = [];
    for (let day = 0; day < 5; day += 1) {
        for (const hour of [10, 12, 14, 16, 18]) {
            const slot = new Date(base);
            slot.setDate(base.getDate() + day);
            slot.setHours(hour, 0, 0, 0);
            if (slot.getTime() <= now.getTime() + 30 * 60 * 1000)
                continue;
            slots.push({ value: slot.toISOString(), label: formatSlotLabel(slot) });
        }
    }
    return slots.slice(0, 12);
};
const makeSimplePdfBuffer = (title, lines) => {
    const escape = (text) => text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const textLines = [title, "", ...lines].slice(0, 30);
    const content = [
        "BT",
        "/F1 12 Tf",
        "50 790 Td",
        ...textLines.flatMap((line, index) => (index === 0
            ? [`(${escape(line)}) Tj`]
            : ["0 -18 Td", `(${escape(line)}) Tj`])),
        "ET",
    ].join("\n");
    const objects = [
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
        "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
        `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`,
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    for (const obj of objects) {
        offsets.push(pdf.length);
        pdf += obj;
    }
    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i += 1) {
        pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return Buffer.from(pdf, "utf8");
};
const generateFallbackDiagnosis = (appliance, issue, language) => {
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
    }
    else if (normalized.includes("noise") || normalized.includes("awaz") || normalized.includes("fan")) {
        likelyCause = "fan motor imbalance, bearing wear, ya loose mounting";
        safetyStep = "machine ko zyada load pe use na karein";
        fixStep = "fan assembly aur motor alignment service karwana hoga";
        estimate = "₹900 - ₹3,200";
    }
    else if (normalized.includes("leak") || normalized.includes("pani") || normalized.includes("water")) {
        likelyCause = "drain blockage, pipe crack, ya inlet valve issue";
        safetyStep = "water supply temporarily band karein";
        fixStep = "drain line cleaning + seal replacement karwana chahiye";
        estimate = "₹800 - ₹2,800";
    }
    else if (normalized.includes("not working") || normalized.includes("band") || normalized.includes("start")) {
        likelyCause = "starter relay, PCB, ya power board fault";
        safetyStep = "extension board use na karein, direct socket use karein";
        fixStep = "multimeter diagnostic aur relay/board inspection required hai";
        estimate = "₹1,000 - ₹5,500";
    }
    if (language === "HINDI") {
        return `गोल्डन रेफ्रिजरेशन तकनीशियन त्वरित निदान:
संभावित समस्या: ${likelyCause}.
सुरक्षा कदम: ${safetyStep}.
सुझाया गया समाधान: ${fixStep}.
अनुमानित लागत सीमा: ${estimate} (अंतिम निरीक्षण के बाद निश्चित होगा)।
उपकरण: ${appliance}.`;
    }
    if (language === "ENGLISH") {
        return `Golden Refrigeration quick diagnosis:
Probable issue: ${likelyCause}.
Safety step: ${safetyStep}.
Recommended fix: ${fixStep}.
Estimated cost range: ${estimate} (final amount confirmed after inspection).
Appliance: ${appliance}.`;
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
app.use(cookieParser());
app.use(express.json({ limit: '12mb' }));
// --- AI DIAGNOSIS ROUTE (No Booking Side Effects) ---
app.post('/api/ai/diagnose', async (req, res) => {
    try {
        const { appliance, issue } = req.body;
        if (!appliance || !issue)
            return res.status(400).json({ error: "Please provide appliance details and issue description." });
        const inputLanguage = detectInputLanguage(String(issue));
        const prompt = `You are a highly skilled technician at "Golden Refrigeration". Analyze the appliance issue provided.
Customer appliance: ${appliance}
Customer issue: ${issue}
Detected input language: ${inputLanguage}
CRITICAL RULE: You MUST reply in the EXACT same language the user used.
- If user text is Hinglish, reply in Hinglish.
- If user text is Hindi, reply in Hindi.
- If user text is English, reply in English.
Return strictly valid JSON only with keys:
{
  "probableFault": "string",
  "urgency": "LOW|MEDIUM|HIGH",
  "partsList": ["part 1", "part 2"],
  "estimatedCostMin": number,
  "estimatedCostMax": number,
  "actionPlan": "short actionable plan in same language"
}
Make it practical and realistic for appliance repair in India.`;
        const preferredModels = [
            process.env.GEMINI_MODEL,
            "gemini-3.1-flash-lite-preview",
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
        ].filter(Boolean);
        let aiDiagnosis = "";
        let structured = null;
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
                ]);
                const raw = response.text?.trim() || "";
                if (!raw)
                    continue;
                const jsonCandidate = extractJsonObject(raw);
                if (!jsonCandidate)
                    continue;
                const parsed = JSON.parse(jsonCandidate);
                if (parsed?.probableFault &&
                    parsed?.urgency &&
                    Array.isArray(parsed?.partsList) &&
                    Number.isFinite(Number(parsed?.estimatedCostMin)) &&
                    Number.isFinite(Number(parsed?.estimatedCostMax)) &&
                    parsed?.actionPlan) {
                    structured = {
                        probableFault: String(parsed.probableFault),
                        urgency: ["LOW", "MEDIUM", "HIGH"].includes(parsed.urgency) ? parsed.urgency : "MEDIUM",
                        partsList: parsed.partsList.map((p) => String(p)).slice(0, 6),
                        estimatedCostMin: Number(parsed.estimatedCostMin),
                        estimatedCostMax: Number(parsed.estimatedCostMax),
                        actionPlan: String(parsed.actionPlan),
                    };
                    break;
                }
            }
            catch (modelError) {
                lastModelError = modelError?.message || "Unknown model error";
            }
        }
        if (!structured) {
            structured = fallbackStructuredDiagnosis(appliance, issue, inputLanguage);
            aiDiagnosis = generateFallbackDiagnosis(appliance, issue, inputLanguage);
            console.warn("AI fallback used:", lastModelError);
        }
        else {
            if (inputLanguage === "HINDI") {
                aiDiagnosis = `संभावित खराबी: ${structured.probableFault}
तत्कालता: ${structured.urgency}
संभावित पार्ट्स: ${structured.partsList.join(", ")}
अनुमानित खर्च: ₹${structured.estimatedCostMin} - ₹${structured.estimatedCostMax}
कार्रवाई योजना: ${structured.actionPlan}`;
            }
            else if (inputLanguage === "ENGLISH") {
                aiDiagnosis = `Probable fault: ${structured.probableFault}
Urgency: ${structured.urgency}
Likely parts: ${structured.partsList.join(", ")}
Estimated cost range: ₹${structured.estimatedCostMin} - ₹${structured.estimatedCostMax}
Action plan: ${structured.actionPlan}`;
            }
            else {
                aiDiagnosis = `Mumkin fault: ${structured.probableFault}
Urgency level: ${structured.urgency}
Likely parts: ${structured.partsList.join(", ")}
Estimated cost range: ₹${structured.estimatedCostMin} - ₹${structured.estimatedCostMax}
Action plan: ${structured.actionPlan}`;
            }
        }
        const suggestedSlots = generateSuggestedSlots();
        res.json({
            diagnosis: aiDiagnosis,
            structured,
            suggestedSlots,
            contact: {
                phone: TECHNICIAN_PHONE,
                call: `tel:${TECHNICIAN_PHONE}`,
                whatsapp: `https://wa.me/91${TECHNICIAN_PHONE}`,
                sms: `sms:+91${TECHNICIAN_PHONE}`,
            },
        });
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch history." });
    }
});
app.get('/api/booking/slots', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const pincode = String(req.query.pincode || "").trim();
        const dateParam = String(req.query.date || "").trim();
        const targetDate = dateParam ? new Date(dateParam) : undefined;
        const techRows = await prisma.$queryRaw `
      SELECT "id", "name", "phone", "pincode"
      FROM "Technician"
      WHERE "active" = TRUE
      ORDER BY "id" ASC
    `;
        const technicians = pincode
            ? techRows.filter((t) => t.pincode === pincode || t.pincode.slice(0, 3) === pincode.slice(0, 3))
            : techRows;
        const slots = generateSuggestedSlots(targetDate).map((slot) => ({
            ...slot,
            technician: technicians[0] || null,
        }));
        res.json({ slots, technicians: technicians.slice(0, 5) });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch slots." });
    }
});
app.post('/api/booking/create', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { userId, appliance, issue, aiDiagnosis, slot, pincode } = req.body;
        if (!userId || !appliance || !issue) {
            return res.status(400).json({ error: "userId, appliance and issue are required." });
        }
        const scheduledAt = slot ? new Date(slot) : new Date(Date.now() + 2 * 60 * 60 * 1000);
        if (Number.isNaN(scheduledAt.getTime())) {
            return res.status(400).json({ error: "Invalid slot selected." });
        }
        const techRows = await prisma.$queryRaw `
      SELECT "id", "name", "phone", "pincode"
      FROM "Technician"
      WHERE "active" = TRUE
      ORDER BY "id" ASC
    `;
        const selectedTech = techRows.find((t) => pincode && (t.pincode === pincode || t.pincode.slice(0, 3) === pincode.slice(0, 3))) ||
            techRows[0] ||
            { id: "tech-1", name: "Assigned Technician", phone: TECHNICIAN_PHONE, pincode: pincode || "N/A" };
        const booking = await prisma.serviceBooking.create({
            data: {
                customer: { connect: { id: userId } },
                appliance,
                issue,
                aiDiagnosis: aiDiagnosis || null,
                status: "PENDING",
                scheduledAt,
            },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceAssignment" ("bookingId", "technicianId", "pincode", "routeNote")
      VALUES (${booking.id}, ${selectedTech.id}, ${pincode || selectedTech.pincode}, ${"Auto allocated by pincode and availability"})
      ON CONFLICT ("bookingId") DO UPDATE
      SET "technicianId" = EXCLUDED."technicianId",
          "pincode" = EXCLUDED."pincode",
          "routeNote" = EXCLUDED."routeNote"
    `;
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${randomUUID()}, ${booking.id}, ${"REQUEST_RECEIVED"}, ${"Request received from customer"})
    `;
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${randomUUID()}, ${booking.id}, ${"ASSIGNED"}, ${`Assigned to ${selectedTech.name}`})
    `;
        res.status(201).json({
            booking,
            message: "Technician booking created.",
            assignedTechnician: selectedTech,
            contact: {
                phone: selectedTech.phone || TECHNICIAN_PHONE,
                call: `tel:${selectedTech.phone || TECHNICIAN_PHONE}`,
                whatsapp: `https://wa.me/91${selectedTech.phone || TECHNICIAN_PHONE}`,
                sms: `sms:+91${selectedTech.phone || TECHNICIAN_PHONE}`,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create booking.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/service/book', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { userId, appliance, issue, address, lat, lng, slot, pincode, fullName, phoneNumber } = req.body;
        if (!userId || !appliance || !issue) {
            return res.status(400).json({ error: "userId, appliance, issue are required." });
        }
        const scheduledAt = slot ? new Date(slot) : new Date(Date.now() + 2 * 60 * 60 * 1000);
        if (Number.isNaN(scheduledAt.getTime())) {
            return res.status(400).json({ error: "Invalid slot selected." });
        }
        const techRows = await prisma.$queryRaw `
      SELECT "id", "name", "phone", "pincode"
      FROM "Technician"
      WHERE "active" = TRUE
      ORDER BY "id" ASC
    `;
        const selectedTech = techRows.find((t) => pincode && (t.pincode === pincode || t.pincode.slice(0, 3) === pincode.slice(0, 3))) ||
            techRows[0] ||
            { id: "tech-1", name: "Assigned Technician", phone: TECHNICIAN_PHONE, pincode: pincode || "N/A" };
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser)
            return res.status(404).json({ error: "User not found." });
        const resolvedName = String(fullName || existingUser.name || "Customer").trim();
        const resolvedPhone = String(phoneNumber || "").trim() || "Not provided";
        const bookingId = randomUUID();
        const inserted = await prisma.$queryRaw `
      INSERT INTO "ServiceBooking"
      (
        "id",
        "customerId",
        "appliance",
        "issue",
        "status",
        "scheduledAt",
        "address",
        "contactName",
        "contactPhone",
        "locationLat",
        "locationLng"
      )
      VALUES
      (
        ${bookingId},
        ${userId},
        ${appliance},
        ${issue},
        ${"PENDING"}::"Status",
        ${scheduledAt},
        ${address || null},
        ${resolvedName},
        ${resolvedPhone},
        ${lat !== undefined && lat !== null && String(lat) !== "" ? Number(lat) : null},
        ${lng !== undefined && lng !== null && String(lng) !== "" ? Number(lng) : null}
      )
      RETURNING *
    `;
        const booking = inserted[0];
        await prisma.$executeRaw `
      INSERT INTO "ServiceAssignment" ("bookingId", "technicianId", "pincode", "routeNote")
      VALUES (${booking.id}, ${selectedTech.id}, ${pincode || selectedTech.pincode}, ${"Auto allocated by pincode and availability"})
      ON CONFLICT ("bookingId") DO UPDATE
      SET "technicianId" = EXCLUDED."technicianId",
          "pincode" = EXCLUDED."pincode",
          "routeNote" = EXCLUDED."routeNote"
    `;
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${randomUUID()}, ${booking.id}, ${"PENDING"}, ${"Request received from customer"})
    `;
        res.status(201).json({
            booking,
            assignedTechnician: selectedTech,
            contact: {
                phone: selectedTech.phone || TECHNICIAN_PHONE,
                call: `tel:${selectedTech.phone || TECHNICIAN_PHONE}`,
                whatsapp: `https://wa.me/91${selectedTech.phone || TECHNICIAN_PHONE}`,
                sms: `sms:+91${selectedTech.phone || TECHNICIAN_PHONE}`,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to book service.", details: error?.message || "Unknown error" });
    }
});
app.patch('/api/booking/:id/status', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const { status } = req.body;
        if (!status || !["PENDING", "ASSIGNED", "OUT_FOR_REPAIR", "REPAIRING", "FIXED", "COMPLETED"].includes(status)) {
            return res.status(400).json({ error: "Valid status is required." });
        }
        const updated = await prisma.serviceBooking.update({
            where: { id },
            data: { status: status },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${randomUUID()}, ${id}, ${status}, ${`Status updated to ${status}`})
    `;
        res.json({ booking: updated });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update status.", details: error?.message || "Unknown error" });
    }
});
app.patch('/api/booking/:id/reschedule', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const { slot } = req.body;
        if (!slot)
            return res.status(400).json({ error: "slot is required." });
        const nextDate = new Date(slot);
        if (Number.isNaN(nextDate.getTime())) {
            return res.status(400).json({ error: "Invalid slot selected." });
        }
        const updated = await prisma.serviceBooking.update({
            where: { id },
            data: { scheduledAt: nextDate },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${randomUUID()}, ${id}, ${"RESCHEDULED"}, ${`Rescheduled to ${nextDate.toISOString()}`})
    `;
        res.json({ booking: updated, message: "Booking rescheduled." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to reschedule.", details: error?.message || "Unknown error" });
    }
});
app.patch('/api/booking/:id/cancel', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const updated = await prisma.serviceBooking.update({
            where: { id },
            data: { status: "COMPLETED" },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${randomUUID()}, ${id}, ${"COMPLETED"}, ${"Closed by user/admin"})
    `;
        res.json({ booking: updated, message: "Booking closed." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to cancel booking.", details: error?.message || "Unknown error" });
    }
});
app.get('/api/booking/timeline/:bookingId', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { bookingId } = req.params;
        const events = await prisma.$queryRaw `
      SELECT "status", COALESCE("note", '') AS "note", "createdAt"
      FROM "ServiceEvent"
      WHERE "bookingId" = ${bookingId}
      ORDER BY "createdAt" ASC
    `;
        res.json({ timeline: events });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch timeline.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/booking/:id/send-otp', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await prisma.$executeRaw `
      INSERT INTO "ServiceOtp" ("id", "bookingId", "otp", "expiresAt", "verified")
      VALUES (${randomUUID()}, ${id}, ${otp}, ${expiresAt}, ${false})
    `;
        res.json({
            message: "Completion OTP generated.",
            otpPreview: otp,
            reminder: {
                whatsapp: `https://wa.me/91${TECHNICIAN_PHONE}?text=Booking%20${id}%20OTP%20${otp}`,
                sms: `sms:+91${TECHNICIAN_PHONE}?body=Booking ${id} OTP ${otp}`,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate OTP.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/booking/:id/verify-otp', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const { otp } = req.body;
        if (!otp)
            return res.status(400).json({ error: "otp is required." });
        const rows = await prisma.$queryRaw `
      SELECT "id", "otp", "expiresAt", "verified"
      FROM "ServiceOtp"
      WHERE "bookingId" = ${id}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;
        const latest = rows[0];
        if (!latest)
            return res.status(404).json({ error: "OTP not found." });
        if (latest.verified)
            return res.status(400).json({ error: "OTP already used." });
        if (new Date(latest.expiresAt).getTime() < Date.now())
            return res.status(400).json({ error: "OTP expired." });
        if (String(latest.otp) !== String(otp))
            return res.status(400).json({ error: "Invalid OTP." });
        await prisma.$executeRaw `UPDATE "ServiceOtp" SET "verified" = TRUE WHERE "id" = ${latest.id}`;
        const booking = await prisma.serviceBooking.update({
            where: { id },
            data: { status: "COMPLETED" },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${randomUUID()}, ${id}, ${"COMPLETED"}, ${"OTP verified and service completed"})
    `;
        res.json({ message: "OTP verified. Service marked completed.", booking });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to verify OTP.", details: error?.message || "Unknown error" });
    }
});
app.get('/api/service/my-bookings/:userId', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { userId } = req.params;
        const bookings = await prisma.serviceBooking.findMany({
            where: { customerId: userId },
            orderBy: { scheduledAt: "desc" },
        });
        const bookingIds = bookings.map((b) => b.id);
        if (!bookingIds.length)
            return res.json([]);
        const assignmentRows = await prisma.$queryRaw `
      SELECT "bookingId", "technicianId", COALESCE("pincode",'') AS "pincode", COALESCE("routeNote",'') AS "routeNote"
      FROM "ServiceAssignment"
    `;
        const bookingIdSet = new Set(bookingIds);
        const assignments = assignmentRows.filter((r) => bookingIdSet.has(r.bookingId));
        const technicians = await prisma.$queryRaw `
      SELECT "id", "name", "phone" FROM "Technician"
    `;
        const assignMap = new Map(assignments.map((a) => [a.bookingId, a]));
        const techMap = new Map(technicians.map((t) => [t.id, t]));
        res.json(bookings.map((b) => {
            const assign = assignMap.get(b.id);
            const tech = assign ? techMap.get(assign.technicianId) : null;
            return {
                ...b,
                technician: tech || null,
                pincode: assign?.pincode || null,
                routeNote: assign?.routeNote || null,
            };
        }));
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch bookings.", details: error?.message || "Unknown error" });
    }
});
app.get('/api/service/my-bookings', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const userId = String(req.query.userId || "").trim();
        if (!userId)
            return res.status(400).json({ error: "userId is required." });
        const bookings = await prisma.serviceBooking.findMany({
            where: { customerId: userId },
            orderBy: { scheduledAt: "desc" },
        });
        const bookingIds = bookings.map((b) => b.id);
        if (!bookingIds.length)
            return res.json([]);
        const assignmentRows = await prisma.$queryRaw `
      SELECT "bookingId", "technicianId", COALESCE("pincode",'') AS "pincode", COALESCE("routeNote",'') AS "routeNote"
      FROM "ServiceAssignment"
    `;
        const bookingIdSet = new Set(bookingIds);
        const assignments = assignmentRows.filter((r) => bookingIdSet.has(r.bookingId));
        const technicians = await prisma.$queryRaw `
      SELECT "id", "name", "phone" FROM "Technician"
    `;
        const assignMap = new Map(assignments.map((a) => [a.bookingId, a]));
        const techMap = new Map(technicians.map((t) => [t.id, t]));
        res.json(bookings.map((b) => {
            const assign = assignMap.get(b.id);
            const tech = assign ? techMap.get(assign.technicianId) : null;
            return {
                ...b,
                technician: tech || null,
                pincode: assign?.pincode || null,
                routeNote: assign?.routeNote || null,
            };
        }));
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch bookings.", details: error?.message || "Unknown error" });
    }
});
app.patch('/api/admin/service/:id', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const { status, finalCost } = req.body;
        if (!status || !["PENDING", "ASSIGNED", "OUT_FOR_REPAIR", "REPAIRING", "FIXED", "COMPLETED"].includes(status)) {
            return res.status(400).json({ error: "Valid status is required." });
        }
        const parsedCost = finalCost === undefined || finalCost === null || String(finalCost).trim() === ""
            ? null
            : Number(finalCost);
        if (parsedCost !== null && (!Number.isFinite(parsedCost) || parsedCost < 0)) {
            return res.status(400).json({ error: "finalCost must be a valid positive number." });
        }
        const booking = await prisma.serviceBooking.findUnique({ where: { id } });
        if (!booking)
            return res.status(404).json({ error: "Booking not found." });
        const amountToUse = status === "FIXED" ? Number(parsedCost ?? booking.finalCost ?? 0) : Number(booking.finalCost ?? 0);
        const paymentQR = status === "FIXED" && amountToUse > 0
            ? `upi://pay?pa=${SHOP_UPI_ID}&pn=MD%20ATHAR%20ALI&am=${amountToUse}&cu=INR`
            : booking.paymentQR;
        const invoiceUrl = status === "FIXED"
            ? `${req.protocol}://${req.get("host")}/api/docs/invoice/${id}`
            : booking.invoiceUrl;
        const updated = await prisma.$queryRaw `
      UPDATE "ServiceBooking"
      SET
        "status" = ${status}::"Status",
        "finalCost" = ${status === "FIXED" ? amountToUse : parsedCost ?? booking.finalCost},
        "paymentQR" = ${paymentQR || null},
        "invoiceUrl" = ${invoiceUrl || null}
      WHERE "id" = ${id}
      RETURNING *
    `;
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (
        ${randomUUID()},
        ${id},
        ${status},
        ${status === "FIXED"
            ? `Final estimate locked at ₹${amountToUse}. Payment request generated.`
            : `Admin updated status to ${status}`}
      )
    `;
        res.json({
            booking: updated[0] || null,
            paymentQR: paymentQR || null,
            invoiceUrl: invoiceUrl || null,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update service booking.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/service/:id/rating', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const rating = Number(req.body?.rating);
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "rating must be between 1 and 5." });
        }
        const updated = await prisma.$queryRaw `
      UPDATE "ServiceBooking"
      SET "rating" = ${Math.round(rating)}
      WHERE "id" = ${id}
      RETURNING *
    `;
        if (!updated.length)
            return res.status(404).json({ error: "Booking not found." });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${randomUUID()}, ${id}, ${"COMPLETED"}, ${`Customer submitted rating ${Math.round(rating)}/5`})
    `;
        res.json({ booking: updated[0] });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to save rating.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/admin/gallery', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { imageUrl, caption, fileData, mediaType } = req.body;
        let finalUrl = (imageUrl || "").trim();
        let resolvedMediaType = mediaType === "video"
            ? "video"
            : mediaType === "image"
                ? "image"
                : inferMediaTypeFromUrl(finalUrl);
        if (fileData?.startsWith("data:video/"))
            resolvedMediaType = "video";
        if (fileData?.startsWith("data:image/"))
            resolvedMediaType = "image";
        if (!finalUrl && fileData && (fileData.startsWith("data:image/") || fileData.startsWith("data:video/"))) {
            const uploaded = await cloudinary.uploader.upload(fileData, {
                folder: "refri-smart/gallery",
                resource_type: resolvedMediaType,
            });
            finalUrl = resolvedMediaType === "image" ? cloudinaryOptimizeUrl(uploaded.secure_url) : uploaded.secure_url;
        }
        if (!finalUrl)
            return res.status(400).json({ error: "imageUrl or media fileData is required." });
        const id = randomUUID();
        const storedUrl = resolvedMediaType === "image" ? cloudinaryOptimizeUrl(finalUrl) : finalUrl;
        await prisma.$executeRaw `
      INSERT INTO "Gallery" ("id", "imageUrl", "mediaType", "caption")
      VALUES (${id}, ${storedUrl}, ${resolvedMediaType}, ${caption || null})
    `;
        res.status(201).json({ id, imageUrl: storedUrl, mediaType: resolvedMediaType, caption: caption || null });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to upload gallery item.", details: error?.message || "Unknown error" });
    }
});
app.get('/api/gallery', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const rows = await prisma.$queryRaw `
      SELECT "id", "imageUrl", "mediaType", "caption", "createdAt"
      FROM "Gallery"
      ORDER BY "createdAt" DESC
    `;
        res.json(rows.map((row) => ({
            ...row,
            mediaType: row.mediaType === "video" ? "video" : "image",
            imageUrl: row.mediaType === "video" ? row.imageUrl : cloudinaryOptimizeUrl(row.imageUrl),
        })));
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch gallery.", details: error?.message || "Unknown error" });
    }
});
app.delete('/api/admin/gallery/:id', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const rows = await prisma.$queryRaw `
      SELECT "id", "imageUrl", "mediaType"
      FROM "Gallery"
      WHERE "id" = ${id}
      LIMIT 1
    `;
        if (!rows.length)
            return res.status(404).json({ error: "Image not found." });
        const imageUrl = rows[0].imageUrl || "";
        const mediaType = rows[0].mediaType === "video" ? "video" : "image";
        await prisma.$executeRaw `
      DELETE FROM "Gallery"
      WHERE "id" = ${id}
    `;
        if (imageUrl.includes("res.cloudinary.com") && imageUrl.includes("/upload/")) {
            try {
                const cleanUrl = imageUrl.split("?")[0];
                const uploadIndex = cleanUrl.indexOf("/upload/");
                const rawPath = cleanUrl.slice(uploadIndex + "/upload/".length);
                const segments = rawPath.split("/").filter(Boolean);
                if (segments[0] && (segments[0].includes(",") || segments[0].includes(":") || segments[0].startsWith("f_") || segments[0].startsWith("q_"))) {
                    segments.shift();
                }
                if (segments[0] && /^v\d+$/.test(segments[0])) {
                    segments.shift();
                }
                const publicId = segments.join("/").replace(/\.[^/.]+$/, "");
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId, { resource_type: mediaType });
                }
            }
            catch (cloudinaryError) {
                console.warn("Gallery image deleted from DB but Cloudinary cleanup failed.", cloudinaryError);
            }
        }
        res.json({ success: true, id });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete gallery image.", details: error?.message || "Unknown error" });
    }
});
app.get('/api/booking/:id/reminders', async (req, res) => {
    const { id } = req.params;
    res.json({
        bookingId: id,
        whatsapp: `https://wa.me/91${TECHNICIAN_PHONE}?text=Reminder%20for%20booking%20${id}`,
        sms: `sms:+91${TECHNICIAN_PHONE}?body=Reminder for booking ${id}`,
    });
});
app.get('/api/technician/jobs', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const phone = String(req.query.phone || "");
        const tech = await prisma.$queryRaw `
      SELECT "id", "name", "phone" FROM "Technician"
      WHERE "phone" = ${phone || TECHNICIAN_PHONE}
      LIMIT 1
    `;
        if (!tech.length)
            return res.json([]);
        const jobs = await prisma.$queryRaw `
      SELECT "bookingId" FROM "ServiceAssignment"
      WHERE "technicianId" = ${tech[0].id}
      ORDER BY "assignedAt" DESC
      LIMIT 30
    `;
        const bookingIds = jobs.map((j) => j.bookingId);
        if (!bookingIds.length)
            return res.json([]);
        const bookings = await prisma.serviceBooking.findMany({ where: { id: { in: bookingIds } }, orderBy: { scheduledAt: "asc" } });
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch technician jobs.", details: error?.message || "Unknown error" });
    }
});
app.patch('/api/technician/jobs/:bookingId/status', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { bookingId } = req.params;
        const { status, note } = req.body;
        if (!status)
            return res.status(400).json({ error: "status is required." });
        const normalizedStatus = status === "IN_PROGRESS"
            ? "REPAIRING"
            : status === "CANCELLED"
                ? "COMPLETED"
                : status;
        if (!["PENDING", "ASSIGNED", "OUT_FOR_REPAIR", "REPAIRING", "FIXED", "COMPLETED"].includes(normalizedStatus)) {
            return res.status(400).json({ error: "Invalid status update." });
        }
        const booking = await prisma.serviceBooking.update({
            where: { id: bookingId },
            data: { status: normalizedStatus },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${randomUUID()}, ${bookingId}, ${normalizedStatus}, ${note || `Updated by technician to ${normalizedStatus}`})
    `;
        res.json({ booking });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update technician job status.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/sell/request', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { userId, applianceType, brandModel, conditionNote, expectedPrice, pincode, imageUrl } = req.body;
        if (!userId || !applianceType || !brandModel || !conditionNote) {
            return res.status(400).json({ error: "userId, applianceType, brandModel, conditionNote are required." });
        }
        const id = randomUUID();
        await prisma.$executeRaw `
      INSERT INTO "SellRequest" ("id", "userId", "applianceType", "brandModel", "conditionNote", "expectedPrice", "pincode", "imageUrl", "status")
      VALUES (${id}, ${userId}, ${applianceType}, ${brandModel}, ${conditionNote}, ${expectedPrice ? Number(expectedPrice) : null}, ${pincode || null}, ${imageUrl || null}, ${"REQUESTED"})
    `;
        res.status(201).json({ id, message: "Sell request submitted." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to submit sell request.", details: error?.message || "Unknown error" });
    }
});
app.get('/api/sell/requests', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const userId = String(req.query.userId || "");
        const rows = userId
            ? await prisma.$queryRaw `SELECT * FROM "SellRequest" WHERE "userId" = ${userId} ORDER BY "createdAt" DESC`
            : await prisma.$queryRaw `SELECT * FROM "SellRequest" ORDER BY "createdAt" DESC`;
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch sell requests.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/sell/requests/:id/offer', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const { offerPrice, pickupSlot } = req.body;
        if (!offerPrice)
            return res.status(400).json({ error: "offerPrice is required." });
        const offerId = randomUUID();
        await prisma.$executeRaw `
      INSERT INTO "SellOffer" ("id", "requestId", "offerPrice", "pickupSlot", "status")
      VALUES (${offerId}, ${id}, ${Number(offerPrice)}, ${pickupSlot ? new Date(pickupSlot) : null}, ${"PENDING"})
    `;
        await prisma.$executeRaw `UPDATE "SellRequest" SET "status" = ${"OFFER_SENT"} WHERE "id" = ${id}`;
        res.json({ offerId, message: "Offer sent to customer." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to send offer.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/sell/offers/:id/respond', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const { action } = req.body;
        if (!action || !["ACCEPT", "REJECT"].includes(action))
            return res.status(400).json({ error: "action must be ACCEPT or REJECT." });
        const status = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";
        await prisma.$executeRaw `UPDATE "SellOffer" SET "status" = ${status} WHERE "id" = ${id}`;
        const rel = await prisma.$queryRaw `SELECT "requestId" FROM "SellOffer" WHERE "id" = ${id} LIMIT 1`;
        if (rel[0]?.requestId) {
            await prisma.$executeRaw `UPDATE "SellRequest" SET "status" = ${status} WHERE "id" = ${rel[0].requestId}`;
        }
        res.json({ message: `Offer ${status.toLowerCase()}.` });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to respond offer.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/sell/requests/:id/move-to-refurbished', async (req, res) => {
    try {
        await ensurePhase1ProductSchema().catch(() => { });
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const { sellerId, title, description, price, imageUrl } = req.body;
        if (!sellerId || !title || !price) {
            return res.status(400).json({ error: "sellerId, title, and price are required." });
        }
        const product = await prisma.product.create({
            data: {
                title,
                description: description || "",
                price: Number(price),
                sellerId,
                isUsed: true,
                productType: "REFURBISHED",
                conditionScore: 8,
                ageMonths: 24,
                warrantyType: "SHOP",
                images: imageUrl ? [cloudinaryOptimizeUrl(imageUrl)] : [],
                status: "AVAILABLE",
            },
        });
        await prisma.$executeRaw `UPDATE "SellRequest" SET "status" = ${"REFURBISHED_LISTED"} WHERE "id" = ${id}`;
        res.json({ message: "Moved to refurbished inventory.", product });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to move to inventory.", details: error?.message || "Unknown error" });
    }
});
app.get('/api/ops/analytics', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const [totalReqRows, acceptedRows, topFaults, slaRows, products] = await Promise.all([
            prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "SellRequest"`,
            prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "SellRequest" WHERE "status" IN ('ACCEPTED','REFURBISHED_LISTED')`,
            prisma.$queryRaw `
        SELECT "appliance", COUNT(*)::bigint AS count FROM "ServiceBooking" GROUP BY "appliance" ORDER BY count DESC LIMIT 5
      `,
            prisma.$queryRaw `
        SELECT EXTRACT(EPOCH FROM (MAX(e2."createdAt") - MIN(e1."createdAt")))/3600 AS hours
        FROM "ServiceEvent" e1
        JOIN "ServiceEvent" e2 ON e1."bookingId" = e2."bookingId"
        WHERE e1."status" = 'REQUEST_RECEIVED' AND e2."status" = 'COMPLETED'
        GROUP BY e1."bookingId"
      `,
            prisma.$queryRaw `SELECT "productType", "price" FROM "Product"`,
        ]);
        const totalRequests = Number(totalReqRows?.[0]?.count || 0);
        const accepted = Number(acceptedRows?.[0]?.count || 0);
        const conversionRate = totalRequests ? Number(((accepted / totalRequests) * 100).toFixed(1)) : 0;
        const avgSlaHours = slaRows.length
            ? Number((slaRows.reduce((sum, r) => sum + Number(r.hours || 0), 0) / slaRows.length).toFixed(1))
            : 0;
        const marginByCategory = products.reduce((acc, p) => {
            const type = p.productType || "NEW";
            const marginPct = type === "REFURBISHED" ? 0.18 : 0.1;
            acc[type] = Number(((acc[type] || 0) + Number(p.price || 0) * marginPct).toFixed(2));
            return acc;
        }, {});
        res.json({
            conversionRate,
            avgSlaHours,
            topFaults: topFaults.map((r) => ({ appliance: r.appliance, count: Number(r.count || 0) })),
            marginByCategory,
            totalSellRequests: totalRequests,
            acceptedSellRequests: accepted,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch analytics.", details: error?.message || "Unknown error" });
    }
});
app.get('/api/admin/service-overview', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const [recentBookings, assignmentRows, technicians] = await Promise.all([
            prisma.$queryRaw `
        SELECT
          sb."id",
          sb."appliance",
          sb."issue",
          sb."status"::text AS "status",
          sb."scheduledAt",
          sb."finalCost",
          sb."paymentQR",
          sb."invoiceUrl",
          sb."address",
          sb."contactName",
          sb."contactPhone",
          u."name" AS "customerName",
          u."email" AS "customerEmail"
        FROM "ServiceBooking" sb
        LEFT JOIN "User" u ON u."id" = sb."customerId"
        ORDER BY sb."scheduledAt" DESC
        LIMIT 20
      `,
            prisma.$queryRaw `
        SELECT "bookingId", "technicianId", COALESCE("pincode",'') AS "pincode", COALESCE("routeNote",'') AS "routeNote"
        FROM "ServiceAssignment"
      `,
            prisma.$queryRaw `SELECT "id", "name", "phone" FROM "Technician"`,
        ]);
        const assignmentMap = new Map(assignmentRows.map((row) => [row.bookingId, row]));
        const techMap = new Map(technicians.map((t) => [t.id, t]));
        const pipelineCounts = recentBookings.reduce((acc, booking) => {
            const key = booking.status || "PENDING";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        res.json({
            bookings: recentBookings.map((b) => {
                const assignment = assignmentMap.get(b.id);
                const tech = assignment ? techMap.get(assignment.technicianId) : null;
                return {
                    ...b,
                    customer: {
                        name: b.contactName || b.customerName || "Unknown",
                        email: b.customerEmail || "",
                    },
                    contactName: b.contactName || b.customerName || null,
                    contactPhone: b.contactPhone || null,
                    address: b.address || null,
                    technician: tech || null,
                    pincode: assignment?.pincode || null,
                    routeNote: assignment?.routeNote || null,
                };
            }),
            pipelineCounts,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch admin service overview.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/docs/:docType', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { docType } = req.params;
        const { bookingId, amount, gst, signature, notes } = req.body;
        const allowed = ["invoice", "warranty-certificate", "service-report"];
        if (!allowed.includes(docType))
            return res.status(400).json({ error: "Unsupported docType." });
        const now = new Date();
        const title = docType === "invoice" ? "Golden Refrigeration - Invoice" :
            docType === "warranty-certificate" ? "Golden Refrigeration - Warranty Certificate" :
                "Golden Refrigeration - Service Report";
        const lines = [
            `Date: ${now.toLocaleString("en-IN")}`,
            `Booking ID: ${bookingId || "N/A"}`,
            `Amount: ₹${Number(amount || 0).toLocaleString()}`,
            `GST: ${Number(gst || 0)}%`,
            `Technician Contact: ${TECHNICIAN_PHONE}`,
            `Signature: ${signature || "Digital Sign - Golden Refrigeration"}`,
            `Notes: ${notes || "Generated from service module"}`,
        ];
        const pdfBuffer = makeSimplePdfBuffer(title, lines);
        await prisma.$executeRaw `
      INSERT INTO "DocumentLog" ("id", "docType", "bookingId", "meta")
      VALUES (${randomUUID()}, ${docType}, ${bookingId || null}, ${JSON.stringify({ amount, gst, signature, notes })})
    `;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${docType}-${bookingId || "doc"}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate document.", details: error?.message || "Unknown error" });
    }
});
app.get('/api/docs/invoice/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await prisma.serviceBooking.findUnique({ where: { id: bookingId } });
        if (!booking)
            return res.status(404).json({ error: "Booking not found." });
        const amount = Number(booking.finalCost || 0);
        const lines = [
            `Booking ID: ${booking.id}`,
            `Appliance: ${booking.appliance}`,
            `Issue: ${booking.issue}`,
            `Status: ${booking.status}`,
            `Amount: ₹${amount.toLocaleString("en-IN")}`,
            `Technician Contact: ${TECHNICIAN_PHONE}`,
        ];
        const pdfBuffer = makeSimplePdfBuffer("Golden Refrigeration - Invoice", lines);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="invoice-${bookingId}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate invoice.", details: error?.message || "Unknown error" });
    }
});
// --- AUTH & PRODUCTS ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required." });
        }
        const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists with this email." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword },
        });
        try {
            await sendEmail(user.email, "Welcome to Golden Refrigeration", `<div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Welcome, ${user.name}!</h2>
          <p>Your account has been created successfully at <strong>Golden Refrigeration</strong>.</p>
          <p>Please log in and verify your account using OTP from your dashboard.</p>
        </div>`, `Welcome ${user.name}! Your Golden Refrigeration account is ready. Please login and verify your email with OTP.`);
        }
        catch (mailError) {
            console.warn("Welcome email failed:", mailError.message);
        }
        res.status(201).json({
            message: "Registration successful. Please log in and verify your account.",
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Registration failed.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/auth/login', async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email and password are required." });
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        const isProd = process.env.NODE_ENV === "production";
        const verificationRows = await prisma.$queryRaw `
      SELECT COALESCE("isAccountVerified", FALSE) AS "isAccountVerified"
      FROM "User"
      WHERE "id" = ${user.id}
      LIMIT 1
    `;
        const isAccountVerified = Boolean(verificationRows[0]?.isAccountVerified);
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: COOKIE_MAX_AGE,
            path: "/",
        });
        res.json({
            message: "Login successful.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isAccountVerified,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Login failed.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/auth/logout', async (_req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
    });
    res.json({ message: "Logged out successfully." });
});
app.post('/api/auth/send-verify-otp', userAuth, async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: "User not found." });
        const otp = generateOtp();
        const expiry = Date.now() + 24 * 60 * 60 * 1000;
        await prisma.$executeRaw `
      UPDATE "User"
      SET "verifyOtp" = ${otp}, "verifyOtpExpiryAt" = ${expiry}
      WHERE "id" = ${userId}
    `;
        await sendEmail(user.email, "Verify your Golden Refrigeration account", `<div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Account Verification OTP</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:4px">${otp}</h1>
        <p>This OTP is valid for 24 hours.</p>
      </div>`, `Your Golden Refrigeration verification OTP is ${otp}. It is valid for 24 hours.`);
        res.json({ message: "Verification OTP sent to your email." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to send verification OTP.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/auth/verify-otp', userAuth, async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const userId = req.userId;
        const { otp } = req.body;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        if (!otp)
            return res.status(400).json({ error: "OTP is required." });
        const rows = await prisma.$queryRaw `
      SELECT "id", "verifyOtp", "verifyOtpExpiryAt"
      FROM "User"
      WHERE "id" = ${userId}
      LIMIT 1
    `;
        const user = rows[0];
        if (!user)
            return res.status(404).json({ error: "User not found." });
        if (!user.verifyOtp || !user.verifyOtpExpiryAt)
            return res.status(400).json({ error: "No verification OTP found. Send OTP first." });
        if (Date.now() > Number(user.verifyOtpExpiryAt))
            return res.status(400).json({ error: "OTP expired. Request a new OTP." });
        if (String(user.verifyOtp) !== String(otp).trim())
            return res.status(400).json({ error: "Invalid OTP." });
        await prisma.$executeRaw `
      UPDATE "User"
      SET "isAccountVerified" = TRUE,
          "verifyOtp" = NULL,
          "verifyOtpExpiryAt" = NULL
      WHERE "id" = ${userId}
    `;
        res.json({ message: "Account verified successfully." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to verify OTP.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/auth/send-reset-otp', async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ error: "Email is required." });
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (!user)
            return res.status(404).json({ error: "No account found with this email." });
        const otp = generateOtp();
        const expiry = Date.now() + 15 * 60 * 1000;
        await prisma.$executeRaw `
      UPDATE "User"
      SET "resetOtp" = ${otp}, "resetOtpExpiryAt" = ${expiry}
      WHERE "id" = ${user.id}
    `;
        await sendEmail(user.email, "Golden Refrigeration password reset OTP", `<div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Password Reset OTP</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:4px">${otp}</h1>
        <p>This OTP is valid for 15 minutes.</p>
      </div>`, `Your Golden Refrigeration password reset OTP is ${otp}. It is valid for 15 minutes.`);
        res.json({ message: "Password reset OTP sent to your email." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to send reset OTP.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: "Email, OTP, and newPassword are required." });
        }
        if (newPassword.length < 6)
            return res.status(400).json({ error: "New password must be at least 6 characters long." });
        const users = await prisma.$queryRaw `
      SELECT "id", "resetOtp", "resetOtpExpiryAt"
      FROM "User"
      WHERE "email" = ${email.toLowerCase().trim()}
      LIMIT 1
    `;
        const user = users[0];
        if (!user)
            return res.status(404).json({ error: "No account found with this email." });
        if (!user.resetOtp || !user.resetOtpExpiryAt)
            return res.status(400).json({ error: "No reset OTP found. Request OTP first." });
        if (Date.now() > Number(user.resetOtpExpiryAt))
            return res.status(400).json({ error: "OTP expired. Request a new OTP." });
        if (String(user.resetOtp) !== String(otp).trim())
            return res.status(400).json({ error: "Invalid OTP." });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        await prisma.$executeRaw `
      UPDATE "User"
      SET "resetOtp" = NULL, "resetOtpExpiryAt" = NULL
      WHERE "id" = ${user.id}
    `;
        res.json({ message: "Password updated successfully." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to reset password.", details: error?.message || "Unknown error" });
    }
});
app.get('/api/products', async (req, res) => {
    try {
        await ensurePhase1ProductSchema().catch(() => { });
        const products = await prisma.product.findMany({
            orderBy: { id: 'desc' }
        });
        const normalized = products.map((p) => {
            const { cleanDescription, meta } = decodeCompatMetaFromDescription(p.description);
            return {
                ...p,
                description: cleanDescription,
                productType: p.productType || meta.productType || (p.isUsed ? "REFURBISHED" : "NEW"),
                conditionScore: p.conditionScore ?? meta.conditionScore ?? null,
                ageMonths: p.ageMonths ?? meta.ageMonths ?? null,
                warrantyType: p.warrantyType ?? meta.warrantyType ?? null,
                warrantyExpiry: p.warrantyExpiry ?? meta.warrantyExpiry ?? null,
                warrantyCertificateUrl: p.warrantyCertificateUrl ?? meta.warrantyCertificateUrl ?? null,
            };
        });
        res.json(normalized);
    }
    catch (error) {
        try {
            const legacyProducts = await prisma.$queryRaw `
        SELECT "id", "title", "description", "price", "isUsed", "images", "status", "sellerId", "createdAt"
        FROM "Product"
        ORDER BY "id" DESC
      `;
            res.json(legacyProducts.map((p) => ({
                ...(() => {
                    const { cleanDescription, meta } = decodeCompatMetaFromDescription(p.description);
                    return {
                        ...p,
                        description: cleanDescription,
                        productType: meta.productType || (p.isUsed ? "REFURBISHED" : "NEW"),
                        conditionScore: meta.conditionScore ?? null,
                        ageMonths: meta.ageMonths ?? null,
                        warrantyType: meta.warrantyType ?? null,
                        warrantyExpiry: meta.warrantyExpiry ?? null,
                        warrantyCertificateUrl: meta.warrantyCertificateUrl ?? null,
                    };
                })(),
            })));
        }
        catch {
            res.status(500).json({ error: "Database error" });
        }
    }
});
app.post('/api/orders', async (req, res) => {
    try {
        await ensurePhase1ProductSchema().catch(() => { });
        await ensurePhase2Schema().catch(() => { });
        const { userId, productId, deliveryAddress, deliveryPhone, fullName, paymentConfirmed } = req.body;
        if (!userId || !productId || !deliveryAddress || !deliveryPhone) {
            return res.status(400).json({ error: "userId, productId, deliveryAddress, and deliveryPhone are required." });
        }
        const [user, product] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.product.findUnique({ where: { id: productId } }),
        ]);
        if (!user)
            return res.status(404).json({ error: "Customer not found." });
        if (!product)
            return res.status(404).json({ error: "Product not found." });
        if (product.status !== "AVAILABLE")
            return res.status(400).json({ error: "Product is not available for order." });
        const productImageUrl = Array.isArray(product.images) && product.images[0]
            ? String(product.images[0])
            : "";
        const amount = Number(product.price || 0);
        const paymentQR = `upi://pay?pa=${SHOP_UPI_ID}&pn=Golden%20Refrigeration&am=${amount}&cu=INR`;
        const orderId = randomUUID();
        const inserted = await prisma.$queryRaw `
      INSERT INTO "ProductOrder"
      (
        "id",
        "productId",
        "customerId",
        "productTitle",
        "productImageUrl",
        "price",
        "customerName",
        "deliveryPhone",
        "deliveryAddress",
        "orderStatus",
        "paymentStatus",
        "paymentQR",
        "updatedAt"
      )
      VALUES
      (
        ${orderId},
        ${product.id},
        ${user.id},
        ${product.title},
        ${productImageUrl ? cloudinaryOptimizeUrl(productImageUrl) : null},
        ${amount},
        ${String(fullName || user.name || "Customer").trim() || "Customer"},
        ${String(deliveryPhone).trim()},
        ${String(deliveryAddress).trim()},
        ${"ORDER_PLACED"},
        ${paymentConfirmed ? "PAID" : "PENDING"},
        ${paymentQR},
        ${new Date()}
      )
      RETURNING *
    `;
        res.status(201).json({
            order: inserted[0] || null,
            paymentQR,
            statusFlow: ORDER_STATUS_FLOW,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to place order.", details: error?.message || "Unknown error" });
    }
});
app.get('/api/orders/my', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const userId = String(req.query.userId || "").trim();
        if (!userId)
            return res.status(400).json({ error: "userId is required." });
        const rows = await prisma.$queryRaw `
      SELECT *
      FROM "ProductOrder"
      WHERE "customerId" = ${userId}
      ORDER BY "createdAt" DESC
    `;
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch customer orders.", details: error?.message || "Unknown error" });
    }
});
app.get('/api/admin/orders', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const rows = await prisma.$queryRaw `
      SELECT
        o.*,
        u."name" AS "userName",
        u."email" AS "userEmail"
      FROM "ProductOrder" o
      LEFT JOIN "User" u ON u."id" = o."customerId"
      ORDER BY o."createdAt" DESC
      LIMIT 120
    `;
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch admin orders.", details: error?.message || "Unknown error" });
    }
});
app.patch('/api/admin/orders/:id', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const { orderStatus } = req.body;
        if (!orderStatus || !ORDER_STATUS_FLOW.includes(orderStatus)) {
            return res.status(400).json({ error: "Valid orderStatus is required." });
        }
        const updated = await prisma.$queryRaw `
      UPDATE "ProductOrder"
      SET "orderStatus" = ${orderStatus}, "updatedAt" = ${new Date()}
      WHERE "id" = ${id}
      RETURNING *
    `;
        if (!updated.length)
            return res.status(404).json({ error: "Order not found." });
        res.json({ order: updated[0] });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update order status.", details: error?.message || "Unknown error" });
    }
});
app.post('/api/admin/orders/:id/generate-invoice', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const rows = await prisma.$queryRaw `
      SELECT *
      FROM "ProductOrder"
      WHERE "id" = ${id}
      LIMIT 1
    `;
        if (!rows.length)
            return res.status(404).json({ error: "Order not found." });
        const invoiceUrl = `${req.protocol}://${req.get("host")}/api/docs/order-invoice/${id}`;
        const updated = await prisma.$queryRaw `
      UPDATE "ProductOrder"
      SET "invoiceUrl" = ${invoiceUrl}, "updatedAt" = ${new Date()}
      WHERE "id" = ${id}
      RETURNING *
    `;
        res.json({ order: updated[0] || rows[0], invoiceUrl });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate order invoice.", details: error?.message || "Unknown error" });
    }
});
app.get('/api/docs/order-invoice/:orderId', async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { orderId } = req.params;
        const rows = await prisma.$queryRaw `
      SELECT
        o.*,
        u."email" AS "customerEmail"
      FROM "ProductOrder" o
      LEFT JOIN "User" u ON u."id" = o."customerId"
      WHERE o."id" = ${orderId}
      LIMIT 1
    `;
        if (!rows.length)
            return res.status(404).json({ error: "Order not found." });
        const order = rows[0];
        const lines = [
            `Order ID: ${order.id}`,
            `Date: ${new Date(order.createdAt).toLocaleString("en-IN")}`,
            `Customer: ${order.customerName || "Customer"}`,
            `Phone: ${order.deliveryPhone || "N/A"}`,
            `Address: ${order.deliveryAddress || "N/A"}`,
            `Product: ${order.productTitle || "N/A"}`,
            `Order Status: ${order.orderStatus || "ORDER_PLACED"}`,
            `Amount: ₹${Number(order.price || 0).toLocaleString("en-IN")}`,
            `Payment Status: ${order.paymentStatus || "PENDING"}`,
        ];
        const pdfBuffer = makeSimplePdfBuffer("Golden Refrigeration - Product Invoice", lines);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="order-invoice-${orderId}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate order invoice.", details: error?.message || "Unknown error" });
    }
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch diagnosis data." });
    }
});
// 2. Dashboard Stats (Original Version)
app.get('/api/admin/stats-basic', async (req, res) => {
    try {
        const [bookingsCountRows, usersCountRows, productsCountRows] = await Promise.all([
            prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "ServiceBooking"`,
            prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "User"`,
            prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "Product"`,
        ]);
        const totalBookings = Number(bookingsCountRows?.[0]?.count || 0);
        const totalUsers = Number(usersCountRows?.[0]?.count || 0);
        const totalProducts = Number(productsCountRows?.[0]?.count || 0);
        res.json({ totalBookings, totalUsers, totalProducts });
    }
    catch (error) {
        res.status(500).json({ error: "Stats fetch failed" });
    }
});
// 3. Upgrade Stats with Latest Products & Appliance Pulse
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [bookingsCountRows, usersCountRows, productsCountRows, latestUsers, latestProducts, applianceStats] = await Promise.all([
            prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "ServiceBooking"`.catch(() => []),
            prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "User"`.catch(() => []),
            prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "Product"`.catch(() => []),
            prisma.$queryRaw `
        SELECT "id", "name", "email"
        FROM "User"
        ORDER BY "createdAt" DESC NULLS LAST
        LIMIT 5
      `.catch(() => []),
            prisma.$queryRaw `
        SELECT "id", "title", "price", "images", "status", "isUsed"
        FROM "Product"
        ORDER BY "id" DESC
      `.catch(() => []),
            prisma.$queryRaw `
        SELECT "appliance", COUNT(*)::bigint AS count
        FROM "ServiceBooking"
        GROUP BY "appliance"
      `.catch(() => [])
        ]);
        const totalBookings = Number(bookingsCountRows?.[0]?.count || 0);
        const totalUsers = Number(usersCountRows?.[0]?.count || 0);
        const totalProducts = Number(productsCountRows?.[0]?.count || 0);
        res.json({
            totalBookings,
            totalUsers,
            totalProducts,
            latestUsers,
            latestProducts: latestProducts.map((p) => ({
                ...p,
                productType: p.isUsed ? "REFURBISHED" : "NEW",
            })),
            applianceStats: applianceStats.map((row) => ({
                appliance: row.appliance,
                _count: { _all: Number(row.count || 0) }
            }))
        });
    }
    catch (error) {
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
        const imageUrl = cloudinaryOptimizeUrl(uploaded.secure_url);
        res.status(201).json({ imageUrl, originalUrl: uploaded.secure_url });
    }
    catch (error) {
        console.error("Upload Error:", error.message);
        res.status(500).json({ error: "Image upload failed." });
    }
});
app.post('/api/admin/suggest-price', async (req, res) => {
    try {
        const { basePrice, conditionScore, ageMonths, productType, title, description } = req.body;
        const parsedBase = Number(basePrice || 0);
        const parsedCondition = Number(conditionScore || 8);
        const parsedAge = Number(ageMonths || 0);
        const type = productType === "REFURBISHED" ? "REFURBISHED" : "NEW";
        if (!parsedBase || parsedBase <= 0) {
            return res.status(400).json({ error: "basePrice is required." });
        }
        let formulaSuggested = parsedBase;
        if (type === "REFURBISHED") {
            const agePenalty = Math.min(parsedAge * 0.012, 0.45);
            const conditionBoost = Math.max((parsedCondition - 5) * 0.03, -0.2);
            formulaSuggested = parsedBase * (1 - agePenalty + conditionBoost);
        }
        else {
            formulaSuggested = parsedBase * 1.02;
        }
        const marketRows = await prisma.$queryRaw `
      SELECT "title", "price", "isUsed"
      FROM "Product"
      WHERE "status" = 'AVAILABLE'
      ORDER BY "id" DESC
      LIMIT 140
    `.catch(() => []);
        const queryTokens = tokenize(`${title || ""} ${description || ""}`);
        const tokenSet = new Set(queryTokens);
        const sameTypeRows = marketRows.filter((row) => (type === "REFURBISHED" ? row.isUsed : !row.isUsed));
        const comparables = sameTypeRows
            .map((row) => {
            const rowTokens = tokenize(row.title || "");
            const overlap = rowTokens.filter((t) => tokenSet.has(t)).length;
            const similarity = tokenSet.size > 0 ? overlap / tokenSet.size : 0;
            const weight = 1 + similarity * 2;
            return { ...row, similarity, weight };
        })
            .filter((row) => tokenSet.size === 0 || row.similarity > 0)
            .slice(0, 60);
        const fallbackComparables = comparables.length
            ? comparables
            : sameTypeRows.slice(0, 30).map((row) => ({ ...row, similarity: 0, weight: 1 }));
        const comparablePrices = fallbackComparables.map((c) => Number(c.price)).filter((p) => Number.isFinite(p) && p > 0);
        const marketMedian = median(comparablePrices);
        let marketSuggested = parsedBase;
        if (marketMedian) {
            if (type === "REFURBISHED") {
                const conditionFactor = clamp(0.72 + (parsedCondition - 1) * 0.038, 0.58, 1.08);
                const ageFactor = clamp(1 - parsedAge * 0.01, 0.52, 1.02);
                marketSuggested = marketMedian * conditionFactor * ageFactor;
            }
            else {
                marketSuggested = marketMedian * 1.01;
            }
        }
        const sampleSize = fallbackComparables.length;
        const marketWeight = marketMedian ? clamp(0.35 + sampleSize * 0.02, 0.35, 0.78) : 0;
        const suggested = marketWeight
            ? (marketSuggested * marketWeight) + (formulaSuggested * (1 - marketWeight))
            : formulaSuggested;
        const confidenceScore = clamp((marketMedian ? 0.48 : 0.26) +
            Math.min(sampleSize * 0.018, 0.34) -
            (type === "REFURBISHED" ? Math.min(parsedAge * 0.002, 0.1) : 0), 0.2, 0.92);
        const spread = confidenceScore >= 0.75 ? 0.08 : confidenceScore >= 0.58 ? 0.12 : 0.18;
        const floor = Math.max(500, Math.round(suggested * (1 - spread)));
        const ceil = Math.round(suggested * (1 + spread));
        const quickSalePrice = Math.max(500, Math.round(suggested * (1 - spread * 0.85)));
        const premiumListingPrice = Math.round(suggested * (1 + spread * 0.9));
        const reasoning = [
            marketMedian
                ? `Used ${sampleSize} comparable ${type === "REFURBISHED" ? "refurbished" : "new"} listings from your live inventory.`
                : "No strong comparables found; applied condition-age formula model.",
            type === "REFURBISHED"
                ? `Adjusted by condition ${parsedCondition}/10 and age ${parsedAge} months.`
                : "Applied new-product margin and market anchor blending.",
            "Final price remains admin decision; this is AI guidance."
        ];
        res.json({
            suggestedPrice: Math.round(suggested),
            recommendedMin: floor,
            recommendedMax: ceil,
            quickSalePrice,
            premiumListingPrice,
            confidenceScore: Number(confidenceScore.toFixed(2)),
            marketSampleSize: sampleSize,
            reasoning,
            note: type === "REFURBISHED"
                ? "Market-aware refurbished pricing with condition and age adjustments."
                : "Market-aware new product pricing guidance."
        });
    }
    catch (error) {
        console.error("Suggest Price Error:", error.message);
        res.status(500).json({ error: "Price suggestion failed." });
    }
});
app.post('/api/admin/add-product', async (req, res) => {
    try {
        await ensurePhase1ProductSchema().catch(() => { });
        const { title, description, price, sellerId, imageUrl, productType, conditionScore, ageMonths, warrantyType, warrantyExpiry, warrantyCertificateUrl } = req.body;
        if (!title || !price || !sellerId) {
            return res.status(400).json({ error: "Missing details!" });
        }
        const normalizedProductType = productType === "REFURBISHED" ? "REFURBISHED" : "NEW";
        const optimizedImageUrl = imageUrl ? cloudinaryOptimizeUrl(imageUrl) : "";
        const conditionRaw = parseOptionalNumber(conditionScore);
        const ageRaw = parseOptionalNumber(ageMonths);
        const parsedCondition = conditionRaw === null ? null : Math.min(10, Math.max(1, Math.round(conditionRaw)));
        const parsedAge = ageRaw === null ? null : Math.max(0, Math.round(ageRaw));
        const parsedWarrantyExpiry = parseFlexibleDate(warrantyExpiry);
        const normalizedWarrantyType = warrantyType === "SHOP" || warrantyType === "BRAND"
            ? warrantyType
            : null;
        const compatMeta = {
            productType: normalizedProductType,
            conditionScore: parsedCondition,
            ageMonths: parsedAge,
            warrantyType: normalizedWarrantyType,
            warrantyExpiry: parsedWarrantyExpiry ? parsedWarrantyExpiry.toISOString() : null,
            warrantyCertificateUrl: warrantyCertificateUrl || null,
        };
        if (conditionRaw !== null && Number.isNaN(conditionRaw)) {
            return res.status(400).json({ error: "Condition score must be a valid number between 1 and 10." });
        }
        if (ageRaw !== null && Number.isNaN(ageRaw)) {
            return res.status(400).json({ error: "Age in months must be a valid number." });
        }
        const baseData = {
            title,
            description: description || "",
            price: parseFloat(price),
            sellerId,
            isUsed: normalizedProductType === "REFURBISHED",
            images: optimizedImageUrl ? [optimizedImageUrl] : [],
            status: 'AVAILABLE'
        };
        let newProduct;
        try {
            newProduct = await prisma.product.create({
                data: {
                    ...baseData,
                    productType: normalizedProductType,
                    conditionScore: parsedCondition,
                    ageMonths: parsedAge,
                    warrantyType: normalizedWarrantyType,
                    warrantyExpiry: parsedWarrantyExpiry,
                    warrantyCertificateUrl: warrantyCertificateUrl || null
                }
            });
        }
        catch (phaseOneError) {
            const msg = String(phaseOneError?.message || "").toLowerCase();
            const isSchemaCompatibilityIssue = phaseOneError?.code === "P2021" ||
                phaseOneError?.code === "P2022" ||
                msg.includes("column") ||
                msg.includes("does not exist");
            if (!isSchemaCompatibilityIssue) {
                throw phaseOneError;
            }
            await ensurePhase1ProductSchema().catch(() => { });
            try {
                newProduct = await prisma.product.create({
                    data: {
                        ...baseData,
                        productType: normalizedProductType,
                        conditionScore: parsedCondition,
                        ageMonths: parsedAge,
                        warrantyType: normalizedWarrantyType,
                        warrantyExpiry: parsedWarrantyExpiry,
                        warrantyCertificateUrl: warrantyCertificateUrl || null
                    }
                });
                return res.status(201).json({ message: "Product added!", product: newProduct });
            }
            catch {
                // continue with minimal fallback below
            }
            // Backward-compatible save path for databases that have not run phase-1 migration yet.
            const legacyId = randomUUID();
            const fallbackDescription = encodeCompatMetaInDescription(description || "", compatMeta);
            await prisma.$executeRaw `
        INSERT INTO "Product" ("id", "title", "description", "price", "isUsed", "images", "status", "sellerId")
        VALUES (${legacyId}, ${baseData.title}, ${fallbackDescription}, ${baseData.price}, ${baseData.isUsed}, ${baseData.images}, ${baseData.status}, ${baseData.sellerId})
      `;
            newProduct = { id: legacyId, ...baseData, ...compatMeta, description: description || "" };
        }
        res.status(201).json({ message: "Product added!", product: newProduct });
    }
    catch (error) {
        console.error("Add Product Error:", error.message);
        res.status(500).json({
            error: "Failed to save product.",
            details: error?.message || "Unknown server error",
            code: error?.code || null
        });
    }
});
app.post('/api/admin/seed-demo-products', async (req, res) => {
    try {
        const { sellerId } = req.body;
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
                    isUsed: true,
                    productType: "REFURBISHED",
                    conditionScore: 8,
                    ageMonths: 14,
                    warrantyType: "SHOP",
                    warrantyExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
                    warrantyCertificateUrl: "",
                    sellerId: seller.id,
                    status: 'AVAILABLE',
                },
            });
            created++;
        }
        res.json({ message: "Demo products seeded.", created, skipped });
    }
    catch (error) {
        console.error("Seed Error:", error.message);
        res.status(500).json({ error: "Failed to seed demo products." });
    }
});
app.delete('/api/admin/delete-product/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id } });
        res.json({ message: "Product deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete product." });
    }
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is ACTIVE on http://localhost:${PORT}`);
});
