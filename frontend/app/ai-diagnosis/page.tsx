// "use client";
// import { useState } from "react";

// export default function AIDiagnosis() {
//   const [appliance, setAppliance] = useState("Refrigerator");
//   const [issue, setIssue] = useState("");
//   const [result, setResult] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleDiagnose = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setResult("");

//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/diagnose`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ appliance, issue }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         setResult(data.diagnosis);
//       } else {
//         setResult("Bhai, AI thoda busy hai. Baad mein try kar!");
//       }
//     } catch (err) {
//       setResult("Connection error! Backend check kar bhai.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-[#f8fafc] py-20 px-6">
//       <div className="max-w-3xl mx-auto">
//         <h1 className="text-5xl font-black text-slate-950 mb-4 tracking-tighter italic">
//           AI <span className="text-blue-600">Expert.</span>
//         </h1>
//         <p className="text-slate-500 mb-12 font-medium">Appliance ki problem batao, hum solution denge.</p>

//         <form onSubmit={handleDiagnose} className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 space-y-6">
//           <div>
//             <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Select Appliance</label>
//             <select 
//               value={appliance}
//               onChange={(e) => setAppliance(e.target.value)}
//               className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-bold"
//             >
//               <option>Refrigerator</option>
//               <option>Air Conditioner</option>
//               <option>Washing Machine</option>
//               <option>Microwave Oven</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Describe the Issue</label>
//             <textarea 
//               placeholder="Bhai, kya dikkat aa rahi hai? (e.g. Fridge cooling nahi kar raha)"
//               className="w-full p-6 rounded-[2rem] bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px] text-slate-900"
//               onChange={(e) => setIssue(e.target.value)}
//               required
//             />
//           </div>

//           <button 
//             disabled={loading}
//             className="w-full bg-slate-950 text-white font-black py-5 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-300 disabled:opacity-50"
//           >
//             {loading ? "Analysing Problem... ❄️" : "Get AI Diagnosis"}
//           </button>
//         </form>

//         {result && (
//           <div className="mt-12 p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-2xl shadow-blue-200 animate-in fade-in slide-in-from-bottom-5 duration-500">
//             <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
//               <span>👨‍🔧</span> Golden Ref. Expert Advice:
//             </h3>
//             <p className="leading-relaxed font-medium text-blue-50 whitespace-pre-wrap">{result}</p>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }



// "use client";
// import { useState, useEffect } from "react";

// export default function AIDiagnosis() {
//   const [appliance, setAppliance] = useState("Refrigerator");
//   const [issue, setIssue] = useState("");
//   const [result, setResult] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [history, setHistory] = useState<any[]>([]); // History state

//   // Pehle check karo user login hai ya nahi
//   const getUserId = () => {
//     const savedUser = localStorage.getItem("user");
//     return savedUser ? JSON.parse(savedUser).id : null;
//   };

//   // History load karne ka function
//   const fetchHistory = async () => {
//     const userId = getUserId();
//     if (!userId) return;
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history/${userId}`);
//       const data = await res.json();
//       setHistory(data);
//     } catch (err) { console.error("History error", err); }
//   };

//   useEffect(() => { fetchHistory(); }, []);

//   const handleDiagnose = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setResult("");

//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/diagnose`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ appliance, issue, userId: getUserId() }), // userId bheja
//       });

//       const data = await res.json();
//       if (res.ok) {
//         setResult(data.diagnosis);
//         fetchHistory(); // Result aane ke baad history refresh karo
//       } else {
//         setResult("Bhai, AI thoda busy hai. Baad mein try kar!");
//       }
//     } catch (err) {
//       setResult("Connection error! Backend check kar bhai.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-[#f8fafc] py-20 px-6">
//       <div className="max-w-3xl mx-auto">
//         <h1 className="text-5xl font-black text-slate-950 mb-4 tracking-tighter italic">
//           AI <span className="text-blue-600">Expert.</span>
//         </h1>
//         <p className="text-slate-500 mb-12 font-medium">Appliance ki problem batao, hum solution denge.</p>

//         <form onSubmit={handleDiagnose} className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 space-y-6">
//           <div>
//             <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Select Appliance</label>
//             <select 
//               value={appliance}
//               onChange={(e) => setAppliance(e.target.value)}
//               className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-bold"
//             >
//               <option>Refrigerator</option>
//               <option>Air Conditioner</option>
//               <option>Washing Machine</option>
//               <option>Microwave Oven</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Describe the Issue</label>
//             <textarea 
//               placeholder="Bhai, kya dikkat aa rahi hai? (e.g. Fridge cooling nahi kar raha)"
//               className="w-full p-6 rounded-[2rem] bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px] text-slate-900"
//               onChange={(e) => setIssue(e.target.value)}
//               required
//             />
//           </div>

