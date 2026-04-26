"use client";
import { useState, useMemo } from "react";
import { ALL_ORDER_STATUSES, ORDER_STATUS_LABELS, isFinalOrderStatus, normalizeOrderApiPayload } from "@/lib/order-status";
import { toast } from "sonner";
import { Search, Download, X } from "lucide-react";
import { INR, sc, btn } from "./_types";
import type { SectionProps, Order } from "./_types";

/* ── CSV export helper ── */
function downloadCSV(rows: string[][], filename: string) {
  const csv = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function OrdersSection({ orders, setOrders, API }: SectionProps) {
  const [oStatus,    setOStatus]    = useState<Record<string, Order["status"]>>({});
  const [genInv,     setGenInv]     = useState<Record<string, boolean>>({});
  const [confPay,    setConfPay]    = useState<Record<string, boolean>>({});
  const [transferTo, setTransferTo] = useState<Record<string, string>>({});
  const [reassigning, setReassigning] = useState<Record<string, boolean>>({});
  const [searchQ,    setSearchQ]    = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const liveO = orders.filter((order) => !isFinalOrderStatus(order.status));
  const doneO = orders.filter((order) => isFinalOrderStatus(order.status));

  /* ── Filtering ── */
  const filterFn = (o: Order) => {
    const q = searchQ.toLowerCase();
    const matchSearch = !q || [o.productTitle, o.userName, o.userEmail, o.userPhone, o.customerName, o.deliveryPhone, o.deliveryAddress]
      .some(v => v?.toLowerCase().includes(q));
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  };

  const filteredLive = useMemo(() => liveO.filter(filterFn), [liveO, searchQ, statusFilter]);
  const filteredDone = useMemo(() => doneO.filter(filterFn), [doneO, searchQ, statusFilter]);

  /* ── CSV export ── */
  const exportCSV = () => {
    const header = ["ID", "Product", "Price", "Status", "Payment", "Customer", "Email", "Phone", "Delivery Address", "Created At"];
    const rows = orders.map(o => [
      String(o.id), String(o.productTitle), String(o.price), ORDER_STATUS_LABELS[o.status], String(o.paymentStatus ?? ""),
      o.userName || o.customerName || "", o.userEmail || "", o.userPhone || o.deliveryPhone || "",
      o.deliveryAddress || "", new Date(o.createdAt).toLocaleString(),
    ] as string[]);
    downloadCSV([header, ...rows], `orders-${new Date().toISOString().slice(0,10)}.csv`);
    toast.success("CSV exported!");
  };

  const updateOrder = async (id: string, status: Order["status"]) => {
    const prev = [...orders];
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
    try {
      const r = await fetch(`${API}/admin/orders/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status }),
      });
      const p = await r.json().catch(() => null);
      if (!r.ok) { setOrders(prev); toast.error(p?.message || p?.error || "Update failed."); return; }
      if (p?.order) {
        const normalized = normalizeOrderApiPayload(p.order as Order & { orderStatus?: string });
        setOrders(o => o.map(x => x.id === id ? { ...x, ...normalized } : x));
      }
    } catch { setOrders(prev); toast.error("Update failed."); }
  };

  const confirmPay = async (id: string) => {
    setConfPay(p => ({ ...p, [id]: true }));
    try {
      const r = await fetch(`${API}/admin/orders/${id}/confirm-payment`, { method: "PATCH", credentials: "include" });
      const p = await r.json().catch(() => null);
      if (!r.ok) { toast.error(p?.message || p?.error || "Failed."); return; }
      if (p?.order) {
        const normalized = normalizeOrderApiPayload(p.order as Order & { orderStatus?: string });
        setOrders(o => o.map(x => x.id === id ? { ...x, ...normalized } : x));
      }
      toast.success("Payment confirmed.");
    } catch { toast.error("Failed."); }
    finally { setConfPay(p => { const n = { ...p }; delete n[id]; return n; }); }
  };

  const genBill = async (id: string) => {
    setGenInv(p => ({ ...p, [id]: true }));
    try {
      const r = await fetch(`${API}/admin/orders/${id}/generate-invoice`, { method: "POST", credentials: "include" });
      const p = await r.json().catch(() => null);
      if (!r.ok) { toast.error(p?.message || p?.error || "Failed."); return; }
      if (p?.order) {
        const normalized = normalizeOrderApiPayload(p.order as Order & { orderStatus?: string });
        setOrders(o => o.map(x => x.id === id ? { ...x, ...normalized } : x));
      }
      if (p?.invoiceUrl) window.open(p.invoiceUrl, "_blank", "noopener,noreferrer");
      toast.success("Invoice generated.");
    } catch { toast.error("Failed."); }
    finally { setGenInv(p => { const n = { ...p }; delete n[id]; return n; }); }
  };

  const reassignOrder = async (id: string) => {
    const rawTarget = String(transferTo[id] || "").trim();
    if (!rawTarget) { toast.error("Enter the target customer email, phone, or user id."); return; }
    const payload =
      rawTarget.includes("@")
        ? { customerEmail: rawTarget.toLowerCase() }
        : /^[0-9]{10}$/.test(rawTarget.replace(/\D/g, ""))
          ? { customerPhone: rawTarget.replace(/\D/g, "") }
          : /^[0-9a-f-]{36}$/i.test(rawTarget)
            ? { customerId: rawTarget }
            : null;
    if (!payload) { toast.error("Use a customer email, 10-digit phone number, or user id."); return; }
    setReassigning(prev => ({ ...prev, [id]: true }));
    try {
      const r = await fetch(`${API}/admin/orders/${id}/reassign-customer`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(payload),
      });
      const p = await r.json().catch(() => null);
      if (!r.ok) { toast.error(p?.message || p?.error || "Ownership transfer failed."); return; }
      if (p?.order) {
        const normalized = normalizeOrderApiPayload(p.order as Order & { orderStatus?: string });
        setOrders(current => current.map(item => item.id === id ? { ...item, ...normalized } : item));
        setTransferTo(current => ({ ...current, [id]: "" }));
      }
      toast.success("Order ownership updated.");
    } catch { toast.error("Ownership transfer failed."); }
    finally { setReassigning(prev => { const next = { ...prev }; delete next[id]; return next; }); }
  };

  const getAccountOwnerLabel = (o: Order) => {
    const name = o.userName || "Unknown";
    const sec  = o.userEmail || o.userPhone || "";
    return sec ? `${name} · ${sec}` : name;
  };

  const getDeliveryContactLabel = (o: Order) => {
    const dn = String(o.customerName || "").trim();
    const an = String(o.userName || "").trim();
    if (!dn) return null;
    if (an && dn.toLowerCase() === an.toLowerCase()) return null;
    return dn;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {([
          ["Live Orders",   liveO.length,  "text-orange-400"],
          ["Closed Orders", doneO.length,  "text-emerald-400"],
          ["Total Orders",  orders.length, "text-cyan-400"],
          ["Revenue",       INR(orders.filter(o => String(o.paymentStatus) === "PAID").reduce((s,o) => s + o.price, 0)), "text-purple-400"],
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
            placeholder="Search by product, customer, phone…"
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
          {ALL_ORDER_STATUSES.map(s => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
        </select>
        <button
          onClick={exportCSV}
          className={btn("border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 shrink-0")}
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Live orders */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-white">Live Orders</h3>
          <span className="text-xs font-bold bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1 rounded-full">
            {filteredLive.length}{filteredLive.length !== liveO.length ? ` / ${liveO.length}` : ""} pending
          </span>
        </div>

        <div className="space-y-4 max-h-[55vh] overflow-auto pr-1">
          {filteredLive.map(o => {
            const st        = oStatus[o.id] || o.status;
            const paid      = String(o.paymentStatus) === "PAID";
            const cancelled = o.status === "CANCELLED";
            const deliveryContact = getDeliveryContactLabel(o);
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
                      <span className={`ml-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc(o.status)}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                    </div>
                    <p className="text-xs text-slate-300">Account: {getAccountOwnerLabel(o)}</p>
                    {deliveryContact && <p className="text-xs text-amber-300">Delivery Contact: {deliveryContact}</p>}
                    <p className="text-xs text-slate-300">📞 {o.deliveryPhone}</p>
                    <p className="text-xs text-slate-400">📍 {o.deliveryAddress}</p>
                    <p className="text-xs text-slate-500">Placed: {new Date(o.createdAt).toLocaleString()}</p>
                    {paid && <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">✓ PAID</span>}
                  </div>
                  {/* Controls */}
                  <div className="flex flex-col gap-2 w-full lg:w-44 lg:shrink-0">
                    <select value={st}
                      onChange={e => { const s = e.target.value as Order["status"]; setOStatus(p => ({ ...p, [o.id]: s })); updateOrder(o.id, s); }}
                      disabled={cancelled}
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-100 disabled:opacity-40">
                      {ALL_ORDER_STATUSES.map((status) => <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>)}
                    </select>
                    <button onClick={() => confirmPay(o.id)} disabled={paid || !!confPay[o.id] || cancelled}
                      className={btn("border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40 w-full justify-center")}>
                      {paid ? "✓ Paid" : confPay[o.id] ? "Confirming…" : "Confirm Payment"}
                    </button>
                    <button onClick={() => genBill(o.id)} disabled={!!genInv[o.id] || cancelled}
                      className={btn("border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-40 w-full justify-center")}>
                      {genInv[o.id] ? "Generating…" : "Generate Bill"}
                    </button>
                    <input
                      value={transferTo[o.id] || ""}
                      onChange={(e) => setTransferTo(prev => ({ ...prev, [o.id]: e.target.value }))}
                      placeholder="Transfer by email / phone / user id"
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-[11px] text-slate-100 placeholder:text-slate-500"
                    />
                    <button
                      onClick={() => reassignOrder(o.id)}
                      disabled={!!reassigning[o.id]}
                      className={btn("border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 disabled:opacity-40 w-full justify-center")}>
                      {reassigning[o.id] ? "Reassigning…" : "Transfer Owner"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {!filteredLive.length && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg font-semibold">
                {searchQ || statusFilter !== "ALL" ? "No orders match your search 🔍" : "No live orders 🎉"}
              </p>
              {(searchQ || statusFilter !== "ALL") && (
                <button onClick={() => { setSearchQ(""); setStatusFilter("ALL"); }} className="text-cyan-400 text-sm mt-2 hover:underline">Clear filters</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Completed orders */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white">Closed Orders</h3>
          <span className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
            {filteredDone.length}{filteredDone.length !== doneO.length ? ` / ${doneO.length}` : ""} closed
          </span>
        </div>
        <div className="space-y-2 max-h-80 overflow-auto pr-1">
          {filteredDone.map(o => {
            const deliveryContact = getDeliveryContactLabel(o);
            return (
              <div key={o.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{o.productTitle}</p>
                    <p className="text-xs text-slate-400">{INR(o.price)} · {ORDER_STATUS_LABELS[o.status]}</p>
                    <p className="mt-1 text-xs text-slate-300">Account: {getAccountOwnerLabel(o)}</p>
                    {deliveryContact && <p className="text-xs text-amber-300">Delivery Contact: {deliveryContact}</p>}
                  </div>
                  {o.invoiceUrl && (
                    <button onClick={() => window.open(o.invoiceUrl!, "_blank")}
                      className={btn("border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shrink-0")}>
                      Invoice
                    </button>
                  )}
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={transferTo[o.id] || ""}
                    onChange={(e) => setTransferTo(prev => ({ ...prev, [o.id]: e.target.value }))}
                    placeholder="Transfer by email / phone / user id"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-[11px] text-slate-100 placeholder:text-slate-500"
                  />
                  <button
                    onClick={() => reassignOrder(o.id)}
                    disabled={!!reassigning[o.id]}
                    className={btn("border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 disabled:opacity-40 shrink-0 justify-center")}>
                    {reassigning[o.id] ? "Reassigning…" : "Transfer Owner"}
                  </button>
                </div>
              </div>
            );
          })}
          {!filteredDone.length && (
            <p className="text-slate-500 text-sm">
              {searchQ || statusFilter !== "ALL" ? "No closed orders match your search." : "No completed orders yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
