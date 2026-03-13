"use client";

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
        <h3 className="text-lg font-bold text-slate-900">Service History</h3>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          {completedBookings.length} completed
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Appliance</th>
              <th className="px-4 py-3">Issue</th>
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
                <td className="px-4 py-3 font-semibold text-emerald-600">₹{Number(booking.finalCost || 0).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onDownloadInvoice(booking)}
                    className="min-h-[40px] rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-transform hover:bg-blue-100 active:scale-95"
                  >
                    Download Bill
                  </button>
                </td>
              </tr>
            ))}
            {!completedBookings.length && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={5}>
                  No completed service records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
