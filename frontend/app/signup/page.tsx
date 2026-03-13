"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";

type RegisterResponse = {
  message?: string;
  error?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as RegisterResponse;
      if (!res.ok) {
        setError(data.error || "Unable to create account.");
        toast.error(data.error || "Unable to create account.");
        return;
      }
      toast.success(data.message || "Account created successfully. Please login.");
      router.push("/login");
    } catch {
      setError("Something went wrong while creating your account.");
      toast.error("Something went wrong while creating your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 md:py-20">
      <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="hidden border-r border-slate-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Golden Refrigeration
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight text-slate-900">Create your secure service account</h1>
            <p className="mt-4 max-w-xl text-slate-600">
              Get premium access to AI diagnosis, service operations, and transparent inventory workflows.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-sm text-slate-700">
            Registration does not auto-login. You will receive a welcome email and then verify your account by OTP.
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <h2 className="text-3xl font-black text-slate-900">Create Account</h2>
          <p className="mt-2 text-sm text-slate-600">Set up your account in less than a minute.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Full Name</span>
              <div className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
                <User className="h-4 w-4 text-blue-600" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Email</span>
              <div className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
                <Mail className="h-4 w-4 text-blue-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Password</span>
              <div className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
                <Lock className="h-4 w-4 text-blue-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  required
                  minLength={6}
                />
              </div>
            </label>

            {error ? (
              <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="min-h-[48px] w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition-transform hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
