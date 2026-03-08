// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// export default function AdminDashboard() {
//   const [data, setData] = useState<any[]>([]);
//   const [stats, setStats] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();
//   const [selectedLog, setSelectedLog] = useState<any>(null);

//   // 🔥 Naya State: Product add karne ke liye (Added imageUrl)
//   const [newProd, setNewProd] = useState({ title: "", description: "", price: "", imageUrl: "" });

//   useEffect(() => {
//     const checkAdmin = () => {
//       const savedUser = localStorage.getItem("user");
//       const user = savedUser ? JSON.parse(savedUser) : null;
      
//       // Fix: Email exact match aur Role check logic tera purana wala
//       if (!user || (user.email !== "mdatharsbr@gmail.com" && user.role !== "ADMIN")) {
//         console.log("Access Denied for:", user?.email);
//         router.push("/");
//         return false;
//       }
//       return true;
//     };

//     const fetchAdminData = async () => {
//       if (!checkAdmin()) return;
//       try {
//         const [dataRes, statsRes] = await Promise.all([
//           fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/all-diagnoses`),
//           fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`)
//         ]);
//         setData(await dataRes.json());
//         setStats(await statsRes.json());
//       } catch (err) { console.error(err); } 
//       finally { setLoading(false); }
//     };
//     fetchAdminData();
//   }, [router]);

//   // 🔥 Product Add karne ka function
//   const handleAddProduct = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const savedUser = localStorage.getItem("user");
//     const user = savedUser ? JSON.parse(savedUser) : null;

//     if (!user) return alert("Login required!");

//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/add-product`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...newProd, sellerId: user.id }),
//       });

//       if (res.ok) {
//         alert("Bhai, Product list ho gaya! 🎉");
//         setNewProd({ title: "", description: "", price: "", imageUrl: "" });
//         window.location.reload();
//       }
//     } catch (err) { console.error(err); }
//   };

