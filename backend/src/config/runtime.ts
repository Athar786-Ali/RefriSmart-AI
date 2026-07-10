import nodemailer from "nodemailer";
import { randomUUID } from "node:crypto";
import { prisma } from "./prisma.js";

export const PORT = Number(process.env.PORT || 5001);
export const JWT_SECRET = process.env.JWT_SECRET || "golden_ref_secret_123";
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";

const mailTransporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const demoProducts = [
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

export const cloudinaryOptimizeUrl = (rawUrl: string) => {
  if (!rawUrl || !rawUrl.includes("res.cloudinary.com") || !rawUrl.includes("/upload/")) {
    return rawUrl;
  }
  // Idempotency guard: if transforms are already embedded in the URL, return as-is.
  // Without this, calling cloudinaryOptimizeUrl twice produces a broken double-transform URL
  // like: /upload/f_webp,.../upload/f_webp,.../image.jpg
  const uploadSegment = rawUrl.slice(rawUrl.indexOf("/upload/") + "/upload/".length);
  const firstSegment = uploadSegment.split("/")[0] || "";
  if (firstSegment.includes("f_") || firstSegment.includes("q_") || firstSegment.includes("w_") || firstSegment.includes("c_")) {
    return rawUrl;
  }
  return rawUrl.replace("/upload/", "/upload/f_webp,q_auto:good,c_limit,w_1400/");
};

export const inferMediaTypeFromUrl = (url: string): "image" | "video" => {
  const clean = (url || "").toLowerCase().split("?")[0];
  if (clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov") || clean.endsWith(".mkv")) {
    return "video";
  }
  return "image";
};

export const parseFlexibleDate = (value: unknown): Date | null => {
  if (!value || typeof value !== "string") return null;

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;

  const ddmmyyyy = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!ddmmyyyy) return null;
  const day = Number(ddmmyyyy[1]);
  const month = Number(ddmmyyyy[2]) - 1;
  const year = Number(ddmmyyyy[3]);
  const normalized = new Date(year, month, day);
  return Number.isNaN(normalized.getTime()) ? null : normalized;
};

export const parseOptionalNumber = (value: unknown) => {
  if (value === undefined || value === null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? Number.NaN : parsed;
};

export const tokenize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !["the", "and", "with", "for", "from"].includes(token));

export const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
};

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const PRODUCT_META_MARKER = "__GR_META__";

export type ProductCompatMeta = {
  productType?: "NEW" | "REFURBISHED";
  conditionScore?: number | null;
  ageMonths?: number | null;
  warrantyType?: "BRAND" | "SHOP" | null;
  warrantyExpiry?: string | null;
  warrantyCertificateUrl?: string | null;
};

export const encodeCompatMetaInDescription = (description: string, meta: ProductCompatMeta) => {
  const clean = description.includes(PRODUCT_META_MARKER)
    ? description.split(PRODUCT_META_MARKER)[0].trim()
    : description.trim();
  return `${clean}\n\n${PRODUCT_META_MARKER}${JSON.stringify(meta)}`;
};

export const decodeCompatMetaFromDescription = (description: string | null | undefined) => {
  if (!description || typeof description !== "string") {
    return { cleanDescription: "", meta: {} as ProductCompatMeta };
  }

  const idx = description.indexOf(PRODUCT_META_MARKER);
  if (idx === -1) {
    return { cleanDescription: description, meta: {} as ProductCompatMeta };
  }

  const cleanDescription = description.slice(0, idx).trim();
  const rawMeta = description.slice(idx + PRODUCT_META_MARKER.length).trim();
  try {
    const parsed = JSON.parse(rawMeta) as ProductCompatMeta;
    return { cleanDescription, meta: parsed || {} };
  } catch {
    return { cleanDescription, meta: {} as ProductCompatMeta };
  }
};

let phase1SchemaEnsured = false;
export const ensurePhase1ProductSchema = async () => {
  if (phase1SchemaEnsured) return;
  try {
    await prisma.product.updateMany({
      where: { isUsed: true, productType: { not: "REFURBISHED" } },
      data: { productType: "REFURBISHED" },
    });
    await prisma.product.updateMany({
      where: { isUsed: false, productType: { not: "NEW" } },
      data: { productType: "NEW" },
    });
  } catch {
    // Ignore if schema not yet migrated.
  }

  phase1SchemaEnsured = true;
};

