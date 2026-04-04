"use client";

import { CalendarClock, Loader2, Star } from "lucide-react";

export type BookingStatus =
  | "PENDING"
  | "ASSIGNED"
  | "ESTIMATE_APPROVED"
  | "OUT_FOR_REPAIR"
  | "REPAIRING"
  | "PAYMENT_PENDING"
  | "FIXED"
  | "COMPLETED"
  | "CANCELLED";

export type ServiceBooking = {
  id: string;
  appliance: string;
  issue: string;
  status: BookingStatus;
  scheduledAt: string;
  address?: string | null;
  finalCost?: number | null;
  invoiceUrl?: string | null;
  rating?: number | null;
  technician?: { name: string; phone: string } | null;
};

type ServiceActiveTrackerCardProps = {
  loading: boolean;
  hasActiveBooking: boolean | null;
  activeBooking: ServiceBooking | null;
  ratingValue: number;
  setRatingValue: (next: number) => void;
  ratingLoading: boolean;
  onSubmitRating: () => void;
  onDownloadInvoice: (booking: ServiceBooking) => void;
  onPayWithRazorpay: () => void;
  paying: boolean;
  canPay: boolean;
};

// Issue #23 Fix: Removed ESTIMATE_APPROVED — this status does not exist in the backend enum.
// It was a permanently dead step that was never highlighted, only causing customer confusion.
const STATUS_STEPS: Array<{ key: BookingStatus; label: string }> = [
  { key: "PENDING", label: "Pending" },
  { key: "ASSIGNED", label: "Assigned" },
  { key: "OUT_FOR_REPAIR", label: "On Way" },
  { key: "REPAIRING", label: "Repairing" },
  { key: "PAYMENT_PENDING", label: "Payment Pending" },
];

const getStepIndex = (status: BookingStatus) => {
  const idx = STATUS_STEPS.findIndex((step) => step.key === status);
  if (idx >= 0) return idx;
  if (status === "FIXED") return STATUS_STEPS.findIndex((step) => step.key === "PAYMENT_PENDING");
  if (status === "COMPLETED") return STATUS_STEPS.length - 1;
  // Issue #24 Fix: CANCELLED must NOT map to the last step — it should not appear
  // as a completed flow. Return -1 so all steps render as unfilled (grey).
  if (status === "CANCELLED") return -1;
  return 0;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ServiceActiveTrackerCard({
  loading,
  hasActiveBooking,
  activeBooking,
  ratingValue,
  setRatingValue,
  ratingLoading,
  onSubmitRating,
  onDownloadInvoice,
  onPayWithRazorpay,
  paying,
  canPay,
}: ServiceActiveTrackerCardProps) {
  const isPaymentStage = Boolean(activeBooking && ["FIXED", "PAYMENT_PENDING", "COMPLETED"].includes(activeBooking.status));
  const isPaymentPending = Boolean(activeBooking?.status === "PAYMENT_PENDING" && Number(activeBooking.finalCost || 0) > 0);
  const isPaymentComplete = activeBooking?.status === "COMPLETED";
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-8 md:gap-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Service Hub</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">Active Service Tracker</h1>
          <p className="mt-2 text-sm text-slate-600">Track your request, complete payment when fixed, and rate your service.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p>
            Appliance: <span className="font-semibold">{activeBooking?.appliance || "Not assigned"}</span>
          </p>
        </div>
      </div>

      {hasActiveBooking ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          {loading ? (
            <div className="grid min-h-24 place-items-center">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          ) : !activeBooking ? (
            <p className="text-sm text-slate-600">Fetching active tracker...</p>
          ) : isPaymentStage ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900">Payment & Invoice</h3>
                <p className="text-sm text-slate-600">
                  {isPaymentComplete
                    ? "Payment verified. You can download your invoice below."
                    : "Final estimate ready. Complete payment to finish the service."}
                </p>
                <p className="text-2xl font-black text-emerald-600">₹{Number(activeBooking.finalCost || 0).toLocaleString("en-IN")}</p>
                {isPaymentComplete && (
                  <button
                    type="button"
                    onClick={() => onDownloadInvoice(activeBooking)}
                    className="min-h-[48px] rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-transform hover:bg-blue-700 active:scale-95"
                  >
                    Download Invoice
                  </button>
                )}
                <div>
                  {isPaymentComplete && (
                    <>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Rate Service</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, idx) => {
                          const value = idx + 1;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setRatingValue(value)}
                              className="rounded-md p-1"
                              aria-label={`Rate ${value}`}
                            >
                              <Star className={`h-5 w-5 ${value <= ratingValue ? "fill-amber-400 text-amber-400" : "text-slate-400"}`} />
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={onSubmitRating}
                          disabled={ratingLoading || ratingValue < 1}
                          className="ml-2 min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"
                        >
                          {ratingLoading ? "Saving..." : "Submit"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white p-4">
                <div className="space-y-2 text-center">
                  {isPaymentComplete ? (
                    <span className="inline-flex items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700">
                      ✅ Payment Successful
                    </span>
                  ) : isPaymentPending && canPay ? (
                    <button
                      type="button"
                      onClick={onPayWithRazorpay}
                      disabled={paying}
                      className="min-h-[48px] rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-700 transition-transform hover:bg-emerald-500/20 disabled:opacity-60"
                    >
                      {paying ? "Processing..." : "Pay via Razorpay"}
                    </button>
                  ) : isPaymentPending ? (
                    <p className="text-xs font-semibold text-slate-600">Login required to pay online.</p>
                  ) : (
                    <p className="text-xs font-semibold text-slate-600">Payment link will appear once the final estimate is ready.</p>
                  )}
                  <p className="text-[11px] text-slate-500">Secure payment powered by Razorpay.</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid gap-3 sm:grid-cols-5">
                {STATUS_STEPS.map((step, index) => {
                  const currentStep = getStepIndex(activeBooking.status);
                  const isDone = index <= currentStep;
                  return (
                    <div key={step.key} className="relative flex flex-col gap-2">
                      <div className={`h-2 rounded-full ${isDone ? "bg-blue-600" : "bg-slate-300"}`} />
                      <p className={`text-xs font-semibold ${isDone ? "text-blue-700" : "text-slate-500"}`}>{step.label}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-700">
                <p><span className="text-slate-500">Issue:</span> {activeBooking.issue}</p>
                <p><span className="text-slate-500">Address:</span> {activeBooking.address || "Not provided"}</p>
                <p><span className="text-slate-500">Scheduled:</span> {formatDateTime(activeBooking.scheduledAt)}</p>
                <p><span className="text-slate-500">Technician:</span> {activeBooking.technician?.name || "Auto-assigned shortly"}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-blue-300 bg-blue-50/70 p-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              Checking active service requests...
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-blue-200 bg-white p-2">
                <CalendarClock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">No active service requests right now. Book a technician below! 🛠️</p>
                <p className="mt-1 text-xs text-slate-600">Once you submit the form, your tracker will appear here instantly.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
