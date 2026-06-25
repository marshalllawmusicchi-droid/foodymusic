import React from "react";

export const Section: React.FC<{ title?: string; sub?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, sub, action, children, className = "" }) => (
  <section className={`mb-10 ${className}`}>
    {(title || action) && (
      <div className="flex items-end justify-between mb-4">
        <div>
          {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
          {sub && <p className="text-sm text-zinc-400 mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

export const Page: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-6 ${className}`}>{children}</div>
);

export const StatPill: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent = "text-white" }) => (
  <div className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3">
    <p className="text-[11px] text-zinc-500 uppercase tracking-wide">{label}</p>
    <p className={`text-lg font-bold ${accent}`}>{value}</p>
  </div>
);
