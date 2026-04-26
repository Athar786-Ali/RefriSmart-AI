"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import { getApiBase } from "@/lib/api";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  Loader2,
  Phone,
  RefreshCw,
  ShieldCheck,
  Star,
  Tag,
  Upload,
} from "lucide-react";

const APPLIANCE_TYPES = [
  "Refrigerator",
  "Air Conditioner (1 ton)",
  "Air Conditioner (1.5 ton)",
  "Air Conditioner (2 ton)",
  "Washing Machine (Top Load)",
  "Washing Machine (Front Load)",
  "Microwave Oven",
  "Water Purifier / RO",
  "LED TV",
  "Deep Freezer / Commercial Fridge",
  "Other",
];

const CONDITION_OPTIONS = [
  { val: "EXCELLENT", label: "Excellent", desc: "Works perfectly, like new", stars: 5 },
  { val: "GOOD", label: "Good", desc: "Minor wear, fully functional", stars: 4 },
  { val: "FAIR", label: "Fair", desc: "Works but has some issues", stars: 3 },
  { val: "POOR", label: "Poor", desc: "Needs repair, still salvageable", stars: 2 },
  { val: "NOT_WORKING", label: "Not Working", desc: "Does not power on / completely broken", stars: 1 },
];

const REQUEST_STATUS_META: Record<string, { label: string; tone: string; help: string }> = {
  REQUESTED: {
    label: "Awaiting Review",
    tone: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    help: "Your appliance details are with the admin team. An offer will appear here once reviewed.",
  },
  OFFER_SENT: {
    label: "Offer Ready",
    tone: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    help: "A new offer is available below. Accept or reject it directly from this page.",
  },
  ACCEPTED: {
    label: "Offer Accepted",
    tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    help: "You accepted the admin offer. Pickup or next steps can now be coordinated.",
  },
  REJECTED: {
    label: "Offer Rejected",
    tone: "border-red-500/30 bg-red-500/10 text-red-300",
    help: "You rejected the last offer. The admin can still send you an updated one.",
  },
  REFURBISHED_LISTED: {
    label: "Moved to Inventory",
    tone: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    help: "This appliance has already been moved into the refurbished inventory workflow.",
  },
};

type FormState = {
  contactName: string;
  address: string;
  applianceType: string;
  brandModel: string;
  conditionNote: string;
  expectedPrice: string;
  pincode: string;
  imageUrl: string;
};

type SellOfferView = {
  id: string;
  offerPrice: number;
  pickupSlot?: string | null;
  status: string;
  createdAt: string;
};

type SellRequestView = {
  id: string;
  userId: string;
  applianceType: string;
  brandModel: string;
  contactName?: string | null;
  address?: string | null;
  conditionNote: string;
  expectedPrice?: number | null;
  pincode?: string | null;
  imageUrl?: string | null;
  status: string;
  createdAt: string;
  offers?: SellOfferView[];
  latestOffer?: SellOfferView | null;
  pendingOffer?: SellOfferView | null;
};

const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Read error"));
    reader.readAsDataURL(file);
  });

const formatDate = (value?: string | null) => {
  if (!value) return "Not scheduled";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "Not scheduled" : parsed.toLocaleString();
};

const getLatestOffer = (request: SellRequestView) => request.latestOffer || request.offers?.[0] || null;
const getPendingOffer = (request: SellRequestView) =>
  request.pendingOffer || request.offers?.find((offer) => offer.status === "PENDING") || null;
const parsePayload = async (response: Response) => response.json().catch(() => null);
const isInlineImage = (value?: string | null) => typeof value === "string" && value.startsWith("data:image/");
const normalizeSellRequests = (payload: unknown) =>
  Array.isArray(payload)
    ? (payload as SellRequestView[])
    : Array.isArray((payload as { requests?: unknown[] } | null)?.requests)
      ? (((payload as { requests?: unknown[] }).requests || []) as SellRequestView[])
      : [];
const filterSellRequestsForUser = (requests: SellRequestView[], userId?: string) =>
  userId ? requests.filter((request) => !request.userId || request.userId === userId) : requests;
