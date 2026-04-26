"use client";

import { CalendarClock, Loader2, Star } from "lucide-react";
import {
  DISPLAY_SERVICE_STATUSES,
  getServiceDisplayStatus,
  getServiceStatusLabel,
  isAwaitingServicePayment,
  type ServiceDisplayStatus,
} from "@/lib/service-status";

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
  displayStatus?: ServiceDisplayStatus;
  statusLabel?: string;
  scheduledAt: string;
  address?: string | null;
  finalCost?: number | null;
  invoiceUrl?: string | null;
  rating?: number | null;
  technician?: { name: string; phone: string } | null;
  technicianName?: string | null;
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

const TRACKER_STEPS = DISPLAY_SERVICE_STATUSES.filter((status) => status !== "CANCELLED");

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
  const displayStatus = activeBooking ? getServiceDisplayStatus(activeBooking) : "PENDING";
  const currentStep = TRACKER_STEPS.findIndex((step) => step === displayStatus);
  const technicianName = activeBooking?.technicianName || activeBooking?.technician?.name || "Assigning shortly";
  const isPaymentPending = Boolean(activeBooking && isAwaitingServicePayment(activeBooking) && Number(activeBooking.finalCost || 0) > 0);
  const isPaymentComplete = activeBooking?.status === "COMPLETED";
  const showPaymentPanel = isPaymentPending || isPaymentComplete;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-8 md:gap-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Service Hub</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">Active Service Tracker</h1>
          <p className="mt-2 text-sm text-slate-600">Track your request status in real time.</p>
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
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                {TRACKER_STEPS.map((step, index) => {
                  const isDone = displayStatus === "CANCELLED" ? false : index <= currentStep;
                  return (
                    <div key={step} className="relative flex flex-col gap-2">
                      <div className={`h-2 rounded-full ${isDone ? "bg-blue-600" : "bg-slate-300"}`} />
                      <p className={`text-xs font-semibold ${isDone ? "text-blue-700" : "text-slate-500"}`}>
                        {getServiceStatusLabel({ displayStatus: step })}
                      </p>
                    </div>
                  );
                })}
              </div>

              {showPaymentPanel && (
                <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Payment Desk</p>
                      <p className="text-base font-semibold text-slate-900">
                        {isPaymentPending
                          ? "Your service is completed. Please proceed with payment."
                          : "Payment received. Your service booking is now completed."}
                      </p>
                      <p className="text-sm text-slate-600">
                        {isPaymentPending
                          ? `Amount due: ₹${Number(activeBooking?.finalCost || 0).toLocaleString("en-IN")}`
                          : "You can download your invoice below."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isPaymentPending && canPay && (
                        <button
                          type="button"
                          onClick={onPayWithRazorpay}
                          disabled={paying}
                          className="min-h-[44px] rounded-xl border border-emerald-500 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-transform hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {paying ? "Processing..." : "Pay via Razorpay"}
                        </button>
                      )}
                      {isPaymentComplete && activeBooking && (
                        <button
                          type="button"
                          onClick={() => onDownloadInvoice(activeBooking)}
                          className="min-h-[44px] rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-transform hover:bg-blue-700 active:scale-95"
                        >
                          Download Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:grid-cols-2">
                <p>
                  <span className="text-slate-500">Status:</span>{" "}
                  <span className="font-semibold text-slate-900">{activeBooking.statusLabel || getServiceStatusLabel(activeBooking)}</span>
                </p>
                <p>
                  <span className="text-slate-500">Technician:</span>{" "}
                  <span className="font-semibold text-slate-900">{technicianName}</span>
                </p>
                <p className="md:col-span-2">
                  <span className="text-slate-500">Issue:</span>{" "}
                  <span className="font-semibold text-slate-900">{activeBooking.issue}</span>
                </p>
                <p className="md:col-span-2">
                  <span className="text-slate-500">Date:</span>{" "}
                  <span className="font-semibold text-slate-900">{formatDateTime(activeBooking.scheduledAt)}</span>
                </p>
              </div>

              {isPaymentComplete && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
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
              )}

              {displayStatus === "CANCELLED" && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  This service request was cancelled.
                </div>
              )}
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
