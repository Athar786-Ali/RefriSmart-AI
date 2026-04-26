/**
 * OTP Delivery Service — Golden Refrigeration
 *
 * Priority chain:
 *   1. MSG91 WhatsApp  (professional, shows "Golden Refrigeration" as sender)
 *   2. MSG91 SMS       (works with free trial immediately)
 *   3. Dev console     (no config needed — OTP is logged + returned in response)
 *
 * Environment variables (backend/.env):
 *   MSG91_AUTH_KEY       — Auth key from msg91.com dashboard
 *   MSG91_TEMPLATE_ID    — OTP template ID from MSG91 dashboard
 *   MSG91_SENDER_ID      — 6-char sender ID e.g. GOLDRG  (default: GOLDRG)
 *   MSG91_WA_FLOW_ID     — WhatsApp flow ID (optional, after WhatsApp approval)
 *   MSG91_WA_OTP_VAR     — Template variable name for OTP (default: OTP)
 */
const AUTHKEY = process.env.MSG91_AUTH_KEY ?? "";
const SMS_TMPL = process.env.MSG91_TEMPLATE_ID ?? "";
const SENDER_ID = process.env.MSG91_SENDER_ID ?? "GOLDRG";
const WA_FLOW_ID = process.env.MSG91_WA_FLOW_ID ?? "";
const WA_OTP_VAR = process.env.MSG91_WA_OTP_VAR ?? "OTP";
const IS_PROD = process.env.NODE_ENV === "production";
const TIMEOUT_MS = 10_000; // 10 second max wait for MSG91
/** Fetch wrapper with AbortController timeout */
async function fetchWithTimeout(url, options, ms = TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    }
    finally {
        clearTimeout(timer);
    }
}
/** Public API — call from authController */
export async function deliverLoginOtp(phone, // 10-digit Indian number WITHOUT country code
otp) {
    const mobile = `91${phone}`;
    // ── 1. Try WhatsApp (most professional) ─────────────────────────────────
    if (AUTHKEY && WA_FLOW_ID) {
        try {
            await sendViaWhatsApp(mobile, otp);
            console.log(`[OTP] ✅ WhatsApp delivered → +91${phone}`);
            return { channel: "whatsapp" };
        }
        catch (err) {
            console.warn(`[OTP] ⚠ WhatsApp failed (${err.message}), trying SMS…`);
        }
    }
    // ── 2. Try MSG91 SMS ─────────────────────────────────────────────────────
    if (AUTHKEY && SMS_TMPL) {
        try {
            await sendViaSms(mobile, otp);
            console.log(`[OTP] ✅ SMS delivered → +91${phone}`);
            return { channel: "sms" };
        }
        catch (err) {
            console.warn(`[OTP] ⚠ SMS failed (${err.message}), using dev fallback`);
        }
    }
    // ── 3. Dev fallback ──────────────────────────────────────────────────────
    if (IS_PROD) {
        throw new Error("OTP delivery failed. Set MSG91_AUTH_KEY + MSG91_TEMPLATE_ID in backend/.env");
    }
    console.log(`\n╔══════════════════════════════════════╗`);
    console.log(`║  🔑 DEV OTP for +91${phone}      ║`);
    console.log(`║     Code  : ${otp}                  ║`);
    console.log(`║     Expiry: 10 minutes               ║`);
    console.log(`╚══════════════════════════════════════╝\n`);
    return { channel: "dev" };
}
// ── MSG91 WhatsApp Flow API ───────────────────────────────────────────────
async function sendViaWhatsApp(mobile, otp) {
    const res = await fetchWithTimeout("https://api.msg91.com/api/v5/flow/", {
        method: "POST",
        headers: { "Content-Type": "application/json", authkey: AUTHKEY },
        body: JSON.stringify({
            flow_id: WA_FLOW_ID,
            sender: SENDER_ID,
            mobiles: mobile,
            [WA_OTP_VAR]: otp,
        }),
    });
    const json = (await res.json().catch(() => ({})));
    if (!res.ok || json["type"] === "error") {
        throw new Error(String(json["message"] ?? `HTTP ${res.status}`));
    }
}
// ── MSG91 SMS OTP API ────────────────────────────────────────────────────
async function sendViaSms(mobile, otp) {
    const res = await fetchWithTimeout("https://api.msg91.com/api/v5/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", authkey: AUTHKEY },
        body: JSON.stringify({
            template_id: SMS_TMPL,
            mobile,
            authkey: AUTHKEY,
            otp,
            sender: SENDER_ID,
        }),
    });
    const json = (await res.json().catch(() => ({})));
    if (!res.ok || json["type"] === "error") {
        throw new Error(String(json["message"] ?? `HTTP ${res.status}`));
    }
}
