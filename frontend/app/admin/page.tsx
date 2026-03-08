"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [selectedLog, setSelectedLog] = useState<any>(null);



  useEffect(() => {
  const checkAdmin = () => {
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;
    
    // 🔥 Fix 1: Email exact match karo
    // 🔥 Fix 2: Role: ADMIN bhi check karo (Double Security)
    if (!user || (user.email !== "mdatharsbr@gmail.com" && user.role !== "ADMIN")) {
      console.log("Access Denied for:", user?.email);
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f8fafc]">Loading Admin...</div>;

  return (
    <main className="min-h-screen bg-[#f8fafc] p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Metrics Section (Chamkte huye Cards) --- */}
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Product Inventory</p>
            <h2 className="text-4xl font-black text-slate-900">{stats?.totalProducts || 0}</h2>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">AI Efficiency</p>
            <h2 className="text-4xl font-black text-indigo-600">98.4%</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Table Section --- */}
          <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">User Details</th>
                    <th className="px-8 py-4">Appliance</th>
                    <th className="px-8 py-4">Status</th>
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
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                          {item.appliance}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                          <span className="text-xs font-bold text-slate-500 uppercase">AI SORTED</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => setSelectedLog(item)} className="bg-slate-950 text-white px-5 py-2 rounded-xl text-[10px] font-black hover:bg-blue-600 transition-all shadow-lg">
                          VIEW LOGS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- Side Panels (Right Side) --- */}
          <div className="space-y-8">
            <div className="bg-slate-950 text-white p-10 rounded-[3rem] shadow-2xl">
               <h3 className="text-xl font-black mb-6 italic">Appliance Pulse</h3>
               <div className="space-y-6">
                 {stats?.applianceStats?.map((s: any, i: number) => (
                   <div key={i}>
                     <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                       <span>{s.appliance}</span>
                       <span className="text-blue-400">{s._count._all}</span>
                     </div>
                     <div className="h-1 w-full bg-slate-800 rounded-full">
                       <div className="h-full bg-blue-500" style={{ width: `${(s._count._all / stats.totalBookings) * 100}%` }}></div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 Modal Logic */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 relative">
            <button onClick={() => setSelectedLog(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-950 text-2xl font-bold">✕</button>
            <div className="mb-6 border-b border-slate-50 pb-4">
              <span className="text-blue-600 font-black text-xs uppercase tracking-widest">{selectedLog.appliance} Log</span>
              <h3 className="text-2xl font-black text-slate-950 mt-1">Diagnosis Report</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Customer: {selectedLog.customer?.name}</p>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-slate-800 font-medium italic">
                "{selectedLog.issue}"
              </div>
              <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap text-sm">
                {selectedLog.aiDiagnosis}
              </div>
            </div>
            <button onClick={() => setSelectedLog(null)} className="mt-8 w-full bg-slate-950 text-white py-4 rounded-2xl font-bold">Close Report</button>
          </div>
        </div>
      )}
    </main>
  );
}


