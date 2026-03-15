"use client";

import QRCode from "react-qr-code";
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
  activeBookingUpiLink: string;
  ratingValue: number;
  setRatingValue: (next: number) => void;
  ratingLoading: boolean;
  onSubmitRating: () => void;
  onDownloadInvoice: (booking: ServiceBooking) => void;
  upiId: string;
};

const STATUS_STEPS: Array<{ key: BookingStatus; label: string }> = [
  { key: "PENDING", label: "Pending" },
  { key: "ASSIGNED", label: "Assigned" },
  { key: "ESTIMATE_APPROVED", label: "Estimate Approved" },
  { key: "OUT_FOR_REPAIR", label: "On Way" },
  { key: "REPAIRING", label: "Repairing" },
  { key: "PAYMENT_PENDING", label: "Payment Pending" },
];

const getStepIndex = (status: BookingStatus) => {
  const idx = STATUS_STEPS.findIndex((step) => step.key === status);
  if (idx >= 0) return idx;
  if (status === "FIXED") return STATUS_STEPS.findIndex((step) => step.key === "PAYMENT_PENDING");
  if (status === "COMPLETED") return STATUS_STEPS.length - 1;
  if (status === "CANCELLED") return STATUS_STEPS.length - 1;
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
  activeBookingUpiLink,
  ratingValue,
  setRatingValue,
  ratingLoading,
  onSubmitRating,
  onDownloadInvoice,
  upiId,
}: ServiceActiveTrackerCardProps) {
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
          ) : ["FIXED", "PAYMENT_PENDING"].includes(activeBooking.status) ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900">Payment & Invoice</h3>
                <p className="text-sm text-slate-600">Your technician has marked the job as fixed. Please complete payment and download your bill.</p>
                <p className="text-2xl font-black text-emerald-600">₹{Number(activeBooking.finalCost || 0).toLocaleString("en-IN")}</p>
                <button
                  type="button"
                  onClick={() => onDownloadInvoice(activeBooking)}
                  className="min-h-[48px] rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-transform hover:bg-blue-700 active:scale-95"
                >
                  Download Invoice
                </button>
                <div>
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
                </div>
              </div>
              <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white p-4">
                <div className="space-y-2 text-center">
                  <QRCode value={activeBookingUpiLink} size={140} bgColor="#ffffff" fgColor="#0f172a" />
                  <p className="text-[11px] font-semibold text-slate-600">{upiId}</p>
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
