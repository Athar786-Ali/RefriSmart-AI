"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { MailCheck, ShieldCheck } from "lucide-react";

type VerifyResponse = {
  message?: string;
  error?: string;
};

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
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
      const parsed = JSON.parse(rawUser) as { isAccountVerified?: boolean };
      if (parsed.isAccountVerified) router.replace("/");
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const handleSendOtp = async () => {
    setError("");
    setMessage("");
    setSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-verify-otp`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as VerifyResponse;
      if (!res.ok) {
        setError(data.error || "Unable to send OTP.");
        return;
      }
      setMessage(data.message || "OTP sent to your email.");
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp: otp.trim() }),
      });
      const data = (await res.json()) as VerifyResponse;
      if (!res.ok) {
        setError(data.error || "OTP verification failed.");
        return;
      }

      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser) as { [key: string]: unknown };
        localStorage.setItem("user", JSON.stringify({ ...parsed, isAccountVerified: true }));
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
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6">
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-900/20 sm:p-10">
        <div className="mb-8 space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" /> Account Verification
          </p>
          <h1 className="text-3xl font-black text-white">Verify your account</h1>
          <p className="text-slate-300">Your account needs email OTP verification before full access.</p>
        </div>

        <button
          type="button"
          onClick={handleSendOtp}
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <MailCheck className="h-4 w-4" />
          {sending ? "Sending OTP..." : "Send OTP to Email"}
        </button>

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
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

