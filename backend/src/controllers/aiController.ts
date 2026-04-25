import type { Request, Response } from "express";
import { ai } from "../config/gemini.js";
import { TECHNICIAN_PHONE, detectInputLanguage, extractJsonObject, fallbackStructuredDiagnosis, wait, createUuid } from "../config/runtime.js";
import { prisma } from "../config/prisma.js";
import { cloudinary } from "../config/cloudinary.js";

type ConsultantPayload = {
  isRelevant: boolean;
  problem?: string;
  technicalExplanation?: string;
  safetyAlert?: string;
  conclusion?: string;
  estimatedCostRange?: string;
};

import fs from "fs";

export const diagnose = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
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

    const prompt = `You are a "Golden Refrigeration Expert Technician", a top repair expert working in Sabour, Bhagalpur area.
You only answer appliance repair questions. Provide proper practical solutions that satisfy the customer.
If an image or video is provided, analyze it carefully to identify the exact fault and give a precise solution.
If the user asks anything unrelated to appliance repair, set isRelevant=false.

Appliance: ${resolvedAppliance || 'Unknown'}
Issue details: ${resolvedIssue || 'See attached media'}

Reply language rule:
- If user language is Hindi or Hinglish, respond in simple professional Hinglish (Roman script).
- If user language is English, respond in simple clear English.

Return strictly valid JSON only with keys:
{
  "isRelevant": true | false,
  "problem": "exact identified problem based on description or visual analysis",
  "technicalExplanation": "proper practical and step-by-step solution to satisfy the customer",
  "safetyAlert": "mention any high voltage, gas, or physical safety risks",
  "conclusion": "A strong, friendly advice to book our Golden Refrigeration expert technician to get it safely repaired.",
  "estimatedCostRange": "real estimation charge for Sabour/Bhagalpur area (include a baseline like ₹300 visit fee + expected parts limit)"
}
If isRelevant is false, leave other fields as empty strings.`;

    const preferredModels = [
      "gemini-2.0-flash", // Enforce 2.0-flash for media understanding
      "gemini-1.5-flash",
    ];

    let parsed: ConsultantPayload | null = null;
    let lastModelError = "";
    
    let uploadedFilePart: any = null;
    if (file) {
      try {
        uploadedFilePart = await ai.files.upload({
          file: file.path,
          config: { mimeType: file.mimetype },
        });
      } catch (e: any) {
        console.error("Failed to upload to Gemini File API:", e.message);
      }
    }

    const contents = uploadedFilePart ? [uploadedFilePart, prompt] : [prompt];

    for (const model of preferredModels) {
      try {
        const reqPromise = uploadedFilePart
          ? ai.models.generateContent({ model, contents })
          : ai.models.generateContent({ model, contents: prompt });
          
        const response = await Promise.race([
          reqPromise,
          wait(8000).then(() => {
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
        console.error("Model failure:", lastModelError);
      }
    }
    
    if (file && uploadedFilePart) {
      try {
        const cloudinaryResult = await cloudinary.uploader.upload(file.path, {
          folder: "refri-smart/gallery",
          resource_type: "auto",
        });
        await prisma.gallery.create({
          data: {
            id: createUuid(),
            imageUrl: cloudinaryResult.secure_url,
            mediaType: cloudinaryResult.resource_type === "video" ? "video" : "image",
            caption: `AI Diagnosis issue: ${resolvedAppliance} - ${resolvedIssue.substring(0, 50) || "Uploaded media problem"}`,
          }
        });
      } catch (err: any) {
        console.error("Failed to add AI problem to gallery:", err.message);
      }

      try {
        await ai.files.delete({ name: uploadedFilePart.name });
      } catch(e) {}
    }
    if (file) {
      try {
        fs.unlinkSync(file.path);
      } catch(e) {}
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
