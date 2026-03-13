import React from "react";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export default function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 shadow-md shadow-blue-300/50">
        <svg viewBox="0 0 24 24" className="h-5.5 w-5.5 text-white" fill="none" aria-hidden="true">
          <path d="M6 8h12v8H6z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 5h6M9 19h6M12 5v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="absolute -bottom-1 -right-1 rounded-full border border-blue-200 bg-white px-1.5 py-0.5 text-[8px] font-black text-blue-700 leading-none">
          GR
        </span>
      </span>

      {compact ? (
        <span className="text-lg sm:text-xl font-black tracking-tight leading-none whitespace-nowrap">
          <span className="bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent">GOLDEN</span>{" "}
          <span className="text-slate-900">REFRIGERATION</span>
        </span>
      ) : (
        <span className="text-xl sm:text-2xl font-black tracking-tight leading-none whitespace-nowrap">
          <span className="bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent">GOLDEN</span>{" "}
          <span className="text-slate-900">REFRIGERATION</span>
        </span>
      )}
    </div>
  );
}
