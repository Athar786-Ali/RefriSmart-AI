import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from './generated/client/client.js';
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
const cloudinaryOptimizeUrl = (rawUrl) => {
    if (!rawUrl || !rawUrl.includes("res.cloudinary.com") || !rawUrl.includes("/upload/")) {
        return rawUrl;
    }
    return rawUrl.replace("/upload/", "/upload/f_webp,q_auto:good,c_limit,w_1400/");
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
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const generateFallbackDiagnosis = (appliance, issue) => {
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
        if (!appliance || !issue)
            return res.status(400).json({ error: "Please provide appliance details and issue description." });
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
        ].filter(Boolean);
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
                ]);
                aiDiagnosis = response.text?.trim() || "";
                if (aiDiagnosis)
                    break;
            }
            catch (modelError) {
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
// --- AUTH & PRODUCTS ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({ data: { name, email, password: hashedPassword } });
        res.status(201).json({ message: "User created!" });
    }
    catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
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
    }
    catch (error) {
        res.status(500).json({ error: "Login failed" });
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
