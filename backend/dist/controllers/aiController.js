import fs from "node:fs";
import { ai } from "../config/gemini.js";
import { resolveUserIdFromRequest } from "../middlewares/authMiddleware.js";
import { TECHNICIAN_PHONE, detectInputLanguage, extractJsonObject, fallbackStructuredDiagnosis } from "../config/runtime.js";
import { createDiagnosisLog, listDiagnosisLogs } from "../services/diagnosisService.js";
import { storeMediaFromTempFile, toAbsoluteMediaUrl } from "../services/mediaStorageService.js";
const buildSmartFallback = (appliance, issue, lang, fallback, costRange) => {
    const a = appliance.toLowerCase();
    const i = issue.toLowerCase();
    const isEn = lang === "ENGLISH";
    const rules = [
        {
            match: (a, i) => (a.includes("refriger") || a.includes("fridge")) && (i.includes("cool") || i.includes("thanda") || i.includes("cold") || i.includes("freez")),
            en: {
                isRelevant: true,
                problem: "Low refrigerant gas (R-600a/R-134a) or faulty compressor start relay",
                technicalExplanation: "Step 1: Technician checks gas pressure with manifold gauge. Step 2: If gas is low, the evaporator coil is inspected for leaks using a leak detector. Step 3: Leak is sealed with brazing/welding. Step 4: Vacuum is pulled and fresh refrigerant recharged to spec pressure. Step 5: If gas is OK, the compressor start relay (PTC) is tested and replaced if faulty (common ₹150-300 part). Step 6: Condenser coils are cleaned of dust/lint for optimal heat rejection. Repair time: 2-4 hours.",
                safetyAlert: "Refrigerant gas under pressure — do not attempt DIY. Compressor capacitors hold charge even when unplugged.",
                conclusion: "Book Golden Refrigeration for same-day service in Sabour/Bhagalpur. Our technicians carry gas cylinders and spare relays for on-site repair.",
                estimatedCostRange: "₹1,200 - ₹3,500 total (Visit ₹300 + Gas refill ₹800-1,500 + Labour ₹300-500 + Parts ₹0-900 if relay/capacitor needed)",
            },
            hi: {
                isRelevant: true,
                problem: "Refrigerant gas (R-600a/R-134a) kam ho gaya ya compressor start relay kharab hai",
                technicalExplanation: "Step 1: Technician manifold gauge se gas pressure check karega. Step 2: Agar gas low hai to evaporator coil mein leak dhundha jaega. Step 3: Leak ko brazing se seal kiya jaega. Step 4: Vacuum pull karke fresh gas bhara jaega. Step 5: Agar gas theek hai to PTC relay (₹150-300 ka part) replace ki jaegi. Step 6: Condenser coil saaf ki jaegi. Repair time: 2-4 ghante.",
                safetyAlert: "Refrigerant gas pressure mein hota hai — khud mat kholein. Compressor capacitor mein charge rehta hai plug nikalne ke baad bhi.",
                conclusion: "Golden Refrigeration ko book karein — Sabour/Bhagalpur mein same-day service available hai. Hamara technician gas cylinder aur spare parts lekar aata hai.",
                estimatedCostRange: "₹1,200 - ₹3,500 total (Visit ₹300 + Gas refill ₹800-1,500 + Labour ₹300-500 + Parts ₹0-900)",
            },
        },
        {
            match: (a, i) => (a.includes("ac") || a.includes("air con")) && (i.includes("cool") || i.includes("thanda") || i.includes("heat") || i.includes("warm")),
            en: {
                isRelevant: true,
                problem: "Low refrigerant (R-22/R-32), dirty air filter, or faulty capacitor",
                technicalExplanation: "Step 1: Technician measures indoor/outdoor temperature split — below 8°C difference indicates gas shortage. Step 2: Gas pressure checked on service port. Step 3: If low — leak test, seal, and recharge (R-22 or R-32 per unit spec). Step 4: Air filter and indoor coil inspected and cleaned (blocked filter reduces cooling 30-40%). Step 5: Capacitor checked with multimeter — weak capacitor causes compressor to start slow or not at all. Repair time: 1.5-3 hours.",
                safetyAlert: "High-voltage capacitors inside outdoor unit — do not open. Refrigerant gas can cause frostbite if handled without protection.",
                conclusion: "Book Golden Refrigeration now for expert AC service in Bhagalpur/Sabour. We offer same-day slots for cooling emergencies.",
                estimatedCostRange: "₹1,500 - ₹4,500 total (Visit ₹300 + Gas refill R-22: ₹900-1,800 / R-32: ₹1,200-2,500 + Filter clean ₹200 + Capacitor ₹300-600 if needed)",
            },
            hi: {
                isRelevant: true,
                problem: "Gas (R-22/R-32) leak, dirty filter, ya capacitor kharab",
                technicalExplanation: "Step 1: Technician inlet-outlet temperature difference check karega — 8°C se kam difference gas ki kami batata hai. Step 2: Service port pe gas pressure check hoga. Step 3: Gas low hai to leak seal karke recharge hoga. Step 4: Air filter aur indoor coil saaf hogi — blocked filter se 30-40% cooling kum hoti hai. Step 5: Capacitor multimeter se test hoga — weak capacitor compressor start nahi karta. Repair time: 1.5-3 ghante.",
                safetyAlert: "Outdoor unit mein high-voltage capacitor hota hai — khud mat kholein. Gas se frostbite ho sakta hai.",
                conclusion: "Golden Refrigeration ko abhi book karein — Bhagalpur/Sabour mein same-day AC service available hai.",
                estimatedCostRange: "₹1,500 - ₹4,500 total (Visit ₹300 + Gas R-22: ₹900-1,800 / R-32: ₹1,200-2,500 + Filter ₹200 + Capacitor ₹300-600)",
            },
        },
        {
            match: (a, i) => (a.includes("wash")) && (i.includes("drain") || i.includes("pani") || i.includes("water") || i.includes("leak")),
            en: {
                isRelevant: true,
                problem: "Clogged drain pump filter or cracked drain hose",
                technicalExplanation: "Step 1: Technician removes the drain pump filter (front-bottom panel) — this is usually clogged with lint, coins, or small clothes. Step 2: Filter is cleaned or replaced (₹200-400). Step 3: Drain hose is inspected for cracks or kinks. Step 4: Door seal/gasket is checked for tears that allow water to escape. Step 5: Machine is run on a test cycle to confirm no leak. Repair time: 45-90 minutes.",
                safetyAlert: "Unplug the washing machine before any inspection. Water + electricity is a shock hazard.",
                conclusion: "Golden Refrigeration provides doorstep washing machine repair in Sabour/Bhagalpur — book now for a next-day slot.",
                estimatedCostRange: "₹500 - ₹2,000 total (Visit ₹300 + Drain pump filter ₹200-400 + Hose replacement ₹300-800 + Labour ₹200-300)",
            },
            hi: {
                isRelevant: true,
                problem: "Drain pump filter band ho gaya ya drain hose mein crack hai",
                technicalExplanation: "Step 1: Technician front-bottom panel se drain pump filter nikalega — usme lint, sikke ya kapda fasa hota hai. Step 2: Filter saaf ya replace hoga (₹200-400). Step 3: Drain hose kinks ya crack ke liye check hogi. Step 4: Door seal torn hai to pani bahar aata hai — seal replace hogi. Step 5: Test cycle chalaya jaega. Repair time: 45-90 minute.",
                safetyAlert: "Inspection se pehle machine ka plug nikaal dein — pani aur bijli dono khatra hain.",
                conclusion: "Golden Refrigeration Sabour/Bhagalpur mein ghar pe washing machine repair karta hai — next-day slot book karein.",
                estimatedCostRange: "₹500 - ₹2,000 total (Visit ₹300 + Filter ₹200-400 + Hose ₹300-800 + Labour ₹200-300)",
            },
        },
        {
            match: (a, i) => i.includes("noise") || i.includes("sound") || i.includes("awaz") || i.includes("vibrat"),
            en: {
                isRelevant: true,
                problem: "Fan motor bearing wear or loose mounting bracket",
                technicalExplanation: "Step 1: Technician identifies whether noise is from evaporator fan (inside) or condenser fan (outside/back). Step 2: Fan blades inspected for cracks or ice buildup. Step 3: Motor bearing checked — worn bearings cause grinding/rattling noise. Step 4: Mounting screws and brackets tightened. Step 5: If bearing worn — fan motor assembly replaced (₹400-1,200 depending on model). Step 6: Unit levelled properly to reduce vibration. Repair time: 1-2 hours.",
                safetyAlert: "Motor contains live wires — unplug before any inspection. Do not touch fan blades while machine is running.",
                conclusion: "Book Golden Refrigeration for a noise diagnosis in Bhagalpur — same-day inspection slots available.",
                estimatedCostRange: "₹700 - ₹2,500 total (Visit ₹300 + Labour ₹300-500 + Fan motor ₹400-1,200 + Screws/mounts ₹100-200)",
            },
            hi: {
                isRelevant: true,
                problem: "Fan motor bearing kharab ya mounting loose hai",
                technicalExplanation: "Step 1: Technician pata karega noise evaporator fan (andar) se hai ya condenser fan (bahar/peeche) se. Step 2: Fan blades mein crack ya ice check hogi. Step 3: Motor bearing check hogi — ghisi bearing grinding/rattling awaz deti hai. Step 4: Mounting screws tight kiye jaenge. Step 5: Bearing kharab hai to fan motor assembly replace hogi (₹400-1,200). Step 6: Machine level kiya jaega vibration kam karne ke liye. Repair time: 1-2 ghante.",
                safetyAlert: "Motor mein live wire hoti hai — inspect se pehle plug nikaalein. Chalu machine ke fan ko haath mat lagaein.",
                conclusion: "Bhagalpur mein noise diagnosis ke liye Golden Refrigeration book karein — same-day slot available hai.",
                estimatedCostRange: "₹700 - ₹2,500 total (Visit ₹300 + Labour ₹300-500 + Fan motor ₹400-1,200 + Fittings ₹100-200)",
            },
        },
        {
            match: (a, i) => i.includes("not work") || i.includes("start") || i.includes("band") || i.includes("power") || i.includes("dead") || i.includes("chalu nahi"),
            en: {
                isRelevant: true,
                problem: "Failed start relay, blown thermal fuse, or PCB power board fault",
                technicalExplanation: "Step 1: Technician checks power supply at socket with multimeter. Step 2: PTC start relay tested — shake test (rattling = failed relay, costs ₹150-300). Step 3: Thermal fuse continuity checked — blown fuse means no power to compressor. Step 4: Overload protector tested. Step 5: If all small parts OK, PCB main board diagnosed — board repair or replacement (₹1,200-3,500). Step 6: Wiring harness inspected for rodent damage or burn marks. Repair time: 1-3 hours.",
                safetyAlert: "Do not plug/unplug repeatedly — this can damage the PCB further. Capacitors inside hold lethal charge.",
                conclusion: "Book Golden Refrigeration for expert electrical diagnosis in Bhagalpur/Sabour — we carry all common spare parts for same-day repair.",
                estimatedCostRange: "₹500 - ₹4,000 total (Visit ₹300 + Relay ₹150-300 + Thermal fuse ₹100-200 + PCB ₹1,200-3,500 if needed)",
            },
            hi: {
                isRelevant: true,
                problem: "Start relay fail, thermal fuse blown, ya PCB power board kharab",
                technicalExplanation: "Step 1: Socket pe voltage multimeter se check hoga. Step 2: PTC relay shake test — rattling sound aaye to relay kharab hai (₹150-300). Step 3: Thermal fuse continuity check — fuse blown matlab compressor ko power nahi milti. Step 4: Overload protector test hoga. Step 5: Agar sab theek hai to PCB main board diagnose hoga (₹1,200-3,500). Step 6: Wiring harness mein jalane ke nishan ya chuhe ka damage check hoga. Repair time: 1-3 ghante.",
                safetyAlert: "Bar bar plug mat karein — PCB aur damage ho sakta hai. Andar capacitor mein high voltage hoti hai.",
                conclusion: "Bhagalpur/Sabour mein electrical diagnosis ke liye Golden Refrigeration book karein — hum common parts lekar aate hain same-day repair ke liye.",
                estimatedCostRange: "₹500 - ₹4,000 total (Visit ₹300 + Relay ₹150-300 + Fuse ₹100-200 + PCB ₹1,200-3,500)",
            },
        },
    ];
    // Find best matching rule
    for (const rule of rules) {
        if (rule.match(a, i)) {
            return isEn ? rule.en : rule.hi;
        }
    }
    // General fallback using the existing structured fallback data
    return {
        isRelevant: true,
        problem: fallback.probableFault,
        technicalExplanation: isEn
            ? `Step 1: Technician visits and performs a full diagnostic test on your ${appliance}. Step 2: ${fallback.partsList.join(", ")} are checked. Step 3: Faulty components identified and replaced. Step 4: Unit tested under load to confirm repair. ${fallback.actionPlan} Repair time: 1-3 hours.`
            : `Step 1: Technician aapke ${appliance} ka full diagnostic test karega. Step 2: ${fallback.partsList.join(", ")} check kiye jaenge. Step 3: Kharab parts identify karke replace kiye jaenge. Step 4: Repair ke baad unit test hoga. ${fallback.actionPlan} Repair time: 1-3 ghante.`,
        safetyAlert: isEn
            ? "High voltage components inside — do not attempt DIY repair."
            : "Andar high voltage parts hain — khud repair na karein.",
        conclusion: isEn
            ? `Book Golden Refrigeration for expert ${appliance} repair in Bhagalpur/Sabour — same-day or next-day slots available.`
            : `Bhagalpur/Sabour mein ${appliance} repair ke liye Golden Refrigeration book karein — same-day ya next-day slot available hai.`,
        estimatedCostRange: costRange + " (Visit ₹300 + Labour + Parts — final amount after on-site inspection)",
    };
};
export const diagnose = async (req, res) => {
    try {
        const file = req.file;
        const { applianceType, issueDetails, appliance, issue } = req.body;
        const resolvedAppliance = String(applianceType || appliance || "").trim();
        const resolvedIssue = String(issueDetails || issue || "").trim();
        if (!resolvedAppliance && !resolvedIssue && !file) {
            return res.status(400).json({ error: "Please provide an appliance type, issue description, or upload a photo/video." });
        }
        const detectedLanguage = detectInputLanguage(resolvedIssue || "English");
        const replyLanguage = detectedLanguage === "ENGLISH" ? "ENGLISH" : "HINGLISH";
        const prompt = `You are a SENIOR APPLIANCE REPAIR TECHNICIAN at Golden Refrigeration, Sabour, Bhagalpur — 15+ years experience repairing Indian home appliances.

APPLIANCE: ${resolvedAppliance || "Not specified"}
ISSUE: ${resolvedIssue || "See attached photo/video"}
${file ? "MEDIA: Customer uploaded a photo/video — analyze it for visual clues." : ""}

Give a SPECIFIC, REAL diagnosis based on the exact appliance and issue described. Do NOT give generic answers.

Reply in ${replyLanguage === "ENGLISH" ? "clear English" : "friendly Hinglish (Roman script)"}.

Return ONLY this JSON (no markdown, no explanation):
{
  "isRelevant": true,
  "problem": "Name the exact failed component (e.g. compressor start relay, R-22 gas leak, drain pump filter clog, PCB capacitor blown)",
  "technicalExplanation": "Step-by-step: what failed and why, what technician will check and do, which parts may be replaced, how long it takes",
  "safetyAlert": "Real safety warning specific to this repair, or empty string if none",
  "conclusion": "Warm recommendation to book Golden Refrigeration with same-day/next-day availability in Bhagalpur/Sabour",
  "estimatedCostRange": "Realistic total cost for Bhagalpur 2024-25: visit ₹300 + labour + parts breakdown, give a total range"
}
If completely unrelated to appliance repair: { "isRelevant": false, "problem": "", "technicalExplanation": "", "safetyAlert": "", "conclusion": "", "estimatedCostRange": "" }`;
        let parsed = null;
        let lastModelError = "";
        let uploadedFilePart = null;
        let storedMediaUrl = null;
        let storedMediaType = null;
        // Upload media file to Gemini if provided
        if (file) {
            try {
                uploadedFilePart = await ai.files.upload({
                    file: file.path,
                    config: { mimeType: file.mimetype },
                });
            }
            catch (e) {
                console.error("Failed to upload to Gemini File API:", e.message);
            }
        }
        // Try each model — NO timeout, let AI take as long as it needs
        // gemini-flash-lite-latest and gemini-flash-latest are within free tier quota
        const models = ["gemini-flash-lite-latest", "gemini-flash-latest", "gemini-pro-latest"];
        for (const model of models) {
            try {
                console.log(`[AI Diagnose] Calling model: ${model} for "${resolvedAppliance}" — "${resolvedIssue}"`);
                const contents = uploadedFilePart ? [uploadedFilePart, prompt] : [prompt];
                const response = await (uploadedFilePart
                    ? ai.models.generateContent({ model, contents })
                    : ai.models.generateContent({ model, contents: prompt }));
                const raw = (response.text || "").trim();
                console.log(`[AI Diagnose] Raw response (${model}):`, raw.slice(0, 300));
                if (!raw) {
                    lastModelError = "Empty response";
                    continue;
                }
                const jsonStr = extractJsonObject(raw);
                if (!jsonStr) {
                    lastModelError = "No JSON found in response";
                    continue;
                }
                const candidate = JSON.parse(jsonStr);
                if (typeof candidate?.isRelevant === "boolean") {
                    parsed = {
                        isRelevant: candidate.isRelevant,
                        problem: String(candidate.problem || "").trim(),
                        technicalExplanation: String(candidate.technicalExplanation || "").trim(),
                        safetyAlert: String(candidate.safetyAlert || "").trim(),
                        conclusion: String(candidate.conclusion || "").trim(),
                        estimatedCostRange: String(candidate.estimatedCostRange || "").trim(),
                    };
                    console.log(`[AI Diagnose] Success with model: ${model}`);
                    break;
                }
                lastModelError = "Invalid response structure";
            }
            catch (err) {
                lastModelError = err.message || "Unknown model error";
                console.error(`[AI Diagnose] Model ${model} error:`, lastModelError);
            }
        }
        // Persist uploaded media locally
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
            }
            catch (err) {
                console.error("Failed to persist diagnosis media:", err.message);
            }
        }
        if (uploadedFilePart) {
            try {
                await ai.files.delete({ name: uploadedFilePart.name });
            }
            catch { }
        }
        if (file && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            }
            catch { }
        }
        // Only use smart fallback if AI completely failed
        if (!parsed) {
            console.warn(`[AI Diagnose] All models failed. Using smart fallback. Last error: ${lastModelError}`);
            const fallback = fallbackStructuredDiagnosis(resolvedAppliance, resolvedIssue, replyLanguage);
            const costRange = `₹${Number(fallback.estimatedCostMin).toLocaleString("en-IN")} - ₹${Number(fallback.estimatedCostMax).toLocaleString("en-IN")}`;
            parsed = buildSmartFallback(resolvedAppliance, resolvedIssue, replyLanguage, fallback, costRange);
        }
        const strictMessage = replyLanguage === "ENGLISH"
            ? "I am specialized in Golden Refrigeration appliance diagnostics. Please ask about your repair needs."
            : "Main Golden Refrigeration appliance diagnostics mein specialize karta hoon. Kripya apni repair problem batayein.";
        const safeProblem = parsed.problem || resolvedAppliance || "an internal fault";
        const technicalExplanation = parsed.technicalExplanation || "A technician will inspect and diagnose the exact fault on-site.";
        const safetyAlert = parsed.safetyAlert || "";
        let conclusion = parsed.conclusion || "Book Golden Refrigeration for expert service in Bhagalpur/Sabour.";
        if (!/golden refrigeration/i.test(conclusion)) {
            conclusion += replyLanguage === "ENGLISH" ? " — Golden Refrigeration, Bhagalpur/Sabour." : " — Golden Refrigeration, Bhagalpur/Sabour.";
        }
        const estimatedCostRange = parsed.isRelevant ? (parsed.estimatedCostRange || "") : "";
        const aiDiagnosis = parsed.isRelevant
            ? replyLanguage === "ENGLISH"
                ? `Problem identified: ${safeProblem}\n\n${technicalExplanation}${safetyAlert ? `\n\nSafety Alert: ${safetyAlert}` : ""}\n\nGolden Advice: ${conclusion}`
                : `Identified problem: ${safeProblem}\n\n${technicalExplanation}${safetyAlert ? `\n\nSafety: ${safetyAlert}` : ""}\n\nGolden Advice: ${conclusion}`
            : strictMessage;
        const requesterId = resolveUserIdFromRequest(req);
        let diagnosisLogId = null;
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
        }
        catch (error) {
            console.error("Failed to persist diagnosis log:", error.message);
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
            fallbackUsed: Boolean(lastModelError),
            modelError: lastModelError || undefined,
        });
    }
    catch (error) {
        console.error("AI Diagnosis Error:", error);
        res.status(500).json({ error: "AI diagnosis failed.", details: error.message });
    }
};
export const getMyDiagnosisHistory = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        const rows = await listDiagnosisLogs(userId);
        res.json(rows.map((item) => ({
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
        })));
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch diagnosis history.", details: error.message });
    }
};
