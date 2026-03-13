"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";

type ResetOtpResponse = {
  message?: string;
  error?: string;
};

export default function ResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as ResetOtpResponse;
      if (!res.ok) {
        setError(data.error || "Failed to send reset OTP.");
        return;
      }
      setMessage(data.message || "Reset OTP sent.");
      router.push(`/new-password?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Unable to process your request right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-6rem)] flex items-center justify-center py-12 bg-slate-50 text-slate-900">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-md bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 [&_h1]:!text-slate-900 [&_p]:!text-slate-600">
        <h1 className="text-3xl font-black text-white">Forgot your password?</h1>
        <p className="mt-2 text-sm text-slate-300">Enter your email to receive a 6-digit reset OTP.</p>

        <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
          <label className="block">
            <span className="mb-1.5 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Email</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 px-4">
              <Mail className="h-4 w-4 text-cyan-300" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="you@example.com"
                required
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-500 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-900/30 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Sending OTP..." : "Send Reset OTP"}
          </button>
        </form>

        {message ? <p className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
      </section>
    </main>
  );
}
