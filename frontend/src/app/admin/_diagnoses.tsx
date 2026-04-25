"use client";
import { useState } from "react";
import type { SectionProps } from "./_types";
import type { DiagnosisItem } from "@/types";

export function DiagnosesSection({ diagnoses }: SectionProps) {
  const [selected, setSelected] = useState<DiagnosisItem | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-white">AI Diagnosis Logs</h3>
          <span className="text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full">{diagnoses.length} sessions</span>
        </div>

        <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
          {diagnoses.map((d, i) => (
            <button
              key={d.id ?? i}
              onClick={() => setSelected(selected?.id === d.id ? null : d)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${selected?.id === d.id ? "border-cyan-500/40 bg-cyan-500/5" : "border-slate-700 bg-slate-900 hover:border-cyan-500/20"}`}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">{(d as any).appliance || "Appliance"}</p>
                    {(d as any).language && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-600 text-slate-400">{(d as any).language}</span>
                    )}
                    {d.customer?.name ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-500/30 text-blue-400 bg-blue-500/10">Logged In</span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-600 text-slate-500">Guest</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{(d as any).concern || (d as any).issue || "—"}</p>
                  {(d as any).createdAt && (
                    <p className="text-[10px] text-slate-600 mt-0.5">{new Date((d as any).createdAt).toLocaleString()}</p>
                  )}
                </div>
                <span className="text-slate-500 text-xs shrink-0">{selected?.id === d.id ? "▲" : "▼"}</span>
              </div>

              {/* Expanded view */}
              {selected?.id === d.id && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3 text-left">
                  {(d as any).concern && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Customer Concern</p>
                      <p className="text-sm text-slate-200">{(d as any).concern}</p>
                    </div>
                  )}
                  {(d as any).diagnosis && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-cyan-500/70 mb-1">AI Diagnosis</p>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{(d as any).diagnosis}</p>
                    </div>
                  )}
                  {(d as any).estimatedCost && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-500/70 mb-1">Cost Estimate</p>
                      <p className="text-sm text-emerald-400 font-bold">{(d as any).estimatedCost}</p>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
          {!diagnoses.length && (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg font-semibold">No AI diagnoses yet</p>
              <p className="text-slate-600 text-sm mt-1">Sessions will appear here when customers use the AI tool.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
