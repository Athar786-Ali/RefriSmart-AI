"use client";

import { useEffect, useState } from "react";
import { useCallback } from "react";

type HistoryItem = {
  id: string;
  appliance: string;
  issue: string;
  aiDiagnosis: string;
  scheduledAt: string;
};

export default function AIDiagnosis() {
  const [appliance, setAppliance] = useState("Refrigerator");
  const [issue, setIssue] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const getUserId = () => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser).id as string;
    } catch {
      return null;
    }
  };

  const fetchHistory = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history/${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (err) {
      console.error("History error", err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
        setResult(data?.error || data?.details || "AI service is currently unavailable. Please try again.");
      }
    } catch {
      setResult("Connection error. Please check the backend service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 sm:px-6 py-10 bg-[radial-gradient(circle_at_top_right,#0f172a_0%,#020617_45%,#000814_100%)]">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <section className="rounded-[2rem] border border-cyan-400/20 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-cyan-900/20 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">AI Assistant</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-3">Smart appliance diagnosis</h1>
          <p className="text-slate-300 mt-3 mb-8">
            Describe the problem and get technician-style guidance in seconds.
          </p>

          <form onSubmit={handleDiagnose} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
                Appliance type
              </label>
              <select
                value={appliance}
                onChange={(e) => setAppliance(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none text-slate-100 font-medium"
              >
                <option>Refrigerator</option>
                <option>Air Conditioner</option>
                <option>Washing Machine</option>
                <option>Microwave Oven</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
                Issue details
              </label>
              <textarea
                placeholder="Example: Cooling is inconsistent and there is noise near the compressor."
                className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none min-h-[150px] text-slate-100 placeholder:text-slate-400"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold py-4 rounded-xl hover:from-cyan-300 hover:to-blue-400 disabled:opacity-60 shadow-lg shadow-cyan-900/30"
            >
              {loading ? "Analyzing..." : "Get AI Diagnosis"}
            </button>
          </form>

          {result && (
            <div className="mt-8 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white shadow-2xl shadow-cyan-900/30 border border-cyan-300/40">
              <h3 className="text-lg font-bold mb-2">Golden Refrigeration Technician Advice</h3>
              <p className="leading-relaxed text-cyan-50 whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-cyan-400/20 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-cyan-900/20 p-6 sm:p-8 h-fit">
          <h2 className="text-2xl font-black text-white">Consultation history</h2>
          <p className="text-slate-300 text-sm mt-2 mb-6">Review your previous diagnosis records.</p>

          {history.length > 0 ? (
            <div className="space-y-3 max-h-[28rem] overflow-auto pr-1">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="w-full text-left bg-slate-800 border border-slate-700 p-4 rounded-xl hover:border-cyan-400/60 hover:bg-cyan-500/10"
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="text-cyan-300 font-semibold text-sm uppercase">{item.appliance}</span>
                    <span className="text-slate-400 text-xs">{new Date(item.scheduledAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-100 text-sm font-medium line-clamp-2">{item.issue}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No consultations yet. Submit your first diagnosis request.</p>
          )}
        </section>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-2xl font-semibold"
            >
              ×
            </button>

            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 font-semibold">{selectedItem.appliance}</p>
            <h3 className="text-2xl font-black text-white mt-2">Diagnosis details</h3>

            <div className="mt-6 rounded-xl bg-slate-800 border border-slate-700 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-300 font-semibold mb-1">Issue</p>
              <p className="text-slate-100">{selectedItem.issue}</p>
            </div>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-cyan-300 font-semibold mb-2">Recommendation</p>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedItem.aiDiagnosis}</p>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="mt-7 w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 py-3 rounded-xl font-semibold hover:from-cyan-300 hover:to-blue-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
