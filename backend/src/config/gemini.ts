import { GoogleGenAI } from "@google/genai";

// Collect all configured API keys (supports up to 5 keys for rotation)
// Each key = separate Google project = separate quota (1,500 req/day free)
const rawKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter((k): k is string => Boolean(k && k.trim()));

if (rawKeys.length === 0) {
  console.error("[Gemini] ❌ No GEMINI_API_KEY found in environment!");
} else {
  console.log(`[Gemini] ✅ Loaded ${rawKeys.length} API key(s) for rotation.`);
}

// Create one GoogleGenAI client per key
export const geminiClients: GoogleGenAI[] = rawKeys.map(
  (key) => new GoogleGenAI({ apiKey: key })
);

// Round-robin key rotation index
let currentKeyIndex = 0;

/**
 * Returns the next available GoogleGenAI client (round-robin rotation).
 * Call rotateKey() after a quota error to switch to the next project's key.
 */
export const getGeminiClient = (): GoogleGenAI => {
  return geminiClients[currentKeyIndex % geminiClients.length];
};

export const rotateKey = (): void => {
  const prev = currentKeyIndex;
  currentKeyIndex = (currentKeyIndex + 1) % geminiClients.length;
  console.log(
    `[Gemini] 🔄 Rotating key: slot ${prev + 1} → slot ${currentKeyIndex + 1} of ${geminiClients.length}`
  );
};

export const totalKeys = (): number => geminiClients.length;

// Default export for backward compat (uses primary key always)
export const ai = geminiClients[0] ?? new GoogleGenAI({ apiKey: "" });
