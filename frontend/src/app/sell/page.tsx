"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import {
  RefreshCw, Upload, CheckCircle2, ArrowRight, Phone, Tag,
  Loader2, Star, ShieldCheck, Banknote, Clock,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

const APPLIANCE_TYPES = [
  "Refrigerator", "Air Conditioner (1 ton)", "Air Conditioner (1.5 ton)", "Air Conditioner (2 ton)",
  "Washing Machine (Top Load)", "Washing Machine (Front Load)", "Microwave Oven",
  "Water Purifier / RO", "LED TV", "Deep Freezer / Commercial Fridge", "Other"
];

const CONDITION_OPTIONS = [
  { val: "EXCELLENT",    label: "Excellent",    desc: "Works perfectly, like new",         stars: 5 },
  { val: "GOOD",         label: "Good",         desc: "Minor wear, fully functional",      stars: 4 },
  { val: "FAIR",         label: "Fair",         desc: "Works but has some issues",         stars: 3 },
  { val: "POOR",         label: "Poor",         desc: "Needs repair, still salvageable",   stars: 2 },
  { val: "NOT_WORKING",  label: "Not Working",  desc: "Does not power on / completely broken", stars: 1 },
];

type FormState = {
  applianceType: string; brandModel: string; conditionNote: string;
  expectedPrice: string; pincode: string; imageUrl: string;
};

const toDataUrl = (f: File) => new Promise<string>((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(String(r.result ?? ""));
  r.onerror = () => rej(new Error("Read error"));
  r.readAsDataURL(f);
});