//           <button 
//             disabled={loading}
//             className="w-full bg-slate-950 text-white font-black py-5 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-300 disabled:opacity-50"
//           >
//             {loading ? "Analysing Problem... ❄️" : "Get AI Diagnosis"}
//           </button>
//         </form>

//         {result && (
//           <div className="mt-12 p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-2xl shadow-blue-200 animate-in fade-in slide-in-from-bottom-5 duration-500">
//             <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
//               <span>👨‍🔧</span> Golden Ref. Expert Advice:
//             </h3>
//             <p className="leading-relaxed font-medium text-blue-50 whitespace-pre-wrap">{result}</p>
//           </div>
//         )}

//         {/* 🔥 Past Consultations Section */}
//         <div className="mt-20">
//           <h2 className="text-2xl font-black text-slate-900 mb-6">Past Consultations</h2>
//           {history.length > 0 ? (
//             <div className="space-y-4">
//               {history.map((item) => (
//                 <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
//                   <div className="flex justify-between items-start mb-2">
//                     <span className="text-blue-600 font-bold text-sm uppercase">{item.appliance}</span>
//                     <span className="text-slate-400 text-xs">{new Date(item.scheduledAt).toLocaleDateString()}</span>
//                   </div>
//                   <p className="text-slate-900 font-bold text-sm mb-2 italic">"{item.issue}"</p>
//                   <p className="text-slate-500 text-xs line-clamp-2">{item.aiDiagnosis}</p>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-slate-400 text-sm italic">No history found. First diagnosis karke dekho bhai!</p>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }


"use client";
import { useState, useEffect } from "react";

export default function AIDiagnosis() {
  const [appliance, setAppliance] = useState("Refrigerator");
  const [issue, setIssue] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]); 

  // 🔥 Naya State: Sirf poora diagnosis dikhane ke liye (Puraana code disturb nahi hoga)
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const getUserId = () => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser).id : null;
  };

  const fetchHistory = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history/${userId}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) { console.error("History error", err); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appliance, issue, userId: getUserId() }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.diagnosis);
        fetchHistory(); 
      } else {
        setResult("Bhai, AI thoda busy hai. Baad mein try kar!");
      }
    } catch (err) {
      setResult("Connection error! Backend check kar bhai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-black text-slate-950 mb-4 tracking-tighter italic">
          AI <span className="text-blue-600">Expert.</span>
        </h1>
        <p className="text-slate-500 mb-12 font-medium">Appliance ki problem batao, hum solution denge.</p>

        <form onSubmit={handleDiagnose} className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Select Appliance</label>
            <select 
              value={appliance}
              onChange={(e) => setAppliance(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-bold"
            >
              <option>Refrigerator</option>
              <option>Air Conditioner</option>
              <option>Washing Machine</option>
              <option>Microwave Oven</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Describe the Issue</label>
            <textarea 
              placeholder="Bhai, kya dikkat aa rahi hai? (e.g. Fridge cooling nahi kar raha)"
              className="w-full p-6 rounded-[2rem] bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px] text-slate-900"
              onChange={(e) => setIssue(e.target.value)}
              required
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-950 text-white font-black py-5 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-300 disabled:opacity-50"
          >
            {loading ? "Analysing Problem... ❄️" : "Get AI Diagnosis"}
          </button>
        </form>

        {result && (
          <div className="mt-12 p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-2xl shadow-blue-200 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>👨‍🔧</span> Golden Ref. Expert Advice:
            </h3>
            <p className="leading-relaxed font-medium text-blue-50 whitespace-pre-wrap">{result}</p>
          </div>
        )}

        {/* 🔥 Updated History Section: Ab card clickable hai */}
        <div className="mt-20">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Past Consultations</h2>
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)} // Card click pe naya state set hoga
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-blue-600 font-bold text-sm uppercase">{item.appliance}</span>
                    <span className="text-slate-400 text-xs">{new Date(item.scheduledAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-900 font-bold text-sm mb-2 italic">"{item.issue}"</p>
                  <p className="text-slate-500 text-xs line-clamp-2">{item.aiDiagnosis}</p>
                  <p className="mt-3 text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Click to read full diagnosis →</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm italic">No history found. First diagnosis karke dekho bhai!</p>
          )}
        </div>

        {/* 🔥 Modal Popup Logic (Jab selectedItem null nahi hoga tab dikhega) */}
        {selectedItem && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 relative animate-in zoom-in duration-300">
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-950 text-2xl font-bold"
              >✕</button>
              
              <div className="mb-6">
                <span className="text-blue-600 font-black text-xs uppercase tracking-widest">{selectedItem.appliance}</span>
                <h3 className="text-2xl font-black text-slate-950 mt-1">Diagnosis Details</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Your Issue:</p>
                  <p className="text-slate-800 font-medium italic">"{selectedItem.issue}"</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-2 flex items-center gap-1">
                    <span>👨‍🔧</span> Expert Solution:
                  </p>
                  <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                    {selectedItem.aiDiagnosis}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-bold hover:bg-slate-950 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
