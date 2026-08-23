/**
 * NVIDIA NIM API Configuration
 * 
 * Uses the OpenAI-compatible REST API at integrate.api.nvidia.com
 * Supports multimodal (text + base64 image) via chat completions endpoint.
 * Zero external dependencies — uses native fetch().
 */

import fs from "node:fs";

const NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY?.trim() || "";

if (!NVIDIA_API_KEY) {
  console.warn("[NVIDIA] ⚠️  No NVIDIA_API_KEY found in environment. NVIDIA AI will be skipped.");
} else {
  console.log(`[NVIDIA] ✅ API key loaded (${NVIDIA_API_KEY.slice(0, 12)}...)`);
}

export const isNvidiaConfigured = (): boolean => Boolean(NVIDIA_API_KEY);

// Models ordered: best vision → general → lighter vision
export const NVIDIA_MODELS = [
  "meta/llama-3.2-90b-vision-instruct",     // Best vision model (90B)
  "google/gemma-3-27b-it",                   // Strong general model
  "meta/llama-3.2-11b-vision-instruct",      // Lighter vision model (11B)
] as const;

/**
 * Maximum base64 payload size for NVIDIA vision models (~180KB encoded).
 * Images larger than this are skipped for multimodal and sent as text-only.
 */
const MAX_BASE64_SIZE = 180_000;

/**
 * Read a file from disk and convert to a base64 data URL.
 * Returns null if file is too large or unreadable.
 */
export function fileToBase64DataUrl(
  filePath: string,
  mimeType: string,
): string | null {
  try {
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString("base64");

    if (base64.length > MAX_BASE64_SIZE) {
      console.warn(
        `[NVIDIA] Image too large for inline base64 (${(base64.length / 1024).toFixed(0)}KB > ${(MAX_BASE64_SIZE / 1024).toFixed(0)}KB limit). Sending text-only.`,
      );
      return null;
    }

    return `data:${mimeType};base64,${base64}`;
  } catch (err: any) {
    console.error(`[NVIDIA] Failed to read file for base64:`, err.message);
    return null;
  }
}

/**
 * Call NVIDIA NIM chat completions API.
 *
 * @param model - NVIDIA model ID (e.g. "meta/llama-3.2-90b-vision-instruct")
 * @param prompt - Text prompt for the AI
 * @param base64ImageUrl - Optional base64 data URL for multimodal (e.g. "data:image/jpeg;base64,...")
 * @returns The AI response text
 * @throws Error with descriptive message on failure
 */
export async function callNvidia(
  model: string,
  prompt: string,
  base64ImageUrl?: string | null,
): Promise<string> {
  if (!NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY not configured");
  }

  // Build message content — text-only or multimodal
  let content: any;
  if (base64ImageUrl && model.includes("vision")) {
    // Multimodal: text + image (only for vision models)
    content = [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: base64ImageUrl } },
    ];
  } else {
    // Text-only
    content = prompt;
  }

  const body = {
    model,
    messages: [{ role: "user", content }],
    max_tokens: 1024,
    temperature: 0.3,
    top_p: 0.9,
  };

  const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    const status = response.status;

    if (status === 401) {
      throw new Error(`NVIDIA 401: Invalid API key`);
    }
    if (status === 429) {
      throw new Error(`NVIDIA 429: Rate limited / quota exceeded. ${errorText.slice(0, 200)}`);
    }
    if (status === 404) {
      throw new Error(`NVIDIA 404: Model "${model}" not found`);
    }

    throw new Error(`NVIDIA ${status}: ${errorText.slice(0, 300)}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = data?.choices?.[0]?.message?.content?.trim() || "";
  if (!text) {
    throw new Error(`NVIDIA: Empty response from model "${model}"`);
  }

  return text;
}
