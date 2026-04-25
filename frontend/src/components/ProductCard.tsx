"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// Issue #22 Fix: Removed react-hot-toast. Two separate toast libraries were running
// simultaneously, causing duplicate containers and bloating the bundle.
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";
import { useAuth } from "@/context/AuthContext";
import type { NormalizedProduct, Product } from "@/types";

export type ProductCardItem = Product;

type ProductCardProps = {
  product: NormalizedProduct;
};

const API = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_CERTIFICATE_LINE = "Tested & Certified: Cooling system and compressor working properly.";

const getImageUrl = (images: unknown): string | null => {
  if (Array.isArray(images) && typeof images[0] === "string" && images[0].trim()) {
    return images[0].trim();
  }
  if (typeof images === "string" && images.trim()) {
    return images.trim();
  }
  return null;
};

const transformCloudinaryImage = (url: string | null) => {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  return url.replace("/upload/", "/upload/f_webp,q_auto:good,c_limit,w_900/");
};

const getShopWarrantyLine = (product: ProductCardProps["product"]) => {
  const expiry = product.warrantyExpiry ? new Date(product.warrantyExpiry) : null;
  const purchase = product.createdAt ? new Date(product.createdAt) : new Date();
  if (!expiry || Number.isNaN(expiry.getTime()) || Number.isNaN(purchase.getTime())) {
    return "Shop Warranty - Golden Refrigeration (From Date of Purchase)";
  }

  let months =
    (expiry.getFullYear() - purchase.getFullYear()) * 12 +
    (expiry.getMonth() - purchase.getMonth());
  if (expiry.getDate() < purchase.getDate()) months -= 1;
  if (months <= 0) {
    months = Math.max(1, Math.round((expiry.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  }
  return `${months}-Month Shop Warranty - Golden Refrigeration (From Date of Purchase)`;
};

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const imageUrl = transformCloudinaryImage(getImageUrl(product.images));
  const numericStock = typeof product.stockQty === "number" ? product.stockQty : null;
  const isOutOfStock = numericStock !== null && numericStock <= 0;
  const isLowStock = numericStock !== null && numericStock > 0 && numericStock <= 5;
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) {
      setFullName((prev) => prev || user.name || "");
    }
  }, [user?.name]);

  const checkoutAmount = Number(product.price || 0);

  const openCheckout = () => {
    if (isOutOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }
    if (!user?.id) {
      toast.error("Please login first to buy products.");
      router.push("/login");
      return;
    }
    setCheckoutStep(1);
    setCheckoutOpen(true);
  };

  const closeCheckout = () => {
    if (placingOrder) return;
    setCheckoutOpen(false);
    setCheckoutStep(1);
    setAddress("");
    setPhone("");
    setActiveOrderId(null);
  };

  const handleProceed = () => {
    if (!address.trim() || !phone.trim()) {
      toast.error("Delivery address and phone number are required.");
      return;
    }
    if (!/^[0-9]{10}$/.test(phone.replace(/\D/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }
    setCheckoutStep(2);
  };

  const createLocalOrder = async () => {
    if (!user?.id || !API) return null;
    if (activeOrderId) return activeOrderId;
    const res = await fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userId: user.id,
        productId: product.id,
        deliveryAddress: address.trim(),
        deliveryPhone: phone.replace(/\D/g, ""),
        fullName: fullName.trim(),
      }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        toast.error("Session expired. Please log in securely to continue checkout.");
        window.location.href = "/login";
        return null;
      }
      toast.error(payload?.error || "Failed to place order.");
      return null;
    }
    const placedOrderId = payload?.order?.id;
    if (!placedOrderId) {
      toast.error("Order created but missing order id.");
      return null;
    }
    setActiveOrderId(placedOrderId);
    return placedOrderId as string;
  };

  const handleRazorpayPayment = async () => {
    if (!user?.id || !API) return;
    if (isOutOfStock) {
      toast.error("This item just went out of stock.");
      return;
    }
    setPlacingOrder(true);
    let localOrderId: string | null = null;
    try {
      localOrderId = await createLocalOrder();
      if (!localOrderId) return;

      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        toast.error("Failed to load Razorpay checkout.");
        return;
      }

      const orderRes = await fetch(`${API}/orders/${localOrderId}/razorpay`, {
        method: "POST",
        credentials: "include",
      });
      const orderPayload = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        if (orderRes.status === 409) {
          toast.error(orderPayload?.error || "This item is out of stock.");
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
        description: product.title,
        order_id: razorpayOrder.id,
        prefill: {
          name: fullName.trim(),
          contact: phone.replace(/\D/g, ""),
        },
      });

      const verifyRes = await fetch(`${API}/orders/${localOrderId}/razorpay/verify`, {
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
        toast.error(verifyPayload?.message || "Order cancelled due to stock unavailability.");
        closeCheckout();
        router.push(`/orders?highlight=${encodeURIComponent(localOrderId)}`);
        return;
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("products:refresh"));
      }
      toast.success("Payment verified. Order confirmed.");
      closeCheckout();
      router.push(`/orders?highlight=${encodeURIComponent(localOrderId)}`);
    } catch (error: any) {
      const message = String(error?.message || "").toLowerCase();
      if (message.includes("cancel")) {
        toast.error("Payment cancelled.");
      } else {
        toast.error("Payment could not be completed.");
      }
      if (localOrderId) {
        closeCheckout();
        router.push(`/orders?highlight=${encodeURIComponent(localOrderId)}`);
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <>
      <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-300/50">
        <div className="relative flex aspect-[5/4] items-center justify-center overflow-hidden bg-slate-100">
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-cyan-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
              {product.normalizedType === "REFURBISHED" ? "Refurbished" : "Brand New"}
            </span>
            {typeof product.conditionScore === "number" && product.normalizedType === "REFURBISHED" && (
              <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                {product.conditionScore}/10 Condition
              </span>
            )}
          </div>

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div className={`${imageUrl ? "hidden" : "flex"} absolute inset-0 items-center justify-center text-4xl text-slate-500`}>❄️</div>
        </div>

        <div className="p-4 md:p-5">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
              isOutOfStock
                ? "border-red-200 bg-red-50 text-red-600"
                : isLowStock
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            {isOutOfStock ? "❌ Out of Stock" : isLowStock ? `⚠️ Only ${numericStock} left!` : "Available"}
          </span>
          <h2 className="mt-3 line-clamp-2 text-lg font-bold leading-tight text-slate-900 md:text-xl">{product.title}</h2>
          <p className="mt-2 min-h-9 line-clamp-2 text-sm text-slate-600">
            {product.description || "Refurbished and quality-checked appliance in excellent condition."}
          </p>

          {product.normalizedType === "REFURBISHED" && (
            <div className="mt-3 space-y-1.5 rounded-xl border border-cyan-100 bg-cyan-50/60 p-2.5 text-[11px] text-slate-700">
              <p>
                Condition:{" "}
                <span className="font-semibold text-slate-900">
                  {typeof product.conditionScore === "number" ? `${product.conditionScore}/10` : "Not specified"}
                </span>
              </p>
              <p>
                Age:{" "}
                <span className="font-semibold text-slate-900">
                  {typeof product.ageMonths === "number" ? `${product.ageMonths} months` : "Not specified"}
                </span>
              </p>
              <p>
                Warranty:{" "}
                <span className="font-semibold text-slate-900">
                  {product.warrantyType === "SHOP"
                    ? getShopWarrantyLine(product)
                    : product.warrantyType === "BRAND"
                      ? "Brand Warranty"
                      : "Not specified"}
                </span>
                {product.warrantyType !== "SHOP" && product.warrantyExpiry
                  ? ` · till ${new Date(product.warrantyExpiry).toLocaleDateString()}`
                  : ""}
              </p>
              <p className="line-clamp-2">
                Certificate:{" "}
                <span className="font-medium text-slate-800">{product.warrantyCertificateUrl || DEFAULT_CERTIFICATE_LINE}</span>
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <span className="whitespace-nowrap text-xl font-black text-slate-950 md:text-2xl">
              ₹{Number(product.price || 0).toLocaleString()}
            </span>
            <button
              type="button"
              onClick={openCheckout}
              className="min-h-[48px] whitespace-nowrap rounded-lg bg-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-sm transition-transform hover:bg-blue-700 active:scale-95 md:text-sm"
            >
              Buy Now
            </button>
          </div>
        </div>
      </article>

      {checkoutOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm md:items-center md:p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-300 md:rounded-2xl">
            <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-slate-300 md:hidden" />
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-blue-600 font-semibold">Secure Checkout</p>
                <h3 className="text-2xl font-black mt-1">{product.title}</h3>
                <p className="text-sm text-slate-600 mt-1">₹{checkoutAmount.toLocaleString("en-IN")}</p>
              </div>
              <button
                onClick={closeCheckout}
                className="min-h-[44px] min-w-[44px] rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {checkoutStep === 1 ? (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    Full Name
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Phone Number
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Delivery Address
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-2 min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="House no, street, locality, city"
                    />
                  </label>
                  <button
                    onClick={handleProceed}
                    className="min-h-[48px] w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:bg-blue-700 active:scale-95"
                  >
                    Proceed to Payment
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-700">
                    Secure payment powered by Razorpay. You will be redirected to complete the payment.
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Order Total</p>
                    <p className="text-lg font-black text-slate-900">₹{checkoutAmount.toLocaleString("en-IN")}</p>
                    <p className="mt-2 text-xs text-slate-500">Complete payment to confirm your order instantly.</p>
                  </div>
                  <button
                    onClick={handleRazorpayPayment}
                    disabled={placingOrder || isOutOfStock}
                    className="min-h-[48px] w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
                  >
                    {isOutOfStock ? "Currently Unavailable" : placingOrder ? "Starting Payment..." : "Pay via Razorpay"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
