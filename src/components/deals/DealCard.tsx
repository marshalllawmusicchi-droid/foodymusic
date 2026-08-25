import React, { useState } from "react";
import { Check, ListPlus, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/Logo";
import { useApp } from "@/context/AppContext";
import { dealSavingsAmount, dealSavingsPercent } from "@/services/deals";
import type { Deal } from "@/types/deals";

const money = (value: number) => `$${value.toFixed(2)}`;

type DealCardProps = {
  deal: Deal;
};

export const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const { addGrocery, grocery } = useApp();
  const [justAdded, setJustAdded] = useState(false);
  const inList = Object.prototype.hasOwnProperty.call(grocery, deal.productName);
  const savings = dealSavingsAmount(deal);
  const savingsPct = dealSavingsPercent(deal);

  const handleAddToGrocery = () => {
    addGrocery([deal.productName]);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <article className="flex h-full flex-col rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{deal.category}</p>
          <h3 className="mt-1 text-base font-bold leading-snug text-white">{deal.productName}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-zinc-400">
            <MapPin size={13} className="text-emerald-400" />
            {deal.store}
            {deal.distanceMiles !== undefined && (
              <span className="text-zinc-500">· {deal.distanceMiles.toFixed(1)} mi</span>
            )}
          </p>
        </div>
        {deal.weeklyDeal && <Badge kind="Sponsored" />}
      </div>

      <div className="mt-4 flex items-end gap-3">
        <div>
          <p className="text-xs text-zinc-500 line-through">{money(deal.regularPrice)}</p>
          <p className="text-2xl font-black text-emerald-300">{money(deal.salePrice)}</p>
        </div>
        <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
          Save {money(savings)} ({savingsPct}%)
        </div>
      </div>

      {deal.couponLabel && (
        <div className="mt-3 inline-flex items-center gap-1 self-start rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
          <Tag size={12} /> {deal.couponLabel}
        </div>
      )}

      <button
        type="button"
        onClick={handleAddToGrocery}
        className={`mt-4 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
          inList || justAdded
            ? "bg-emerald-500 text-black"
            : "bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        {inList || justAdded ? (
          <>
            <Check size={15} /> Added to Grocery List
          </>
        ) : (
          <>
            <ListPlus size={15} /> Add to Grocery List
          </>
        )}
      </button>
    </article>
  );
};
