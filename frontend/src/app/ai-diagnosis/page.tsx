"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DiagnosisSkeleton from "@/components/DiagnosisSkeleton";
import { useAuth } from "@/context/AuthContext";

type StructuredDiagnosis = {
  probableFault: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  partsList: string[];
  estimatedCostMin: number;
  estimatedCostMax: number;
  actionPlan: string;
};

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
  scheduledAt: string;
  status?: string;
};

const SERVICE_PIN_PREFIXES = ["500", "506"];

export default function AIDiagnosis() {
  const router = useRouter();
  const { user } = useAuth();
  const [appliance, setAppliance] = useState("Refrigerator");
  const [issue, setIssue] = useState("");
  const [result, setResult] = useState("");
  const [structured, setStructured] = useState<StructuredDiagnosis | null>(null);
  const [contact, setContact] = useState<ContactInfo>({
    phone: "9060877595",
    call: "tel:9060877595",
    whatsapp: "https://wa.me/919060877595",
    sms: "sms:+919060877595",
  });
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const fetchHistory = useCallback(async () => {
    const userId = user?.id;
    if (!userId) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history/${userId}`, { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (err) {
      console.error("History error", err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
    setStructured(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ appliance, issue }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.diagnosis);
        setStructured(data.structured || null);
        if (data.contact) setContact(data.contact as ContactInfo);
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
      fetchHistory();
    } catch {
      toast.error("Booking service is unavailable right now.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const urgencyStyle =
    structured?.urgency === "HIGH"
      ? "bg-red-50 border-red-200 text-red-700"
      : structured?.urgency === "MEDIUM"
        ? "bg-amber-50 border-amber-200 text-amber-700"
        : "bg-emerald-50 border-emerald-200 text-emerald-700";

  return (
    <main className="min-h-screen pt-20 md:pt-24 pb-12 flex flex-col bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid gap-6 md:gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col gap-8 md:gap-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">AI Assistant</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">Smart appliance diagnosis</h1>
          <p className="mb-8 mt-3 text-slate-600">Describe the problem and get technician-style guidance in seconds.</p>

          <form onSubmit={handleDiagnose} className="max-w-3xl mx-auto w-full flex flex-col gap-6">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Appliance type</label>
              <select
                value={appliance}
                onChange={(e) => setAppliance(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-white p-4 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Refrigerator</option>
                <option>Air Conditioner</option>
                <option>Washing Machine</option>
                <option>Microwave Oven</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Issue details</label>
              <textarea
                placeholder="Example: Cooling is inconsistent and there is noise near the compressor."
                className="min-h-[150px] w-full rounded-xl border border-slate-200 bg-white p-4 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                required
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className="min-h-[48px] rounded-lg border border-blue-200 px-3 py-2 text-xs text-blue-700 hover:bg-blue-50"
                >
                  {isListening ? "Listening..." : "Voice Input"}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="min-h-[48px] w-full rounded-xl bg-blue-600 py-4 font-semibold text-white shadow-sm transition-transform hover:bg-blue-700 active:scale-95 disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Get AI Diagnosis"}
            </button>
          </form>

          {loading ? (
            <div className="flex flex-col gap-6 md:gap-8">
              <DiagnosisSkeleton />
            </div>
          ) : result ? (
            <div className="flex flex-col gap-6 md:gap-8">
              <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white shadow-lg">
                <h3 className="mb-2 text-lg font-bold">Golden Refrigeration Technician Advice</h3>
                <p className="whitespace-pre-wrap leading-relaxed text-cyan-50">{result}</p>
              </div>

              {structured && (
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-bold text-slate-900">Structured Diagnosis</h4>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${urgencyStyle}`}>
                      Urgency: {structured.urgency}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-blue-600">Probable fault: </span>
                    {structured.probableFault}
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-blue-600">Estimated cost: </span>
                    ₹{Number(structured.estimatedCostMin || 0).toLocaleString()} - ₹
                    {Number(structured.estimatedCostMax || 0).toLocaleString()}
                  </p>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Likely parts</p>
                    <div className="flex flex-wrap gap-2">
                      {structured.partsList.map((part, idx) => (
                        <span key={`${part}-${idx}`} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900">Need On-Site Help?</h4>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                    Booking starts only after confirmation
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  Get a verified Golden Refrigeration technician at your doorstep with transparent pricing and service tracking.
                </p>
                <a
                  href={contact.call}
                  className="min-h-[48px] w-full rounded-xl border border-blue-200 bg-white px-5 py-3 text-center text-sm font-semibold text-blue-700 transition-transform active:scale-95"
                >
                  Call Technician Now
                </a>
                <button
                  type="button"
                  onClick={openBooking}
                  className="min-h-[48px] w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-transform active:scale-95"
                >
                  Need Help? Book Technician Now
                </button>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a href={contact.call} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">Call: {contact.phone}</a>
                  <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white">WhatsApp</a>
                  <a href={`${contact.sms}?body=Hello technician, I need service support.`} className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">Message</a>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col gap-6 md:gap-8">
          <h2 className="text-2xl font-black text-slate-900">Consultation history</h2>
          <p className="mb-6 mt-2 text-sm text-slate-600">Review your previous diagnosis records.</p>

          {history.length > 0 ? (
            <div className="max-h-[28rem] space-y-3 overflow-auto pr-1">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-blue-300 hover:bg-blue-50/50"
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold uppercase text-blue-600">{item.appliance}</span>
                    <span className="text-xs text-slate-500">{new Date(item.scheduledAt).toLocaleDateString()}</span>
                  </div>
                  <p className="line-clamp-2 text-sm font-medium text-slate-900">{item.issue}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">{item.status || "PENDING"}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No consultations yet. Submit your first diagnosis request.</p>
          )}
        </section>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-sm md:items-center md:p-4">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 md:rounded-2xl">
            <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-slate-300 md:hidden" />
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-5 top-5 text-2xl font-semibold text-slate-400 hover:text-slate-900"
            >
              ×
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">{selectedItem.appliance}</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">Diagnosis details</h3>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Issue</p>
              <p className="text-slate-900">{selectedItem.issue}</p>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">Recommendation</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{selectedItem.aiDiagnosis}</p>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="mt-7 min-h-[48px] w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-transform hover:bg-blue-700 active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {bookingOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-sm md:items-center md:p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl md:rounded-2xl">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-300 md:hidden" />
            <button
              onClick={() => setBookingOpen(false)}
              className="absolute right-5 top-5 text-2xl font-semibold text-slate-400 hover:text-slate-900"
            >
              ×
            </button>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Service Booking</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">Book Technician</h3>
            <p className="mt-1 text-sm text-slate-600">Provide your details so we can assign the nearest technician.</p>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Full Name
                  <input
                    value={bookingFullName}
                    onChange={(e) => setBookingFullName(e.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your full name"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Phone Number
                  <input
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-slate-700">
                PIN Code
                <input
                  value={bookingPincode}
                  onChange={(e) => setBookingPincode(e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Example: 500001"
                  inputMode="numeric"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Full Address
                <textarea
                  value={bookingAddress}
                  onChange={(e) => setBookingAddress(e.target.value)}
                  className="mt-2 min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="House no, street, locality, city"
                />
              </label>

              <button
                type="button"
                onClick={handleBookTechnician}
                disabled={bookingSubmitting}
                className="min-h-[48px] w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
              >
                {bookingSubmitting ? "Booking..." : "Confirm & Book Technician"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
