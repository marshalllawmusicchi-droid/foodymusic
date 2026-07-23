import React from "react";

export const ForkClef: React.FC<{ size?: number; className?: string }> = ({ size = 36, className = "" }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none">
    <defs>
      <linearGradient id="fc" x1="0" y1="0" x2="64" y2="64">
        <stop offset="0" stopColor="#fbbf24" />
        <stop offset="1" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    {/* fork tines */}
    <g stroke="url(#fc)" strokeWidth="2.6" strokeLinecap="round">
      <line x1="20" y1="8" x2="20" y2="22" />
      <line x1="27" y1="8" x2="27" y2="22" />
      <line x1="34" y1="8" x2="34" y2="22" />
    </g>
    {/* clef / fork stem swirl */}
    <path
      d="M27 22 C27 34, 41 36, 41 46 C41 55, 30 58, 24 53 C20 49.5, 21 43, 26 43 C30 43, 31 47, 28.5 49"
      stroke="url(#fc)" strokeWidth="3.4" strokeLinecap="round" fill="none"
    />
    <circle cx="24.5" cy="52" r="2.4" fill="#f59e0b" />
  </svg>
);

export const Logo: React.FC<{ size?: number; onClick?: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="flex w-full items-center justify-center cursor-pointer select-none lg:-mx-4 lg:-mt-3 lg:-mb-4 lg:w-[calc(100%+2rem)]"
  >
    <img
      src="/logo.PNG"
      alt="FoodyMusic"
      className="h-auto max-w-none object-contain w-[170px] lg:w-[82.5%]"
    />
  </div>
);

export const Badge: React.FC<{ kind: "Sponsored" | "Promoted" | "Affiliate"; className?: string }> = ({ kind, className = "" }) => {
  const colors = {
    Sponsored: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Promoted: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    Affiliate: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${colors[kind]} ${className}`}>
      {kind}
    </span>
  );
};

export const Waveform: React.FC<{ className?: string; bars?: number }> = ({ className = "", bars = 16 }) => (
  <div className={`flex items-end gap-0.5 h-4 ${className}`}>
    {Array.from({ length: bars }).map((_, i) => (
      <span
        key={i}
        className="w-0.5 rounded-full bg-[#1db954] animate-pulse"
        style={{ height: `${30 + Math.abs(Math.sin(i)) * 70}%`, animationDelay: `${i * 80}ms` }}
      />
    ))}
  </div>
);
