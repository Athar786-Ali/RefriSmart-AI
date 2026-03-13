import { ai } from "../config/gemini.js";
import { TECHNICIAN_PHONE, detectInputLanguage, extractJsonObject, fallbackStructuredDiagnosis, generateFallbackDiagnosis, wait, } from "../config/runtime.js";
export const diagnose = async (req, res) => {
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
                        urgency: String(parsed.urgency).toUpperCase() || "MEDIUM",
                        partsList: parsed.partsList.map((part) => String(part)).filter(Boolean).slice(0, 6),
                        estimatedCostMin: Number(parsed.estimatedCostMin),
                        estimatedCostMax: Number(parsed.estimatedCostMax),
                        actionPlan: String(parsed.actionPlan),
                    };
                    break;
                }
            }
            catch (error) {
                lastModelError = error.message;
            }
        }
        if (!structured) {
            structured = fallbackStructuredDiagnosis(appliance, issue, inputLanguage);
        }
        aiDiagnosis = generateFallbackDiagnosis(appliance, issue, inputLanguage);
        return res.json({
            diagnosis: aiDiagnosis,
            structured,
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
    }
    catch (error) {
        console.error("AI Diagnosis Error:", error);
        res.status(500).json({ error: "AI diagnosis failed.", details: error.message });
    }
};
