"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toast as hotToast } from "react-hot-toast";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";
import { useAuth } from "@/context/AuthContext";
import { getApiBase } from "@/lib/api";
import {
  getOrderStepIndex,
  normalizeOrderApiPayload,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STEPS,
  type OrderStatus,
} from "@/lib/order-status";

type ProductOrder = {
  id: string;
  productTitle: string;
  productImageUrl?: string | null;
  price: number;
  deliveryPhone: string;
  deliveryAddress: string;
  status: OrderStatus;
  paymentStatus?: string;
  stockQty?: number | null;
  internalNote?: string | null;
  invoiceUrl?: string | null;
  createdAt: string;
};

const STATUS_STEPS = ORDER_STATUS_STEPS.map((key) => ({
  key,
  label: ORDER_STATUS_LABELS[key],
}));

export default function OrdersPage() {
  const { user } = useAuth();
  const API = getApiBase();
  const [highlightId, setHighlightId] = useState("");
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setHighlightId(params.get("highlight") || "");
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
      const nextOrders = (Array.isArray(payload) ? payload : []).filter(Boolean).map((item) =>
        normalizeOrderApiPayload(item as ProductOrder & { orderStatus?: string }),
      );
      const order = nextOrders?.[0];
      console.log("Orders API:", nextOrders);
      console.log("Order status:", order?.status);
      nextOrders.forEach((item) => console.log("Customer order:", item?.status));
      setOrders(nextOrders);
    } catch {
      setOrders([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [API, user?.id]);

  useEffect(() => {
    void refreshOrders(true);
  }, [refreshOrders]);

  useEffect(() => {
    if (!user?.id || !API) return;
    const interval = window.setInterval(() => {
      void refreshOrders(false);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [API, refreshOrders, user?.id]);

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
      <main className="min-h-screen pt-20 md:pt-24 pb-16 flex flex-col font-sans bg-slate-50">
        <section className="bg-slate-900 border-b-4 border-blue-600 relative overflow-hidden py-12 md:py-20 mb-10">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-center flex flex-col items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Orders</span>
            </h1>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid gap-8">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={`order-skeleton-${i}`} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-4 w-64 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (!user?.id) {
    return (
      <main className="min-h-screen pt-20 md:pt-24 pb-16 flex flex-col font-sans bg-slate-50">
        <section className="bg-slate-900 border-b-4 border-blue-600 relative overflow-hidden py-12 md:py-20 mb-10">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-center flex flex-col items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Orders</span>
            </h1>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl mx-auto rounded-[2.5rem] border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-200/50">
            <h2 className="text-2xl font-black text-slate-900">Sign in to track your items</h2>
            <p className="mt-3 text-slate-600 font-medium">Please login to view your product orders, delivery timelines, and download your billing invoices.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 md:pt-24 pb-16 flex flex-col font-sans bg-slate-50">
      
      {/* PREMIUM HEADER */}
      <section className="bg-slate-900 border-b-4 border-blue-600 relative overflow-hidden py-12 md:py-20 mb-10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-center flex flex-col items-center gap-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Orders</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl mt-4">
            Track your appliance purchases, view live delivery statuses, and download your tax invoices.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8 md:gap-10">
        {orderedData.map((order) => {
          const currentStatus = order?.status ?? "PLACED";
          const stepIndex = getOrderStepIndex(currentStatus);
          const isHighlighted = highlightId && highlightId === order.id;
          const isPaid = String(order.paymentStatus || "PENDING") === "PAID";
          const isDelivered = currentStatus === "DELIVERED";
          const showStockBadge = !isPaid && !isDelivered;

          return (
            <article
              key={order.id}
              className={`rounded-[2.5rem] border bg-white p-8 md:p-10 transition-shadow duration-300 ${
                isHighlighted ? "border-blue-400 shadow-2xl shadow-blue-900/20" : "border-slate-200 shadow-xl shadow-slate-200/50"
              }`}
            >
              <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                <div className="flex flex-col gap-6">
                  
                  <div className="border-b border-slate-100 pb-6 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h2 className="text-2xl font-black text-slate-900 break-words flex-1 min-w-[200px]">{order.productTitle}</h2>
                      {showStockBadge && typeof order.stockQty === "number" && order.stockQty <= 0 && (
                        <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-600">
                           Out of Stock
                        </span>
                      )}
                      {showStockBadge &&
                        typeof order.stockQty === "number" &&
                        order.stockQty > 0 &&
                        order.stockQty <= 5 && (
                        <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
                          ⚡ Only {order.stockQty} left
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-black text-cyan-600">₹{Number(order.price || 0).toLocaleString("en-IN")}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm font-medium text-slate-600 border-b border-slate-100 pb-6">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Delivery Address</p>
                      <p className="text-slate-900 leading-relaxed">{order.deliveryAddress}</p>
                      <p className="mt-2 text-slate-500">📞 {order.deliveryPhone}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                      <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Order Details</p>
                      <p>Date: <span className="text-slate-900">{new Date(order.createdAt).toLocaleString()}</span></p>
                      <p className="mt-1">
                        Payment: <strong className={isPaid ? "text-emerald-600" : "text-amber-500"}>{order.paymentStatus || "PENDING"}</strong>
                      </p>
                      {order?.status === "CANCELLED" && (
                        <p className="mt-2 text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded inline-flex">
                          Refund initiating in 3-5 days.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {String(order.paymentStatus || "PENDING") !== "PAID" && order?.status !== "CANCELLED" && (
                      <button
                        type="button"
                        disabled={payingOrderId === order.id || (typeof order.stockQty === "number" && order.stockQty <= 0)}
                        onClick={() => handlePay(order)}
                        className="w-full sm:w-auto rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-8 py-3 text-sm font-black tracking-wide text-white transition-transform hover:bg-emerald-400 active:translate-y-1 active:border-b-0 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {typeof order.stockQty === "number" && order.stockQty <= 0
                          ? "Unavailable"
                          : payingOrderId === order.id
                            ? "Processing..."
                            : "Pay Securely via Razorpay"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const url = order.invoiceUrl || `${API}/orders/my/invoice/${order.id}`;
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                      className="w-full sm:w-auto rounded-2xl border-2 border-cyan-200 bg-cyan-50 px-8 py-3 text-sm font-bold text-cyan-800 transition-colors hover:bg-cyan-100 hover:border-cyan-300"
                    >
                      Download GST Bill
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-6 shadow-inner flex flex-col justify-center">
                  <p className="text-xs uppercase tracking-[0.18em] text-blue-600 font-bold mb-6 text-center">Live Tracker</p>
                  <div className="space-y-6 relative ml-4">
                    {/* Connecting line */}
                    <div className="absolute left-2.5 top-2 bottom-6 w-0.5 bg-slate-200 -z-10"></div>
                    
                    {STATUS_STEPS.map((step, index) => {
                      const done = index <= stepIndex;
                      const active = index === stepIndex;
                      return (
                        <div key={step.key} className="flex items-center gap-4 relative">
                          <span
                            className={`h-5 w-5 rounded-full border-4 shadow-sm z-10 ${
                              done 
                                ? active ? "bg-white border-blue-500 shadow-blue-300" : "bg-blue-500 border-blue-500" 
                                : "bg-slate-100 border-slate-300"
                            }`}
                          />
                          <p className={`text-base flex-1 ${
                            done 
                              ? active ? "text-blue-700 font-black" : "text-slate-800 font-bold" 
                              : "text-slate-400 font-medium"
                          }`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {!loading && !orderedData.length && (
          <div className="rounded-[2.5rem] border border-dashed border-slate-300 bg-slate-100/50 py-20 px-6 text-center shadow-inner">
            <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
               📦
            </div>
            <h3 className="text-xl font-bold text-slate-800">No active products found</h3>
            <p className="mt-2 text-slate-500 font-medium">Head to the Showroom to browse premium appliances.</p>
          </div>
        )}
      </div>
    </main>
  );
}
