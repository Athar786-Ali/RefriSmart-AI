"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Phone, KeyRound, ShieldCheck, ArrowRight, CheckCircle2,
  User, MessageCircle, Smartphone, RotateCcw, Info, Mail
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

type LoginResponse = {
  message?: string;
  error?: string;
  channel?: "whatsapp" | "sms" | "dev" | "email";
  otpPreview?: string;
  user?: {
    id: string; name: string; email: string; role: string;
    isAccountVerified?: boolean; isPhoneVerified?: boolean; phone?: string | null;
  };
};

const RESEND_COOLDOWN = 30; // seconds

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [method,    setMethod]  = useState<"email" | "phone">("email");
  const [step,      setStep]    = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState(""); // Stores either email or phone depending on method
  const [name,      setName]    = useState("");
  const [otp,       setOtp]     = useState("");
  const [loading,   setLoading] = useState(false);
  const [error,     setError]   = useState("");
  const [channel,   setChannel] = useState<"whatsapp" | "sms" | "dev" | "email" | "">("");
  const [devOtp,    setDevOtp]  = useState("");          // only in dev mode
  const [countdown, setCountdown] = useState(0);        // resend cooldown
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  // Auto-focus OTP field when step changes
  useEffect(() => {
    if (step === 2) setTimeout(() => otpInputRef.current?.focus(), 100);
  }, [step]);

  // Switch tabs
  const handleSwitchMethod = (newMethod: "email" | "phone") => {
    if (loading) return;
    setMethod(newMethod);
    setIdentifier("");
    setStep(1);
    setOtp("");
    setError("");
  };

  const handleRequestOtp = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setError("");
    
    // Validation
    if (method === "phone" && identifier.replace(/\D/g, "").length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (method === "email" && (!identifier.includes("@") || !identifier.includes("."))) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = method === "email" ? "/auth/request-email-login-otp" : "/auth/request-login-otp";
      const payload = method === "email" 
        ? { email: identifier.trim(), name: name.trim() || undefined }
        : { phone: identifier.replace(/\D/g, ""), name: name.trim() || undefined };

      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      
      const data = (await res.json()) as LoginResponse;
      if (!res.ok) { setError(data.error || "Failed to send OTP."); return; }

      setChannel(method === "email" ? "email" : (data.channel ?? ""));
      setDevOtp(data.otpPreview ?? "");
      setCountdown(RESEND_COOLDOWN);
      setStep(2);
      
      toast.success(
        method === "email" ? "✅ OTP sent to your email inbox!"
        : data.channel === "whatsapp" ? "✅ OTP sent to your WhatsApp!"
        : data.channel === "sms"    ? "✅ OTP sent via SMS!"
        : "🔧 Dev mode — OTP shown below"
      );
    } catch {
      setError("Unable to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setOtp("");
    setDevOtp("");
    setError("");
    await handleRequestOtp();
  };

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = method === "email" ? "/auth/verify-email-login" : "/auth/verify-login";
      const payload = method === "email"
        ? { email: identifier.trim(), otp }
        : { phone: identifier.replace(/\D/g, ""), otp };

      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      
      const data = (await res.json()) as LoginResponse;
      if (!res.ok || !data.user) {
        setError(data.error || "Verification failed.");
        toast.error(data.error || "Verification failed.");
        return;
      }
      
      const sessionUser = {
        id: data.user.id, name: data.user.name, email: data.user.email,
        role: data.user.role,
        isAccountVerified: Boolean(data.user.isAccountVerified),
        isPhoneVerified: Boolean(data.user.isPhoneVerified),
        phone: data.user.phone ?? null,
      };
      
      localStorage.setItem("user", JSON.stringify(sessionUser));
      setUser(sessionUser);
      
      if (data.user.role === "ADMIN") {
        toast.success("Welcome back, Admin! 👑");
        router.push("/admin");
      } else {
        toast.success(`Welcome, ${data.user.name}! 🎉`);
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Unable to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const channelIcon =
    channel === "whatsapp" ? <MessageCircle className="w-5 h-5 text-green-500" />
    : channel === "sms"    ? <Smartphone    className="w-5 h-5 text-blue-500"  />
    : channel === "email"  ? <Mail          className="w-5 h-5 text-purple-500" />
    :                        <Info          className="w-5 h-5 text-amber-500"  />;

  const channelLabel =
    channel === "whatsapp" ? "Sent via WhatsApp"
    : channel === "sms"    ? "Sent via SMS"
    : channel === "email"  ? "Sent to Email Inbox"
    : "Dev Mode — OTP shown below";

  return (
    <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4
                     bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

      {/* Glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <section className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Card */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 backdrop-blur-xl
                        shadow-2xl shadow-black/50 p-8 sm:p-10 space-y-8">

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500
                            flex items-center justify-center shadow-xl shadow-blue-900/30 mb-2">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {step === 1 ? "Sign In" : "Enter OTP"}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              {step === 1
                ? "No password needed. We'll send a one-time code to you."
                : `OTP sent to ${method === 'phone' ? '+91 ' + identifier.replace(/\D/g, "") : identifier}`
              }
            </p>
          </div>

          {/* Tabs for toggling method (only in step 1) */}
          {step === 1 && (
            <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleSwitchMethod("email")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  method === "email" 
                    ? "bg-slate-800 text-white shadow-lg border border-slate-700" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Mail className="w-4 h-4" /> Email
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMethod("phone")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  method === "phone" 
                    ? "bg-slate-800 text-white shadow-lg border border-slate-700" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Smartphone className="w-4 h-4" /> Phone
              </button>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {[1, 2].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500
                ${s <= step ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-slate-800"}`} />
            ))}
          </div>

          {/* ── STEP 1: Details ── */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
                  Your Name <span className="normal-case font-normal text-slate-500">(optional for new users)</span>
                </label>
                <div className="flex h-13 items-center gap-3 rounded-2xl border border-slate-700/80
                                bg-slate-800/60 focus-within:border-blue-500/60
                                focus-within:bg-slate-800 px-4 py-3 transition-all">
                  <User className="h-4 w-4 text-slate-500 shrink-0" />
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="flex-1 bg-transparent text-sm font-semibold text-white
                               outline-none placeholder:text-slate-600 placeholder:font-normal"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Identifier (Email/Phone) */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
                  {method === "email" ? "Email Address *" : "Mobile Number *"}
                </label>
                <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-700/80
                                bg-slate-800/60 focus-within:border-blue-500/60
                                focus-within:bg-slate-800 px-4 transition-all">
                  {method === "phone" && (
                     <span className="text-slate-400 font-bold text-sm border-r border-slate-600 pr-3">🇮🇳 +91</span>
                  )}
                  {method === "email" && (
                    <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                  )}
                  <input
                    type={method === "email" ? "email" : "tel"} 
                    value={identifier}
                    onChange={e => setIdentifier(method === 'phone' ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value)}
                    placeholder={method === "email" ? "you@example.com" : "Enter 10-digit number"}
                    className={`flex-1 bg-transparent text-white outline-none placeholder:text-slate-600 placeholder:font-normal
                               ${method === "phone" ? "text-lg font-bold tracking-widest placeholder:tracking-normal" : "text-base font-semibold"}`}
                    required 
                    autoComplete={method === "email" ? "email" : "tel"}
                  />
                  {method === "phone" && <Phone className="h-4 w-4 text-slate-500 shrink-0" />}
                </div>
              </div>

              {error && <Error msg={error} />}

              <button
                type="submit" disabled={loading || identifier.length < 5}
                className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl
                           bg-gradient-to-r from-blue-600 to-cyan-500
                           hover:from-blue-500 hover:to-cyan-400
                           text-white font-bold text-base shadow-xl shadow-blue-900/30
                           disabled:opacity-50 transition-all active:scale-[0.98]">
                {loading
                  ? <><Spinner /> Sending OTP…</>
                  : <><MessageCircle className="w-5 h-5" /> Get OTP  <ArrowRight className="w-4 h-4" /></>
                }
              </button>

              <p className="text-center text-xs text-slate-600 leading-relaxed">
                First time? Your account is created automatically.
              </p>
            </form>
          )}

          {/* ── STEP 2: OTP Entry ── */}
          {step === 2 && (
            <form onSubmit={handleVerify} className="space-y-5">

              {/* Delivery status badge */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-700/50
                              bg-slate-800/40 px-4 py-3">
                {channelIcon}
                <div className="flex-1 flex flex-col items-start truncate overflow-hidden">
                   <span className="text-xs text-slate-400 font-medium">{channelLabel}</span>
                   <span className="text-sm text-slate-200 font-bold truncate w-full">{identifier}</span>
                </div>
                <button
                  type="button" onClick={() => { setStep(1); setOtp(""); setError(""); }}
                  className="text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors shrink-0">
                  Change
                </button>
              </div>

              {/* Dev OTP preview — only in development without real MSG91/Email config */}
              {devOtp && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-amber-400/70 font-bold mb-1">
                    🔧 Dev Mode — Your OTP
                  </p>
                  <p className="text-3xl font-black text-amber-300 tracking-[0.4em]">{devOtp}</p>
                </div>
              )}

              {/* OTP Input — 6 large digits */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
                  Enter 6-digit OTP
                </label>
                <div className="flex h-16 items-center gap-3 rounded-2xl border border-slate-700/80
                                bg-slate-800/60 focus-within:border-cyan-500/60
                                focus-within:bg-slate-800 px-5 transition-all">
                  <KeyRound className="h-5 w-5 text-slate-500 shrink-0" />
                  <input
                    ref={otpInputRef}
                    type="text" value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="• • • • • •"
                    className="flex-1 bg-transparent text-2xl font-black tracking-[0.5em]
                               text-white outline-none placeholder:text-slate-700
                               placeholder:tracking-widest placeholder:font-normal
                               placeholder:text-xl text-center"
                    required autoComplete="one-time-code" inputMode="numeric"
                  />
                </div>
              </div>

              {error && <Error msg={error} />}

              <button
                type="submit" disabled={loading || otp.length < 6}
                className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl
                           bg-gradient-to-r from-slate-100 to-white
                           hover:from-white hover:to-slate-100
                           text-slate-900 font-black text-base shadow-xl
                           disabled:opacity-50 transition-all active:scale-[0.98]">
                {loading
                  ? <><Spinner dark /> Verifying…</>
                  : <><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Verify & Sign In</>
                }
              </button>

              {/* Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-slate-500">
                    Resend OTP in <span className="text-white font-bold tabular-nums">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button" onClick={handleResend} disabled={loading}
                    className="flex items-center gap-1.5 mx-auto text-sm text-blue-400
                               hover:text-blue-300 font-bold transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-slate-600 leading-relaxed border-t border-slate-800 pt-5">
            By signing in you agree to Golden Refrigeration&apos;s{" "}
            <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</Link>.
          </p>
        </div>

        {/* Company badge below card */}
        <p className="text-center text-xs text-slate-600 mt-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
          Secured by Golden Refrigeration · OTP expires in 10 min
        </p>
      </section>
    </main>
  );
}

const Error = ({ msg }: { msg: string }) => (
  <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3
                text-sm text-red-400 font-medium text-center">
    {msg}
  </p>
);

const Spinner = ({ dark }: { dark?: boolean }) => (
  <span className={`w-4 h-4 rounded-full border-2 animate-spin shrink-0
    ${dark ? "border-slate-400 border-t-slate-900" : "border-white/30 border-t-white"}`} />
);
