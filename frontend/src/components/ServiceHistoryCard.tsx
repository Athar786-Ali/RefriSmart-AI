"use client";

import { getServiceDisplayStatus, getServiceStatusLabel } from "@/lib/service-status";
import type { ServiceBooking } from "./ServiceActiveTrackerCard";

type ServiceHistoryCardProps = {
  completedBookings: ServiceBooking[];
  onDownloadInvoice: (booking: ServiceBooking) => void;
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

export default function ServiceHistoryCard({ completedBookings, onDownloadInvoice }: ServiceHistoryCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-bold text-slate-900">Previous Bookings</h3>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          {completedBookings.length} records
        </span>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Appliance</th>
              <th className="px-4 py-3">Issue</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3 text-right">Bill</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {completedBookings.map((booking) => (
              <tr key={booking.id} className="text-slate-700">
                <td className="px-4 py-3 text-slate-600">{formatDateTime(booking.scheduledAt)}</td>
                <td className="px-4 py-3 font-semibold">{booking.appliance}</td>
                <td className="px-4 py-3 text-slate-600">{booking.issue}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getServiceDisplayStatus(booking) === "CANCELLED" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                    {booking.statusLabel || getServiceStatusLabel(booking)}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-emerald-600">₹{Number(booking.finalCost || 0).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-right">
                  {getServiceDisplayStatus(booking) === "CANCELLED" ? (
                    <span className="text-xs font-semibold text-slate-400">N/A</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onDownloadInvoice(booking)}
                      className="min-h-[40px] rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-transform hover:bg-blue-100 active:scale-95"
                    >
                      Download Bill
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!completedBookings.length && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={6}>
                  No previous service records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
