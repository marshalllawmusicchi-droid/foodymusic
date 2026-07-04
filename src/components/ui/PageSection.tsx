import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageSectionProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PageSection: React.FC<PageSectionProps> = ({
  title,
  description,
  eyebrow,
  action,
  children,
  className,
}) => (
  <section className={cn("rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6", className)}>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">{eyebrow}</p> : null}
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm text-zinc-400">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
    {children}
  </section>
);

export const SectionLink: React.FC<{ label: string; href?: string; onClick?: () => void }> = ({ label, href, onClick }) => {
  const content = (
    <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400">
      {label}
      <ArrowRight size={15} />
    </span>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return <button type="button" onClick={onClick} className="text-left">{content}</button>;
};
