"use client";
import { Package, TrendingUp } from "lucide-react";
import { isFinalOrderStatus } from "@/lib/order-status";
import { INR, imgSrc, sc } from "./_types";
import type { SectionProps } from "./_types";

/* ── Tiny inline SVG bar chart ── */
function MiniBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-24 w-full">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-[9px] font-bold text-slate-400 leading-none">{d.value || ""}</span>
            <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${Math.max(pct, 4)}%`, background: color, opacity: d.value ? 1 : 0.15 }} />
            <span className="text-[9px] text-slate-600 leading-none truncate w-full text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* Build last-7-days daily booking counts from bookings array */
function buildDailyTrend(bookings: SectionProps["bookings"]) {
  const days: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    const value = bookings.filter(b => new Date(b.scheduledAt).toDateString() === key).length;
    days.push({ label, value });
  }
  return days;
}

export function DashboardSection({ stats, analytics, bookings, orders, sells }: SectionProps) {
  const activeQ  = bookings.filter(b => !["COMPLETED","CANCELLED"].includes(b.status));
  const doneQ    = bookings.filter(b => b.status === "COMPLETED");
  const liveO    = orders.filter((order) => !isFinalOrderStatus(order.status));
  const revenue  = bookings.reduce((s, b) => s + (b.finalCost || 0), 0);
  const topFaults = analytics?.topFaults ?? stats?.applianceStats?.map(a => ({ appliance: a.appliance, count: a._count._all })) ?? [];
  const trend     = buildDailyTrend(bookings);

  /* Revenue this week vs last week */
  const now = new Date();
  const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - 7);
  const lastWeekStart = new Date(now); lastWeekStart.setDate(now.getDate() - 14);
  const revThisWeek = bookings.filter(b => new Date(b.scheduledAt) >= thisWeekStart).reduce((s, b) => s + (b.finalCost || 0), 0);
  const revLastWeek = bookings.filter(b => new Date(b.scheduledAt) >= lastWeekStart && new Date(b.scheduledAt) < thisWeekStart).reduce((s, b) => s + (b.finalCost || 0), 0);
  const revDelta = revLastWeek > 0 ? Math.round(((revThisWeek - revLastWeek) / revLastWeek) * 100) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {([
          { label: "Total Bookings",  val: stats?.totalBookings ?? 0, sub: `${activeQ.length} active`,  g: "from-cyan-500/20 border-cyan-500/30 text-cyan-400" },
          { label: "Registered Users",val: stats?.totalUsers    ?? 0, sub: "all time",                  g: "from-blue-500/20 border-blue-500/30 text-blue-400" },
          { label: "Listed Products", val: stats?.totalProducts ?? 0, sub: "in inventory",              g: "from-purple-500/20 border-purple-500/30 text-purple-400" },
          { label: "Service Revenue", val: INR(revenue),               sub: "from completed repairs",   g: "from-emerald-500/20 border-emerald-500/30 text-emerald-400" },
        ] as { label: string; val: string|number; sub: string; g: string }[]).map((k, i) => (
          <div key={i} className={`rounded-2xl border bg-gradient-to-br to-transparent p-4 sm:p-5 shadow-lg ${k.g}`}>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1 sm:mb-2 truncate">{k.label}</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white break-all">{k.val}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* 7-day trend chart + ops summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Booking trend chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">7-Day Booking Trend</p>
            {revDelta !== null && (
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${revDelta >= 0 ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-red-400 bg-red-500/10 border border-red-500/20"}`}>
                <TrendingUp className="w-3 h-3" />
                {revDelta >= 0 ? "+" : ""}{revDelta}% revenue vs last week
              </span>
            )}
          </div>
          <MiniBarChart data={trend} color="rgba(6,182,212,0.7)" />
        </div>

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
      </div>

      {/* Top faults + Recent products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top faults */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">Top Fault Types</p>
          {topFaults.slice(0, 6).map((f, i) => {
            const maxCount = topFaults[0]?.count || 1;
            const pct = Math.round((f.count / maxCount) * 100);
            return (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-800/40 last:border-0">
                <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black flex items-center justify-center shrink-0">{i+1}</span>
                <span className="text-sm text-slate-200 flex-1 min-w-0 truncate">{f.appliance}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                    <div className="h-full rounded-full bg-cyan-500/60 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-400">{f.count}</span>
                </div>
              </div>
            );
          })}
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
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${p.productType === "REFURBISHED" ? "border-orange-500/30 text-orange-400 bg-orange-500/10" : "border-blue-500/30 text-blue-400 bg-blue-500/10"}`}>{p.productType ?? "NEW"}</span>
            </div>
          ))}
          {!stats?.latestProducts?.length && <p className="text-sm text-slate-500">No products yet</p>}
        </div>
      </div>

      {/* Recent service activity */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">Recent Service Activity</p>
        <div className="space-y-2 max-h-64 overflow-auto pr-1">
          {bookings.slice(0, 8).map(b => (
            <div key={b.id} className="flex items-start sm:items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{b.appliance}</p>
                <p className="text-xs text-slate-400 truncate">{b.contactName || "Unknown"} · {new Date(b.scheduledAt).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc(b.status)}`}>{b.status}</span>
                {b.finalCost ? <p className="text-emerald-400 font-black text-xs">{INR(b.finalCost)}</p> : null}
              </div>
            </div>
          ))}
          {!bookings.length && <p className="text-sm text-slate-500">No bookings yet.</p>}
        </div>
      </div>
    </div>
  );
}
