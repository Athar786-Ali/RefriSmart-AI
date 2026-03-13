export default function DiagnosisSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-5 w-40 animate-pulse rounded-md bg-slate-200" />
      <div className="h-4 w-full animate-pulse rounded-md bg-slate-200" />
      <div className="h-4 w-11/12 animate-pulse rounded-md bg-slate-200" />
      <div className="h-4 w-2/3 animate-pulse rounded-md bg-slate-200" />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

