import React from "react";
import { Store } from "lucide-react";
import { Page, Section } from "../components/ui/common";
import { Badge } from "../components/ui/Logo";
import { foodBrands } from "../data/seed";

export const Brands: React.FC = () => (
  <Page>
    <Section title="Food Brands" sub="Discover partner brands and their products. Sponsored placements are labeled.">
      <div className="grid sm:grid-cols-2 gap-4">
        {foodBrands.map((b) => (
          <div key={b.id} className="rounded-2xl bg-white/[0.04] border border-white/10 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-300 font-bold">{b.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <h3 className="font-bold text-white">{b.name}</h3>
                  <p className="text-xs text-zinc-400">{b.tagline} · {b.category}</p>
                </div>
              </div>
              {b.sponsored && <Badge kind="Sponsored" />}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {b.products.map((p) => (
                <div key={p.id} className="rounded-xl bg-black/30 border border-white/5 p-3 text-center relative">
                  {p.sponsored && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />}
                  <p className="text-xs text-white leading-tight">{p.name}</p>
                  <p className="text-amber-400 font-bold text-sm mt-1">${p.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/20 flex items-center justify-center gap-2"><Store size={14} /> Visit Brand</button>
          </div>
        ))}
      </div>
    </Section>
  </Page>
);
