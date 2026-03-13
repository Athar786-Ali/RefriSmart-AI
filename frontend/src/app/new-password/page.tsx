"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { KeyRound, Lock } from "lucide-react";

type NewPasswordResponse = {
  message?: string;
  error?: string;
};

export default function NewPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get("email") || "");
  }, []);

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setError("Missing email. Please start from reset page.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp: otp.trim(), newPassword: password }),
      });
      const data = (await res.json()) as NewPasswordResponse;
      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }
      setMessage(data.message || "Password updated successfully.");
      setTimeout(() => router.push("/login"), 800);
    } catch {
      setError("Unable to reset password right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6">
      <section className="mx-auto w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-900/20 sm:p-10">
        <h1 className="text-3xl font-black text-white">Set new password</h1>
        <p className="mt-2 text-sm text-slate-300">
          Email: <span className="font-semibold text-cyan-300">{email || "Not provided"}</span>
        </p>

        <form onSubmit={handleResetPassword} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-1.5 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">6-Digit OTP</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 px-4">
              <KeyRound className="h-4 w-4 text-cyan-300" />
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="h-12 w-full bg-transparent text-lg font-bold tracking-[0.25em] text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="000000"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">New Password</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 px-4">
              <Lock className="h-4 w-4 text-cyan-300" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {message ? <p className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
      </section>
    </main>
  );
}
