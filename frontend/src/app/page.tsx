"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import type { NormalizedProduct, Product } from "@/types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0);

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

  // Checkout flow now lives inside ProductCard.

  const normalizedProducts: NormalizedProduct[] = products.map((p) => ({
    ...p,
    normalizedType: p.productType || (p.isUsed ? "REFURBISHED" : "NEW"),
  }));
  const brandNewProducts = normalizedProducts.filter((p) => p.normalizedType === "NEW");
  const refurbishedProducts = normalizedProducts.filter((p) => p.normalizedType === "REFURBISHED");

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-16 grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductSkeleton key={`product-skeleton-${i}`} />
        ))}
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-20 md:pt-24 pb-12 flex flex-col overflow-x-hidden bg-slate-50">
      <section className="relative flex min-h-[72vh] w-full flex-col items-center justify-center overflow-hidden rounded-b-2xl shadow-xl md:min-h-[80vh] py-12 md:py-20 lg:py-24">
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center flex flex-col gap-8 md:gap-12">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-16 flex flex-col gap-8 md:gap-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-blue-700 font-semibold">Inventory</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Featured Products</h2>
          </div>
          <span className="shrink-0 text-sm bg-white border border-slate-200 px-4 py-2 rounded-full text-slate-600 font-medium">
            {products.length} listed
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 font-medium">
            No products listed yet.
          </div>
        ) : (
          <div className="flex flex-col gap-8 md:gap-12">
            <section className="flex flex-col gap-6 md:gap-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl md:text-2xl font-black text-slate-900">Brand New Products</h3>
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                  {brandNewProducts.length} items
                </span>
              </div>
              {brandNewProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {brandNewProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 md:py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 font-medium">
                  No brand new products available right now.
                </div>
              )}
            </section>

            <section className="flex flex-col gap-6 md:gap-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl md:text-2xl font-black text-slate-900">Refurbished Products</h3>
                <span className="text-xs font-semibold uppercase tracking-wide text-cyan-700 bg-cyan-50 border border-cyan-100 px-3 py-1.5 rounded-full">
                  {refurbishedProducts.length} items
                </span>
              </div>
              {refurbishedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {refurbishedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 md:py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 font-medium">
                  No refurbished products available right now.
                </div>
              )}
            </section>
          </div>
        )}
      </div>

    </main>
  );
}
