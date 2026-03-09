"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
      } catch (err) { console.error("Fetch error:", err); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 font-bold text-slate-900 italic">Golden Smart Care Loading... ❄️</div>;

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      
      {/* 🔥 Luxury Industry Level Hero Section (Fixed Video) */}
      <section className="relative h-650px w-full flex flex-col items-center justify-center overflow-hidden rounded-b-[5rem] mb-16 shadow-2xl">
        
        {/* 🔥 Background Video Container */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay loop muted playsInline 
            className="w-full h-full object-cover scale-110" // scale-110 to avoid white edges
          >
            {/* Direct Professional Video Link */}
            <source src="https://assets.mixkit.co/videos/preview/mixkit-technician-repairing-an-air-conditioner-4251-large.mp4" type="video/mp4" />
          </video>
          {/* Subtle White Overlay for better text readability */}
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]"></div>
        </div>

        {/* Hero Content - Restored to your original style */}
        <div className="relative z-10 text-center px-6">
          <h1 className="text-7xl md:text-9xl font-black text-slate-950 mb-6 tracking-tighter drop-shadow-sm">
            Smart <span className="text-blue-600">Care.</span>
          </h1>
          <p className="text-slate-700 text-xl md:text-2xl max-w-2xl mx-auto font-bold leading-relaxed">
            Premium appliances, AI-driven repair. <br/> 
            The future of <span className="text-blue-600">Golden Refrigeration.</span>
          </p>
        </div>
      </section>

      {/* Main Container for Products */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {products.length > 0 ? products.map((p) => {
            const phoneNumber = "919060877595"; 
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hi, Enquiry for ${p.title}`;

            return (
              <div key={p.id} className="group bg-white border border-slate-100 rounded-[3rem] p-5 shadow-xl shadow-slate-200/40 hover:shadow-blue-200/50 transition-all duration-500">
                
                {/* 🔥 Fixed Product Image - Made Clearly Visible with object-contain */}
                <div className="aspect-video bg-slate-50 rounded-[2.5rem] overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-500 relative border border-slate-50">
                  {p.images && p.images[0] ? (
                    <img 
                      src={p.images[0]} 
                      alt={p.title} 
                      className="w-full h-full object-contain p-2" // object-contain ensures image is not cut
                      onError={(e) => { e.currentTarget.src = ""; e.currentTarget.parentElement!.innerHTML = "❄️"; }}
                    />
                  ) : (
                    <span className="text-4xl">❄️</span>
                  )}
                </div>
                
                <div className="p-6">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">Available</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-4">{p.title}</h2>
                  <p className="text-slate-500 text-sm mt-2 line-clamp-2">{p.description}</p>
                  
                  <div className="mt-8 flex justify-between items-center border-t border-slate-50 pt-6">
                    <span className="text-3xl font-black text-slate-950">₹{p.price.toLocaleString()}</span>
                    <a 
                      href={whatsappUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-emerald-500 text-white px-7 py-3.5 rounded-2xl flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg font-bold text-sm"
                    >Enquire 💬</a>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-3 text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 text-slate-400 font-medium italic">
              Bhai, abhi koi products nahi hain. Admin se add karo!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}