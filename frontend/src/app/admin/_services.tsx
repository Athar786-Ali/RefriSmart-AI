"use client";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Search, Download, X } from "lucide-react";
import {
  DISPLAY_SERVICE_STATUSES,
  getServiceDisplayStatus,
  getServiceStatusLabel,
  type ServiceDisplayStatus,
} from "@/lib/service-status";
import { INR, sc, btn } from "./_types";
import type { SectionProps, Booking, TechnicianOption } from "./_types";

const DEFAULT_TECHNICIANS: TechnicianOption[] = [
  { id: "ravi-kumar", name: "Ravi Kumar" },
  { id: "sanjay-kumar", name: "Sanjay Kumar" },
  { id: "amit-singh", name: "Amit Singh" },
  { id: "rahul-verma", name: "Rahul Verma" },
];

/* ── CSV export helper ── */
function downloadCSV(rows: string[][], filename: string) {
  const csv = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function ServicesSection({ bookings, setBookings, technicians, API }: SectionProps) {
  const [bStatus,      setBStatus]      = useState<Record<string, ServiceDisplayStatus>>({});
  const [bCost,        setBCost]        = useState<Record<string, string>>({});
  const [bTechnician,  setBTechnician]  = useState<Record<string, string>>({});
  const [searchQ,      setSearchQ]      = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const technicianOptions = technicians.length ? technicians : DEFAULT_TECHNICIANS;

  const activeQ = bookings.filter((b) => !["COMPLETED", "CANCELLED"].includes(getServiceDisplayStatus(b)));
  const doneQ   = bookings.filter((b) => getServiceDisplayStatus(b) === "COMPLETED");
  const revenue = bookings.reduce((s, b) => s + (b.finalCost || 0), 0);

  /* ── filtered queues ── */
  const filterFn = (b: Booking) => {
    const q = searchQ.toLowerCase();
    const matchSearch = !q || [b.appliance, b.contactName, b.contactPhone, b.address, b.issue]
      .some(v => v?.toLowerCase().includes(q));
    const matchStatus = statusFilter === "ALL" || getServiceDisplayStatus(b) === statusFilter;
    return matchSearch && matchStatus;
  };

  const filteredActive = useMemo(() => activeQ.filter(filterFn), [activeQ, searchQ, statusFilter]);
  const filteredDone   = useMemo(() => doneQ.filter(filterFn),   [doneQ,   searchQ, statusFilter]);

  /* ── CSV export ── */
  const exportCSV = () => {
    const header = ["ID", "Appliance", "Issue", "Customer", "Phone", "Address", "Status", "Technician", "Scheduled At", "Final Cost"];
    const rows = bookings.map(b => [
      String(b.id), String(b.appliance), String(b.issue ?? ""), String(b.contactName || b.customer?.name || ""), String(b.contactPhone || ""),
      String(b.address || ""), String(getServiceDisplayStatus(b)), String(b.technicianName || b.technician?.name || ""),
      String(new Date(b.scheduledAt).toLocaleString()), String(b.finalCost ?? ""),
    ] as string[]);
    downloadCSV([header, ...rows], `service-bookings-${new Date().toISOString().slice(0,10)}.csv`);
    toast.success("CSV exported!");
  };

  const update = async (id: string, status: ServiceDisplayStatus, cost?: string) => {
    const pc   = cost?.trim() ? Number(cost) : undefined;
    const prev = [...bookings];
    setBookings((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              status: status === "ON_THE_WAY" ? "OUT_FOR_REPAIR" : (status as Booking["status"]),
              displayStatus: status,
              statusLabel: getServiceStatusLabel({ displayStatus: status }),
              finalCost: Number.isFinite(pc) ? pc : item.finalCost,
            }
          : item,
      ),
    );
    try {
      const r = await fetch(`${API}/admin/service/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status, finalCost: Number.isFinite(pc) ? pc : undefined }),
      });
      const p = await r.json().catch(() => null);
      if (!r.ok) { setBookings(prev); toast.error(p?.error || "Update failed."); return; }
      if (p?.booking) setBookings((items) => items.map((item) => item.id === id ? { ...item, ...p.booking } : item));
      toast.success("Booking updated.");
    } catch { setBookings(prev); toast.error("Update failed."); }
  };

  const assignTechnician = async (booking: Booking) => {
    const selectedTechnicianId = bTechnician[booking.id] || booking.technicianId || technicianOptions[0]?.id;
    const selectedTechnician = technicianOptions.find((t) => t.id === selectedTechnicianId)
      || technicianOptions.find((t) => t.name === selectedTechnicianId);
    if (!selectedTechnician) { toast.error("Select a technician first."); return; }

    const prev = [...bookings];
    setBookings((items) =>
      items.map((item) =>
        item.id === booking.id
          ? { ...item, status: "ASSIGNED", displayStatus: "ASSIGNED", statusLabel: getServiceStatusLabel({ displayStatus: "ASSIGNED" }),
              technician: { name: selectedTechnician.name, phone: selectedTechnician.phone },
              technicianId: selectedTechnician.id, technicianName: selectedTechnician.name }
          : item,
      ),
    );
    try {
      const response = await fetch(`${API}/admin/assign-technician/${booking.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ technicianId: technicians.length ? selectedTechnician.id : undefined, technicianName: selectedTechnician.name }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) { setBookings(prev); toast.error(payload?.error || "Technician assignment failed."); return; }
      if (payload?.booking) setBookings((items) => items.map((item) => item.id === booking.id ? { ...item, ...payload.booking } : item));
      toast.success("Technician assigned.");
    } catch { setBookings(prev); toast.error("Technician assignment failed."); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {([
          ["Active Repairs",   activeQ.length,    "text-yellow-400"],
          ["Completed",        doneQ.length,      "text-emerald-400"],
          ["Awaiting Payment", bookings.filter((b) => getServiceDisplayStatus(b) === "PAYMENT_PENDING").length, "text-pink-400"],
          ["Total Revenue",    INR(revenue),      "text-cyan-400"],
        ] as [string, string|number, string][]).map(([l, v, c]) => (
          <div key={l} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1 sm:mb-2 truncate">{l}</p>
            <p className={`text-xl sm:text-2xl font-black ${c} break-all`}>{String(v)}</p>
          </div>
        ))}
      </div>

      {/* ── Search & Filter toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search by customer, appliance, phone…"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-9 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/60 focus:outline-none"
          />
          {searchQ && (
            <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 focus:border-cyan-500/60 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          {DISPLAY_SERVICE_STATUSES.map(s => (
            <option key={s} value={s}>{getServiceStatusLabel({ displayStatus: s })}</option>
          ))}
        </select>
        <button
          onClick={exportCSV}
          className={btn("border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 shrink-0")}
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Active queue */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-white">Active Service Queue</h3>
          <span className="text-xs font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full">
            {filteredActive.length}{filteredActive.length !== activeQ.length ? ` / ${activeQ.length}` : ""} active
          </span>
        </div>

        <div className="space-y-4 max-h-[55vh] overflow-auto pr-1">
          {filteredActive.map(b => {
            const st   = bStatus[b.id] || getServiceDisplayStatus(b);
            const cost = bCost[b.id] ?? (b.finalCost ? String(b.finalCost) : "");
            const selectedTechnician = bTechnician[b.id] || b.technicianId || "";
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
                      <span className={`ml-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc(st)}`}>
                        {getServiceStatusLabel({ displayStatus: st })}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5 mt-2">
                      <p className="text-xs text-slate-300">📅 {new Date(b.scheduledAt).toLocaleString()}</p>
                      <p className="text-xs text-slate-300">👤 {b.contactName || b.customer?.name || "Unknown"}</p>
                      <p className="text-xs text-slate-300">📞 {b.contactPhone || "N/A"}</p>
                      {b.address && <p className="text-xs text-slate-400 truncate">📍 {b.address}</p>}
                      {(b.technicianName || b.technician?.name) && <p className="text-xs text-blue-400">🔧 {b.technicianName || b.technician?.name}</p>}
                      {b.finalCost ? <p className="text-xs text-emerald-400 font-bold">💰 Final: {INR(b.finalCost)}</p> : null}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col gap-2 w-full lg:w-56 lg:shrink-0">
                    <select
                      value={selectedTechnician}
                      onChange={(event) => setBTechnician((prev) => ({ ...prev, [b.id]: event.target.value }))}
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="">Select Technician</option>
                      {technicianOptions.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => void assignTechnician(b)}
                      className={btn("border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 w-full justify-center")}
                    >
                      Assign Technician
                    </button>
                    <select value={st}
                      onChange={e => {
                        const s = e.target.value as ServiceDisplayStatus;
                        setBStatus(p => ({ ...p, [b.id]: s }));
                        update(b.id, s, cost);
                      }}
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none">
                      {DISPLAY_SERVICE_STATUSES.map((status) => (
                        <option key={status} value={status}>{getServiceStatusLabel({ displayStatus: status })}</option>
                      ))}
                    </select>
                    <input
                      value={cost}
                      onChange={e => setBCost(p => ({ ...p, [b.id]: e.target.value }))}
                      placeholder="Final Cost ₹"
                      type="number" min="0"
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
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
          {!filteredActive.length && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg font-semibold">
                {searchQ || statusFilter !== "ALL" ? "No results match your search 🔍" : "No active service requests 🎉"}
              </p>
              {(searchQ || statusFilter !== "ALL") && (
                <button onClick={() => { setSearchQ(""); setStatusFilter("ALL"); }} className="text-cyan-400 text-sm mt-2 hover:underline">Clear filters</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Completed log */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white">Completed Services</h3>
          <span className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
            {filteredDone.length}{filteredDone.length !== doneQ.length ? ` / ${doneQ.length}` : ""} completed
          </span>
        </div>
        <div className="space-y-2 max-h-80 overflow-auto pr-1">
          {filteredDone.map(b => (
            <div key={b.id} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3 hover:border-emerald-500/20 transition-all">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{b.appliance}</p>
                <p className="text-xs text-slate-400">{b.contactName || "Unknown"} · {new Date(b.scheduledAt).toLocaleDateString()}</p>
              </div>
              {b.finalCost ? <p className="text-emerald-400 font-black text-sm shrink-0">{INR(b.finalCost)}</p> : null}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${sc(getServiceDisplayStatus(b))}`}>
                {getServiceStatusLabel(b)}
              </span>
            </div>
          ))}
          {!filteredDone.length && (
            <p className="text-slate-500 text-sm">
              {searchQ || statusFilter !== "ALL" ? "No completed services match your search." : "No completed services yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
