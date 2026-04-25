"use client";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Send, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { inp, btn, INR } from "./_types";
import type { SectionProps } from "./_types";

// Actual fields from SellRequest table
type SellRequest = {
  id: string;
  applianceType: string;
  brandModel: string;
  conditionNote: string;
  expectedPrice?: number | null;
  pincode?: string | null;
  imageUrl?: string | null;
  status: string;
  createdAt: string;
  userId?: string | null;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  REQUESTED:            { label: "New Request",      color: "border-yellow-500/30 text-yellow-400 bg-yellow-500/10" },
  OFFER_SENT:           { label: "Offer Sent",        color: "border-blue-500/30 text-blue-400 bg-blue-500/10" },
  OFFER_ACCEPTED:       { label: "Offer Accepted",    color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
  OFFER_REJECTED:       { label: "Offer Rejected",    color: "border-red-400/30 text-red-400 bg-red-500/10" },
  MOVED_TO_REFURBISHED: { label: "In Inventory",      color: "border-purple-500/30 text-purple-400 bg-purple-500/10" },
  REJECTED:             { label: "Rejected",          color: "border-slate-600 text-slate-500 bg-slate-800" },
};

export function SellSection({ sells, setSells, API }: SectionProps) {
  const requests = sells as unknown as SellRequest[];
  const [offerPrice,   setOfferPrice]   = useState<Record<string, string>>({});
  const [pickupSlot,   setPickupSlot]   = useState<Record<string, string>>({});
  const [sending,      setSending]      = useState<Record<string, boolean>>({});
  const [expanded,     setExpanded]     = useState<Record<string, boolean>>({});

  const pending  = requests.filter(r => !["MOVED_TO_REFURBISHED", "REJECTED"].includes(r.status));
  const archived = requests.filter(r =>  ["MOVED_TO_REFURBISHED", "REJECTED"].includes(r.status));

  const sendOffer = async (id: string) => {
    const price = offerPrice[id];
    if (!price || isNaN(Number(price)) || Number(price) <= 0) return toast.error("Enter a valid offer price.");
    setSending(p => ({ ...p, [id]: true }));
    try {
      const body: Record<string, unknown> = { offerPrice: Number(price) };
      if (pickupSlot[id]) body.pickupSlot = pickupSlot[id];
      const r = await fetch(`${API}/sell/requests/${id}/offer`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(body),
      });
      const p = await r.json().catch(() => null);
      if (!r.ok) return toast.error(p?.error || "Failed to send offer.");
      toast.success("Offer sent to customer!");
      setSells(s => s.map(x => x.id === id ? { ...x, status: "OFFER_SENT", offerPrice: Number(price) } as any : x));
      setOfferPrice(p => { const n = { ...p }; delete n[id]; return n; });
    } catch { toast.error("Failed to send offer."); }
    finally { setSending(p => { const n = { ...p }; delete n[id]; return n; }); }
  };

  const moveRefurb = async (id: string) => {
    try {
      const r = await fetch(`${API}/sell/requests/${id}/move-to-refurbished`, {
        method: "POST", credentials: "include",
      });
      const p = await r.json().catch(() => null);
      if (!r.ok) return toast.error(p?.error || "Failed.");
      toast.success("Moved to refurbished inventory!");
      setSells(s => s.map(x => x.id === id ? { ...x, status: "MOVED_TO_REFURBISHED" } as any : x));
    } catch { toast.error("Failed."); }
  };

  const toggleExpand = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {([
          ["Total",          requests.length, "text-cyan-400"],
          ["New / Pending",  pending.filter(r => r.status === "REQUESTED").length, "text-yellow-400"],
          ["Offer Sent",     requests.filter(r => r.status === "OFFER_SENT").length,  "text-blue-400"],
          ["In Inventory",   requests.filter(r => r.status === "MOVED_TO_REFURBISHED").length, "text-purple-400"],
        ] as [string, number, string][]).map(([l, v, c]) => (
          <div key={l} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">{l}</p>
            <p className={`text-2xl font-black ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      {/* Link to customer sell page */}
      <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3">
        <div>
          <p className="text-emerald-300 font-bold text-sm">Customer Sell Page</p>
          <p className="text-emerald-400/60 text-xs">Customers submit appliances via this page</p>
        </div>
        <a href="/sell" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl transition-all">
          <ExternalLink className="w-3.5 h-3.5" /> View Page
        </a>
      </div>

      {/* Active requests */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-white">Active Sell Requests</h3>
          <span className="text-xs font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
            {pending.length} active
          </span>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-auto pr-1">
          {pending.map(req => {
            const sm = STATUS_MAP[req.status] ?? { label: req.status, color: "border-slate-700 text-slate-400" };
            const isExpanded = !!expanded[req.id];
            const offerSent = req.status === "OFFER_SENT";
            const accepted  = req.status === "OFFER_ACCEPTED";
            return (
              <div key={req.id} className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden hover:border-cyan-500/20 transition-all">

                {/* Header row — always visible */}
                <button className="w-full flex items-center gap-4 p-4 text-left" onClick={() => toggleExpand(req.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white">{req.applianceType}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sm.color}`}>{sm.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{req.brandModel}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(req.createdAt).toLocaleString()} · {req.pincode ? `📍 ${req.pincode}` : ""}
                    </p>
                  </div>
                  {req.expectedPrice && (
                    <p className="text-cyan-400 font-black text-sm shrink-0">
                      Wants {INR(req.expectedPrice)}
                    </p>
                  )}
                  <span className="text-slate-500 text-xs shrink-0">{isExpanded ? "▲" : "▼"}</span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-700/50 p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Condition Note</p>
                        <p className="text-slate-200">{req.conditionNote || "—"}</p>
                      </div>
                      {req.expectedPrice && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Customer Expects</p>
                          <p className="text-cyan-400 font-black">{INR(req.expectedPrice)}</p>
                        </div>
                      )}
                    </div>

                    {/* Image */}
                    {req.imageUrl && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Appliance Photo</p>
                        <img src={req.imageUrl} alt={req.applianceType} className="w-40 h-32 object-cover rounded-xl border border-slate-700" />
                      </div>
                    )}

                    {/* Offer form */}
                    {!["MOVED_TO_REFURBISHED", "REJECTED", "OFFER_ACCEPTED"].includes(req.status) && (
                      <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 space-y-3">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Send Offer to Customer</p>
                        <div className="flex gap-2 flex-wrap">
                          <input
                            value={offerPrice[req.id] ?? ""}
                            onChange={e => setOfferPrice(p => ({ ...p, [req.id]: e.target.value }))}
                            placeholder={offerSent ? "Update offer ₹" : "Offer price ₹"}
                            type="number" min="0"
                            className={`${inp} flex-1 min-w-32`}
                          />
                          <input
                            value={pickupSlot[req.id] ?? ""}
                            onChange={e => setPickupSlot(p => ({ ...p, [req.id]: e.target.value }))}
                            placeholder="Pickup date/slot (optional)"
                            type="date"
                            className={`${inp} flex-1 min-w-36`}
                          />
                        </div>
                        <button
                          onClick={() => sendOffer(req.id)}
                          disabled={!!sending[req.id]}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold disabled:opacity-50 transition-all">
                          <Send className="w-4 h-4" />
                          {sending[req.id] ? "Sending…" : offerSent ? "Update Offer" : "Send Offer"}
                        </button>
                      </div>
                    )}

                    {/* Status messages */}
                    {offerSent && (
                      <div className="flex items-center gap-2 text-blue-400 text-sm bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Offer has been sent. Waiting for customer response.</span>
                      </div>
                    )}
                    {accepted && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Customer accepted! Schedule pickup and move to inventory.</span>
                        </div>
                        <button
                          onClick={() => moveRefurb(req.id)}
                          className={btn("border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 flex items-center gap-2")}>
                          <RefreshCw className="w-4 h-4" /> Move to Refurbished Inventory
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {!pending.length && (
            <div className="text-center py-16">
              <RefreshCw className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-base font-semibold">No active sell requests</p>
              <p className="text-slate-600 text-sm mt-1">Share the <a href="/sell" className="text-emerald-400 hover:underline" target="_blank">Sell Page</a> with customers to start receiving requests.</p>
            </div>
          )}
        </div>
      </div>

      {/* Archived / processed */}
      {archived.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="text-base font-black text-slate-400 mb-4">Processed Requests ({archived.length})</h3>
          <div className="space-y-2 max-h-60 overflow-auto pr-1">
            {archived.map(req => {
              const sm = STATUS_MAP[req.status] ?? { label: req.status, color: "border-slate-700 text-slate-400" };
              return (
                <div key={req.id} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{req.applianceType} · {req.brandModel}</p>
                    <p className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${sm.color}`}>{sm.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
