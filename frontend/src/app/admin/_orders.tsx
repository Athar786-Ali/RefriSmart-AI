"use client";
import { useState } from "react";
import { toast } from "sonner";
import { INR, sc, btn } from "./_types";
import type { SectionProps, Order } from "./_types";

export function OrdersSection({ orders, setOrders, API }: SectionProps) {
  const [oStatus,   setOStatus]   = useState<Record<string, Order["orderStatus"]>>({});
  const [genInv,    setGenInv]    = useState<Record<string, boolean>>({});
  const [confPay,   setConfPay]   = useState<Record<string, boolean>>({});

  const liveO = orders.filter(o => String(o.paymentStatus) !== "PAID" && o.orderStatus !== "DELIVERED");
  const doneO = orders.filter(o => String(o.paymentStatus) === "PAID" || o.orderStatus === "DELIVERED");

  const updateOrder = async (id: string, status: Order["orderStatus"]) => {
    const prev = [...orders];
    setOrders(o => o.map(x => x.id === id ? { ...x, orderStatus: status } : x));
    try {
      const r = await fetch(`${API}/admin/orders/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ orderStatus: status }),
      });
      const p = await r.json().catch(() => null);
      if (!r.ok) { setOrders(prev); toast.error(p?.error || "Update failed."); return; }
      if (p?.order) setOrders(o => o.map(x => x.id === id ? p.order : x));
    } catch { setOrders(prev); toast.error("Update failed."); }
  };

  const confirmPay = async (id: string) => {
    setConfPay(p => ({ ...p, [id]: true }));
    try {
      const r = await fetch(`${API}/admin/orders/${id}/confirm-payment`, { method: "PATCH", credentials: "include" });
      const p = await r.json().catch(() => null);
      if (!r.ok) { toast.error(p?.error || "Failed."); return; }
      if (p?.order) setOrders(o => o.map(x => x.id === id ? p.order : x));
      toast.success("Payment confirmed.");
    } catch { toast.error("Failed."); }
    finally { setConfPay(p => { const n = { ...p }; delete n[id]; return n; }); }
  };

  const genBill = async (id: string) => {
    setGenInv(p => ({ ...p, [id]: true }));
    try {
      const r = await fetch(`${API}/admin/orders/${id}/generate-invoice`, { method: "POST", credentials: "include" });
      const p = await r.json().catch(() => null);
      if (!r.ok) { toast.error(p?.error || "Failed."); return; }
      if (p?.order) setOrders(o => o.map(x => x.id === id ? p.order : x));
      if (p?.invoiceUrl) window.open(p.invoiceUrl, "_blank", "noopener,noreferrer");
      toast.success("Invoice generated.");
    } catch { toast.error("Failed."); }
    finally { setGenInv(p => { const n = { ...p }; delete n[id]; return n; }); }
  };

  const ORDER_STATUSES: Order["orderStatus"][] = ["ORDER_PLACED","DISPATCHED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {([
          ["Live Orders",     liveO.length,  "text-orange-400"],
          ["Delivered",       doneO.length,  "text-emerald-400"],
          ["Total Orders",    orders.length, "text-cyan-400"],
          ["Revenue",         INR(orders.filter(o => String(o.paymentStatus) === "PAID").reduce((s,o) => s + o.price, 0)), "text-purple-400"],
        ] as [string, string|number, string][]).map(([l, v, c]) => (
          <div key={l} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">{l}</p>
            <p className={`text-2xl font-black ${c}`}>{String(v)}</p>
          </div>
        ))}
      </div>

      {/* Live orders */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-white">Live Orders</h3>
          <span className="text-xs font-bold bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1 rounded-full">{liveO.length} pending</span>
        </div>

        <div className="space-y-4 max-h-[55vh] overflow-auto pr-1">
          {liveO.map(o => {
            const st        = oStatus[o.id] || o.orderStatus;
            const paid      = String(o.paymentStatus) === "PAID";
            const cancelled = o.orderStatus === "CANCELLED";
            return (
              <div key={o.id} className={`rounded-xl border p-4 transition-all ${cancelled ? "border-red-500/30 bg-red-500/5" : "border-slate-700 bg-slate-900 hover:border-blue-500/30"}`}>
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start gap-3">
                      <div>
                        <p className="font-bold text-white">{o.productTitle}</p>
                        <p className="text-cyan-400 font-black">{INR(o.price)}</p>
                      </div>
                      <span className={`ml-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc(o.orderStatus)}`}>{o.orderStatus}</span>
                    </div>
                    <p className="text-xs text-slate-300">👤 {o.customerName || o.userName || "Unknown"}{o.userEmail ? ` · ${o.userEmail}` : ""}</p>
                    <p className="text-xs text-slate-300">📞 {o.deliveryPhone}</p>
                    <p className="text-xs text-slate-400">📍 {o.deliveryAddress}</p>
                    <p className="text-xs text-slate-500">Placed: {new Date(o.createdAt).toLocaleString()}</p>
                    {paid && <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">✓ PAID</span>}
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col gap-2 lg:w-44 shrink-0">
                    <select value={st}
                      onChange={e => { const s = e.target.value as Order["orderStatus"]; setOStatus(p => ({ ...p, [o.id]: s })); updateOrder(o.id, s); }}
                      disabled={cancelled}
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-100 disabled:opacity-40">
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => confirmPay(o.id)} disabled={paid || !!confPay[o.id] || cancelled}
                      className={btn("border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40 w-full justify-center")}>
                      {paid ? "✓ Paid" : confPay[o.id] ? "Confirming…" : "Confirm Payment"}
                    </button>
                    <button onClick={() => genBill(o.id)} disabled={!!genInv[o.id] || cancelled}
                      className={btn("border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-40 w-full justify-center")}>
                      {genInv[o.id] ? "Generating…" : "Generate Bill"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {!liveO.length && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg font-semibold">No live orders 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* Completed orders */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white">Completed Orders</h3>
          <span className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">{doneO.length} delivered</span>
        </div>
        <div className="space-y-2 max-h-80 overflow-auto pr-1">
          {doneO.map(o => (
            <div key={o.id} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{o.productTitle}</p>
                <p className="text-xs text-slate-400">{o.customerName || o.userName || "Unknown"} · {INR(o.price)} · {o.paymentStatus || "PENDING"}</p>
              </div>
              {o.invoiceUrl && (
                <button onClick={() => window.open(o.invoiceUrl!, "_blank")}
                  className={btn("border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shrink-0")}>
                  Invoice
                </button>
              )}
            </div>
          ))}
          {!doneO.length && <p className="text-slate-500 text-sm">No completed orders yet.</p>}
        </div>
      </div>
    </div>
  );
}
