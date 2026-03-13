"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import ProductCard, { type ProductCardItem } from "./components/ProductCard";
import ProductSkeleton from "./components/ProductSkeleton";

type Product = ProductCardItem;
type NormalizedProduct = ProductCardItem & { normalizedType: "NEW" | "REFURBISHED" };
type UserSession = { id: string; name?: string; email?: string } | null;

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<UserSession>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<NormalizedProduct | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutName, setCheckoutName] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const technicianVideos = [
    "https://assets.mixkit.co/videos/preview/mixkit-technician-repairing-an-air-conditioner-4251-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-man-repairing-an-air-conditioner-43535-large.mp4",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { credentials: "include" });
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const syncUser = () => {
      const raw = localStorage.getItem("user");
      try {
        const parsed = raw ? (JSON.parse(raw) as UserSession) : null;
        setCurrentUser(parsed);
        setCheckoutName((prev) => prev || parsed?.name || "");
      } catch {
        setCurrentUser(null);
      }
    };
    syncUser();
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const openCheckout = (product: NormalizedProduct) => {
    if (!currentUser?.id) {
      toast.error("Please login first to buy products.");
      router.push("/login");
      return;
    }
    setSelectedProduct(product);
    setCheckoutStep(1);
    setCheckoutName(currentUser?.name || "");
    setCheckoutOpen(true);
  };

  const closeCheckout = () => {
    if (placingOrder) return;
    setCheckoutOpen(false);
    setCheckoutStep(1);
    setSelectedProduct(null);
    setCheckoutAddress("");
    setCheckoutPhone("");
  };

  const checkoutAmount = Number(selectedProduct?.price || 0);
  const checkoutUpiLink = useMemo(() => {
    if (!selectedProduct) return "";
    const params = new URLSearchParams({
      pa: "9060877595-2@ybl",
      pn: "Golden Refrigeration",
      am: String(Number(selectedProduct.price || 0)),
      cu: "INR",
      tn: selectedProduct.title,
    });
    return `upi://pay?${params.toString()}`;
  }, [selectedProduct]);

  const handleContinueToPayment = () => {
    if (!selectedProduct) return;
    if (!checkoutAddress.trim() || !checkoutPhone.trim()) {
      toast.error("Delivery address and phone number are required.");
      return;
    }
    if (!/^\d{10}$/.test(checkoutPhone.replace(/\D/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    setCheckoutStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!selectedProduct || !currentUser?.id) return;
    setPlacingOrder(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: currentUser.id,
          productId: selectedProduct.id,
          deliveryAddress: checkoutAddress.trim(),
          deliveryPhone: checkoutPhone.replace(/\D/g, ""),
          fullName: checkoutName.trim() || currentUser?.name || "Customer",
          paymentConfirmed: true,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(payload?.error || "Failed to place order.");
        return;
      }
      const placedOrderId = payload?.order?.id;
      closeCheckout();
      if (placedOrderId) {
        router.push(`/orders?highlight=${encodeURIComponent(placedOrderId)}`);
      } else {
        router.push("/orders");
      }
      toast.success("Order placed successfully.");
    } catch {
      toast.error("Order placement failed.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const normalizedProducts: NormalizedProduct[] = products.map((p) => ({
    ...p,
    normalizedType: p.productType || (p.isUsed ? "REFURBISHED" : "NEW"),
  }));
  const brandNewProducts = normalizedProducts.filter((p) => p.normalizedType === "NEW");
  const refurbishedProducts = normalizedProducts.filter((p) => p.normalizedType === "REFURBISHED");

  if (loading) {
    return (
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductSkeleton key={`product-skeleton-${i}`} />
        ))}
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50">
      <section className="relative mb-14 flex min-h-[72vh] w-full flex-col items-center justify-center overflow-hidden rounded-b-[2.5rem] shadow-xl md:min-h-[80vh] md:rounded-b-[4rem]">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1600&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            onError={() => {
              setVideoIndex((prev) => (prev < technicianVideos.length - 1 ? prev + 1 : prev));
            }}
          >
            <source
              src={technicianVideos[videoIndex]}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-slate-950/55"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-slate-900/45 to-slate-950/80"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/95 mb-6">
            Certified Cooling Experts
          </p>
          <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-white drop-shadow-sm md:text-5xl lg:text-6xl">
            Repair. Restore.
            <br className="hidden sm:block" />
            <span className="text-cyan-300">Upgrade with Confidence.</span>
          </h1>
          <p className="text-slate-100/95 text-base md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Real technicians, quality-tested inventory, and faster support powered by AI diagnostics.
          </p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/75 text-xs uppercase tracking-[0.2em]">
          Golden Refrigeration
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-blue-700 font-semibold">Inventory</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Featured Products</h2>
          </div>
          <span className="shrink-0 text-sm bg-white border border-slate-200 px-4 py-2 rounded-full text-slate-600 font-medium">
            {products.length} listed
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 font-medium">
            No products listed yet.
          </div>
        ) : (
          <div className="space-y-12">
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl md:text-2xl font-black text-slate-900">Brand New Products</h3>
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                  {brandNewProducts.length} items
                </span>
              </div>
              {brandNewProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                  {brandNewProducts.map((p) => (
                    <ProductCard key={p.id} product={p} onBuyNow={() => openCheckout(p)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 font-medium">
                  No brand new products available right now.
                </div>
              )}
            </section>

            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl md:text-2xl font-black text-slate-900">Refurbished Products</h3>
                <span className="text-xs font-semibold uppercase tracking-wide text-cyan-700 bg-cyan-50 border border-cyan-100 px-3 py-1.5 rounded-full">
                  {refurbishedProducts.length} items
                </span>
              </div>
              {refurbishedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                  {refurbishedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} onBuyNow={() => openCheckout(p)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 font-medium">
                  No refurbished products available right now.
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {checkoutOpen && selectedProduct && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm md:items-center md:p-4">
          <div className="w-full max-w-2xl rounded-t-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-300 md:rounded-3xl">
            <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-slate-300 md:hidden" />
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-blue-600 font-semibold">Secure Checkout</p>
                <h3 className="text-2xl font-black mt-1">{selectedProduct.title}</h3>
                <p className="text-sm text-slate-600 mt-1">₹{checkoutAmount.toLocaleString("en-IN")}</p>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                className="min-h-[48px] rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              {checkoutStep === 1 ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white">Step 1: Delivery Details</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      placeholder="Full Name"
                      className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                    />
                    <input
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      placeholder="Phone Number"
                      inputMode="numeric"
                      className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                    />
                  </div>
                  <textarea
                    value={checkoutAddress}
                    onChange={(e) => setCheckoutAddress(e.target.value)}
                    placeholder="Delivery Address"
                    className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleContinueToPayment}
                    className="min-h-[48px] w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-transform hover:bg-blue-700 active:scale-95"
                  >
                    Continue to Payment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white">Step 2: UPI Payment</h4>
                  <p className="text-sm text-slate-600">Scan the QR code and complete payment, then confirm order placement.</p>
                  <div className="grid place-items-center rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <QRCode value={checkoutUpiLink} size={220} bgColor="#f8fafc" fgColor="#0f172a" />
                    <p className="mt-3 text-xs text-slate-600">UPI ID: 9060877595-2@ybl</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(1)}
                      className="min-h-[48px] rounded-xl border border-slate-200 bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition-transform hover:bg-slate-200 active:scale-95"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={placingOrder}
                      className="min-h-[48px] rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-transform hover:bg-blue-700 active:scale-95 disabled:opacity-60"
                    >
                      {placingOrder ? "Placing Order..." : "I Have Paid, Place Order"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
