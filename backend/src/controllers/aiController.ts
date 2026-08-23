import type { Request, Response } from "express";
import fs from "node:fs";
import { getGeminiClient, rotateKey, totalKeys } from "../config/gemini.js";
import { isNvidiaConfigured, NVIDIA_MODELS, callNvidia, fileToBase64DataUrl } from "../config/nvidia.js";
import { resolveUserIdFromRequest, type AuthenticatedRequest } from "../middlewares/authMiddleware.js";
import { TECHNICIAN_PHONE, detectInputLanguage, extractJsonObject, fallbackStructuredDiagnosis } from "../config/runtime.js";
import { createDiagnosisLog, listDiagnosisLogs } from "../services/diagnosisService.js";
import { storeMediaFromTempFile, toAbsoluteMediaUrl } from "../services/mediaStorageService.js";

import type { StructuredDiagnosis, InputLanguage } from "../config/runtime.js";

type ConsultantPayload = {
  isRelevant: boolean;
  problem?: string;
  technicalExplanation?: string;
  solution?: string;
  safetyAlert?: string;
  conclusion?: string;
  estimatedCostRange?: string;
};

const buildSmartFallback = (
  appliance: string,
  issue: string,
  lang: InputLanguage,
  fallback: StructuredDiagnosis,
  costRange: string,
): ConsultantPayload => {
  const a = appliance.toLowerCase();
  const i = issue.toLowerCase();
  const isEn = lang === "ENGLISH";

  // Map (appliance + issue keywords) to specific diagnosis
  type DiagMap = { match: (a: string, i: string) => boolean; en: ConsultantPayload; hi: ConsultantPayload };
  const rules: DiagMap[] = [
    {
      match: (a, i) => (a.includes("refriger") || a.includes("fridge")) && (i.includes("cool") || i.includes("thanda") || i.includes("cold") || i.includes("freez")),
      en: {
        isRelevant: true,
        problem: "Low refrigerant gas (R-600a/R-134a) or faulty compressor start relay",
        technicalExplanation: "Step 1: Technician checks gas pressure with manifold gauge. Step 2: If gas is low, the evaporator coil is inspected for leaks using a leak detector. Step 3: Leak is sealed with brazing/welding. Step 4: Vacuum is pulled and fresh refrigerant recharged to spec pressure. Step 5: If gas is OK, the compressor start relay (PTC) is tested and replaced if faulty (common Rs.150-300 part). Step 6: Condenser coils are cleaned of dust/lint for optimal heat rejection. Repair time: 2-4 hours.",
        safetyAlert: "Refrigerant gas under pressure — do not attempt DIY. Compressor capacitors hold charge even when unplugged.",
        conclusion: "Book Golden Refrigeration for same-day service in Sabour/Bhagalpur. Our technicians carry gas cylinders and spare relays for on-site repair.",
        estimatedCostRange: "Rs.1,200 - Rs.3,500 total (Visit Rs.300 + Gas refill Rs.800-1,500 + Labour Rs.300-500 + Parts Rs.0-900 if relay/capacitor needed)",
      },
      hi: {
        isRelevant: true,
        problem: "Refrigerant gas (R-600a/R-134a) kam ho gaya ya compressor start relay kharab hai",
        technicalExplanation: "Step 1: Technician manifold gauge se gas pressure check karega. Step 2: Agar gas low hai to evaporator coil mein leak dhundha jaega. Step 3: Leak ko brazing se seal kiya jaega. Step 4: Vacuum pull karke fresh gas bhara jaega. Step 5: Agar gas theek hai to PTC relay (Rs.150-300 ka part) replace ki jaegi. Step 6: Condenser coil saaf ki jaegi. Repair time: 2-4 ghante.",
        safetyAlert: "Refrigerant gas pressure mein hota hai — khud mat kholein. Compressor capacitor mein charge rehta hai plug nikalne ke baad bhi.",
        conclusion: "Golden Refrigeration ko book karein — Sabour/Bhagalpur mein same-day service available hai. Hamara technician gas cylinder aur spare parts lekar aata hai.",
        estimatedCostRange: "Rs.1,200 - Rs.3,500 total (Visit Rs.300 + Gas refill Rs.800-1,500 + Labour Rs.300-500 + Parts Rs.0-900)",
      },
    },
    {
      match: (a, i) => (a.includes("ac") || a.includes("air con")) && (i.includes("cool") || i.includes("thanda") || i.includes("heat") || i.includes("warm")),
      en: {
        isRelevant: true,
        problem: "Low refrigerant (R-22/R-32), dirty air filter, or faulty capacitor",
        technicalExplanation: "Step 1: Technician measures indoor/outdoor temperature split — below 8C difference indicates gas shortage. Step 2: Gas pressure checked on service port. Step 3: If low — leak test, seal, and recharge (R-22 or R-32 per unit spec). Step 4: Air filter and indoor coil inspected and cleaned (blocked filter reduces cooling 30-40%). Step 5: Capacitor checked with multimeter — weak capacitor causes compressor to start slow or not at all. Repair time: 1.5-3 hours.",
        safetyAlert: "High-voltage capacitors inside outdoor unit — do not open. Refrigerant gas can cause frostbite if handled without protection.",
        conclusion: "Book Golden Refrigeration now for expert AC service in Bhagalpur/Sabour. We offer same-day slots for cooling emergencies.",
        estimatedCostRange: "Rs.1,500 - Rs.4,500 total (Visit Rs.300 + Gas refill R-22: Rs.900-1,800 / R-32: Rs.1,200-2,500 + Filter clean Rs.200 + Capacitor Rs.300-600 if needed)",
      },
      hi: {
        isRelevant: true,
        problem: "Gas (R-22/R-32) leak, dirty filter, ya capacitor kharab",
        technicalExplanation: "Step 1: Technician inlet-outlet temperature difference check karega — 8C se kam difference gas ki kami batata hai. Step 2: Service port pe gas pressure check hoga. Step 3: Gas low hai to leak seal karke recharge hoga. Step 4: Air filter aur indoor coil saaf hogi — blocked filter se 30-40% cooling kum hoti hai. Step 5: Capacitor multimeter se test hoga — weak capacitor compressor start nahi karta. Repair time: 1.5-3 ghante.",
        safetyAlert: "Outdoor unit mein high-voltage capacitor hota hai — khud mat kholein. Gas se frostbite ho sakta hai.",
        conclusion: "Golden Refrigeration ko abhi book karein — Bhagalpur/Sabour mein same-day AC service available hai.",
        estimatedCostRange: "Rs.1,500 - Rs.4,500 total (Visit Rs.300 + Gas R-22: Rs.900-1,800 / R-32: Rs.1,200-2,500 + Filter Rs.200 + Capacitor Rs.300-600)",
      },
    },
    {
      match: (a, i) => (a.includes("wash")) && (i.includes("drain") || i.includes("pani") || i.includes("water") || i.includes("leak")),
      en: {
        isRelevant: true,
        problem: "Clogged drain pump filter or cracked drain hose",
        technicalExplanation: "Step 1: Technician removes the drain pump filter (front-bottom panel) — this is usually clogged with lint, coins, or small clothes. Step 2: Filter is cleaned or replaced (Rs.200-400). Step 3: Drain hose is inspected for cracks or kinks. Step 4: Door seal/gasket is checked for tears that allow water to escape. Step 5: Machine is run on a test cycle to confirm no leak. Repair time: 45-90 minutes.",
        safetyAlert: "Unplug the washing machine before any inspection. Water + electricity is a shock hazard.",
        conclusion: "Golden Refrigeration provides doorstep washing machine repair in Sabour/Bhagalpur — book now for a next-day slot.",
        estimatedCostRange: "Rs.500 - Rs.2,000 total (Visit Rs.300 + Drain pump filter Rs.200-400 + Hose replacement Rs.300-800 + Labour Rs.200-300)",
      },
      hi: {
        isRelevant: true,
        problem: "Drain pump filter band ho gaya ya drain hose mein crack hai",
        technicalExplanation: "Step 1: Technician front-bottom panel se drain pump filter nikalega — usme lint, sikke ya kapda fasa hota hai. Step 2: Filter saaf ya replace hoga (Rs.200-400). Step 3: Drain hose kinks ya crack ke liye check hogi. Step 4: Door seal torn hai to pani bahar aata hai — seal replace hogi. Step 5: Test cycle chalaya jaega. Repair time: 45-90 minute.",
        safetyAlert: "Inspection se pehle machine ka plug nikaal dein — pani aur bijli dono khatra hain.",
        conclusion: "Golden Refrigeration Sabour/Bhagalpur mein ghar pe washing machine repair karta hai — next-day slot book karein.",
        estimatedCostRange: "Rs.500 - Rs.2,000 total (Visit Rs.300 + Filter Rs.200-400 + Hose Rs.300-800 + Labour Rs.200-300)",
      },
    },
    {
      match: (a, i) => i.includes("noise") || i.includes("sound") || i.includes("awaz") || i.includes("vibrat"),
      en: {
        isRelevant: true,
        problem: "Fan motor bearing wear or loose mounting bracket",
        technicalExplanation: "Step 1: Technician identifies whether noise is from evaporator fan (inside) or condenser fan (outside/back). Step 2: Fan blades inspected for cracks or ice buildup. Step 3: Motor bearing checked — worn bearings cause grinding/rattling noise. Step 4: Mounting screws and brackets tightened. Step 5: If bearing worn — fan motor assembly replaced (Rs.400-1,200 depending on model). Step 6: Unit levelled properly to reduce vibration. Repair time: 1-2 hours.",
        safetyAlert: "Motor contains live wires — unplug before any inspection. Do not touch fan blades while machine is running.",
        conclusion: "Book Golden Refrigeration for a noise diagnosis in Bhagalpur — same-day inspection slots available.",
        estimatedCostRange: "Rs.700 - Rs.2,500 total (Visit Rs.300 + Labour Rs.300-500 + Fan motor Rs.400-1,200 + Screws/mounts Rs.100-200)",
      },
      hi: {
        isRelevant: true,
        problem: "Fan motor bearing kharab ya mounting loose hai",
        technicalExplanation: "Step 1: Technician pata karega noise evaporator fan (andar) se hai ya condenser fan (bahar/peeche) se. Step 2: Fan blades mein crack ya ice check hogi. Step 3: Motor bearing check hogi — ghisi bearing grinding/rattling awaz deti hai. Step 4: Mounting screws tight kiye jaenge. Step 5: Bearing kharab hai to fan motor assembly replace hogi (Rs.400-1,200). Step 6: Machine level kiya jaega vibration kam karne ke liye. Repair time: 1-2 ghante.",
        safetyAlert: "Motor mein live wire hoti hai — inspect se pehle plug nikaalein. Chalu machine ke fan ko haath mat lagaein.",
        conclusion: "Bhagalpur mein noise diagnosis ke liye Golden Refrigeration book karein — same-day slot available hai.",
        estimatedCostRange: "Rs.700 - Rs.2,500 total (Visit Rs.300 + Labour Rs.300-500 + Fan motor Rs.400-1,200 + Fittings Rs.100-200)",
      },
    },
    {
      match: (a, i) => i.includes("not work") || i.includes("start") || i.includes("band") || i.includes("power") || i.includes("dead") || i.includes("chalu nahi"),
      en: {
        isRelevant: true,
        problem: "Failed start relay, blown thermal fuse, or PCB power board fault",
        technicalExplanation: "Step 1: Technician checks power supply at socket with multimeter. Step 2: PTC start relay tested — shake test (rattling = failed relay, costs Rs.150-300). Step 3: Thermal fuse continuity checked — blown fuse means no power to compressor. Step 4: Overload protector tested. Step 5: If all small parts OK, PCB main board diagnosed — board repair or replacement (Rs.1,200-3,500). Step 6: Wiring harness inspected for rodent damage or burn marks. Repair time: 1-3 hours.",
        safetyAlert: "Do not plug/unplug repeatedly — this can damage the PCB further. Capacitors inside hold lethal charge.",
        conclusion: "Book Golden Refrigeration for expert electrical diagnosis in Bhagalpur/Sabour — we carry all common spare parts for same-day repair.",
        estimatedCostRange: "Rs.500 - Rs.4,000 total (Visit Rs.300 + Relay Rs.150-300 + Thermal fuse Rs.100-200 + PCB Rs.1,200-3,500 if needed)",
      },
      hi: {
        isRelevant: true,
        problem: "Start relay fail, thermal fuse blown, ya PCB power board kharab",
        technicalExplanation: "Step 1: Socket pe voltage multimeter se check hoga. Step 2: PTC relay shake test — rattling sound aaye to relay kharab hai (Rs.150-300). Step 3: Thermal fuse continuity check — fuse blown matlab compressor ko power nahi milti. Step 4: Overload protector test hoga. Step 5: Agar sab theek hai to PCB main board diagnose hoga (Rs.1,200-3,500). Step 6: Wiring harness mein jalane ke nishan ya chuhe ka damage check hoga. Repair time: 1-3 ghante.",
        safetyAlert: "Bar bar plug mat karein — PCB aur damage ho sakta hai. Andar capacitor mein high voltage hoti hai.",
        conclusion: "Bhagalpur/Sabour mein electrical diagnosis ke liye Golden Refrigeration book karein — hum common parts lekar aate hain same-day repair ke liye.",
        estimatedCostRange: "Rs.500 - Rs.4,000 total (Visit Rs.300 + Relay Rs.150-300 + Fuse Rs.100-200 + PCB Rs.1,200-3,500)",
      },
    },
  ];

  for (const rule of rules) {
    if (rule.match(a, i)) {
      return isEn ? rule.en : rule.hi;
    }
  }

  return {
    isRelevant: true,
    problem: fallback.probableFault,
    technicalExplanation: isEn
      ? `Don't worry, this is a common issue with ${appliance}s. Usually, it's just a minor issue like a loose wire or a blown fuse, but sometimes a main part needs replacement. For now, please keep the appliance unplugged to be safe. Our technician will come and check it thoroughly.`
      : `Ghabrayein nahi, ${appliance} mein yeh ek aam problem hai. Zyada tar cases mein yeh kisi loose wire ya chote fuse ki wajah se hota hai. Kabhi kabhi main part badalna padta hai. Abhi ke liye, kripya appliance ka plug nikal dein taki koi aur damage na ho. Humare technician aakar ache se check karenge.`,
    safetyAlert: isEn
      ? "Please keep the appliance unplugged and do not attempt to open it yourself due to high voltage."
      : "Kripya appliance ka plug nikal dein aur ise khud kholne ki koshish na karein (high voltage ka khatra hai).",
    conclusion: isEn
      ? `Book a checkup with our expert technicians in Bhagalpur/Sabour. We're here to help!`
      : `Bhagalpur/Sabour mein humare expert technician ko checkup ke liye book karein. Hum aapki madad ke liye taiyar hain!`,
    estimatedCostRange: isEn
      ? `Visit: Rs.300 | Minor fix: Rs.500-800 | Major fix: ${costRange} (Final rate after inspection)`
      : `Visit charge: Rs.300 | Minor repair: Rs.500-800 | Major repair: ${costRange} (Final rate check karne ke baad)`,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// GEMINI CALL HELPER — always uses current active key via getGeminiClient()
// ─────────────────────────────────────────────────────────────────────────────
async function callGemini(
  model: string,
  prompt: string,
  uploadedFilePart: any,
): Promise<string> {
  let contents: any;

  if (uploadedFilePart) {
    contents = [{
      role: "user",
      parts: [
        { fileData: { mimeType: uploadedFilePart.mimeType, fileUri: uploadedFilePart.uri } },
        { text: prompt },
      ],
    }];
  } else {
    contents = prompt;
  }

  // Use the currently active key (rotated automatically on quota errors)
  const client = getGeminiClient();
  const response = await client.models.generateContent({ model, contents }) as { text?: string };
  return (response.text || "").trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSE GEMINI RESPONSE — strip markdown fences, extract JSON
// ─────────────────────────────────────────────────────────────────────────────
function parseGeminiResponse(raw: string): ConsultantPayload | null {
  if (!raw) return null;

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const cleaned = raw
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .trim();

  const jsonStr = extractJsonObject(cleaned);
  if (!jsonStr) return null;

  try {
    const candidate = JSON.parse(jsonStr) as ConsultantPayload;
    if (typeof candidate?.isRelevant !== "boolean") return null;
    return {
      isRelevant: candidate.isRelevant,
      problem: String(candidate.problem || "").trim(),
      technicalExplanation: String(candidate.technicalExplanation || "").trim(),
      solution: String(candidate.solution || "").trim(),
      safetyAlert: String(candidate.safetyAlert || "").trim(),
      conclusion: String(candidate.conclusion || "").trim(),
      estimatedCostRange: String(candidate.estimatedCostRange || "").trim(),
    };
  } catch {
    return null;
  }
}

const isQuotaError = (msg: string) =>
  msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("rate");

// 503 = temporary server overload
const isOverloadError = (msg: string) =>
  msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("overload");

// 404 = model not found for this project type
const isNotFoundError = (msg: string) =>
  msg.includes("404") || msg.toLowerCase().includes("not found");

// 403 = API not enabled on this project / permission denied
const isProjectError = (msg: string) =>
  msg.includes("403") || msg.includes("PERMISSION_DENIED") || msg.includes("disabled") || msg.includes("API_KEY_INVALID");


export const diagnose = async (req: Request, res: Response) => {
  try {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    const { applianceType, issueDetails, appliance, issue } = req.body as {
      applianceType?: string;
      issueDetails?: string;
      appliance?: string;
      issue?: string;
    };
    const resolvedAppliance = String(applianceType || appliance || "").trim();
    const resolvedIssue = String(issueDetails || issue || "").trim();

    if (!resolvedAppliance && !resolvedIssue && !file) {
      return res.status(400).json({ error: "Please provide an appliance type, issue description, or upload a photo/video." });
    }

    const detectedLanguage = detectInputLanguage(resolvedIssue || "English");
    const replyLanguage = detectedLanguage === "ENGLISH" ? "ENGLISH" : "HINGLISH";

    const prompt = `You are Raju bhai, a warm and honest appliance repair shop owner at Golden Refrigeration, Sabour, Bhagalpur. You have 15+ years of hands-on experience repairing refrigerators, ACs, washing machines, and microwaves in Indian homes. A customer has come to you:

APPLIANCE: ${resolvedAppliance || "Not specified"}
CUSTOMER'S COMPLAINT: ${resolvedIssue || "See attached photo/video"}
${file ? "The customer also shared a photo/video — analyze it carefully for visual clues." : ""}

THINK like a real expert. Based on these EXACT symptoms, what is the MOST LIKELY root cause? Don't guess randomly — use your 15 years of experience to pinpoint the exact issue.

Reply in ${replyLanguage === "ENGLISH" ? "simple, everyday English" : "the same language/script the customer used (Hindi/Hinglish in Roman script)"}.

RULES:
- Be SPECIFIC to THIS problem. Every answer must be UNIQUE and DIFFERENT.
- Comfort the customer naturally (vary your tone — don't repeat the same opening every time).
- Explain what is EXACTLY wrong in simple words (no engineering jargon — say "heating part" not "magnetron", "gas" not "refrigerant R-134a", "small switch" not "capacitor").
- Give a REAL, ACTIONABLE solution the customer can try at home before calling a technician.
- Keep safety tip to ONE short line (max 15 words).
- Suggest Golden Refrigeration technician warmly, like a friend.
- Cost: realistic TOTAL for Bhagalpur rural area (everything included, no separate visiting charge).

Return ONLY this JSON:
{
  "isRelevant": true,
  "problem": "2-4 word name (e.g., 'Gas Khatam', 'Heating Part Fail', 'Naali Band')",
  "technicalExplanation": "Friendly explanation of what exactly went wrong and why. Be specific to this appliance and this symptom.",
  "solution": "A real, practical solution or step the customer can try right now at home (e.g., 'Check if the power plug is loose and try a different socket', 'Clean the back side dust with a dry cloth'). If nothing can be done at home, say so honestly.",
  "safetyAlert": "One SHORT safety line (max 15 words), or empty string",
  "conclusion": "Warm suggestion to book Golden Refrigeration technician — like a friend advising",
  "estimatedCostRange": "Total cost range (e.g., 'Rs.800 - Rs.2,000')"
}

If NOT about appliance repair: { "isRelevant": false, "problem": "", "technicalExplanation": "", "solution": "", "safetyAlert": "", "conclusion": "", "estimatedCostRange": "" }`;

    let parsed: ConsultantPayload | null = null;
    let lastModelError = "";
    let uploadedFilePart: any = null;
    let storedMediaUrl: string | null = null;
    let storedMediaType: "image" | "video" | null = null;
    let geminiUsed = false;
    let nvidiaUsed = false;
    let allQuotaExhausted = true;

    // ── TIER 1: Try NVIDIA NIM API first (primary AI provider) ───────────────
    if (isNvidiaConfigured()) {
      // Convert file to base64 for NVIDIA's inline multimodal (simpler than Gemini's File API)
      let nvidiaBase64Image: string | null = null;
      if (file && file.mimetype?.startsWith("image/")) {
        nvidiaBase64Image = fileToBase64DataUrl(file.path, file.mimetype);
      }

      for (const nvidiaModel of NVIDIA_MODELS) {
        if (parsed) break;
        try {
          console.log(`\n[AI] >> NVIDIA Model: ${nvidiaModel} | Image: ${nvidiaBase64Image ? "yes" : "no"}`);
          console.log(`[AI]    ${resolvedAppliance} — "${resolvedIssue.slice(0, 100)}"`);

          const raw = await callNvidia(nvidiaModel, prompt, nvidiaBase64Image);

          console.log(`[AI] NVIDIA raw response (${nvidiaModel}):\n${raw.slice(0, 600)}`);

          if (!raw) {
            lastModelError = `Empty response from NVIDIA ${nvidiaModel}`;
            continue;
          }

          const candidate = parseGeminiResponse(raw); // Same JSON format — parser works for both
          if (candidate) {
            parsed = candidate;
            nvidiaUsed = true;
            allQuotaExhausted = false;
            lastModelError = "";
            console.log(`\n[AI] ✅ SUCCESS — NVIDIA model "${nvidiaModel}" gave a valid diagnosis!`);
            break;
          }

          lastModelError = `NVIDIA ${nvidiaModel}: JSON parse failed. Raw: ${raw.slice(0, 120)}`;
          allQuotaExhausted = false;
          console.warn(`[AI] NVIDIA parse failed for ${nvidiaModel}. Trying next model...`);

        } catch (err: any) {
          lastModelError = String(err?.message || err || "Unknown NVIDIA error");
          console.warn(`[AI] NVIDIA ${nvidiaModel} failed: ${lastModelError.slice(0, 200)}`);

          if (lastModelError.includes("401")) {
            console.error(`[AI] NVIDIA API key invalid — skipping all NVIDIA models`);
            break; // Bad key — don't try other models
          }
          if (lastModelError.includes("429")) {
            console.warn(`[AI] NVIDIA quota exhausted — falling through to Gemini`);
            break; // Quota — fall through to Gemini
          }
          // 404 = model not found — try next model
          // Other errors — try next model
          continue;
        }
      }

      if (parsed) {
        console.log(`[AI] NVIDIA succeeded — skipping Gemini cascade.`);
      } else {
        console.warn(`[AI] All NVIDIA models failed — falling through to Gemini...`);
      }
    } else {
      console.log(`[AI] NVIDIA not configured — using Gemini directly.`);
    }

    // ── Upload media to Gemini File API (only if NVIDIA didn't succeed) ───────
    if (!parsed && file) {
      try {
        console.log(`\n[AI] Uploading media to Gemini File API: ${file.originalname} (${file.mimetype})`);
        const uploaded = await getGeminiClient().files.upload({ file: file.path, config: { mimeType: file.mimetype } });
        let fileInfo = uploaded;
        let polls = 0;
        while ((fileInfo as any).state === "PROCESSING" && polls < 12) {
          await new Promise((r) => setTimeout(r, 2500));
          fileInfo = await getGeminiClient().files.get({ name: (fileInfo as any).name }) as typeof uploaded;
          polls++;
        }
        uploadedFilePart = fileInfo;
        console.log(`[AI] Gemini file ready — URI: ${(fileInfo as any).uri}, state: ${(fileInfo as any).state}`);
      } catch (e: any) {
        console.error("[AI] Gemini file upload failed:", e.message, "— continuing without file");
      }
    }

    // ── TIER 2: Try Gemini models (backup — only if NVIDIA didn't succeed) ───
    if (!parsed) {

    // ── Try every Gemini model, with per-model retry on quota errors ─────────
    // Ordered: best → lightest. All are valid free-tier model IDs.
    const MODELS = [
      "gemini-3.5-flash",         // Best — retries on 503 (temporary overload)
      "gemini-2.0-flash",         // Free-tier fallback
      "gemini-2.0-flash-lite",    // Lighter quota
      "gemini-2.5-flash-preview-05-20",  // Preview fallback
      "gemini-1.5-flash",         // Classic stable
      "gemini-1.5-flash-8b",      // Ultra-light
      "gemini-1.5-pro",           // High quality
    ];

    // Aggressive retry: cycle through ALL API keys multiple times per model.
    // With 5 keys → MAX_RETRIES = 10, guaranteeing every key is tried 2× per model.
    const keyCount = totalKeys();
    const MAX_RETRIES_PER_MODEL = Math.max(6, keyCount * 2);

    for (const model of MODELS) {
      if (parsed) break;
      let keysTriedThisModel = 0;

      for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
        try {
          console.log(`\n[AI] >> Model: ${model} | Attempt ${attempt}/${MAX_RETRIES_PER_MODEL} | Keys cycled: ${keysTriedThisModel}/${keyCount}`);
          console.log(`[AI]    ${resolvedAppliance} — "${resolvedIssue.slice(0, 100)}"`);

          const raw = await callGemini(model, prompt, uploadedFilePart);

          console.log(`[AI] Raw response (${model}):\n${raw.slice(0, 600)}`);

          if (!raw) {
            lastModelError = `Empty response from ${model}`;
            break;
          }

          const candidate = parseGeminiResponse(raw);
          if (candidate) {
            parsed = candidate;
            geminiUsed = true;
            allQuotaExhausted = false;
            lastModelError = "";
            console.log(`\n[AI] ✅ SUCCESS — Gemini model "${model}" gave a valid diagnosis! (Attempt ${attempt}/${MAX_RETRIES_PER_MODEL})`);
            break;
          }

          lastModelError = `${model}: JSON parse failed or missing isRelevant. Raw: ${raw.slice(0, 120)}`;
          allQuotaExhausted = false;
          console.warn(`[AI] Parse failed for ${model}. Raw snippet: ${raw.slice(0, 200)}`);
          break; // Parsing issues won't improve with retry

        } catch (err: any) {
          lastModelError = String(err?.message || err || "Unknown error");

          if (isNotFoundError(lastModelError)) {
            // Model not available for this project type — skip entirely
            console.warn(`[AI] Model not available: ${model} — skipping all keys`);
            allQuotaExhausted = false;
            break;
          }

          if (isProjectError(lastModelError)) {
            // 403 = this project has API disabled — rotate key immediately
            console.warn(`[AI] Project error (403) — API disabled on this key. Rotating to next key...`);
            if (keyCount > 1) {
              rotateKey();
              keysTriedThisModel++;
              continue; // Retry with next key's project
            }
            allQuotaExhausted = false;
            console.error(`[AI] All projects have API disabled. Check Google Cloud Console.`);
            break;
          }

          if (isOverloadError(lastModelError)) {
            // 503 = temporary server overload — retry with longer wait
            const waitMs = Math.min(15_000 * attempt, 60_000); // 15s, 30s, 45s, 60s — give Gemini time to recover
            if (attempt < MAX_RETRIES_PER_MODEL) {
              console.warn(`[AI] ${model} overloaded (503). Waiting ${waitMs / 1000}s then retrying (${attempt + 1}/${MAX_RETRIES_PER_MODEL})...`);
              await new Promise((r) => setTimeout(r, waitMs));
              continue;
            } else {
              console.warn(`[AI] ${model} still overloaded after ${MAX_RETRIES_PER_MODEL} retries. Trying next model.`);
              allQuotaExhausted = false;
              break;
            }
          }

          if (isQuotaError(lastModelError)) {
            allQuotaExhausted = true;
            // Rotate to next API key first (different project = fresh quota)
            if (keyCount > 1) {
              rotateKey();
              keysTriedThisModel++;
              console.warn(`[AI] Quota hit. Rotated to key ${(keysTriedThisModel % keyCount) + 1}/${keyCount} — retrying ${model}...`);

              // After cycling through ALL keys once, wait 20s before cycling again
              if (keysTriedThisModel > 0 && keysTriedThisModel % keyCount === 0 && attempt < MAX_RETRIES_PER_MODEL) {
                const cooldownMs = 20_000;
                console.warn(`[AI] All ${keyCount} keys exhausted for ${model}. Waiting ${cooldownMs / 1000}s before cycling keys again...`);
                await new Promise((r) => setTimeout(r, cooldownMs));
              }
              continue;
            }
            // Only one key available — aggressive backoff wait
            const retryMatch = lastModelError.match(/retry[^0-9]*?(\d+)[\s.]/i)
              || lastModelError.match(/retryDelay.*?(\d+)/i);
            const waitMs = retryMatch
              ? Math.min(Number(retryMatch[1]) * 1000 + 2000, 90_000)
              : Math.min(15_000 * attempt, 60_000);
            if (attempt < MAX_RETRIES_PER_MODEL) {
              console.warn(`[AI] Quota hit on ${model}. Waiting ${waitMs / 1000}s then retrying (${attempt + 1}/${MAX_RETRIES_PER_MODEL})...`);
              await new Promise((r) => setTimeout(r, waitMs));
              continue;
            } else {
              console.warn(`[AI] ${model} quota exhausted after ${MAX_RETRIES_PER_MODEL} retries. Trying next model.`);
              break;
            }
          }

          // Any other unexpected error
          allQuotaExhausted = false;
          console.error(`[AI] Unexpected error from ${model}:`, lastModelError.slice(0, 300));
          break;
        }
      }
    }

    // ── RETRY PASSES: If first pass failed, wait for quota cooldown and retry all models ──
    if (!parsed) {
      const RETRY_PASSES = 2;
      const PASS_COOLDOWN_MS = 30_000; // 30s between retry passes

      for (let retryPass = 1; retryPass <= RETRY_PASSES; retryPass++) {
        if (parsed) break;
        console.log(`\n[AI] ═══ RETRY PASS ${retryPass}/${RETRY_PASSES} — waiting ${PASS_COOLDOWN_MS / 1000}s for quota cooldown ═══`);
        await new Promise((r) => setTimeout(r, PASS_COOLDOWN_MS));

        for (const retryModel of MODELS) {
          if (parsed) break;
          // Try each model with key rotation on quota errors
          for (let keyAttempt = 0; keyAttempt < Math.max(3, keyCount); keyAttempt++) {
            try {
              console.log(`[AI] >> Retry pass ${retryPass} | Model: ${retryModel} | Key attempt: ${keyAttempt + 1}`);
              const raw = await callGemini(retryModel, prompt, uploadedFilePart);
              if (raw) {
                const candidate = parseGeminiResponse(raw);
                if (candidate) {
                  parsed = candidate;
                  geminiUsed = true;
                  allQuotaExhausted = false;
                  lastModelError = "";
                  console.log(`[AI] ✅ SUCCESS on retry pass ${retryPass} with model "${retryModel}"!`);
                  break;
                }
              }
              break; // Got a response (even if unparseable) — move to next model
            } catch (retryErr: any) {
              const msg = String(retryErr?.message || "");
              if (isQuotaError(msg) && keyCount > 1) {
                rotateKey();
                continue; // Try next key
              }
              if (isOverloadError(msg)) {
                await new Promise((r) => setTimeout(r, 10_000)); // 10s wait on overload
                continue;
              }
              console.warn(`[AI] Retry pass ${retryPass} failed for ${retryModel}: ${msg.slice(0, 150)}`);
              break; // Non-retriable error — move to next model
            }
          }
        }
      }
    }
    } // end if (!parsed) — Gemini backup cascade

    // ── Persist uploaded media to Cloudinary ─────────────────────────────────
    if (file) {
      try {
        const stored = await storeMediaFromTempFile({
          filePath: file.path,
          mimeType: file.mimetype,
          originalName: file.originalname,
          folder: "diagnosis",
        });
        storedMediaUrl = stored.url;
        storedMediaType = stored.resourceType;
      } catch (err: any) {
        console.error("Failed to persist diagnosis media:", err.message);
      }
    }
    if (uploadedFilePart) { try { await getGeminiClient().files.delete({ name: uploadedFilePart.name }); } catch {} }
    if (file && fs.existsSync(file.path)) { try { fs.unlinkSync(file.path); } catch {} }

    // ── ABSOLUTE LAST RESORT: hardcoded fallback ──────────────────────────────
    if (!parsed) {
      if (allQuotaExhausted) {
        console.warn(`\n[AI] *** ALL GEMINI QUOTA EXHAUSTED ***`);
        console.warn(`[AI] Key prefix: ${(process.env.GEMINI_API_KEY || "").slice(0, 10)}...`);
        console.warn(`[AI] Get a fresh key: https://aistudio.google.com/apikey`);
      } else {
        console.warn(`\n[AI] All Gemini models failed. Last error: ${lastModelError}`);
      }
      console.warn(`[AI] Using hardcoded fallback (last resort).`);

      const fallback = fallbackStructuredDiagnosis(resolvedAppliance, resolvedIssue, replyLanguage);
      const costRange = `Rs.${Number(fallback.estimatedCostMin).toLocaleString("en-IN")} - Rs.${Number(fallback.estimatedCostMax).toLocaleString("en-IN")}`;
      parsed = buildSmartFallback(resolvedAppliance, resolvedIssue, replyLanguage, fallback, costRange);
    } else {
      console.log(`\n[AI] LIVE AI response used (${nvidiaUsed ? "NVIDIA" : "Gemini"}) — NOT hardcoded fallback.`);
    }

    // ── Format final response ─────────────────────────────────────────────────
    const strictMessage =
      replyLanguage === "ENGLISH"
        ? "I am specialized in Golden Refrigeration appliance diagnostics. Please ask about your repair needs."
        : "Main Golden Refrigeration appliance diagnostics mein specialize karta hoon. Kripya apni repair problem batayein.";

    const safeProblem = parsed.problem || resolvedAppliance || "Appliance Issue";
    const technicalExplanation = parsed.technicalExplanation || "Our technician will inspect and find the exact issue on-site.";
    const solution = parsed.solution || "";
    const safetyAlert = parsed.safetyAlert || "";
    let conclusion = parsed.conclusion || "Book Golden Refrigeration for expert service in Bhagalpur/Sabour.";
    if (!/golden refrigeration/i.test(conclusion)) {
      conclusion += " — Golden Refrigeration, Bhagalpur/Sabour.";
    }
    const estimatedCostRange = parsed.isRelevant ? (parsed.estimatedCostRange || "") : "";

    // Build a beautifully formatted diagnosis with clear visual sections
    // Flow: 🔍 Problem → Explanation → 🛠️ Solution → ⚠️ Safety → 👨‍🔧 Advice
    let aiDiagnosis: string;
    if (parsed.isRelevant) {
      const parts: string[] = [];

      // Section 1: Problem Name
      parts.push(`🔍 ${safeProblem}`);

      // Section 2: What went wrong and why
      parts.push(technicalExplanation);

      // Section 3: Solution (what you can try at home)
      if (solution) {
        parts.push(`🛠️ ${solution}`);
      }

      // Section 4: Safety (short one-liner)
      if (safetyAlert) {
        parts.push(`⚠️ ${safetyAlert}`);
      }

      // Section 5: Technician suggestion
      parts.push(`👨‍🔧 ${conclusion}`);

      aiDiagnosis = parts.join("\n\n");
    } else {
      aiDiagnosis = strictMessage;
    }

    const requesterId = resolveUserIdFromRequest(req);
    let diagnosisLogId: string | null = null;
    try {
      diagnosisLogId = await createDiagnosisLog({
        customerId: requesterId,
        appliance: resolvedAppliance || "Unknown appliance",
        issue: resolvedIssue || "Media submitted without text details",
        diagnosis: aiDiagnosis,
        estimatedCostRange: estimatedCostRange || null,
        mediaUrl: storedMediaUrl,
        mediaType: storedMediaType,
      });
    } catch (error) {
      console.error("Failed to persist diagnosis log:", (error as Error).message);
    }

    return res.json({
      id: diagnosisLogId,
      diagnosis: aiDiagnosis,
      estimatedCostRange,
      consultant: "Golden Refrigeration Senior Consultant",
      bookingRequired: true,
      mediaUrl: storedMediaUrl ? toAbsoluteMediaUrl(req, storedMediaUrl) : null,
      mediaType: storedMediaType,
      contact: {
        phone: TECHNICIAN_PHONE,
        call: `tel:${TECHNICIAN_PHONE}`,
        whatsapp: `https://wa.me/91${TECHNICIAN_PHONE}`,
        sms: `sms:+91${TECHNICIAN_PHONE}`,
      },
      geminiUsed,
      nvidiaUsed,
      aiProvider: nvidiaUsed ? "nvidia" : geminiUsed ? "gemini" : "fallback",
      fallbackUsed: !geminiUsed && !nvidiaUsed,
      quotaExhausted: allQuotaExhausted && !geminiUsed && !nvidiaUsed,
      modelError: lastModelError || undefined,
    });

  } catch (error) {
    console.error("AI Diagnosis Error:", error);
    res.status(500).json({ error: "AI diagnosis failed.", details: (error as Error).message });
  }
};

export const getMyDiagnosisHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    const rows = await listDiagnosisLogs(userId);
    res.json(
      rows.map((item) => ({
        id: item.id,
        appliance: item.appliance,
        issue: item.issue,
        aiDiagnosis: item.diagnosis,
        estimatedCostRange: item.estimatedCostRange,
        mediaUrl: item.mediaUrl ? toAbsoluteMediaUrl(req, item.mediaUrl) : null,
        mediaType: item.mediaType === "video" ? "video" : "image",
        createdAt: item.createdAt,
        customer: item.customerId
          ? {
              id: item.customerId,
              name: item.customerName || "Customer",
              email: item.customerEmail || "",
            }
          : null,
      })),
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch diagnosis history.", details: (error as Error).message });
  }
};
