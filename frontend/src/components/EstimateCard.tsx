type EstimateCardProps = {
  estimatedCostRange: string;
  onBook: () => void;
};

export default function EstimateCard({ estimatedCostRange, onBook }: EstimateCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-lg font-bold text-slate-900">Estimated Repair Cost</h4>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Consultant Estimate</span>
      </div>
      <p className="text-3xl font-black text-emerald-700">{estimatedCostRange || "Awaiting estimate"}</p>
      <p className="text-sm text-slate-600">
        This is a preliminary estimate based on your report. Final pricing is confirmed after a technician inspection.
      </p>
      <button
        type="button"
        onClick={onBook}
        className="min-h-[48px] w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition-transform active:scale-95"
      >
        Book Technician Now
      </button>
    </div>
  );
}