export default function SellRequestPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    applianceType: "", brandModel: "", conditionNote: "", expectedPrice: "", pincode: "", imageUrl: "",
  });
  const [selectedCondition, setSelectedCondition] = useState("");
  const [uploading, setUploading]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [submittedId, setSubmittedId] = useState("");

  const set = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Please select an image file.");
    if (f.size > 10 * 1024 * 1024) return toast.error("Image too large (max 10 MB).");
    setUploading(true);
    try {
      const fileData = await toDataUrl(f);
      const res = await fetch(`${API}/admin/upload-image`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fileData, fileName: f.name }),
      });
      const p = await res.json().catch(() => ({}));
      if (!res.ok || !p?.imageUrl) throw new Error(p?.error || "Upload failed.");
      set("imageUrl", p.imageUrl as string);
      toast.success("Image uploaded!");
    } catch (e: any) { toast.error(e.message || "Upload failed."); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please log in to submit a sell request."); router.push("/login"); return; }
    if (!form.applianceType) return toast.error("Please select an appliance type.");
    if (!form.brandModel.trim()) return toast.error("Please enter the brand & model.");
    if (!selectedCondition) return toast.error("Please select the condition.");
    if (!form.pincode || form.pincode.length !== 6) return toast.error("Enter a valid 6-digit pincode.");

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/sell/request`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
          applianceType: form.applianceType,
          brandModel: form.brandModel.trim(),
          conditionNote: `${selectedCondition}: ${form.conditionNote.trim() || CONDITION_OPTIONS.find(c => c.val === selectedCondition)?.desc || selectedCondition}`,
          expectedPrice: form.expectedPrice ? Number(form.expectedPrice) : undefined,
          pincode: form.pincode,
          imageUrl: form.imageUrl || undefined,
        }),
      });
      const p = await res.json().catch(() => null);
      if (!res.ok) return toast.error(p?.error || "Failed to submit request.");
      setSubmittedId(p?.id || "");
      setSubmitted(true);
      toast.success("Sell request submitted! We'll review and make you an offer.");
    } catch { toast.error("Failed to submit. Please try again."); }
    finally { setSubmitting(false); }
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-900/30">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Request Submitted!</h1>
            <p className="text-slate-400 mt-2">We&apos;ll review your appliance and send you an offer soon.</p>
            {submittedId && <p className="text-slate-600 text-xs mt-1">Reference ID: {submittedId.slice(0,8)}…</p>}
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-left space-y-3">
            {[
              ["⏱️", "Review within 24 hours", "Our team evaluates your appliance details"],
              ["💰", "Competitive offer",       "You get a fair market-rate offer via call/message"],
              ["🚚", "Free pickup",             "We collect the appliance from your doorstep"],
            ].map(([emoji, title, desc]) => (
              <div key={title} className="flex gap-3">
                <span className="text-lg shrink-0">{emoji}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-slate-400 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/service" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm text-center transition-all">
              Book a Repair Instead
            </Link>
            <Link href="/" className="w-full py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white font-bold text-sm text-center transition-all">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Hero */}
      <section className="relative pt-24 pb-14 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0f3460_0%,_#020617_60%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-5">
            <RefreshCw className="w-3.5 h-3.5" /> Sell Your Old Appliance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Turn your old appliances<br />into <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">instant cash.</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto font-medium">
            Submit your appliance details and get a fair offer from Golden Refrigeration within 24 hours. Free pickup from your doorstep.
          </p>
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {[
              { icon: <Banknote className="w-4 h-4" />, text: "Best Price Guaranteed" },
              { icon: <Clock className="w-4 h-4" />,    text: "Offer in 24 Hours" },
              { icon: <ShieldCheck className="w-4 h-4" />, text: "Trusted Since 2008" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-4 py-1.5">
                <span className="text-cyan-400">{icon}</span>
                <span className="text-slate-300 text-xs font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-2xl mx-auto px-4">
        {/* Login prompt */}
        {!loading && !user && (
          <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-yellow-300 font-bold text-sm">Login required</p>
              <p className="text-yellow-400/70 text-xs">You need to be logged in to submit a sell request.</p>
            </div>
            <Link href="/login" className="shrink-0 flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all">
              Login <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Appliance type */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 block">Appliance Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {APPLIANCE_TYPES.map(t => (
                <button key={t} type="button"
                  onClick={() => set("applianceType", t)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-all ${form.applianceType === t ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Brand & Model */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 block">Brand & Model *</label>
            <input
              required value={form.brandModel} onChange={e => set("brandModel", e.target.value)}
              placeholder="e.g. LG 5-Star 260L Double Door, Samsung 1.5 ton Inverter AC"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>

          {/* Condition */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 block">Condition *</label>
            <div className="space-y-2">
              {CONDITION_OPTIONS.map(c => (
                <button key={c.val} type="button"
                  onClick={() => { setSelectedCondition(c.val); }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all ${selectedCondition === c.val ? "border-emerald-500/50 bg-emerald-500/10" : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"}`}>
                  <div>
                    <p className={`text-sm font-bold ${selectedCondition === c.val ? "text-emerald-300" : "text-white"}`}>{c.label}</p>
                    <p className="text-xs text-slate-400">{c.desc}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5 shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < c.stars ? "fill-yellow-400 text-yellow-400" : "text-slate-700"}`} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
            <textarea
              value={form.conditionNote} onChange={e => set("conditionNote", e.target.value)}
              placeholder="Describe any defects, repairs done, or special features (optional)"
              rows={3}
              className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none resize-none"
            />
          </div>

          {/* Price & Location */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 block">
                  <Tag className="w-3 h-3 inline mr-1" />Expected Price ₹
                </label>
                <input
                  type="number" min="0" value={form.expectedPrice} onChange={e => set("expectedPrice", e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 block">
                  <Phone className="w-3 h-3 inline mr-1" />Pincode *
                </label>
                <input
                  required type="text" maxLength={6} value={form.pincode} onChange={e => set("pincode", e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit pincode"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Image upload */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 block">
              <Upload className="w-3 h-3 inline mr-1" />Photo of Appliance (optional but recommended)
            </label>
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${form.imageUrl ? "border-emerald-500/40 bg-emerald-500/5" : "border-slate-700 hover:border-emerald-500/30 hover:bg-slate-800/30"}`}>
              {form.imageUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={form.imageUrl} alt="preview" className="w-24 h-24 rounded-xl object-cover border border-slate-700" />
                  <p className="text-emerald-400 text-xs font-semibold">✓ Image uploaded</p>
                  <p className="text-slate-500 text-xs">Click to change</p>
                </div>
              ) : uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                  <p className="text-slate-400 text-sm">Uploading…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-slate-500" />
                  <p className="text-slate-400 text-sm font-medium">Click to upload a photo</p>
                  <p className="text-slate-600 text-xs">JPG, PNG, WebP · Max 10 MB</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting || uploading || (!loading && !user)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-base shadow-xl shadow-emerald-900/30 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</>
            ) : (
              <><RefreshCw className="w-5 h-5" /> Submit Sell Request</>
            )}
          </button>
          <p className="text-center text-slate-500 text-xs">
            By submitting, you agree that our team may contact you to schedule a pickup.
          </p>
        </form>
      </section>
    </div>
  );
}
