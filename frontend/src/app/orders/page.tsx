"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toast as hotToast } from "react-hot-toast";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";

type OrderStatus = "ORDER_PLACED" | "DISPATCHED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

type ProductOrder = {
  id: string;
  productTitle: string;
  productImageUrl?: string | null;
  price: number;
  deliveryPhone: string;
  deliveryAddress: string;
  orderStatus: OrderStatus;
  paymentStatus?: string;
  stockQty?: number | null;
  internalNote?: string | null;
  invoiceUrl?: string | null;
  createdAt: string;
};

const STATUS_STEPS: Array<{ key: OrderStatus; label: string }> = [
  { key: "ORDER_PLACED", label: "Order Placed" },
  { key: "DISPATCHED", label: "Dispatched" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

const getStepIndex = (status: OrderStatus) => {
  if (status === "CANCELLED") return 0;
  const index = STATUS_STEPS.findIndex((step) => step.key === status);
  return index >= 0 ? index : 0;
};

const API = process.env.NEXT_PUBLIC_API_URL;

export default function OrdersPage() {
  const [highlightId, setHighlightId] = useState("");
  const [user, setUser] = useState<{ id: string; name?: string } | null>(null);
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setHighlightId(params.get("highlight") || "");
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    try {
      setUser(raw ? (JSON.parse(raw) as { id: string; name?: string }) : null);
    } catch {
      setUser(null);
    }
  }, []);

  const refreshOrders = useCallback(async (showLoader = false) => {
    if (!user?.id) {
      if (showLoader) setLoading(false);
      return;
    }
    if (!API) {
      if (showLoader) setLoading(false);
      return;
    }
    if (showLoader) setLoading(true);
    try {
      const res = await fetch(`${API}/orders/my`, { credentials: "include" });
      const payload = await res.json().catch(() => []);
      setOrders(Array.isArray(payload) ? payload : []);
    } catch {
      setOrders([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refreshOrders(true);
  }, [refreshOrders]);

  const handlePay = async (order: ProductOrder) => {
    if (!API) {
      toast.error("API unavailable.");
      return;
    }
    if (typeof order.stockQty === "number" && order.stockQty <= 0) {
      hotToast.error("This item just went out of stock.");
      return;
    }
    setPayingOrderId(order.id);
    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        toast.error("Failed to load Razorpay checkout.");
        return;
      }

      const orderRes = await fetch(`${API}/orders/${order.id}/razorpay`, {
        method: "POST",
        credentials: "include",
      });
      const orderPayload = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        if (orderRes.status === 409) {
          hotToast.error(orderPayload?.error || "This item is out of stock.");
        } else {
          toast.error(orderPayload?.error || "Unable to start Razorpay payment.");
        }
        return;
      }

      const razorpayOrder = orderPayload?.razorpayOrder;
      const keyId = orderPayload?.keyId;
      if (!razorpayOrder?.id || !keyId) {
        toast.error("Razorpay order not initialized.");
        return;
      }

      const paymentResponse = await openRazorpayCheckout({
        key: keyId,
        amount: Number(razorpayOrder.amount || 0),
        currency: razorpayOrder.currency || "INR",
        name: "Golden Refrigeration",
        description: order.productTitle,
        order_id: razorpayOrder.id,
      });

      const verifyRes = await fetch(`${API}/orders/${order.id}/razorpay/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(paymentResponse),
      });
      const verifyPayload = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) {
        toast.error(verifyPayload?.error || "Payment verification failed.");
        return;
      }
      if (verifyPayload?.success === false) {
        hotToast.error(verifyPayload?.message || "Order cancelled due to stock unavailability.");
        await refreshOrders(false);
        return;
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("products:refresh"));
      }
      toast.success("Payment verified. Thank you!");
      await refreshOrders(false);
    } catch (error: any) {
      const message = String(error?.message || "").toLowerCase();
      if (message.includes("cancel")) {
        toast.error("Payment cancelled.");
      } else {
        toast.error("Payment could not be completed.");
      }
    } finally {
      setPayingOrderId(null);
    }
  };

  const orderedData = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders],
  );

  if (loading) {
    return (
      <main className="min-h-screen pt-20 md:pt-24 pb-12 flex flex-col bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-16 grid gap-6 md:gap-8">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={`order-skeleton-${i}`} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="h-6 w-48 animate-pulse rounded bg-slate-700" />
              <div className="mt-3 h-4 w-32 animate-pulse rounded bg-slate-700" />
              <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-800" />
              <div className="mt-5 flex items-center gap-2 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                <span className="text-sm">Preparing live delivery timeline...</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (!user?.id) {
    return (
      <main className="min-h-screen pt-20 md:pt-24 pb-12 flex flex-col bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-16">
          <div className="max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
          <h1 className="text-3xl font-black text-white">My Orders / Delivery Tracker</h1>
          <p className="mt-3 text-slate-300">Please login to view your product orders and live delivery status.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 md:pt-24 pb-12 flex flex-col bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8 md:gap-12">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 font-semibold">E-Commerce</p>
          <h1 className="text-3xl font-black mt-2">My Orders / Delivery Tracker</h1>
          <p className="text-sm text-slate-300 mt-2">Track each purchase from placement to final delivery.</p>
        </section>

        <section className="flex flex-col gap-6 md:gap-8">
          {orderedData.map((order) => {
            const stepIndex = getStepIndex(order.orderStatus);
            const isHighlighted = highlightId && highlightId === order.id;
            const isPaid = String(order.paymentStatus || "PENDING") === "PAID";
            const isDelivered = order.orderStatus === "DELIVERED";
            const showStockBadge = !isPaid && !isDelivered;
            return (
              <article
                key={order.id}
                className={`rounded-2xl border p-5 bg-slate-900/70 ${
                  isHighlighted ? "border-cyan-400/60 shadow-lg shadow-cyan-900/20" : "border-slate-800"
                }`}
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-bold text-white">{order.productTitle}</p>
                      {showStockBadge && typeof order.stockQty === "number" && order.stockQty <= 0 && (
                        <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-red-200">
                          ❌ Out of Stock
                        </span>
                      )}
                      {showStockBadge &&
                        typeof order.stockQty === "number" &&
                        order.stockQty > 0 &&
                        order.stockQty <= 5 && (
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-amber-200">
                          ⚠️ Only {order.stockQty} left!
                        </span>
                      )}
                    </div>
                    <p className="text-cyan-300 font-semibold">₹{Number(order.price || 0).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-slate-300">Delivery Phone: {order.deliveryPhone}</p>
                    <p className="text-xs text-slate-300">Delivery Address: {order.deliveryAddress}</p>
                    <p className="text-xs text-slate-400">Ordered on {new Date(order.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-slate-300">
                      Payment: <span className="font-semibold">{order.paymentStatus || "PENDING"}</span>
                    </p>
                    {order.orderStatus === "CANCELLED" && (
                      <p className="text-xs text-red-300">
                        We're sorry! This item is out of stock. Your refund will reflect in 3-5 business days.
                      </p>
                    )}
                    <div className="pt-1">
                      {String(order.paymentStatus || "PENDING") !== "PAID" && order.orderStatus !== "CANCELLED" && (
                        <button
                          type="button"
                          disabled={payingOrderId === order.id || (typeof order.stockQty === "number" && order.stockQty <= 0)}
                          onClick={() => handlePay(order)}
                          className="mb-2 w-full rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60"
                        >
                          {typeof order.stockQty === "number" && order.stockQty <= 0
                            ? "Currently Unavailable"
                            : payingOrderId === order.id
                              ? "Processing Payment..."
                              : "Pay via Razorpay"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const url = order.invoiceUrl || `${process.env.NEXT_PUBLIC_API_URL}/orders/my/invoice/${order.id}`;
                          window.open(url, "_blank", "noopener,noreferrer");
                        }}
                        className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20"
                      >
                        Download Bill
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold mb-3">Delivery Progress</p>
                    <div className="space-y-3">
                      {STATUS_STEPS.map((step, index) => {
                        const done = index <= stepIndex;
                        const last = index === STATUS_STEPS.length - 1;
                        return (
                          <div key={step.key} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <span
                                className={`h-3 w-3 rounded-full border ${done ? "bg-cyan-400 border-cyan-300" : "bg-slate-800 border-slate-600"}`}
                              />
                              {!last && (
                                <span className={`mt-1 h-8 w-[2px] ${done ? "bg-cyan-400/80" : "bg-slate-700"}`} />
                              )}
                            </div>
                            <p className={`text-sm ${done ? "text-slate-100 font-semibold" : "text-slate-400"}`}>{step.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          {!orderedData.length && (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-10 text-center text-slate-400">
              No product orders found yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
