"use client";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number | string;
  images?: string[] | string | null;
  isUsed?: boolean;
  productType?: "NEW" | "REFURBISHED";
  conditionScore?: number | null;
  ageMonths?: number | null;
  warrantyType?: "BRAND" | "SHOP" | null;
  warrantyExpiry?: string | null;
  warrantyCertificateUrl?: string | null;
  createdAt?: string | null;
};
type NormalizedProduct = Product & { normalizedType: "NEW" | "REFURBISHED" };

const DEFAULT_CERTIFICATE_LINE = "Tested & Certified: Cooling system and compressor working properly.";

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
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

  const getShopWarrantyLine = (product: Product) => {
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

  const normalizedProducts: NormalizedProduct[] = products.map((p) => ({
    ...p,
    normalizedType: p.productType || (p.isUsed ? "REFURBISHED" : "NEW"),
  }));
  const brandNewProducts = normalizedProducts.filter((p) => p.normalizedType === "NEW");
  const refurbishedProducts = normalizedProducts.filter((p) => p.normalizedType === "REFURBISHED");

  const renderProductCard = (p: NormalizedProduct) => {
    const phoneNumber = "919060877595";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hi, Enquiry for ${p.title}`;
    const imageUrl = transformCloudinaryImage(getImageUrl(p.images));

    return (
      <article
        key={p.id}
        className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-slate-300/35 transition-all duration-300"
      >
        <div className="aspect-[5/4] bg-slate-100 overflow-hidden flex items-center justify-center relative">
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide bg-cyan-500 text-white px-2.5 py-1 rounded-full shadow-sm">
              {p.normalizedType === "REFURBISHED" ? "REFURBISHED" : "BRAND NEW"}
            </span>
            {typeof p.conditionScore === "number" && p.normalizedType === "REFURBISHED" && (
              <span className="text-[10px] font-semibold uppercase tracking-wide bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                {p.conditionScore}/10 Condition
              </span>
            )}
          </div>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={p.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-slate-500 text-4xl">❄️</div>
          )}
          <div className="hidden absolute inset-0 items-center justify-center text-slate-500 text-4xl bg-slate-100">❄️</div>
        </div>

        <div className="p-4 md:p-5">
          <span className="inline-flex text-[11px] font-semibold text-emerald-700 uppercase tracking-wide bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
            Available
          </span>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-3 leading-tight line-clamp-2">
            {p.title}
          </h2>
          <p className="text-slate-600 text-sm mt-2 line-clamp-2 min-h-9">
            {p.description || "Refurbished and quality-checked appliance in excellent condition."}
          </p>
          {p.normalizedType === "REFURBISHED" && (
            <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50/60 p-2.5 space-y-1.5 text-[11px] text-slate-700">
              <p>
                Condition:{" "}
                <span className="font-semibold text-slate-900">
                  {typeof p.conditionScore === "number" ? `${p.conditionScore}/10` : "Not specified"}
                </span>
              </p>
              <p>
                Age:{" "}
                <span className="font-semibold text-slate-900">
                  {typeof p.ageMonths === "number" ? `${p.ageMonths} months` : "Not specified"}
                </span>
              </p>
              <p>
                Warranty:{" "}
                <span className="font-semibold text-slate-900">
                  {p.warrantyType === "SHOP"
                    ? getShopWarrantyLine(p)
                    : p.warrantyType === "BRAND"
                      ? "Brand Warranty"
                      : "Not specified"}
                </span>
                {p.warrantyType !== "SHOP" && p.warrantyExpiry ? ` · till ${new Date(p.warrantyExpiry).toLocaleDateString()}` : ""}
              </p>
              <p className="line-clamp-2">
                Certificate:{" "}
                <span className="font-medium text-slate-800">
                  {p.warrantyCertificateUrl || DEFAULT_CERTIFICATE_LINE}
                </span>
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-between items-center border-t border-slate-100 pt-4 gap-3">
            <span className="text-xl md:text-2xl font-black text-slate-950 whitespace-nowrap">
              ₹{Number(p.price || 0).toLocaleString()}
            </span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm font-semibold text-xs md:text-sm whitespace-nowrap"
            >
              Enquire Now
            </a>
          </div>
        </div>
      </article>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-20 font-semibold text-slate-700">
        Loading products...
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <section className="relative min-h-[72vh] md:min-h-[80vh] w-full flex flex-col items-center justify-center overflow-hidden rounded-b-[2.5rem] md:rounded-b-[4rem] mb-14 shadow-xl">
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
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-5 tracking-tight leading-[0.95] drop-shadow-sm">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
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
                  {brandNewProducts.map((p) => renderProductCard(p))}
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
                  {refurbishedProducts.map((p) => renderProductCard(p))}
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
    </main>
  );
}
