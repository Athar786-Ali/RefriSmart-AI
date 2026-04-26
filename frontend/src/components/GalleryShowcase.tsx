"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getApiBase } from "@/lib/api";

type GalleryItem = {
  id: string;
  imageUrl: string;
  caption: string;
  mediaType?: string;
};

export default function GalleryShowcase() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const apiUrl = getApiBase();
        const res = await fetch(`${apiUrl}/gallery`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const imageOnlyData = Array.isArray(data)
            ? data.filter((item: any) => item?.mediaType !== "video" && !String(item?.imageUrl || "").match(/\.(mp4|webm|mov|m3u8)$/i))
            : [];
          // Pick top 20 items for the showcase
          setItems(imageOnlyData.slice(0, 20));
        }
      } catch (err) {
        console.error("Gallery fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-md mx-auto mb-12"></div>
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-200 animate-pulse rounded-xl h-48 w-full mb-4 break-inside-avoid"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-bold mb-3">Live Snapshots</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Our Recent Work
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            See our certified expert technicians in action across Bhagalpur. We provide transparent and thorough appliance services you can trust.
          </p>
        </div>
        
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="relative group break-inside-avoid overflow-hidden rounded-2xl bg-slate-200 mb-4 shadow-sm border border-slate-200/50">
                <img 
                  src={item.imageUrl} 
                  alt={item.caption || "Appliance repair snapshot"} 
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
                <div className="p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-xs sm:text-sm font-semibold leading-snug drop-shadow-md border-l-2 border-blue-400 pl-2">
                    {item.caption || "Live repair snapshot"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            href="/gallery" 
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-sm sm:text-base hover:bg-blue-600 transition-colors shadow-lg hover:shadow-blue-600/30"
          >
            Explore Full Gallery <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
