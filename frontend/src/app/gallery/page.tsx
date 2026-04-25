"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

type GalleryItem = {
  id: string;
  imageUrl: string;
  caption: string;
  mediaType?: string;
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
        const res = await fetch(`${apiUrl}/gallery`);
        if (res.ok) {
          const data = await res.json();
          const imageOnlyData = data.filter((item: any) => item.mediaType !== "video" && !item.imageUrl.match(/\.(mp4|webm|mov|m3u8)$/i));
          setItems(imageOnlyData);
        }
      } catch (err) {
        console.error("Gallery fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  return (
    <main className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full mb-6 transition-colors border border-blue-100">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
               Live Repair <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Gallery.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-2xl font-medium leading-relaxed">
              Take a look at our expert technicians in action. We believe in complete transparency and showcase our real, on-site appliance repair work across Bhagalpur.
            </p>
          </div>
          <div className="shrink-0 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 flex items-center gap-4">
             <div className="bg-blue-100 p-2 rounded-lg">
               <ImageIcon className="w-6 h-6 text-blue-600" />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Media</p>
               <p className="font-black text-slate-900 text-xl">{loading ? "-" : items.length} Photos Captured</p>
             </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-slate-200 animate-pulse rounded-3xl h-64 w-full break-inside-avoid"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-xl font-medium">No gallery images found.</p>
          </div>
        ) : (
          /* Grid */
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="relative group break-inside-avoid overflow-hidden rounded-3xl bg-white shadow-md shadow-slate-200/50 border border-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                <img 
                  src={item.imageUrl} 
                  alt={item.caption || "Appliance repair snapshot"} 
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
                  <div className="p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-bold leading-relaxed drop-shadow-md border-l-4 border-blue-500 pl-4">
                      {item.caption || "Live repair snapshot"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