let phase2SchemaEnsured = false;
export const ensurePhase2Schema = async () => {
  if (phase2SchemaEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "SellRequest" ADD COLUMN IF NOT EXISTS "contactName" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "SellRequest" ADD COLUMN IF NOT EXISTS "address" TEXT`);
    await prisma.$executeRawUnsafe(`
      UPDATE "SellRequest" sr
      SET "contactName" = u."name"
      FROM "User" u
      WHERE sr."userId" = u."id"
        AND (sr."contactName" IS NULL OR BTRIM(sr."contactName") = '')
    `);

    await prisma.technician.upsert({
      where: { id: "tech-1" },
      update: {
        name: "Ravi Kumar",
        phone: "7070494254",
        role: "TECHNICIAN",
        pincode: "813210",
        active: true,
      },
      create: {
        id: "tech-1",
        name: "Ravi Kumar",
        phone: "7070494254",
        role: "TECHNICIAN",
        pincode: "813210",
        active: true,
      },
    });
    await prisma.technician.upsert({
      where: { id: "tech-2" },
      update: {
        name: "Anil Singh",
        phone: "9060877596",
        role: "TECHNICIAN",
        pincode: "813210",
        active: true,
      },
      create: {
        id: "tech-2",
        name: "Anil Singh",
        phone: "9060877596",
        role: "TECHNICIAN",
        pincode: "813210",
        active: true,
      },
    });
  } catch {
    // Ignore if schema not yet migrated.
  }

  phase2SchemaEnsured = true;
};

let authSchemaEnsured = false;
export const ensureAuthSchema = async () => {
  if (authSchemaEnsured) return;

  authSchemaEnsured = true;
};

export const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP credentials are missing. Set SMTP_USER and SMTP_PASS.");
  }
  await mailTransporter.sendMail({
    from: '"Golden Refrigeration" <mdatharsbr@gmail.com>',
    to,
    subject,
    text: text || "Golden Refrigeration notification",
    html,
  });
};

export const isEmailConfigured = () => Boolean(SMTP_USER && SMTP_PASS);

// WhatsApp fallback uses a "click to chat" deep link and does not require server-side credentials.

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const TECHNICIAN_PHONE = "7070494254";
export const SHOP_UPI_ID = "7070494254-2@ybl";
export const ORDER_STATUS_FLOW = ["PLACED", "DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

export type StructuredDiagnosis = {
  probableFault: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  partsList: string[];
  estimatedCostMin: number;
  estimatedCostMax: number;
  actionPlan: string;
};

export type InputLanguage = "ENGLISH" | "HINGLISH" | "HINDI";

export const detectInputLanguage = (text: string): InputLanguage => {
  if (/[\u0900-\u097F]/.test(text)) return "HINDI";
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

export const formatSlotLabel = (date: Date) =>
  date.toLocaleString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

export const extractJsonObject = (input: string) => {
  const start = input.indexOf("{");
  const end = input.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return input.slice(start, end + 1);
};

export const fallbackStructuredDiagnosis = (appliance: string, issue: string, language: InputLanguage): StructuredDiagnosis => {
  const normalized = issue.toLowerCase();
  let probableFault = "Power fluctuation or internal component wear";
  let urgency: StructuredDiagnosis["urgency"] = "MEDIUM";
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
  } else if (normalized.includes("noise") || normalized.includes("awaz") || normalized.includes("fan")) {
    probableFault = "Fan motor imbalance or bearing wear";
    urgency = "MEDIUM";
    partsList = ["Fan motor inspection", "Bearing set", "Mounting alignment"];
    estimatedCostMin = 900;
    estimatedCostMax = 3200;
    actionPlan = "Avoid heavy use and get fan assembly checked before motor damage increases.";
  } else if (normalized.includes("leak") || normalized.includes("pani")) {
    probableFault = "Drain blockage or pipe seal damage";
    urgency = "MEDIUM";
    partsList = ["Drain pipe cleaning", "Seal kit", "Inlet valve check"];
    estimatedCostMin = 800;
    estimatedCostMax = 2800;
    actionPlan = "Stop water flow, clean visible drain path, and schedule technician for seal and valve checks.";
  } else if (normalized.includes("spark") || normalized.includes("burn")) {
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
      probableFault,
      urgency,
      partsList,
      estimatedCostMin,
      estimatedCostMax,
      actionPlan: "Machine ko safe mode me rakhkar technician visit schedule karein. " + actionPlan,
    };
  }
  return { probableFault, urgency, partsList, estimatedCostMin, estimatedCostMax, actionPlan };
};

export const generateSuggestedSlots = (startDate?: Date) => {
  const now = new Date();
  const base = startDate && !Number.isNaN(startDate.getTime()) ? startDate : now;
  const slots: Array<{ value: string; label: string }> = [];
  for (let day = 0; day < 5; day += 1) {
    for (const hour of [10, 12, 14, 16, 18]) {
      const slot = new Date(base);
      slot.setDate(base.getDate() + day);
      slot.setHours(hour, 0, 0, 0);
      if (slot.getTime() <= now.getTime() + 30 * 60 * 1000) continue;
      slots.push({ value: slot.toISOString(), label: formatSlotLabel(slot) });
    }
  }
  return slots.slice(0, 12);
};

export const makeSimplePdfBuffer = (title: string, lines: string[]) => {
  const escape = (text: string) => text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
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

// ── Professional Invoice PDF Generator ──────────────────────────────────
export type InvoiceData = {
  invoiceNumber: string;
  invoiceDate: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  appliance: string;
  issue: string;
  status: string;
  scheduledDate: string;
  technicianName: string;
  technicianPhone: string;
  serviceCharge: number;
  gstPercent: number;
};

export const makeProfessionalInvoicePdf = (data: InvoiceData): Buffer => {
  const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const rupee = (n: number) => `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const gstAmount = Math.round(data.serviceCharge * data.gstPercent / 100 * 100) / 100;
  const totalAmount = data.serviceCharge + gstAmount;

  // Page dimensions (A4: 595 x 842)
  const W = 595, H = 842;
  const ML = 50, MR = 50; // margins
  const CW = W - ML - MR; // content width = 495

  // We'll build all the drawing commands for the page content stream
  const cmds: string[] = [];

  // ── 1. Header bar (dark blue-grey background) ──
  cmds.push("q"); // save graphics state
  cmds.push("0.129 0.145 0.192 rg"); // dark navy (#212538)
  cmds.push(`${ML - 10} ${H - 120} ${CW + 20} 80 re f`); // filled rectangle
  cmds.push("Q"); // restore

  // Golden accent line below header
  cmds.push("q");
  cmds.push("0.855 0.647 0.243 RG"); // golden color (#DAA53E)
  cmds.push("2 w"); // line width
  cmds.push(`${ML - 10} ${H - 122} m ${ML + CW + 10} ${H - 122} l S`);
  cmds.push("Q");

  // Company name in header (white, large)
  cmds.push("BT");
  cmds.push("1 1 1 rg"); // white
  cmds.push("/F2 22 Tf"); // bold, large
  cmds.push(`${ML + 10} ${H - 85} Td`);
  cmds.push(`(${esc("GOLDEN REFRIGERATION")}) Tj`);
  cmds.push("ET");

  // Tagline
  cmds.push("BT");
  cmds.push("0.855 0.647 0.243 rg"); // golden
  cmds.push("/F1 9 Tf");
  cmds.push(`${ML + 10} ${H - 102} Td`);
  cmds.push(`(${esc("Expert Appliance Repair & Service | Since 2015")}) Tj`);
  cmds.push("ET");

  // INVOICE label (right side of header)
  cmds.push("BT");
  cmds.push("1 1 1 rg");
  cmds.push("/F2 18 Tf");
  cmds.push(`${W - MR - 120} ${H - 85} Td`);
  cmds.push(`(${esc("INVOICE")}) Tj`);
  cmds.push("ET");

  // ── 2. Invoice meta info (below header) ──
  let y = H - 155;
  const labelX = ML + 10;
  const valX = ML + 120;
  const rightLabelX = ML + 280;
  const rightValX = ML + 380;

  // Left column
  const metaLeft = [
    ["Invoice No:", data.invoiceNumber],
    ["Invoice Date:", data.invoiceDate],
    ["Booking ID:", data.bookingId.substring(0, 18) + (data.bookingId.length > 18 ? "..." : "")],
  ];
  // Right column
  const metaRight = [
    ["Status:", data.status],
    ["Service Date:", data.scheduledDate],
  ];

  cmds.push("BT");
  cmds.push("0.3 0.3 0.3 rg");
  cmds.push("/F1 9 Tf");
  cmds.push(`${labelX} ${y} Td`);
  for (let i = 0; i < metaLeft.length; i++) {
    if (i > 0) cmds.push(`0 -16 Td`);
    cmds.push(`(${esc(metaLeft[i][0])}) Tj`);
  }
  cmds.push("ET");

  cmds.push("BT");
  cmds.push("0.1 0.1 0.1 rg");
  cmds.push("/F2 9 Tf");
  cmds.push(`${valX} ${y} Td`);
  for (let i = 0; i < metaLeft.length; i++) {
    if (i > 0) cmds.push(`0 -16 Td`);
    cmds.push(`(${esc(metaLeft[i][1])}) Tj`);
  }
  cmds.push("ET");

  cmds.push("BT");
  cmds.push("0.3 0.3 0.3 rg");
  cmds.push("/F1 9 Tf");
  cmds.push(`${rightLabelX} ${y} Td`);
  for (let i = 0; i < metaRight.length; i++) {
    if (i > 0) cmds.push(`0 -16 Td`);
    cmds.push(`(${esc(metaRight[i][0])}) Tj`);
  }
  cmds.push("ET");

  cmds.push("BT");
  cmds.push("0.1 0.1 0.1 rg");
  cmds.push("/F2 9 Tf");
  cmds.push(`${rightValX} ${y} Td`);
  for (let i = 0; i < metaRight.length; i++) {
    if (i > 0) cmds.push(`0 -16 Td`);
    cmds.push(`(${esc(metaRight[i][1])}) Tj`);
  }
  cmds.push("ET");

  // ── 3. Divider line ──
  y -= 60;
  cmds.push("q");
  cmds.push("0.85 0.85 0.85 RG");
  cmds.push("0.5 w");
  cmds.push(`${ML} ${y} m ${W - MR} ${y} l S`);
  cmds.push("Q");

  // ── 4. Bill To section ──
  y -= 22;
  cmds.push("BT");
  cmds.push("0.129 0.145 0.192 rg");
  cmds.push("/F2 11 Tf");
  cmds.push(`${labelX} ${y} Td`);
  cmds.push(`(${esc("BILL TO")}) Tj`);
  cmds.push("ET");

  y -= 18;
  const customerLines = [
    data.customerName || "N/A",
    data.customerPhone ? `Phone: ${data.customerPhone}` : "",
    data.customerEmail ? `Email: ${data.customerEmail}` : "",
    data.customerAddress ? `Address: ${data.customerAddress}` : "",
  ].filter(Boolean);

  cmds.push("BT");
  cmds.push("0.2 0.2 0.2 rg");
  cmds.push("/F1 9 Tf");
  cmds.push(`${labelX} ${y} Td`);
  for (let i = 0; i < customerLines.length; i++) {
    if (i > 0) cmds.push("0 -15 Td");
    cmds.push(`(${esc(customerLines[i])}) Tj`);
  }
  cmds.push("ET");

  y -= (customerLines.length - 1) * 15 + 25;

  // ── 5. Service Details Table ──
  // Table header background
  const tableX = ML;
  const tableW = CW;
  const rowH = 28;
  const headerY = y;

  cmds.push("q");
  cmds.push("0.929 0.941 0.965 rg"); // light blue-grey (#EDF0F6)
  cmds.push(`${tableX} ${headerY - rowH} ${tableW} ${rowH} re f`);
  cmds.push("Q");

  // Table header text
  const colPositions = [tableX + 10, tableX + 80, tableX + 210, tableX + 390];
  const colHeaders = ["S.No.", "Description", "Details", "Amount"];

  cmds.push("BT");
  cmds.push("0.129 0.145 0.192 rg");
  cmds.push("/F2 9 Tf");
  for (let i = 0; i < colHeaders.length; i++) {
    cmds.push(`${colPositions[i]} ${headerY - 18} Td`);
    cmds.push(`(${esc(colHeaders[i])}) Tj`);
    if (i < colHeaders.length - 1) {
      // Move cursor for next absolute position
      cmds.push(`${colPositions[i + 1] - colPositions[i]} 0 Td`);
    }
  }
  cmds.push("ET");

  // Table header border
  cmds.push("q");
  cmds.push("0.75 0.75 0.75 RG");
  cmds.push("0.5 w");
  cmds.push(`${tableX} ${headerY} ${tableW} ${-rowH} re S`);
  cmds.push("Q");

  // Table rows
  const rows = [
    ["1", "Appliance Type", data.appliance, ""],
    ["2", "Issue Reported", data.issue.length > 40 ? data.issue.substring(0, 40) + "..." : data.issue, ""],
    ["3", "Service / Repair Charge", "Professional service", rupee(data.serviceCharge)],
  ];

  let rowY = headerY - rowH;
  for (const row of rows) {
    // Row background (alternate)
    const rowIndex = rows.indexOf(row);
    if (rowIndex % 2 === 1) {
      cmds.push("q");
      cmds.push("0.973 0.976 0.984 rg"); // very light grey
      cmds.push(`${tableX} ${rowY - rowH} ${tableW} ${rowH} re f`);
      cmds.push("Q");
    }

    // Row text
    cmds.push("BT");
    cmds.push("0.2 0.2 0.2 rg");
    cmds.push("/F1 9 Tf");
    cmds.push(`${colPositions[0]} ${rowY - 18} Td`);
    cmds.push(`(${esc(row[0])}) Tj`);
    cmds.push("ET");

    cmds.push("BT");
    cmds.push("0.2 0.2 0.2 rg");
    cmds.push("/F2 9 Tf");
    cmds.push(`${colPositions[1]} ${rowY - 18} Td`);
    cmds.push(`(${esc(row[1])}) Tj`);
    cmds.push("ET");

    cmds.push("BT");
    cmds.push("0.3 0.3 0.3 rg");
    cmds.push("/F1 9 Tf");
    cmds.push(`${colPositions[2]} ${rowY - 18} Td`);
    cmds.push(`(${esc(row[2])}) Tj`);
    cmds.push("ET");

    if (row[3]) {
      cmds.push("BT");
      cmds.push("0.1 0.1 0.1 rg");
      cmds.push("/F2 9 Tf");
      cmds.push(`${colPositions[3]} ${rowY - 18} Td`);
      cmds.push(`(${esc(row[3])}) Tj`);
      cmds.push("ET");
    }

    // Row border
    cmds.push("q");
    cmds.push("0.85 0.85 0.85 RG");
    cmds.push("0.5 w");
    cmds.push(`${tableX} ${rowY - rowH} ${tableW} ${rowH} re S`);
    cmds.push("Q");

    rowY -= rowH;
  }

  // ── 6. Cost breakdown (right-aligned summary box) ──
  y = rowY - 20;
  const summaryX = tableX + tableW - 220;
  const summaryLabelX = summaryX + 10;
  const summaryValX = summaryX + 160;
  const summaryW = 220;

  // Subtotal
  cmds.push("q");
  cmds.push("0.96 0.96 0.96 rg");
  cmds.push(`${summaryX} ${y - 22} ${summaryW} 22 re f`);
  cmds.push("Q");
  cmds.push("BT");
  cmds.push("0.3 0.3 0.3 rg");
  cmds.push("/F1 9 Tf");
  cmds.push(`${summaryLabelX} ${y - 15} Td`);
  cmds.push(`(${esc("Subtotal")}) Tj`);
  cmds.push("ET");
  cmds.push("BT");
  cmds.push("0.1 0.1 0.1 rg");
  cmds.push("/F2 9 Tf");
  cmds.push(`${summaryValX} ${y - 15} Td`);
  cmds.push(`(${esc(rupee(data.serviceCharge))}) Tj`);
  cmds.push("ET");

  y -= 22;

  // GST
  cmds.push("BT");
  cmds.push("0.3 0.3 0.3 rg");
  cmds.push("/F1 9 Tf");
  cmds.push(`${summaryLabelX} ${y - 15} Td`);
  cmds.push(`(${esc(`GST (${data.gstPercent}%)`)}) Tj`);
  cmds.push("ET");
  cmds.push("BT");
  cmds.push("0.1 0.1 0.1 rg");
  cmds.push("/F1 9 Tf");
  cmds.push(`${summaryValX} ${y - 15} Td`);
  cmds.push(`(${esc(rupee(gstAmount))}) Tj`);
  cmds.push("ET");

  y -= 22;

  // Divider above total
  cmds.push("q");
  cmds.push("0.129 0.145 0.192 RG");
  cmds.push("1 w");
  cmds.push(`${summaryX} ${y} m ${summaryX + summaryW} ${y} l S`);
  cmds.push("Q");

  // Total (highlighted)
  cmds.push("q");
  cmds.push("0.129 0.145 0.192 rg");
  cmds.push(`${summaryX} ${y - 28} ${summaryW} 26 re f`);
  cmds.push("Q");
  cmds.push("BT");
  cmds.push("1 1 1 rg"); // white text
  cmds.push("/F2 11 Tf");
  cmds.push(`${summaryLabelX} ${y - 20} Td`);
  cmds.push(`(${esc("TOTAL")}) Tj`);
  cmds.push("ET");
  cmds.push("BT");
  cmds.push("1 1 1 rg");
  cmds.push("/F2 11 Tf");
  cmds.push(`${summaryValX} ${y - 20} Td`);
  cmds.push(`(${esc(rupee(totalAmount))}) Tj`);
  cmds.push("ET");

  y -= 50;

  // ── 7. Technician info ──
  if (data.technicianName || data.technicianPhone) {
    cmds.push("BT");
    cmds.push("0.129 0.145 0.192 rg");
    cmds.push("/F2 10 Tf");
    cmds.push(`${labelX} ${y} Td`);
    cmds.push(`(${esc("SERVICE TECHNICIAN")}) Tj`);
    cmds.push("ET");

    y -= 16;
    cmds.push("BT");
    cmds.push("0.3 0.3 0.3 rg");
    cmds.push("/F1 9 Tf");
    cmds.push(`${labelX} ${y} Td`);
    cmds.push(`(${esc(`${data.technicianName || "Assigned Technician"}  |  Phone: ${data.technicianPhone || TECHNICIAN_PHONE}`)}) Tj`);
    cmds.push("ET");
    y -= 25;
  }

  // ── 8. Terms & Conditions ──
  cmds.push("q");
  cmds.push("0.85 0.85 0.85 RG");
  cmds.push("0.5 w");
  cmds.push(`${ML} ${y} m ${W - MR} ${y} l S`);
  cmds.push("Q");

  y -= 18;
  cmds.push("BT");
  cmds.push("0.4 0.4 0.4 rg");
  cmds.push("/F2 8 Tf");
  cmds.push(`${labelX} ${y} Td`);
  cmds.push(`(${esc("Terms & Conditions:")}) Tj`);
  cmds.push("ET");

  y -= 14;
  const terms = [
    "1. Service warranty valid for 30 days from the date of service.",
    "2. Spare parts warranty as per manufacturer's policy.",
    "3. Payment is non-refundable once the service is completed.",
    "4. For complaints or feedback, contact us within 7 days.",
  ];
  cmds.push("BT");
  cmds.push("0.5 0.5 0.5 rg");
  cmds.push("/F1 7 Tf");
  cmds.push(`${labelX} ${y} Td`);
  for (let i = 0; i < terms.length; i++) {
    if (i > 0) cmds.push("0 -12 Td");
    cmds.push(`(${esc(terms[i])}) Tj`);
  }
  cmds.push("ET");

  y -= terms.length * 12 + 10;

  // ── 9. Footer bar ──
  const footerH = 50;
  const footerY = 30;

  // Footer background
  cmds.push("q");
  cmds.push("0.129 0.145 0.192 rg");
  cmds.push(`0 ${footerY} ${W} ${footerH} re f`);
  cmds.push("Q");

  // Golden line above footer
  cmds.push("q");
  cmds.push("0.855 0.647 0.243 RG");
  cmds.push("2 w");
  cmds.push(`0 ${footerY + footerH} m ${W} ${footerY + footerH} l S`);
  cmds.push("Q");

  // Footer text
  cmds.push("BT");
  cmds.push("0.855 0.647 0.243 rg");
  cmds.push("/F2 8 Tf");
  cmds.push(`${ML} ${footerY + 30} Td`);
  cmds.push(`(${esc("Golden Refrigeration")}) Tj`);
  cmds.push("ET");

  cmds.push("BT");
  cmds.push("0.8 0.8 0.8 rg");
  cmds.push("/F1 7 Tf");
  cmds.push(`${ML} ${footerY + 16} Td`);
  cmds.push(`(${esc(`Phone: ${TECHNICIAN_PHONE}  |  Email: contact@goldenrefrigeration.in  |  www.goldenrefrigeration.in`)}) Tj`);
  cmds.push("ET");

  // Thank you text (right side)
  cmds.push("BT");
  cmds.push("0.855 0.647 0.243 rg");
  cmds.push("/F3 10 Tf");
  cmds.push(`${W - MR - 170} ${footerY + 25} Td`);
  cmds.push(`(${esc("Thank you for choosing us!")}) Tj`);
  cmds.push("ET");

  // ── Build PDF structure ──
  const contentStream = cmds.join("\n");

  const objects = [
    // 1 - Catalog
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    // 2 - Pages
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    // 3 - Page
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>\nendobj\n`,
    // 4 - Font: Helvetica (regular)
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n",
    // 5 - Font: Helvetica-Bold
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n",
    // 6 - Font: Helvetica-Oblique (italic for "thank you")
    "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\nendobj\n",
    // 7 - Content stream
    `7 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
};

export const generateFallbackDiagnosis = (appliance: string, issue: string, language: InputLanguage) => {
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
  } else if (normalized.includes("noise") || normalized.includes("awaz") || normalized.includes("fan")) {
    likelyCause = "fan motor imbalance, bearing wear, ya loose mounting";
    safetyStep = "machine ko zyada load pe use na karein";
    fixStep = "fan assembly aur motor alignment service karwana hoga";
    estimate = "₹900 - ₹3,200";
  } else if (normalized.includes("leak") || normalized.includes("pani") || normalized.includes("water")) {
    likelyCause = "drain blockage, pipe crack, ya inlet valve issue";
    safetyStep = "water supply temporarily band karein";
    fixStep = "drain line cleaning + seal replacement karwana chahiye";
    estimate = "₹800 - ₹2,800";
  } else if (normalized.includes("not working") || normalized.includes("band") || normalized.includes("start")) {
    likelyCause = "starter relay, PCB, ya power board fault";
    safetyStep = "extension board use na karein, direct socket use karein";
    fixStep = "multimeter diagnostic aur relay/board inspection required hai";
    estimate = "₹1,000 - ₹5,500";
  }

  if (language === "HINDI") {
    return `गोल्डन रेफ्रिजरेशन तकनीशियन त्वरित निदान:\nसंभावित समस्या: ${likelyCause}.\nसुरक्षा कदम: ${safetyStep}.\nसुझाया गया समाधान: ${fixStep}.\nअनुमानित लागत सीमा: ${estimate} (अंतिम निरीक्षण के बाद निश्चित होगा)।\nउपकरण: ${appliance}.`;
  }
  if (language === "ENGLISH") {
    return `Golden Refrigeration quick diagnosis:\nProbable issue: ${likelyCause}.\nSafety step: ${safetyStep}.\nRecommended fix: ${fixStep}.\nEstimated cost range: ${estimate} (final amount confirmed after inspection).\nAppliance: ${appliance}.`;
  }
  return `Golden Refrigeration Technician se quick diagnosis:\nLikely issue: ${likelyCause}.\nSafety step: ${safetyStep}.\nRecommended fix: ${fixStep}.\nEstimated cost range: ${estimate} (final inspection ke baad confirm hoga).\nAppliance: ${appliance}.`;
};

export const createUuid = () => randomUUID();

