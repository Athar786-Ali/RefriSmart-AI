"use client";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Send,
  Truck,
  User,
  X,
} from "lucide-react";
import { btn, inp, INR } from "./_types";
import type { SectionProps, SellOffer, SellReq } from "./_types";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  REQUESTED: { label: "Awaiting Review", color: "border-yellow-500/30 text-yellow-400 bg-yellow-500/10" },
  OFFER_SENT: { label: "Offer Sent", color: "border-blue-500/30 text-blue-400 bg-blue-500/10" },
  ACCEPTED: { label: "Customer Accepted", color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
  REJECTED: { label: "Offer Rejected", color: "border-red-500/30 text-red-400 bg-red-500/10" },
  REFURBISHED_LISTED: { label: "In Inventory", color: "border-purple-500/30 text-purple-400 bg-purple-500/10" },
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not scheduled" : date.toLocaleString();
};

const getLatestOffer = (request: SellReq): SellOffer | null => request.latestOffer || request.offers?.[0] || null;
const getPendingOffer = (request: SellReq): SellOffer | null =>
  request.pendingOffer || request.offers?.find((offer) => offer.status === "PENDING") || null;

export function SellSection({ sells, setSells, API }: SectionProps) {
  const requests = sells as SellReq[];
  const [offerPrice, setOfferPrice] = useState<Record<string, string>>({});
  const [pickupSlot, setPickupSlot] = useState<Record<string, string>>({});
  const [sending,    setSending]    = useState<Record<string, boolean>>({});
  const [confirming, setConfirming] = useState<Record<string, boolean>>({});
  const [expanded,   setExpanded]   = useState<Record<string, boolean>>({});
  const [searchQ,    setSearchQ]    = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filterFn = (r: SellReq) => {
    const q = searchQ.toLowerCase();
    const matchSearch = !q || [r.applianceType, r.brandModel, r.contactName, r.customer?.name, r.customer?.email, r.address]
      .some(v => v?.toLowerCase().includes(q));
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  };

  const activeRequests   = useMemo(() => requests.filter(r => r.status !== "REFURBISHED_LISTED" && filterFn(r)), [requests, searchQ, statusFilter]);
  const archivedRequests = useMemo(() => requests.filter(r => r.status === "REFURBISHED_LISTED" && filterFn(r)), [requests, searchQ, statusFilter]);
  const allActive        = requests.filter(r => r.status !== "REFURBISHED_LISTED");

  /* ── Send offer to customer ── */
  const sendOffer = async (request: SellReq) => {
    const price = offerPrice[request.id];
    if (!price || Number(price) <= 0) {
      toast.error("Enter a valid offer price.");
      return;
    }

    setSending((prev) => ({ ...prev, [request.id]: true }));
    try {
      const body: Record<string, unknown> = { offerPrice: Number(price) };
      if (pickupSlot[request.id]) body.pickupSlot = pickupSlot[request.id];

      const response = await fetch(`${API}/sell/requests/${request.id}/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.error || "Failed to send offer.");
        return;
      }

      if (payload?.request) {
        setSells((current) => current.map((item) => (item.id === request.id ? (payload.request as SellReq) : item)));
      }
      setOfferPrice((prev) => ({ ...prev, [request.id]: "" }));
      setPickupSlot((prev) => ({ ...prev, [request.id]: "" }));
      toast.success("Offer sent to customer. They will see it on the sell page.");
    } catch {
      toast.error("Failed to send offer.");
    } finally {
      setSending((prev) => {
        const next = { ...prev };
        delete next[request.id];
        return next;
      });
    }
  };

  /* ── Move to refurbished inventory (after admin confirms pickup) ── */
  const moveRefurb = async (request: SellReq) => {
    setConfirming((prev) => ({ ...prev, [request.id]: true }));
    try {
      const response = await fetch(`${API}/sell/requests/${request.id}/move-to-refurbished`, {
        method: "POST",
        credentials: "include",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.error || "Failed to confirm pickup.");
        return;
      }

      if (payload?.request) {
        setSells((current) => current.map((item) => (item.id === request.id ? (payload.request as SellReq) : item)));
      }
      toast.success("Pickup confirmed. Appliance moved to refurbished inventory.");
    } catch {
      toast.error("Failed to confirm pickup.");
    } finally {
      setConfirming((prev) => {
        const next = { ...prev };
        delete next[request.id];
        return next;
      });
    }
  };

  const toggleExpand = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {([
          ["Total", requests.length, "text-cyan-400"],
          ["New Requests", requests.filter((r) => r.status === "REQUESTED").length, "text-yellow-400"],
          ["Offer Sent", requests.filter((r) => r.status === "OFFER_SENT").length, "text-blue-400"],
          ["Accepted", requests.filter((r) => r.status === "ACCEPTED").length, "text-emerald-400"],
        ] as [string, number, string][]).map(([label, value, color]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1 sm:mb-2 truncate">{label}</p>
            <p className={`text-xl sm:text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Customer sell page link ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 sm:px-5 py-3">
        <div className="min-w-0">
          <p className="text-emerald-300 font-bold text-sm">Customer Sell Page</p>
          <p className="text-emerald-400/60 text-xs">Customers upload photos, track offers, and accept/reject from here.</p>
        </div>
        <a
          href="/sell"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl transition-all shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" /> View Sell Page
        </a>
      </div>

      {/* ── Search & Filter toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search by appliance, brand, customer…"
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
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* ── Active requests ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-white">Active Sell Requests</h3>
          <span className="text-xs font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
            {activeRequests.length}{activeRequests.length !== allActive.length ? ` / ${allActive.length}` : ""} active
          </span>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-auto pr-1">
          {activeRequests.map((request) => {
            const statusMeta = STATUS_MAP[request.status] ?? {
              label: request.status,
              color: "border-slate-700 text-slate-400 bg-slate-800/70",
            };
            const isExpanded = !!expanded[request.id];
            const latestOffer = getLatestOffer(request);
            const pendingOffer = getPendingOffer(request);
            const customerName = request.contactName || request.customer?.name || "Unknown customer";
            const customerAddress = request.address;

            return (
              <div
                key={request.id}
                className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden hover:border-cyan-500/20 transition-all"
              >
                {/* ── Card header (always visible) ── */}
                <button className="w-full flex items-start gap-4 p-4 text-left" onClick={() => toggleExpand(request.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white">{request.applianceType}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.color}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 truncate">{request.brandModel}</p>

                    {/* Customer name & address — always visible */}
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <User className="w-3 h-3 text-cyan-500" />
                        {customerName}
                      </span>
                      {customerAddress && (
                        <span className="flex items-center gap-1 text-xs text-slate-400 truncate max-w-xs">
                          <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                          {customerAddress}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(request.createdAt).toLocaleString()}
                      {request.pincode ? ` · PIN ${request.pincode}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {latestOffer ? (
                      <p className="text-blue-400 font-black text-sm">Offered {INR(latestOffer.offerPrice)}</p>
                    ) : request.expectedPrice ? (
                      <p className="text-cyan-400 font-black text-sm">Wants {INR(request.expectedPrice)}</p>
                    ) : null}
                    <span className="text-slate-500 text-xs">{isExpanded ? "▲ Collapse" : "▼ Details"}</span>
                  </div>
                </button>

                {/* ── Expanded details ── */}
                {isExpanded && (
                  <div className="border-t border-slate-700/50 p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {/* Left column */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Condition</p>
                          <p className="text-slate-200">{request.conditionNote || "—"}</p>
                        </div>

                        {/* Customer details */}
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Customer Details</p>
                          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-3 space-y-1.5">
                            <p className="text-slate-200 font-semibold flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-cyan-400" />
                              {customerName}
                            </p>
                            {request.customer?.email && (
                              <p className="text-slate-400 text-xs flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5" /> {request.customer.email}
                              </p>
                            )}
                            {request.customer?.phone && (
                              <p className="text-slate-400 text-xs flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5" /> {request.customer.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Pickup address */}
                        {customerAddress ? (
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Pickup Address</p>
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                              <p className="text-emerald-200 whitespace-pre-line text-sm flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                {customerAddress}
                                {request.pincode ? ` — PIN ${request.pincode}` : ""}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-500">
                            No pickup address provided by customer.
                          </div>
                        )}

                        {request.expectedPrice ? (
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Customer's Expected Price</p>
                            <p className="text-cyan-400 font-black text-lg">{INR(request.expectedPrice)}</p>
                          </div>
                        ) : null}
                      </div>

                      {/* Right column — photo */}
                      <div className="space-y-3">
                        {request.imageUrl ? (
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Appliance Photo</p>
                            <img
                              src={request.imageUrl}
                              alt={request.applianceType}
                              className="w-full max-w-xs h-44 object-cover rounded-xl border border-slate-700"
                              onError={(e) => {
                                const el = e.target as HTMLImageElement;
                                el.style.display = "none";
                                const placeholder = el.nextElementSibling as HTMLElement | null;
                                if (placeholder) placeholder.style.display = "flex";
                              }}
                            />
                            <div
                              style={{ display: "none" }}
                              className="w-full max-w-xs h-44 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-xs text-slate-500"
                            >
                              Image failed to load
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-700 p-4 text-xs text-slate-500 h-24 flex items-center justify-center">
                            No photo uploaded by customer.
                          </div>
                        )}

                        {/* Offer history */}
                        {request.offers && request.offers.length > 0 && (
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Offer History</p>
                            <div className="space-y-1.5">
                              {request.offers.map((offer) => (
                                <div key={offer.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs">
                                  <span className="font-bold text-white">{INR(offer.offerPrice)}</span>
                                  <span className="text-slate-400">{formatDate(offer.pickupSlot)}</span>
                                  <span className={`ml-auto font-semibold ${offer.status === "ACCEPTED" ? "text-emerald-400" : offer.status === "REJECTED" ? "text-red-400" : "text-blue-300"}`}>
                                    {offer.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Latest offer summary ── */}
                    {latestOffer && (
                      <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Latest Offer Sent</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="text-blue-300 font-black text-xl">{INR(latestOffer.offerPrice)}</span>
                          <span className="text-slate-400">Pickup: {formatDate(latestOffer.pickupSlot)}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            latestOffer.status === "ACCEPTED"
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                              : latestOffer.status === "REJECTED"
                              ? "border-red-500/30 text-red-400 bg-red-500/10"
                              : "border-blue-500/30 text-blue-400 bg-blue-500/10"
                          }`}>
                            Customer: {latestOffer.status}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* ── Admin action panel ── */}

                    {/* Case 1: Customer ACCEPTED → Admin confirms */}
                    {request.status === "ACCEPTED" && (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 text-emerald-300 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Customer accepted the offer!</p>
                            <p className="text-emerald-400/70 text-xs mt-0.5">
                              Customer: <strong>{customerName}</strong>
                              {customerAddress ? ` · ${customerAddress}` : ""}
                            </p>
                            <p className="text-emerald-400/60 text-xs mt-1">
                              Click "Confirm Deal" once you have coordinated the pickup with the customer.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => moveRefurb(request)}
                          disabled={!!confirming[request.id]}
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold disabled:opacity-50 transition-all shadow-lg shadow-emerald-900/30"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {confirming[request.id] ? "Confirming…" : "✅ Confirm Deal"}
                        </button>
                      </div>
                    )}

                    {/* Case 2: Pending / Offer sent → Send offer form */}
                    {(request.status === "REQUESTED" || request.status === "OFFER_SENT" || request.status === "REJECTED") && (
                      <div className="space-y-3">
                        {pendingOffer && request.status === "OFFER_SENT" && (
                          <div className="flex items-center gap-2 text-blue-400 text-sm bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>Offer visible to customer. Waiting for their response.</span>
                          </div>
                        )}

                        {request.status === "REJECTED" && (
                          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>Customer rejected the last offer. Send an updated offer to continue.</span>
                          </div>
                        )}

                        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 space-y-3">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                            {pendingOffer ? "Update Offer Price" : "Send Offer to Customer"}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <input
                              value={offerPrice[request.id] ?? ""}
                              onChange={(event) => setOfferPrice((prev) => ({ ...prev, [request.id]: event.target.value }))}
                              placeholder={pendingOffer ? "Update offer price ₹" : "Offer price ₹"}
                              type="number"
                              min="0"
                              className={`${inp} flex-1 min-w-32`}
                            />
                            <input
                              value={pickupSlot[request.id] ?? ""}
                              onChange={(event) => setPickupSlot((prev) => ({ ...prev, [request.id]: event.target.value }))}
                              type="date"
                              className={`${inp} flex-1 min-w-36`}
                            />
                          </div>
                          <button
                            onClick={() => sendOffer(request)}
                            disabled={!!sending[request.id]}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold disabled:opacity-50 transition-all"
                          >
                            <Send className="w-4 h-4" />
                            {sending[request.id] ? "Sending…" : pendingOffer ? "Update Offer" : "Send Offer to Customer"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!activeRequests.length && (
            <div className="text-center py-16">
              <RefreshCw className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-base font-semibold">
                {searchQ || statusFilter !== "ALL" ? "No requests match your search 🔍" : "No active sell requests"}
              </p>
              {searchQ || statusFilter !== "ALL" ? (
                <button onClick={() => { setSearchQ(""); setStatusFilter("ALL"); }} className="text-cyan-400 text-sm mt-2 hover:underline">Clear filters</button>
              ) : (
                <p className="text-slate-600 text-sm mt-1">
                  Share the{" "}
                  <a href="/sell" className="text-emerald-400 hover:underline" target="_blank" rel="noreferrer">Sell Page</a>{" "}
                  with customers to start receiving requests.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Archived / processed requests ── */}
      {archivedRequests.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="text-base font-black text-slate-400 mb-4">Processed Requests ({archivedRequests.length})</h3>
          <div className="space-y-2 max-h-60 overflow-auto pr-1">
            {archivedRequests.map((request) => {
              const statusMeta = STATUS_MAP[request.status] ?? {
                label: request.status,
                color: "border-slate-700 text-slate-400 bg-slate-800/70",
              };
              return (
                <div key={request.id} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {request.applianceType} · {request.brandModel}
                    </p>
                    <p className="text-xs text-slate-500">
                      {request.contactName || request.customer?.name || "Unknown"} · {new Date(request.createdAt).toLocaleDateString()}
                      {request.address ? ` · ${request.address}` : ""}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusMeta.color}`}>
                    {statusMeta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
