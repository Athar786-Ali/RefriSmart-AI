"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type LoginResponse = {
  message?: string;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    isAccountVerified?: boolean;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as LoginResponse;
      if (!res.ok || !data.user) {
        setError(data.error || "Login failed.");
        toast.error(data.error || "Login failed.");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          isAccountVerified: Boolean(data.user.isAccountVerified),
        }),
      );
      window.dispatchEvent(new Event("storage"));

      if (!data.user.isAccountVerified) {
        toast.info("Verify your account to continue.");
        router.push("/verify-otp");
        return;
      }
      if (data.user.role === "ADMIN") {
        toast.success("Welcome back, Admin.");
        router.push("/admin");
      } else {
        toast.success(`Welcome back, ${data.user.name}.`);
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Unable to login right now. Please try again.");
      toast.error("Unable to login right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 md:py-20">
      <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden flex-col justify-between border-r border-slate-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-10 lg:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_45%)]" />
          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure Access
            </p>
            <h1 className="text-4xl font-black leading-tight text-slate-900">Welcome back to Golden Refrigeration</h1>
            <p className="max-w-xl text-slate-600">
              Manage diagnostics, bookings, inventory, and service workflows from one premium dashboard.
            </p>
          </div>
          <div className="relative rounded-2xl border border-slate-200 bg-white/80 p-5">
            <p className="text-sm text-slate-700">Cookie-based JWT authentication is active for better session security.</p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <h2 className="text-3xl font-black text-slate-900">Sign In</h2>
          <p className="mt-2 text-sm text-slate-600">Use your account credentials to continue.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
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
                  placeholder="Enter your password"
                  className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  required
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
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link href="/reset" className="font-semibold text-blue-600 hover:text-blue-700">
              Forgot Password?
            </Link>
            <Link href="/signup" className="font-semibold text-slate-700 hover:text-slate-900">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
