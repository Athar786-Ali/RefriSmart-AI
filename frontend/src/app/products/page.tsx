"use client";
import { useCallback, useEffect, useState } from "react";
import { Search, Info, PackageOpen, BadgeCheck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import { getApiBase } from "@/lib/api";
import type { NormalizedProduct, Product } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    const apiBase = getApiBase();
    if (!apiBase) {
      console.error("NEXT_PUBLIC_API_URL is not configured.");
      if (showLoader) setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${apiBase}/products`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setProducts([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      setProducts([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts(true);
  }, [fetchProducts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleRefresh = () => {
      void fetchProducts(false);
    };
    window.addEventListener("products:refresh", handleRefresh);
    return () => window.removeEventListener("products:refresh", handleRefresh);
  }, [fetchProducts]);

  const normalizedProducts: NormalizedProduct[] = products.map((p) => ({
    ...p,
    normalizedType: p.productType || (p.isUsed ? "REFURBISHED" : "NEW"),
  }));
  
  const brandNewProducts = normalizedProducts.filter((p) => p.normalizedType === "NEW");
  const refurbishedProducts = normalizedProducts.filter((p) => p.normalizedType === "REFURBISHED");

  return (
    <main className="min-h-screen pt-24 pb-16 bg-slate-50 font-sans">
      
      {/* SHoWROOM HEADER */}
      <section className="bg-slate-900 border-b-4 border-blue-600 relative overflow-hidden py-12 md:py-20 mb-8">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-center flex flex-col items-center gap-4">
          <BadgeCheck className="w-12 h-12 text-blue-400 mb-2" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Premium Appliance <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Showroom</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl mt-4">
            Browse our curated selection of brand new and professionally refurbished appliances in Bhagalpur. Every item is inspected and certified.
          </p>
        </div>
      </section>

      {/* INVENTORY CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-14">
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-4">
            <PackageOpen className="w-16 h-16 text-slate-300" />
            <h3 className="text-xl font-bold text-slate-700">Inventory is currently being updated.</h3>
            <p className="text-slate-500 font-medium">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            
            {/* BRAND NEW */}
            <section className="flex flex-col gap-8 scroll-mt-28" id="brand-new">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm shrink-0">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Brand New Arrivals</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">Factory sealed appliances with full manufacturer warranty.</p>
                </div>
              </div>

              {brandNewProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {brandNewProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-16 bg-slate-100/50 rounded-3xl border border-dashed border-slate-300 text-slate-500 font-medium text-center">
                  <Info className="w-5 h-5 mr-2" /> No new appliances in stock at the moment.
                </div>
              )}
            </section>

            {/* REFURBISHED */}
            <section className="flex flex-col gap-8 scroll-mt-28" id="refurbished">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center border border-cyan-200 shadow-sm shrink-0">
                  <span className="text-2xl">♻️</span>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Certified Refurbished</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">Professionally repaired, tested, and backed by shop warranty.</p>
                </div>
              </div>

              {refurbishedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {refurbishedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-16 bg-slate-100/50 rounded-3xl border border-dashed border-slate-300 text-slate-500 font-medium text-center">
                  <Info className="w-5 h-5 mr-2" /> No refurbished appliances in stock at the moment.
                </div>
              )}
            </section>

          </div>
        )}
      </div>
    </main>
  );
}
