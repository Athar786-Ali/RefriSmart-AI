"use client";

import type { NormalizedProduct, Product, ProductType } from "@/types";

export type ProductCardItem = Product;

type ProductCardProps = {
  product: NormalizedProduct;
  onBuyNow: () => void;
};

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

export default function ProductCard({ product, onBuyNow }: ProductCardProps) {
  const imageUrl = transformCloudinaryImage(getImageUrl(product.images));

  return (
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
        <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
          Available
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
            onClick={onBuyNow}
            className="min-h-[48px] whitespace-nowrap rounded-lg bg-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-sm transition-transform hover:bg-blue-700 active:scale-95 md:text-sm"
          >
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}
