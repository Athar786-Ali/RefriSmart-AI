"use client";
import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import type { SectionProps } from "./_types";
import type { DiagnosisItem } from "@/types";

export function DiagnosesSection({ diagnoses }: SectionProps) {
  const [selected, setSelected] = useState<DiagnosisItem | null>(null);
  const [searchQ,  setSearchQ]  = useState("");

  const filtered = useMemo(() => {
    const q = searchQ.toLowerCase();
    if (!q) return diagnoses;
    return diagnoses.filter(d =>
      [d.appliance, d.issue, d.customer?.name, d.customer?.email, d.guestName, d.guestPhone, d.aiDiagnosis]
        .some(v => v?.toLowerCase().includes(q))
    );
  }, [diagnoses, searchQ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-black text-white">AI Diagnosis Logs</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {filtered.length}{filtered.length !== diagnoses.length ? ` of ${diagnoses.length}` : ""} sessions
            </p>
          </div>
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search by appliance, customer…"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-9 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/60 focus:outline-none"
            />
            {searchQ && (
              <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
          {filtered.map((d, i) => (
            <button
              key={d.id ?? i}
              onClick={() => setSelected(selected?.id === d.id ? null : d)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${selected?.id === d.id ? "border-cyan-500/40 bg-cyan-500/5" : "border-slate-700 bg-slate-900 hover:border-cyan-500/20"}`}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {d.customer?.name ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-500/30 text-blue-400 bg-blue-500/10">Logged In</span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-600 text-slate-500">Guest</span>
                    )}
                    <p className="text-sm font-bold text-white">{d.appliance || "Appliance"}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{d.issue || "—"}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {d.customer?.name || d.guestName || "Anonymous"}{d.customer?.email ? ` · ${d.customer.email}` : d.guestPhone ? ` · ${d.guestPhone}` : ""}
                  </p>
                  {d.createdAt && (
                    <p className="text-[10px] text-slate-600 mt-0.5">{new Date(d.createdAt).toLocaleString()}</p>
                  )}
                </div>
                <span className="text-slate-500 text-xs shrink-0">{selected?.id === d.id ? "▲" : "▼"}</span>
              </div>

              {/* Expanded view */}
              {selected?.id === d.id && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3 text-left">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Customer Concern</p>
                    <p className="text-sm text-slate-200">{d.issue || "No issue details submitted."}</p>
                  </div>
                  {d.aiDiagnosis && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-cyan-500/70 mb-1">AI Diagnosis</p>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{d.aiDiagnosis}</p>
                    </div>
                  )}
                  {d.estimatedCostRange && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-500/70 mb-1">Cost Estimate</p>
                      <p className="text-sm text-emerald-400 font-bold">{d.estimatedCostRange}</p>
                    </div>
                  )}
                  {d.mediaUrl && (
                    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                      {d.mediaType === "video" ? (
                        <video src={d.mediaUrl} controls className="max-h-72 w-full bg-black object-contain" />
                      ) : (
                        <img src={d.mediaUrl} alt={d.appliance || "Diagnosis upload"} className="max-h-72 w-full object-contain bg-black" />
                      )}
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
          {!filtered.length && (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg font-semibold">
                {searchQ ? "No diagnoses match your search 🔍" : "No AI diagnoses yet"}
              </p>
              {searchQ
                ? <button onClick={() => setSearchQ("")} className="text-cyan-400 text-sm mt-2 hover:underline">Clear search</button>
                : <p className="text-slate-600 text-sm mt-1">Sessions will appear here when customers use the AI tool.</p>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
