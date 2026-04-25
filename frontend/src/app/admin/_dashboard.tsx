"use client";
import { Package } from "lucide-react";
import { INR, imgSrc, sc } from "./_types";
import type { SectionProps } from "./_types";

export function DashboardSection({ stats, analytics, bookings, orders, sells }: SectionProps) {
  const activeQ  = bookings.filter(b => !["COMPLETED","CANCELLED"].includes(b.status));
  const doneQ    = bookings.filter(b => b.status === "COMPLETED");
  const liveO    = orders.filter(o => String(o.paymentStatus) !== "PAID" && o.orderStatus !== "DELIVERED");
  const revenue  = bookings.reduce((s, b) => s + (b.finalCost || 0), 0);
  const topFaults = analytics?.topFaults ?? stats?.applianceStats?.map(a => ({ appliance: a.appliance, count: a._count._all })) ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: "Total Bookings",  val: stats?.totalBookings ?? 0, sub: `${activeQ.length} active`,  g: "from-cyan-500/20 border-cyan-500/30 text-cyan-400" },
          { label: "Registered Users",val: stats?.totalUsers    ?? 0, sub: "all time",                  g: "from-blue-500/20 border-blue-500/30 text-blue-400" },
          { label: "Listed Products", val: stats?.totalProducts ?? 0, sub: "in inventory",              g: "from-purple-500/20 border-purple-500/30 text-purple-400" },
          { label: "Service Revenue", val: INR(revenue),               sub: "from completed repairs",   g: "from-emerald-500/20 border-emerald-500/30 text-emerald-400" },
        ] as { label: string; val: string|number; sub: string; g: string }[]).map((k, i) => (
          <div key={i} className={`rounded-2xl border bg-gradient-to-br to-transparent p-5 shadow-lg ${k.g}`}>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">{k.label}</p>
            <p className="text-3xl font-black text-white">{k.val}</p>
            <p className="text-xs text-slate-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Analytics row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ops summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">Operations Summary</p>
          {([
            ["Conversion Rate",  `${analytics?.conversionRate ?? 0}%`, "text-cyan-400"],
            ["Avg Service Time", `${analytics?.avgSlaHours ?? 0}h`,    "text-cyan-400"],
            ["Active Repairs",   activeQ.length,                        "text-yellow-400"],
            ["Completed",        doneQ.length,                          "text-emerald-400"],
            ["Live Orders",      liveO.length,                          "text-orange-400"],
            ["Sell Requests",    sells.length,                          "text-purple-400"],
          ] as [string, string|number, string][]).map(([l, v, c]) => (
            <div key={l} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
              <span className="text-sm text-slate-300">{l}</span>
              <span className={`font-black ${c}`}>{String(v)}</span>
            </div>
          ))}
        </div>

        {/* Top faults */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">Top Fault Types</p>
          {topFaults.slice(0, 6).map((f, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-800/40 last:border-0">
              <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black flex items-center justify-center shrink-0">{i+1}</span>
              <span className="text-sm text-slate-200 flex-1 truncate">{f.appliance}</span>
              <span className="text-xs font-bold text-slate-400 shrink-0">{f.count}</span>
            </div>
          ))}
          {!topFaults.length && <p className="text-sm text-slate-500">No data yet</p>}
        </div>

        {/* Recent products */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">Recent Products</p>
          {(stats?.latestProducts ?? []).slice(0, 5).map(p => (
            <div key={p.id} className="flex items-center gap-3 py-2 border-b border-slate-800/40 last:border-0">
              <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                {imgSrc(p.images)
                  ? <img src={imgSrc(p.images)!} alt={p.title} className="w-full h-full object-cover" />
                  : <Package className="w-4 h-4 text-slate-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-semibold truncate">{p.title}</p>
                <p className="text-xs text-cyan-400 font-bold">{INR(p.price)}</p>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${p.productType === "REFURBISHED" ? "border-orange-500/30 text-orange-400 bg-orange-500/10" : "border-blue-500/30 text-blue-400 bg-blue-500/10"}`}>{p.productType ?? "NEW"}</span>
            </div>
          ))}
          {!stats?.latestProducts?.length && <p className="text-sm text-slate-500">No products yet</p>}
        </div>
      </div>

      {/* Recent service activity */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">Recent Service Activity</p>
        <div className="space-y-2 max-h-64 overflow-auto pr-1">
          {bookings.slice(0, 8).map(b => (
            <div key={b.id} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{b.appliance}</p>
                <p className="text-xs text-slate-400">{b.contactName || "Unknown"} · {new Date(b.scheduledAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${sc(b.status)}`}>{b.status}</span>
              {b.finalCost ? <p className="text-emerald-400 font-black text-sm shrink-0">{INR(b.finalCost)}</p> : null}
            </div>
          ))}
          {!bookings.length && <p className="text-sm text-slate-500">No bookings yet.</p>}
        </div>
      </div>
    </div>
  );
}
