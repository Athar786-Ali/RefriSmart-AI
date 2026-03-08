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
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 font-bold text-slate-900">Loading Golden Ref... ❄️</div>;

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="absolute top-0 left-0 w-full h-500px bg-gradient-to from-blue-50/50 to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 py-16">
        <section className="text-center mb-24">
          <h1 className="text-6xl md:text-8xl font-black text-slate-950 mb-6 tracking-tighter">
            Smart <span className="text-blue-600">Care.</span>
          </h1>
          <p className="text-slate-500 text-xl max-w-xl mx-auto font-medium">
            Premium appliances, AI-driven repair. <br/> 
            The future of <span className="text-slate-900">Golden Refrigeration.</span>
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {products.length > 0 ? products.map((p) => {
            const phoneNumber = "919060877595"; 
            const message = `Hello Golden Refrigeration, mujhe aapka product "${p.title}" kharidna hai jo ₹${p.price.toLocaleString()} ka hai. Kya ye available hai?`;
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            return (
              <div key={p.id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/40 hover:shadow-blue-200/50 transition-all duration-500">
                {/* 🔥 Updated Image Section */}
                <div className="aspect-video bg-slate-50 rounded-2rem overflow-hidden flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
                  {p.images && p.images[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    "❄️"
                  )}
                </div>
                
                <div className="p-6">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Available</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-3">{p.title}</h2>
                  <p className="text-slate-500 text-sm mt-2 line-clamp-2">{p.description}</p>
                  <div className="mt-8 flex justify-between items-center">
                    <span className="text-3xl font-black text-slate-950">₹{p.price.toLocaleString()}</span>
                    
                    <a 
                      href={whatsappUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-emerald-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100 font-bold text-sm"
                    >
                      Enquire 💬
                    </a>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-3 text-center text-slate-400">No products found in database.</div>
          )}
        </div>
      </div>
    </main>
  );
}