//   // 🔥 Delete Function
//   const handleDeleteProduct = async (id: string) => {
//     if (!confirm("Bhai, pakka hata du?")) return;
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/delete-product/${id}`, { method: "DELETE" });
//       if (res.ok) window.location.reload();
//     } catch (err) { console.error(err); }
//   };

//   if (loading) return <div className="h-screen flex items-center justify-center bg-[#f8fafc]">Loading Admin...</div>;

//   return (
//     <main className="min-h-screen bg-[#f8fafc] p-4 md:p-10">
//       <div className="max-w-7xl mx-auto">
        
//         {/* --- Metrics Section (Chamkte huye Cards) --- */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
//           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
//             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Leads</p>
//             <h2 className="text-4xl font-black text-blue-600">{stats?.totalBookings || 0}</h2>
//           </div>
//           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
//             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Customers</p>
//             <h2 className="text-4xl font-black text-slate-900">{stats?.totalUsers || 0}</h2>
//           </div>
//           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
//             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Product Inventory</p>
//             <h2 className="text-4xl font-black text-slate-900">{stats?.totalProducts || 0}</h2>
//           </div>
//           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
//             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">AI Efficiency</p>
//             <h2 className="text-4xl font-black text-indigo-600">98.4%</h2>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* --- Table Section --- */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden mb-12">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left">
//                   <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
//                     <tr>
//                       <th className="px-8 py-4">User Details</th>
//                       <th className="px-8 py-4">Appliance</th>
//                       <th className="px-8 py-4">Status</th>
//                       <th className="px-8 py-4 text-right">Operation</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-50">
//                     {data.map((item) => (
//                       <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
//                         <td className="px-8 py-6">
//                           <p className="font-bold text-slate-900 text-sm">{item.customer?.name}</p>
//                           <p className="text-xs text-slate-400">{item.customer?.email}</p>
//                         </td>
//                         <td className="px-8 py-6">
//                           <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
//                             {item.appliance}
//                           </span>
//                         </td>
//                         <td className="px-8 py-6">
//                           <div className="flex items-center gap-2">
//                             <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
//                             <span className="text-xs font-bold text-slate-500 uppercase">AI SORTED</span>
//                           </div>
//                         </td>
//                         <td className="px-8 py-6 text-right">
//                           <button onClick={() => setSelectedLog(item)} className="bg-slate-950 text-white px-5 py-2 rounded-xl text-[10px] font-black hover:bg-blue-600 transition-all shadow-lg">
//                             VIEW LOGS
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* 🔥 Live Inventory Management UI (Merged Perfectly) */}
//             <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100">
//               <h3 className="text-xl font-black mb-6 italic text-slate-900">Live Inventory Management</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {stats?.latestProducts?.map((p: any) => (
//                   <div key={p.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
//                     <div>
//                       <p className="font-bold text-slate-900 text-sm">{p.title}</p>
//                       <p className="text-xs text-blue-600 font-black">₹{p.price}</p>
//                     </div>
//                     <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase cursor-pointer">
//                       Delete 🗑️
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* --- Side Panels --- */}
//           <div className="space-y-8">
//             {/* 🔥 QUICK-ADD FORM */}
//             <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100">
//               <h3 className="text-xl font-black text-slate-900 mb-6 italic">Quick Add Product</h3>
//               <form onSubmit={handleAddProduct} className="space-y-4">
//                 <input 
//                   type="text" placeholder="Product Title (e.g. LG Fridge)"
//                   className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold"
//                   value={newProd.title}
//                   onChange={(e) => setNewProd({...newProd, title: e.target.value})}
//                   required
//                 />
//                 <textarea 
//                   placeholder="Short Description..."
//                   className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none text-sm min-h-100px"
//                   value={newProd.description}
//                   onChange={(e) => setNewProd({...newProd, description: e.target.value})}
//                 />
//                 <input 
//                   type="number" placeholder="Price (₹)"
//                   className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-blue-600"
//                   value={newProd.price}
//                   onChange={(e) => setNewProd({...newProd, price: e.target.value})}
//                   required
//                 />
//                 <input 
//                   type="text" placeholder="Image URL (Direct link)"
//                   className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none text-sm"
//                   value={newProd.imageUrl}
//                   onChange={(e) => setNewProd({...newProd, imageUrl: e.target.value})}
//                 />
//                 <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-slate-950 transition-all shadow-lg shadow-blue-100 cursor-pointer">
//                   LIST PRODUCT 📦
//                 </button>
//               </form>
//             </div>

//             {/* Appliance Pulse */}
//             <div className="bg-slate-950 text-white p-10 rounded-[3rem] shadow-2xl">
//                <h3 className="text-xl font-black mb-6 italic">Appliance Pulse</h3>
//                <div className="space-y-6">
//                  {stats?.applianceStats?.map((s: any, i: number) => (
//                    <div key={i}>
//                      <div className="flex justify-between text-[10px] font-black uppercase mb-2">
//                        <span>{s.appliance}</span>
//                        <span className="text-blue-400">{s._count._all}</span>
//                      </div>
//                      <div className="h-1 w-full bg-slate-800 rounded-full">
//                        <div className="h-full bg-blue-500" style={{ width: `${(s._count._all / stats.totalBookings) * 100}%` }}></div>
//                      </div>
//                    </div>
//                  ))}
//                </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modal Logic */}
//       {selectedLog && (
//         <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
//           <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 relative">
//             <button onClick={() => setSelectedLog(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-950 text-2xl font-bold">✕</button>
//             <div className="mb-6 border-b border-slate-50 pb-4">
//               <span className="text-blue-600 font-black text-xs uppercase tracking-widest">{selectedLog.appliance} Log</span>
//               <h3 className="text-2xl font-black text-slate-950 mt-1">Diagnosis Report</h3>
//               <p className="text-xs text-slate-400 font-bold uppercase mt-1">Customer: {selectedLog.customer?.name}</p>
//             </div>
//             <div className="space-y-6">
//               <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-slate-800 font-medium italic">
//                 "{selectedLog.issue}"
//               </div>
//               <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap text-sm">
//                 {selectedLog.aiDiagnosis}
//               </div>
//             </div>
//             <button onClick={() => setSelectedLog(null)} className="mt-8 w-full bg-slate-950 text-white py-4 rounded-2xl font-bold">Close Report</button>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // 🔥 State updated: 'imageUrl' added for the form
  const [newProd, setNewProd] = useState({ title: "", description: "", price: "", imageUrl: "" });

  useEffect(() => {
    const checkAdmin = () => {
      const savedUser = localStorage.getItem("user");
      const user = savedUser ? JSON.parse(savedUser) : null;
      if (!user || (user.email !== "mdatharsbr@gmail.com" && user.role !== "ADMIN")) {
        router.push("/");
        return false;
      }
      return true;
    };

    const fetchAdminData = async () => {
      if (!checkAdmin()) return;
      try {
        const [dataRes, statsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/all-diagnoses`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`)
        ]);
        setData(await dataRes.json());
        setStats(await statsRes.json());
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchAdminData();
  }, [router]);

  // 🔥 Delete Function: Business logic for inventory control
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Bhai, pakka hata du? stock khatam ho gaya kya?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/delete-product/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Product nikaal diya gaya! 🗑️");
        window.location.reload();
      }
    } catch (err) { console.error(err); }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;
    if (!user) return alert("Login required!");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/add-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newProd, sellerId: user.id }),
      });

      if (res.ok) {
        alert("Bhai, Product list ho gaya! 🎉");
        setNewProd({ title: "", description: "", price: "", imageUrl: "" });
        window.location.reload();
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f8fafc] font-bold">Loading Golden Admin... ❄️</div>;

  return (
    <main className="min-h-screen bg-[#f8fafc] p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Metrics Section (Exactly as your original) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Leads</p>
            <h2 className="text-4xl font-black text-blue-600">{stats?.totalBookings || 0}</h2>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Customers</p>
            <h2 className="text-4xl font-black text-slate-900">{stats?.totalUsers || 0}</h2>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inventory</p>
            <h2 className="text-4xl font-black text-slate-900">{stats?.totalProducts || 0}</h2>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">AI Efficiency</p>
            <h2 className="text-4xl font-black text-indigo-600">98.4%</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Table Section */}
            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden mb-12">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-4">User Details</th>
                      <th className="px-8 py-4">Appliance</th>
                      <th className="px-8 py-4 text-right">Operation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="font-bold text-slate-900 text-sm">{item.customer?.name}</p>
                          <p className="text-xs text-slate-400">{item.customer?.email}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{item.appliance}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={() => setSelectedLog(item)} className="bg-slate-950 text-white px-5 py-2 rounded-xl text-[10px] font-black hover:bg-blue-600 transition-all shadow-lg">VIEW LOGS</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 🔥 Live Inventory Management List (Added Delete Feature) */}
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100">
              <h3 className="text-xl font-black mb-6 italic text-slate-900 uppercase tracking-tighter">Live Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats?.latestProducts?.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.5rem border border-slate-100 group hover:border-red-200 transition-all">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                      <p className="text-xs text-blue-600 font-black">₹{p.price.toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-red-700 font-black text-[10px] uppercase cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity">Delete 🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* 🔥 Quick Add Form with Image URL Support */}
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 italic">Quick Add Product</h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <input 
                  type="text" placeholder="Product Title"
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold"
                  value={newProd.title}
                  onChange={(e) => setNewProd({...newProd, title: e.target.value})}
                  required
                />
                <textarea 
                  placeholder="Description..."
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none text-sm min-h-80px"
                  value={newProd.description}
                  onChange={(e) => setNewProd({...newProd, description: e.target.value})}
                />
                <input 
                  type="number" placeholder="Price (₹)"
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none text-sm font-bold text-blue-600"
                  value={newProd.price}
                  onChange={(e) => setNewProd({...newProd, price: e.target.value})}
                  required
                />
                {/* 🔥 New Input for Image */}
                <input 
                  type="text" placeholder="Image URL (Open image in new tab copy link)"
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none text-xs"
                  value={newProd.imageUrl}
                  onChange={(e) => setNewProd({...newProd, imageUrl: e.target.value})}
                />
                <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-slate-950 transition-all shadow-lg shadow-blue-100 cursor-pointer">LIST PRODUCT 📦</button>
              </form>
            </div>

            {/* Appliance Pulse Section */}
            <div className="bg-slate-950 text-white p-10 rounded-[3rem] shadow-2xl">
               <h3 className="text-xl font-black mb-6 italic">Appliance Pulse</h3>
               <div className="space-y-6">
                 {stats?.applianceStats?.map((s: any, i: number) => (
                   <div key={i}>
                     <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                       <span>{s.appliance}</span>
                       <span className="text-blue-400">{s._count._all}</span>
                     </div>
                     <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500" style={{ width: `${(s._count._all / stats.totalBookings) * 100}%` }}></div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Logic (Same as yours) */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 relative animate-in zoom-in duration-300">
            <button onClick={() => setSelectedLog(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-950 text-2xl font-bold">✕</button>
            <div className="mb-6 border-b border-slate-50 pb-4">
              <span className="text-blue-600 font-black text-xs uppercase tracking-widest">{selectedLog.appliance} Log</span>
              <h3 className="text-2xl font-black text-slate-950 mt-1">Diagnosis Report</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Customer: {selectedLog.customer?.name}</p>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-slate-800 font-medium italic">"{selectedLog.issue}"</div>
              <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap text-sm">{selectedLog.aiDiagnosis}</div>
            </div>
            <button onClick={() => setSelectedLog(null)} className="mt-8 w-full bg-slate-950 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-colors">Close Report</button>
          </div>
        </div>
      )}
    </main>
  );
}

