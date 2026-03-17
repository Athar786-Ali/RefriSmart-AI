import type { Request, Response } from "express";
import { ai } from "../config/gemini.js";
import { TECHNICIAN_PHONE, detectInputLanguage, extractJsonObject, fallbackStructuredDiagnosis, wait } from "../config/runtime.js";

type ConsultantPayload = {
  isRelevant: boolean;
  problem?: string;
  technicalExplanation?: string;
  safetyAlert?: string;
  conclusion?: string;
  estimatedCostRange?: string;
};

export const diagnose = async (req: Request, res: Response) => {
  try {
    const { applianceType, issueDetails, appliance, issue } = req.body as {
      applianceType?: string;
      issueDetails?: string;
      appliance?: string;
      issue?: string;
    };
    const resolvedAppliance = String(applianceType || appliance || "").trim();
    const resolvedIssue = String(issueDetails || issue || "").trim();
    if (!resolvedAppliance || !resolvedIssue) {
      return res.status(400).json({ error: "Please provide appliance details and issue description." });
    }

    const detectedLanguage = detectInputLanguage(resolvedIssue);
    const replyLanguage = detectedLanguage === "ENGLISH" ? "ENGLISH" : "HINGLISH";

    const prompt = `You are "Golden Refrigeration Senior Consultant", a senior appliance technician speaking to a friend.
You only answer appliance repair questions. If the user asks anything unrelated to appliance repair, set isRelevant=false.
ONLY talk about the appliance provided; do not mention other appliances.

Appliance: ${resolvedAppliance}
Issue details: ${resolvedIssue}
Reply language rule:
- If user language is Hindi or Hinglish, respond in professional-friendly Hinglish (Roman script).
- If user language is English, respond in VERY SIMPLE English with short, clear sentences.

Return strictly valid JSON only with keys:
{
  "isRelevant": true | false,
  "problem": "short problem title",
  "technicalExplanation": "simple and friendly explanation",
  "safetyAlert": "mention high voltage / gas / safety risks in simple words",
  "conclusion": "always suggest Golden Refrigeration technician booking",
  "estimatedCostRange": "₹600 - ₹1200"
}
If isRelevant is false, leave other fields as empty strings.`;

    const preferredModels = [
      process.env.GEMINI_MODEL,
      "gemini-3.1-flash-lite-preview",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ].filter(Boolean) as string[];

    let parsed: ConsultantPayload | null = null;
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
        ]) as { text?: string };
        const raw = response.text?.trim() || "";
        if (!raw) continue;
        const jsonCandidate = extractJsonObject(raw);
        if (!jsonCandidate) continue;
        const candidate = JSON.parse(jsonCandidate) as ConsultantPayload;
        if (typeof candidate?.isRelevant === "boolean") {
          parsed = {
            isRelevant: candidate.isRelevant,
            problem: typeof candidate.problem === "string" ? candidate.problem.trim() : "",
            technicalExplanation: typeof candidate.technicalExplanation === "string" ? candidate.technicalExplanation.trim() : "",
            safetyAlert: typeof candidate.safetyAlert === "string" ? candidate.safetyAlert.trim() : "",
            conclusion: typeof candidate.conclusion === "string" ? candidate.conclusion.trim() : "",
            estimatedCostRange: typeof candidate.estimatedCostRange === "string" ? candidate.estimatedCostRange.trim() : "",
          };
          break;
        }
      } catch (error) {
        lastModelError = (error as Error).message;
      }
    }

    const fallback = fallbackStructuredDiagnosis(resolvedAppliance, resolvedIssue, replyLanguage);
    const fallbackCostRange = `₹${Number(fallback.estimatedCostMin).toLocaleString("en-IN")} - ₹${Number(
      fallback.estimatedCostMax,
    ).toLocaleString("en-IN")}`;

    if (!parsed) {
      parsed = {
        isRelevant: true,
        problem: fallback.probableFault || "an internal component fault",
        technicalExplanation:
          replyLanguage === "ENGLISH"
            ? "This usually happens when a key part is weak or worn. A technician will test the unit to find the exact fault."
            : "Ye issue aksar tab hota hai jab koi important part weak ho jata hai. Technician test karke exact fault confirm karega.",
        safetyAlert:
          replyLanguage === "ENGLISH"
            ? "Repairs can involve high voltage parts or gas lines. Please do not open the panels yourself."
            : "Repair me high voltage parts ya gas lines ho sakti hain. Kripya khud panel na kholien.",
        conclusion:
          replyLanguage === "ENGLISH"
            ? "Please book a Golden Refrigeration technician for a safe fix."
            : "Safe fix ke liye Golden Refrigeration technician ko book karein.",
        estimatedCostRange: fallbackCostRange,
      };
    }

    const strictMessage =
      replyLanguage === "ENGLISH"
        ? "I am specialized in Golden Refrigeration appliance diagnostics. Please ask about your repair needs."
        : "Main Golden Refrigeration appliance diagnostics mein specialize karta hoon. Kripya apni repair problem batayein.";
    const safeProblem = parsed.problem || fallback.probableFault || "ek technical fault";
    const technicalExplanation =
      parsed.technicalExplanation ||
      (replyLanguage === "ENGLISH"
        ? "This issue needs a quick inspection to find the exact cause."
        : "Is issue ka exact cause jaanne ke liye quick inspection zaroori hai.");
    const safetyAlert =
      parsed.safetyAlert ||
      (replyLanguage === "ENGLISH"
        ? "High voltage or gas risk is possible. Please avoid DIY repair."
        : "High voltage ya gas risk ho sakta hai. Kripya DIY repair na karein.");
    let conclusion =
      parsed.conclusion ||
      (replyLanguage === "ENGLISH"
        ? "Please book a Golden Refrigeration technician for a safe fix."
        : "Safe fix ke liye Golden Refrigeration technician ko book karein.");
    if (!/golden refrigeration/i.test(conclusion)) {
      conclusion =
        replyLanguage === "ENGLISH"
          ? `${conclusion} We recommend Golden Refrigeration technicians.`
          : `${conclusion} Golden Refrigeration ke technicians ko recommend karte hain.`;
    }
    const estimatedCostRange = parsed.isRelevant ? (parsed.estimatedCostRange || fallbackCostRange) : "";

    const aiDiagnosis = parsed.isRelevant
      ? replyLanguage === "ENGLISH"
        ? `Based on your report for ${resolvedAppliance}, the likely cause is ${safeProblem}.\n\n${technicalExplanation}\n\nSafety Alert: ${safetyAlert}\n\nGolden Advice: ${conclusion}`
        : `Aapke ${resolvedAppliance} mein ${safeProblem} ka issue lag raha hai.\n\n${technicalExplanation}\n\nSafety: ${safetyAlert}\n\nGolden Advice: ${conclusion}`
      : strictMessage;

    return res.json({
      diagnosis: aiDiagnosis,
      estimatedCostRange,
      consultant: "Golden Refrigeration Senior Consultant",
      bookingRequired: true,
      contact: {
        phone: TECHNICIAN_PHONE,
        call: `tel:${TECHNICIAN_PHONE}`,
        whatsapp: `https://wa.me/91${TECHNICIAN_PHONE}`,
        sms: `sms:+91${TECHNICIAN_PHONE}`,
      },
      fallbackUsed: Boolean(lastModelError),
      modelError: lastModelError || undefined,
    });
  } catch (error) {
    console.error("AI Diagnosis Error:", error);
    res.status(500).json({ error: "AI diagnosis failed.", details: (error as Error).message });
  }
};
