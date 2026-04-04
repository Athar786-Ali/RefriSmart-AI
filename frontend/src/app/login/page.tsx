"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Phone, KeyRound, ShieldCheck, ArrowRight, CheckCircle2, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

type LoginResponse = {
  message?: string;
  error?: string;
  whatsappLink?: string;
  otpPreview?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    isAccountVerified?: boolean;
    isPhoneVerified?: boolean;
    phone?: string | null;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    if (phone.replace(/\D/g, "").length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/request-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, name: name.trim() || undefined }),
      });

      const data = (await res.json()) as LoginResponse;
      if (!res.ok) {
        setError(data.error || "Failed to request OTP.");
        toast.error(data.error || "Failed to request OTP.");
        return;
      }

      toast.success("OTP Sent! Check your WhatsApp.");
      if (data.whatsappLink) {
        // Automatically open WhatsApp in a new tab to find the OTP easily
        window.open(data.whatsappLink, "_blank");
      }
      setStep(2);
    } catch {
      setError("Unable to request OTP. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, otp }),
      });

      const data = (await res.json()) as LoginResponse;
      if (!res.ok || !data.user) {
        setError(data.error || "Verification failed.");
        toast.error(data.error || "Verification failed.");
        return;
      }

      const sessionUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        isAccountVerified: Boolean(data.user.isAccountVerified),
        isPhoneVerified: Boolean(data.user.isPhoneVerified),
        phone: data.user.phone ?? null,
      };

      localStorage.setItem("user", JSON.stringify(sessionUser));
      setUser(sessionUser);

      if (data.user.role === "ADMIN") {
        toast.success("Welcome back, Admin!");
        router.push("/admin");
      } else {
        toast.success(`Welcome to Golden Refrigeration!`);
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Unable to process login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-6rem)] flex items-center justify-center py-12 bg-slate-50 text-slate-900 overflow-hidden">
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-md bg-white p-8 sm:p-10 shadow-2xl shadow-blue-900/10 rounded-3xl border border-slate-100">
        
        {/* Aesthetic background flares */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-blue-50 blur-3xl p-10 opacity-70 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-cyan-50 blur-3xl p-10 opacity-70 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Secure Sign In</h1>
            <p className="text-slate-600 text-sm">
              We use Passwordless Authentication. Securely log in using just your mobile number.
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-5 mt-4">
              {/* Full Name — optional, saves/updates profile */}
              <label className="block">
                <span className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                  Full Name <span className="normal-case font-normal text-slate-400">(optional)</span>
                </span>
                <div className="flex h-14 items-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 px-4 transition-colors">
                  <User className="h-5 w-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="h-full w-full bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-300 placeholder:font-medium"
                    autoComplete="name"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                  Mobile Number
                </span>
                <div className="flex h-14 items-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 px-4 transition-colors">
                  <span className="text-slate-500 font-bold border-r border-slate-300 pr-3">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter 10 digit number"
                    className="h-full w-full bg-transparent text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-300 placeholder:font-medium"
                    required
                  />
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
              </label>

              {error && (
                <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Get OTP via WhatsApp"} 
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyLogin} className="flex flex-col gap-5 mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">OTP sent to {phone}</span>
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="text-blue-600 font-bold hover:underline"
                >
                  Change
                </button>
              </div>

              <label className="block">
                <div className="flex h-14 items-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 px-4 transition-colors">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter OTP code"
                    className="h-full w-full bg-transparent text-lg font-bold tracking-[0.2em] text-slate-900 outline-none placeholder:tracking-normal placeholder:text-slate-300 placeholder:font-medium"
                    required
                  />
                </div>
              </label>

              {error && (
                <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-base font-bold text-white shadow-lg shadow-slate-900/30 transition-all hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
                {!loading && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
            By logging in, you agree to Golden Refrigeration's Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}
