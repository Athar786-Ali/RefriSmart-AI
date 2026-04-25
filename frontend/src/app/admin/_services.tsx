"use client";
import { useState } from "react";
import { toast } from "sonner";
import { INR, sc, inp, btn } from "./_types";
import type { SectionProps, Booking } from "./_types";

export function ServicesSection({ bookings, setBookings, API }: SectionProps) {
  const [bStatus, setBStatus] = useState<Record<string, Booking["status"]>>({});
  const [bCost,   setBCost]   = useState<Record<string, string>>({});

  const activeQ = bookings.filter(b => !["COMPLETED","CANCELLED"].includes(b.status));
  const doneQ   = bookings.filter(b => b.status === "COMPLETED");
  const revenue = bookings.reduce((s, b) => s + (b.finalCost || 0), 0);

  const update = async (id: string, status: Booking["status"], cost?: string) => {
    const pc   = cost?.trim() ? Number(cost) : undefined;
    const prev = [...bookings];
    setBookings(b => b.map(x => x.id === id ? { ...x, status, finalCost: Number.isFinite(pc) ? pc : x.finalCost } : x));
    try {
      const r = await fetch(`${API}/admin/service/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status, finalCost: Number.isFinite(pc) ? pc : undefined }),
      });
      const p = await r.json().catch(() => null);
      if (!r.ok) { setBookings(prev); toast.error(p?.error || "Update failed."); return; }
      if (p?.booking) setBookings(b => b.map(x => x.id === id ? { ...x, ...p.booking } : x));
      toast.success("Booking updated.");
    } catch { setBookings(prev); toast.error("Update failed."); }
  };

  const ALL_STATUSES: Booking["status"][] = ["PENDING","ASSIGNED","ESTIMATE_APPROVED","OUT_FOR_REPAIR","REPAIRING","PAYMENT_PENDING","FIXED","COMPLETED","CANCELLED"];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {([
          ["Active Repairs",      activeQ.length,    "text-yellow-400"],
          ["Completed",           doneQ.length,      "text-emerald-400"],
          ["Awaiting Payment",    bookings.filter(b => ["FIXED","PAYMENT_PENDING"].includes(b.status)).length, "text-pink-400"],
          ["Total Revenue",       INR(revenue),      "text-cyan-400"],
        ] as [string, string|number, string][]).map(([l, v, c]) => (
          <div key={l} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">{l}</p>
            <p className={`text-2xl font-black ${c}`}>{String(v)}</p>
          </div>
        ))}
      </div>

      {/* Active queue */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-white">Active Service Queue</h3>
          <span className="text-xs font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full">{activeQ.length} active</span>
        </div>

        <div className="space-y-4 max-h-[55vh] overflow-auto pr-1">
          {activeQ.map(b => {
            const st   = bStatus[b.id] || b.status;
            const cost = bCost[b.id] ?? (b.finalCost ? String(b.finalCost) : "");
            return (
              <div key={b.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4 hover:border-cyan-500/30 transition-all">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start gap-3">
                      <div>
                        <p className="font-bold text-white text-lg">{b.appliance}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{b.issue}</p>
                      </div>
                      <span className={`ml-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc(b.status)}`}>{b.status}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5 mt-2">
                      <p className="text-xs text-slate-300">📅 {new Date(b.scheduledAt).toLocaleString()}</p>
                      <p className="text-xs text-slate-300">👤 {b.contactName || b.customer?.name || "Unknown"}</p>
                      <p className="text-xs text-slate-300">📞 {b.contactPhone || "N/A"}</p>
                      {b.address && <p className="text-xs text-slate-400 truncate">📍 {b.address}</p>}
                      {b.technician && <p className="text-xs text-blue-400">🔧 {b.technician.name}</p>}
                      {b.finalCost ? <p className="text-xs text-emerald-400 font-bold">💰 Final: {INR(b.finalCost)}</p> : null}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col gap-2 lg:w-48 shrink-0">
                    <select value={st}
                      onChange={e => {
                        const s = e.target.value as Booking["status"];
                        if (["FIXED","PAYMENT_PENDING"].includes(s) && !cost.trim()) {
                          toast.error("Enter final cost first."); return;
                        }
                        setBStatus(p => ({ ...p, [b.id]: s }));
                        update(b.id, s, cost);
                      }}
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none">
                      {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input
                      value={cost}
                      onChange={e => setBCost(p => ({ ...p, [b.id]: e.target.value }))}
                      placeholder="Final Cost ₹"
                      type="number" min="0"
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                    {["FIXED","PAYMENT_PENDING"].includes(b.status) && (
                      <button
                        onClick={() => {
                          if (!cost) return toast.error("Enter final cost first.");
                          update(b.id, "FIXED", cost);
                        }}
                        className={btn("border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 w-full justify-center")}>
                        Set & Request Payment
                      </button>
                    )}
                    {b.invoiceUrl && (
                      <button onClick={() => window.open(b.invoiceUrl!, "_blank")}
                        className={btn("border-cyan-500/30 bg-cyan-500/10 text-cyan-300 w-full justify-center")}>
                        View Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {!activeQ.length && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg font-semibold">No active service requests 🎉</p>
              <p className="text-slate-600 text-sm mt-1">All caught up!</p>
            </div>
          )}
        </div>
      </div>

      {/* Completed log */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white">Completed Services</h3>
          <span className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">{doneQ.length} completed</span>
        </div>
        <div className="space-y-2 max-h-80 overflow-auto pr-1">
          {doneQ.map(b => (
            <div key={b.id} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3 hover:border-emerald-500/20 transition-all">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{b.appliance}</p>
                <p className="text-xs text-slate-400">{b.contactName || "Unknown"} · {new Date(b.scheduledAt).toLocaleDateString()}</p>
              </div>
              {b.finalCost ? <p className="text-emerald-400 font-black text-sm shrink-0">{INR(b.finalCost)}</p> : null}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${sc(b.status)}`}>DONE</span>
            </div>
          ))}
          {!doneQ.length && <p className="text-slate-500 text-sm">No completed services yet.</p>}
        </div>
      </div>
    </div>
  );
}