const isAuthFailure = (status: number, payload: unknown) => {
  if (status === 401) return true;
  if (status !== 403) return false;
  const text = String(
    (payload as { error?: string; message?: string } | null)?.error ||
      (payload as { error?: string; message?: string } | null)?.message ||
      "",
  ).toLowerCase();
  return text.includes("unauthorized") || text.includes("login") || text.includes("expired token") || text.includes("invalid token");
};

export default function SellRequestPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const API = getApiBase();
  const authRedirectHandledRef = useRef(false);

  const [form, setForm] = useState<FormState>({
    contactName: "",
    address: "",
    applianceType: "",
    brandModel: "",
    conditionNote: "",
    expectedPrice: "",
    pincode: "",
    imageUrl: "",
  });
  const [selectedCondition, setSelectedCondition] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [requests, setRequests] = useState<SellRequestView[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [respondingOfferId, setRespondingOfferId] = useState<string | null>(null);
  const [requestsAuthBlocked, setRequestsAuthBlocked] = useState(false);

  const setField = (key: keyof FormState, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const handleAuthFailure = useCallback(
    async (response: Response, payload: unknown, message = "Your session expired. Please sign in again.") => {
      if (!isAuthFailure(response.status, payload)) return false;
      if (!authRedirectHandledRef.current) {
        authRedirectHandledRef.current = true;
        toast.error(message);
        router.replace("/login");
      }
      return true;
    },
    [router],
  );

  const refreshRequests = useCallback(
    async (showSpinner = false) => {
      if (!API || loading || !user?.id || requestsAuthBlocked) {
        if (showSpinner) setLoadingRequests(false);
        return;
      }

      if (showSpinner) setLoadingRequests(true);
      try {
        const response = await fetch(`${API}/sell/requests?scope=mine`, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await parsePayload(response);

        if (response.ok) {
          setRequestsAuthBlocked(false);
          setRequests(normalizeSellRequests(payload));
          return;
        }

        if (response.status === 401 || response.status === 403) {
          setRequestsAuthBlocked(true);
          await handleAuthFailure(response, payload, "Please sign in again to view your sell requests.");
        }
        setRequests([]);
      } catch {
        setRequests([]);
      } finally {
        if (showSpinner) setLoadingRequests(false);
      }
    },
    [API, handleAuthFailure, loading, requestsAuthBlocked, user?.id],
  );

  useEffect(() => {
    authRedirectHandledRef.current = false;
    setRequestsAuthBlocked(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.name) return;
    setForm((current) =>
      current.contactName.trim()
        ? current
        : {
            ...current,
            contactName: user.name || "",
          },
    );
  }, [user?.name]);

  useEffect(() => {
    if (loading) return;
    if (!user?.id) {
      setRequests([]);
      return;
    }
    void refreshRequests(true);
  }, [loading, refreshRequests, user?.id]);

  useEffect(() => {
    if (loading || !user?.id || !API || requestsAuthBlocked) return;
    const interval = window.setInterval(() => {
      void refreshRequests(false);
    }, 10000);
    return () => window.clearInterval(interval);
  }, [API, loading, refreshRequests, requestsAuthBlocked, user?.id]);

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Max 10 MB.");
      return;
    }
    if (!user?.id) {
      toast.error("Please log in first.");
      router.push("/login");
      return;
    }

    setUploading(true);
    let fileData = "";
    try {
      fileData = await toDataUrl(file);
      const response = await fetch(`${API}/sell/upload-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fileData, fileName: file.name }),
      });
      const payload = await parsePayload(response);
      if (response.ok && payload?.imageUrl) {
        setField("imageUrl", String(payload.imageUrl));
        toast.success("Photo uploaded successfully.");
        return;
      }
      if (await handleAuthFailure(response, payload, "Please sign in again to upload a photo.")) {
        return;
      }
      if (response.status !== 413 && fileData) {
        setField("imageUrl", fileData);
        toast.success(
          response.status === 404 || response.status === 405
            ? "Photo attached. It will be sent with your request."
            : "Photo attached. Direct upload is unavailable, so it will be sent with your request.",
        );
        return;
      }
      throw new Error(payload?.error || "Upload failed.");
    } catch (error: any) {
      toast.error(error?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) {
      toast.error("Checking your login session. Please try again in a moment.");
      return;
    }
    if (!user?.id) {
      toast.error("Please log in to submit a sell request.");
      router.push("/login");
      return;
    }
    if (!form.contactName.trim()) return toast.error("Please enter your name.");
    if (!form.address.trim()) return toast.error("Please enter your pickup address.");
    if (!form.applianceType) return toast.error("Please select an appliance type.");
    if (!form.brandModel.trim()) return toast.error("Please enter the brand and model.");
    if (!selectedCondition) return toast.error("Please select the appliance condition.");
    if (!form.pincode || form.pincode.length !== 6) return toast.error("Enter a valid 6-digit pincode.");

    setSubmitting(true);
    try {
      const response = await fetch(`${API}/sell/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
          contactName: form.contactName.trim(),
          address: form.address.trim(),
          applianceType: form.applianceType,
          brandModel: form.brandModel.trim(),
          condition: selectedCondition,
          conditionNote: `${selectedCondition}: ${
            form.conditionNote.trim() ||
            CONDITION_OPTIONS.find((condition) => condition.val === selectedCondition)?.desc ||
            selectedCondition
          }`,
          expectedPrice: form.expectedPrice ? Number(form.expectedPrice) : undefined,
          pincode: form.pincode,
          imageUrl: form.imageUrl || undefined,
          imageData: isInlineImage(form.imageUrl) ? form.imageUrl : undefined,
        }),
      });
      const payload = await parsePayload(response);
      if (!response.ok) {
        if (await handleAuthFailure(response, payload, "Please sign in again to submit a sell request.")) {
          return;
        }
        toast.error(payload?.error || "Failed to submit request.");
        return;
      }

      setSubmittedId(String(payload?.id || payload?.request?.id || ""));
      if (payload?.request) {
        setRequests((current) => [payload.request as SellRequestView, ...current.filter((item) => item.id !== payload.request.id)]);
      } else {
        void refreshRequests(false);
      }

      setForm({
        contactName: user?.name || "",
        address: "",
        applianceType: "",
        brandModel: "",
        conditionNote: "",
        expectedPrice: "",
        pincode: "",
        imageUrl: "",
      });
      setSelectedCondition("");
      toast.success("Sell request submitted. You can track the offer below.");
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOfferAction = async (offerId: string, action: "ACCEPT" | "REJECT") => {
    setRespondingOfferId(offerId);
    try {
      const response = await fetch(`${API}/sell/offers/${offerId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.error || "Failed to respond to offer.");
        return;
      }

      if (payload?.request) {
        const next = payload.request as SellRequestView;
        setRequests((current) => current.map((item) => (item.id === next.id ? next : item)));
      } else {
        void refreshRequests(false);
      }
      toast.success(action === "ACCEPT" ? "Offer accepted." : "Offer rejected.");
    } catch {
      toast.error("Failed to respond to offer.");
    } finally {
      setRespondingOfferId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <section className="relative pt-24 pb-14 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0f3460_0%,_#020617_60%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-5">
            <RefreshCw className="w-3.5 h-3.5" /> Sell Your Old Appliance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Turn your old appliances
            <br />
            into <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">clear offers and instant cash.</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Upload a photo, send your appliance details, and track every admin offer directly on this page. No more guessing whether the admin received your request.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {[
              { icon: <Banknote className="w-4 h-4" />, text: "Competitive Offers" },
              { icon: <Clock className="w-4 h-4" />, text: "Track Offer Status" },
              { icon: <ShieldCheck className="w-4 h-4" />, text: "Photo + Offer History" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-4 py-1.5">
                <span className="text-cyan-400">{icon}</span>
                <span className="text-slate-300 text-xs font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          {!loading && !user && (
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-yellow-300 font-bold text-sm">Login required</p>
                <p className="text-yellow-400/70 text-xs">Sign in first so your requests and offers stay linked to your account.</p>
              </div>
              <Link
                href="/login"
                className="shrink-0 flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all"
              >
                Login <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {submittedId && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-300 font-bold text-sm">Sell request submitted successfully</p>
                  <p className="text-emerald-400/80 text-xs mt-1">
                    Reference ID: {submittedId.slice(0, 8)}... You can now track offers in the request list below.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 block">Your Name *</label>
                  <input
                    required
                    value={form.contactName}
                    onChange={(event) => setField("contactName", event.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 block">Pickup Address *</label>
                  <textarea
                    required
                    value={form.address}
                    onChange={(event) => setField("address", event.target.value)}
                    placeholder="House number, area, landmark"
                    rows={3}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 block">Appliance Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {APPLIANCE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setField("applianceType", type)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-all ${
                      form.applianceType === type
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                        : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 block">Brand & Model *</label>
              <input
                required
                value={form.brandModel}
                onChange={(event) => setField("brandModel", event.target.value)}
                placeholder="e.g. LG 260L Double Door, Samsung 1.5 ton Inverter AC"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 block">Condition *</label>
              <div className="space-y-2">
                {CONDITION_OPTIONS.map((condition) => (
                  <button
                    key={condition.val}
                    type="button"
                    onClick={() => setSelectedCondition(condition.val)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all ${
                      selectedCondition === condition.val
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-bold ${selectedCondition === condition.val ? "text-emerald-300" : "text-white"}`}>
                        {condition.label}
                      </p>
                      <p className="text-xs text-slate-400">{condition.desc}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5 shrink-0">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`w-3.5 h-3.5 ${index < condition.stars ? "fill-yellow-400 text-yellow-400" : "text-slate-700"}`}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <textarea
                value={form.conditionNote}
                onChange={(event) => setField("conditionNote", event.target.value)}
                placeholder="Describe dents, cooling issues, repairs done, or special features"
                rows={3}
                className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none resize-none"
              />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 block">
                    <Tag className="w-3 h-3 inline mr-1" />Expected Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.expectedPrice}
                    onChange={(event) => setField("expectedPrice", event.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 block">
                    <Phone className="w-3 h-3 inline mr-1" />Pincode *
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(event) => setField("pincode", event.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit pincode"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 block">
                <Upload className="w-3 h-3 inline mr-1" />Photo of Appliance
              </label>
              <label
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
                  form.imageUrl
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-slate-700 hover:border-emerald-500/30 hover:bg-slate-800/30"
                }`}
              >
                {form.imageUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={form.imageUrl} alt="preview" className="w-24 h-24 rounded-xl object-cover border border-slate-700" />
                    <p className="text-emerald-400 text-xs font-semibold">Photo attached</p>
                    <p className="text-slate-500 text-xs">Click to change</p>
                  </div>
                ) : uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                    <p className="text-slate-400 text-sm">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-slate-500" />
                    <p className="text-slate-400 text-sm font-medium">Upload appliance photo</p>
                    <p className="text-slate-600 text-xs">JPG, PNG, WebP · Max 10 MB</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || uploading || loading || !user}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-base shadow-xl shadow-emerald-900/30 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" /> Submit Sell Request
                </>
              )}
            </button>
            <p className="text-center text-slate-500 text-xs">
              Once submitted, your request and future admin offers will stay visible under My Sell Requests.
            </p>
          </form>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">My Sell Requests</p>
                <h2 className="text-xl font-black text-white mt-1">Track offers live</h2>
              </div>
              {loadingRequests && <Loader2 className="w-5 h-5 animate-spin text-slate-500" />}
            </div>

            <div className="mt-4 space-y-4 max-h-[70vh] overflow-auto pr-1">
              {!loading && !user && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-500">
                  Log in to see your submitted appliances and admin offers here.
                </div>
              )}

              {!loading && user && !requests.length && !loadingRequests && (
                <div className="rounded-xl border border-dashed border-slate-800 p-5 text-sm text-slate-500">
                  No sell requests yet. Submit your appliance details from the form and your request will appear here instantly.
                </div>
              )}

              {requests.map((request) => {
                const statusMeta = REQUEST_STATUS_META[request.status] ?? {
                  label: request.status,
                  tone: "border-slate-700 bg-slate-800/70 text-slate-300",
                  help: "Status updated.",
                };
                const latestOffer = getLatestOffer(request);
                const pendingOffer = getPendingOffer(request);
                const hasActionableOffer = !!pendingOffer && request.status === "OFFER_SENT";

                return (
                  <article key={request.id} className={`rounded-2xl border bg-slate-950/60 p-4 space-y-4 transition-all ${hasActionableOffer ? "border-blue-500/40 shadow-lg shadow-blue-900/20" : "border-slate-800"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-white font-bold">{request.applianceType}</h3>
                        <p className="text-sm text-slate-400">{request.brandModel}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(request.createdAt).toLocaleString()}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${statusMeta.tone}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    {request.imageUrl && (
                      <img
                        src={request.imageUrl!}
                        alt={request.applianceType}
                        className="w-full h-40 object-cover rounded-xl border border-slate-800"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm space-y-1.5">
                      <p className="text-slate-300">{statusMeta.help}</p>
                      {request.contactName ? <p className="text-slate-500 text-xs">Name: {request.contactName}</p> : null}
                      {request.address ? <p className="text-slate-500 text-xs whitespace-pre-line">Address: {request.address}</p> : null}
                      <p className="text-slate-500 text-xs">Condition: {request.conditionNote}</p>
                      {request.expectedPrice ? (
                        <p className="text-slate-500 text-xs">Your expected price: ₹{Number(request.expectedPrice).toLocaleString("en-IN")}</p>
                      ) : null}
                      {request.pincode ? <p className="text-slate-500 text-xs">Pincode: {request.pincode}</p> : null}
                    </div>

                    {/* ── Offer block ── */}
                    {latestOffer ? (
                      <div className={`rounded-xl border p-4 space-y-3 ${hasActionableOffer ? "border-blue-500/40 bg-blue-500/8 animate-pulse-once" : "border-slate-700/50 bg-slate-900/50"}`}>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-blue-300">
                            {hasActionableOffer ? "🎉 New Offer from Admin" : "Admin Offer"}
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            latestOffer.status === "ACCEPTED"
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                              : latestOffer.status === "REJECTED"
                              ? "border-red-500/30 text-red-400 bg-red-500/10"
                              : "border-blue-500/30 text-blue-400 bg-blue-500/10"
                          }`}>
                            {latestOffer.status}
                          </span>
                        </div>
                        <p className="text-3xl font-black text-white">₹{Number(latestOffer.offerPrice || 0).toLocaleString("en-IN")}</p>
                        <p className="text-sm text-slate-300">Pickup Slot: {formatDate(latestOffer.pickupSlot)}</p>
                        <p className="text-xs text-slate-500">Sent on {new Date(latestOffer.createdAt).toLocaleString()}</p>

                        {/* Accept / Reject buttons — shown only when offer is pending */}
                        {hasActionableOffer && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleOfferAction(latestOffer.id, "ACCEPT")}
                              disabled={respondingOfferId === latestOffer.id}
                              className="flex-1 min-w-[120px] rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-emerald-900/30"
                            >
                              {respondingOfferId === latestOffer.id ? "Saving..." : "✅ Accept Offer"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOfferAction(latestOffer.id, "REJECT")}
                              disabled={respondingOfferId === latestOffer.id}
                              className="flex-1 min-w-[120px] rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 active:scale-95 disabled:opacity-50 py-3 text-sm font-bold text-red-300 transition-all"
                            >
                              {respondingOfferId === latestOffer.id ? "Saving..." : "✗ Decline"}
                            </button>
                          </div>
                        )}

                        {/* After customer accepts */}
                        {request.status === "ACCEPTED" && (
                          <div className="flex items-center gap-2 text-emerald-300 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            You accepted this offer. The admin will now confirm pickup and coordinate with you.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-800 p-4 text-sm text-slate-500 text-center">
                        No offer yet — admin will send one after reviewing your appliance.
                      </div>
                    )}

                    {/* Offer history (past offers) */}
                    {request.offers && request.offers.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Offer History</p>
                        {request.offers.slice(1).map((offer) => (
                          <div key={offer.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs">
                            <div>
                              <p className="text-slate-300 font-semibold">₹{Number(offer.offerPrice || 0).toLocaleString("en-IN")}</p>
                              <p className="text-slate-500">{formatDate(offer.pickupSlot)}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${offer.status === "ACCEPTED" ? "text-emerald-400" : offer.status === "REJECTED" ? "text-red-400" : "text-slate-400"}`}>
                                {offer.status}
                              </p>
                              <p className="text-slate-600">{new Date(offer.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
