import { Snowflake, Flame } from "lucide-react";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  theme?: "light" | "dark";
};

export default function BrandLogo({ compact = false, className = "", theme = "light" }: BrandLogoProps) {
  const textColor = theme === "dark" ? "text-white drop-shadow-md" : "text-slate-900";
  
  return (
    <div className={`inline-flex items-center gap-3 md:gap-4 group ${className}`}>
      {/* Unique Industry-Level Icon */}
      <div className="relative flex shrink-0 items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-slate-950 shadow-[0_10px_25px_rgba(0,0,0,0.3)] overflow-hidden border-[3px] border-amber-500 group-hover:scale-105 transition-transform duration-300">
        
        {/* Dynamic Inner Gradients (Clash of Heat and Cold) */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-red-600/80 to-transparent mix-blend-screen"></div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-cyan-500/80 to-transparent mix-blend-screen"></div>
        
        {/* Abstract Fusion SVG Elements */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <Flame className="absolute -left-1 text-amber-500 w-7 h-7 drop-shadow-lg" />
          <Snowflake className="absolute -right-1 text-cyan-400 w-7 h-7 drop-shadow-lg animate-[spin_15s_linear_infinite]" />
        </div>
      </div>

      {/* Sharpened Typography */}
      {compact ? (
        <span className="flex flex-col justify-center whitespace-nowrap">
          <span className={`text-lg md:text-xl font-black tracking-tight leading-none ${textColor}`}>GOLDEN</span>
          <span className="text-[11px] md:text-xs font-bold tracking-[0.25em] text-amber-500 uppercase mt-1 leading-none">Refrigeration</span>
        </span>
      ) : (
        <span className="flex flex-col justify-center whitespace-nowrap">
          <span className={`text-[28px] font-black tracking-tight leading-none ${textColor}`}>GOLDEN</span>
          <span className="text-[13px] font-extrabold tracking-[0.28em] text-amber-500 uppercase mt-1.5 leading-none">Refrigeration</span>
        </span>
      )}
    </div>
  );
}
