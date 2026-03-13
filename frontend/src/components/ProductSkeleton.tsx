export default function ProductSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-[5/4] animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4 md:p-5">
        <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-6 w-4/5 animate-pulse rounded-md bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded-md bg-slate-200" />
        <div className="h-4 w-2/3 animate-pulse rounded-md bg-slate-200" />
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="h-8 w-28 animate-pulse rounded-md bg-slate-200" />
          <div className="h-12 w-28 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
    </article>
  );
}

