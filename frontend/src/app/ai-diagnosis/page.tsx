"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import DiagnosisSkeleton from "@/components/DiagnosisSkeleton";
import EstimateCard from "@/components/EstimateCard";
import { useAuth } from "@/context/AuthContext";

type ContactInfo = {
  phone: string;
  call: string;
  whatsapp: string;
  sms: string;
};

type SpeechRecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((event: { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type HistoryItem = {
  id: string;
  appliance: string;
  issue: string;
  aiDiagnosis: string;
  estimatedCostRange?: string;
  createdAt: string;
};

const SERVICE_PIN_PREFIXES = ["813210"];
const HISTORY_KEY = "gr_ai_diagnosis_history";

export default function AIDiagnosis() {
  const { user } = useAuth();
  const [appliance, setAppliance] = useState("Refrigerator");
  const [issue, setIssue] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [estimatedCostRange, setEstimatedCostRange] = useState("");
  const [contact, setContact] = useState<ContactInfo>({
    phone: "9060877595",
    call: "tel:9060877595",
    whatsapp: "https://wa.me/919060877595",
    sms: "sms:+919060877595",
  });
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatLocked, setChatLocked] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingFullName, setBookingFullName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");
  const [bookingPincode, setBookingPincode] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setBookingFullName((prev) => prev || user.name || "");
    }
  }, [user?.name]);

  const persistHistory = useCallback((items: HistoryItem[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch (err) {
      console.error("History load error", err);
    }
  }, []);

  const startVoiceInput = () => {
    const speechWindow = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    recognition.start();
    recognition.onresult = (event: { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      if (transcript) {
        setIssue((prev) => (prev ? `${prev}. ${transcript}` : transcript));
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    setEstimatedCostRange("");
    setChatLocked(true);

    try {
      const formData = new FormData();
      formData.append("applianceType", appliance);
      formData.append("issueDetails", issue);
      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/diagnose`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        const diagnosisText = String(data?.diagnosis || "").trim();
        const costRange = String(data?.estimatedCostRange || "").trim();
        setResult(diagnosisText);
        setEstimatedCostRange(costRange);
        if (data.contact) setContact(data.contact as ContactInfo);
        if (diagnosisText) {
          const newItem: HistoryItem = {
            id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`,
            appliance,
            issue,
            aiDiagnosis: diagnosisText,
            estimatedCostRange: costRange,
            createdAt: new Date().toISOString(),
          };
          setHistory((prev) => {
            const next = [newItem, ...prev].slice(0, 25);
            persistHistory(next);
            return next;
          });
        }
        toast.success("Diagnosis completed.");
      } else {
        setResult(data?.error || data?.details || "AI service is currently unavailable. Please try again.");
        toast.error(data?.error || "Diagnosis failed.");
      }
    } catch {
      setResult("Connection error. Please check the backend service.");
      toast.error("Connection error. Please check backend service.");
    } finally {
      setLoading(false);
    }
  };

  // GPS removed by request; keep state for backward compatibility if needed.

  const isServiceablePincode = (value: string) => {
    const cleaned = value.trim();
    return /^\d{6}$/.test(cleaned) && SERVICE_PIN_PREFIXES.some((prefix) => cleaned.startsWith(prefix));
  };

  const openBooking = () => {
    setBookingOpen(true);
  };

  const handleBookTechnician = async () => {
    if (!issue.trim()) {
      toast.error("Please describe the issue first.");
      return;
    }
    if (!bookingFullName.trim() || !bookingPhone.trim() || !bookingAddress.trim() || !bookingPincode.trim()) {
      toast.error("Please fill all required booking details.");
      return;
    }
    if (!/^[0-9]{10}$/.test(bookingPhone.replace(/\D/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!/^\d{6}$/.test(bookingPincode.trim())) {
      toast.error("PIN code must be a 6-digit number.");
      return;
    }
    if (!isServiceablePincode(bookingPincode)) {
      toast.error("Sorry, we currently do not serve this area.");
      return;
    }

    setBookingSubmitting(true);
    try {
      const diagnosisSummary = result
        ? `${result}${estimatedCostRange ? `\nEstimated cost range: ${estimatedCostRange}` : ""}`
        : "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user?.id,
          guestName: user?.id ? undefined : bookingFullName.trim(),
          guestPhone: user?.id ? undefined : bookingPhone.replace(/\D/g, ""),
          appliance,
          issue,
          aiDiagnosis: diagnosisSummary || undefined,
          fullName: bookingFullName.trim(),
          phoneNumber: bookingPhone.replace(/\D/g, ""),
          address: bookingAddress.trim(),
          lat: undefined,
          lng: undefined,
          pincode: bookingPincode.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Booking failed.");
        return;
      }
      toast.success("Technician booked successfully. Admin has been notified.");
      setBookingOpen(false);
    } catch {
      toast.error("Booking service is unavailable right now.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleClearChat = () => {
    setIssue("");
    setMediaFile(null);
    setResult("");
    setEstimatedCostRange("");
    setChatLocked(false);
  };

  return (
    <main className="min-h-screen pt-20 md:pt-24 pb-16 flex flex-col font-sans bg-slate-50">
      
      {/* PREMIUM HEADER */}
      <section className="bg-slate-900 border-b-4 border-blue-600 relative overflow-hidden py-12 md:py-20 mb-10">
        <div className="absolute inset-0 bg-blue-900/10 mix-blend-color-dodge"></div>
        <div className="absolute top-0 left-0 p-10 opacity-[0.03] pointer-events-none transform -rotate-12">
          {/* Subtle tech pattern */}
          <div className="grid grid-cols-4 gap-4">
            {[...Array(16)].map((_, i) => <div key={i} className="w-16 h-16 rounded-full bg-blue-500"></div>)}
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-center flex flex-col items-center gap-4">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400 mb-2 border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 rounded-full">Intelligent Assistant</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Diagnosis Tool</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl mt-4">
            Describe the problem and get expert-level troubleshooting advice in seconds, powered by Golden Refrigeration AI.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid gap-8 lg:gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        
        {/* INTERACTIVE AI CARD */}
        <section className="rounded-[2.5rem] border border-slate-100 bg-white p-8 md:p-12 shadow-2xl shadow-blue-900/5 flex flex-col gap-10">
          <div className="border-b border-slate-100 pb-6">
            <h2 className="text-3xl font-black text-slate-900">Start Diagnosis</h2>
          </div>

          <form onSubmit={handleDiagnose} className="w-full flex flex-col gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Appliance Type</label>
              <select
                value={appliance}
                onChange={(e) => setAppliance(e.target.value)}
                disabled={chatLocked || loading}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231E293B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option>Refrigerator</option>
                <option>Air Conditioner</option>
                <option>Washing Machine</option>
                <option>Microwave Oven</option>
              </select>
            </div>

            <div className="space-y-3 relative">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Describe The Issue</label>
              <textarea
                placeholder="Example: The AC is blowing warm air and making a rattling noise..."
                className="w-full min-h-[160px] pb-16 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 resize-y"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
              />
              <div className="absolute left-3 bottom-3 flex items-center gap-2">
                <label className="relative flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 px-3 py-2 text-xs font-bold transition shadow-sm overflow-hidden">
                  <input 
                    type="file" 
                    accept="image/*,video/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                  />
                  <Camera className="w-4 h-4" />
                  {mediaFile ? <span className="truncate max-w-[100px] text-blue-600">{mediaFile.name}</span> : <span>Add Media</span>}
                </label>
              </div>
              <button
                type="button"
                onClick={startVoiceInput}
                className="absolute right-3 bottom-3 flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 hover:shadow-md"
              >
                <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></span>
                {isListening ? "Listening..." : "Dictate"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <button
                disabled={loading}
                className="md:col-span-2 rounded-2xl bg-slate-900 py-5 text-lg font-black tracking-wide text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-60"
              >
                {loading ? "Analyzing..." : "Diagnose Now"}
              </button>
              <button
                type="button"
                onClick={handleClearChat}
                className="rounded-2xl border-2 border-slate-200 bg-white py-5 text-lg font-bold text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
              >
                Reset
              </button>
            </div>
          </form>

          {loading ? (
            <div className="pt-8 border-t border-slate-100 flex flex-col gap-6">
              <DiagnosisSkeleton />
            </div>
          ) : result ? (
            <div className="pt-8 border-t border-slate-100 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              
              <div className="relative rounded-[2rem] bg-gradient-to-br from-slate-900 to-blue-950 p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-bl-[100px] pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full border border-blue-400 border-dashed animate-[spin_10s_linear_infinite] flex items-center justify-center p-1">
                    <div className="w-full h-full bg-blue-500 rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-black tracking-wide text-cyan-300 uppercase">Analysis Results</h3>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-200 text-lg font-medium">{result}</p>
              </div>

              <EstimateCard estimatedCostRange={estimatedCostRange} onBook={openBooking} />

              <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50/70 p-8 flex flex-col gap-5">
                <div>
                  <h4 className="text-xl font-black text-emerald-950">Immediate Help Required?</h4>
                  <p className="mt-2 text-sm font-medium text-emerald-700">Service is guaranteed with full transparency. No hidden charges.</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <a href={contact.call} className="sm:col-span-2 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white shadow-md hover:bg-slate-800 transition">
                    📞 Call Technician
                  </a>
                  <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-xl bg-[#25D366] py-4 font-bold text-white shadow-md hover:opacity-90 transition">
                    WhatsApp
                  </a>
                </div>
              </div>

            </div>
          ) : null}
        </section>

        {/* HISTORY SIDEBAR */}
        <section className="h-fit rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40 flex flex-col gap-8">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-black text-slate-900">Diagnosis <br/><span className="text-blue-600">History</span></h2>
            <p className="mt-2 text-sm font-medium text-slate-500">Saved locally to this device.</p>
          </div>

          {history.length > 0 ? (
            <div className="max-h-[36rem] overflow-auto pr-2 space-y-4">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="w-full text-left bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-600">{item.appliance}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-1 rounded-md">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-slate-900 leading-relaxed">{item.issue}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl opacity-50">🤖</span>
              </div>
              <p className="text-sm font-medium text-slate-500 w-2/3">Your future diagnoses will be saved here automatically.</p>
            </div>
          )}
        </section>
      </div>

      {/* MODALS */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-[2.5rem] border border-slate-200 bg-white p-8 md:p-10 shadow-2xl">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-8 top-8 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition"
            >
              ×
            </button>

            <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-800 mb-6">{selectedItem.appliance}</span>
            <h3 className="text-3xl font-black text-slate-900 mb-8">Diagnosis Details</h3>

            <div className="space-y-6">
              <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Reported Issue</p>
                <p className="text-slate-900 font-medium leading-relaxed">{selectedItem.issue}</p>
              </div>

              <div className="rounded-2xl border-l-4 border-blue-500 bg-blue-50 p-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">AI Recommendation</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 font-medium">{selectedItem.aiDiagnosis}</p>
              </div>
              
              {selectedItem.estimatedCostRange && (
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-100 p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Estimated Repair Cost</p>
                  <p className="text-xl font-black text-emerald-600">{selectedItem.estimatedCostRange}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {bookingOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-slate-950/60 p-0 md:p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] border border-slate-200 bg-white p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="mx-auto mb-6 h-1.5 w-16 rounded-full bg-slate-200 md:hidden" />
            <button
              onClick={() => setBookingOpen(false)}
              className="absolute right-8 top-8 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition"
            >
              ×
            </button>
            <div className="border-b border-slate-100 pb-6 mb-8 text-center md:text-left pr-10">
              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-800 mb-4">Urgent Dispatch</span>
              <h3 className="text-3xl font-black text-slate-900">Book Technician</h3>
            </div>

            {user?.id ? (
              <div className="grid gap-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                    <input
                      value={bookingFullName}
                      onChange={(e) => setBookingFullName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Phone Number</label>
                    <input
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">PIN Code</label>
                  <input
                    value={bookingPincode}
                    onChange={(e) => setBookingPincode(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    inputMode="numeric"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Complete Address</label>
                  <textarea
                    value={bookingAddress}
                    onChange={(e) => setBookingAddress(e.target.value)}
                    className="w-full min-h-[100px] rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleBookTechnician}
                  disabled={bookingSubmitting}
                  className="mt-4 w-full rounded-2xl bg-slate-900 py-5 text-lg font-black tracking-wide text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-60"
                >
                  {bookingSubmitting ? "Processing Request..." : "Confirm Doorstep Visit"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <h4 className="text-2xl font-black text-slate-900 mb-3">Authentication Required</h4>
                <p className="text-slate-600 mb-6 max-w-sm text-sm font-medium leading-relaxed">
                  To assign a technician based on your AI diagnosis, please securely log in via OTP.
                </p>
                <Link href="/login" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/20 active:scale-95">
                  Securely Login to Book
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
