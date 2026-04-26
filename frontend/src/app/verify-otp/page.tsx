"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { MailCheck, Phone, ShieldCheck } from "lucide-react";
import { getApiBase } from "@/lib/api";

type VerifyResponse = {
  message?: string;
  error?: string;
  otpPreview?: string;
  whatsappLink?: string;
};

export default function VerifyOtpPage() {
  const router = useRouter();
  const API = getApiBase();
  const [otp, setOtp] = useState("");
  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [phone, setPhone] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) {
      router.replace("/login");
      return;
    }
    try {
      const parsed = JSON.parse(rawUser) as { isAccountVerified?: boolean; isPhoneVerified?: boolean; phone?: string | null };
      if (parsed.isAccountVerified || parsed.isPhoneVerified) router.replace("/");
      if (parsed.phone) setPhone(String(parsed.phone));
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const handleSendOtp = async () => {
    setError("");
    setMessage("");
    if (channel === "phone") {
      const cleaned = phone.replace(/\D/g, "");
      if (cleaned.length !== 10) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }
    }
    setWhatsappLink("");
    setSending(true);
    try {
      const res = await fetch(
        `${API}/${channel === "email" ? "auth/send-verify-otp" : "auth/send-whatsapp-otp"}`,
        {
          method: "POST",
          headers: channel === "phone" ? { "Content-Type": "application/json" } : undefined,
          credentials: "include",
          body: channel === "phone" ? JSON.stringify({ phone: phone.trim() }) : undefined,
        },
      );
      const data = (await res.json()) as VerifyResponse;
      if (!res.ok) {
        setError(data.error || "Unable to send OTP.");
        return;
      }
      if (data && data.whatsappLink) {
        setWhatsappLink(data.whatsappLink);
      }
      if (data && data.otpPreview) {
        setMessage(`${data.message || "OTP generated."} OTP (dev): ${data.otpPreview}`);
      } else {
        setMessage(data.message || "OTP sent.");
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setVerifying(true);
    try {
      const res = await fetch(
        `${API}/${channel === "email" ? "auth/verify-otp" : "auth/verify-phone-otp"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ otp: otp.trim() }),
        },
      );
      const data = (await res.json()) as VerifyResponse;
      if (!res.ok) {
        setError(data.error || "OTP verification failed.");
        return;
      }

      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser) as { [key: string]: unknown };
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsed,
            ...(channel === "email" ? { isAccountVerified: true } : { isPhoneVerified: true, phone: phone.trim() }),
          }),
        );
      }
      window.dispatchEvent(new Event("storage"));
      setMessage(data.message || "Account verified.");
      router.push("/");
      router.refresh();
    } catch {
      setError("Failed to verify OTP.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-6rem)] flex items-center justify-center py-12 bg-slate-50 text-slate-900">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-md bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 [&_h1]:!text-slate-900 [&_p]:!text-slate-600">
        <div className="mb-8 space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" /> Account Verification
          </p>
          <h1 className="text-3xl font-black text-white">Verify your account</h1>
          <p className="text-slate-300">Verify via email or mobile OTP to unlock full access.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setChannel("email")}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.14em] ${
              channel === "email" ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/50" : "border border-slate-700 text-slate-400"
            }`}
          >
            <MailCheck className="h-3.5 w-3.5" />
            Email OTP
          </button>
          <button
            type="button"
            onClick={() => setChannel("phone")}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.14em] ${
              channel === "phone" ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/50" : "border border-slate-700 text-slate-400"
            }`}
          >
            <Phone className="h-3.5 w-3.5" />
            WhatsApp OTP
          </button>
        </div>

        {channel === "phone" && (
          <label className="block text-sm font-semibold text-slate-700">
            Mobile Number
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              inputMode="numeric"
              required
            />
          </label>
        )}

        <button
          type="button"
          onClick={handleSendOtp}
          disabled={sending || (channel === "phone" && phone.trim().length < 10)}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <MailCheck className="h-4 w-4" />
          {sending ? "Sending OTP..." : channel === "email" ? "Send OTP to Email" : "Send OTP to WhatsApp"}
        </button>

        {channel === "phone" && whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Open WhatsApp to View OTP
          </a>
        ) : null}

        <form onSubmit={handleVerify} className="flex flex-col gap-6">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="h-16 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 text-center text-3xl font-black tracking-[0.35em] text-white outline-none placeholder:text-slate-600"
            required
          />
          <button
            type="submit"
            disabled={verifying || otp.trim().length !== 6}
            className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifying ? "Verifying..." : "Verify Account"}
          </button>
        </form>

        {message ? <p className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
      </section>
    </main>
  );
}
