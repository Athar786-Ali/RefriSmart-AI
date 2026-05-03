import Image from "next/image";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  theme?: "light" | "dark";
};

export default function BrandLogo({ compact = false, className = "", theme = "light" }: BrandLogoProps) {
  const textColor = theme === "dark" ? "text-white drop-shadow-md" : "text-slate-900";
  
  return (
    <div className={`inline-flex items-center gap-3 md:gap-4 group ${className}`}>
      {/* AI-Generated Business Logo */}
      <div className="relative flex shrink-0 items-center justify-center group-hover:scale-105 transition-transform duration-300">
        <Image
          src="/logo.png"
          alt="Golden Refrigeration Logo"
          width={compact ? 44 : 56}
          height={compact ? 44 : 56}
          className="rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.35)] border-2 border-amber-500/60"
          priority
        />
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
