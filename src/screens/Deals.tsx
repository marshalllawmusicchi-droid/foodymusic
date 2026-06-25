import React, { useState } from "react";
import { Tag } from "lucide-react";
import { Page, Section } from "../components/ui/common";
import { Badge } from "../components/ui/Logo";
import { CouponCard } from "../components/Cards";
import { coupons } from "../data/seed";

const cats = ["All", ...Array.from(new Set(coupons.map((c) => c.category)))];

export const Deals: React.FC = () => {
  const [cat, setCat] = useState("All");
  const list = coupons.filter((c) => cat === "All" || c.category === cat);
  return (
    <Page>
      {/* Sponsored banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/20 to-emerald-500/15 border border-amber-500/20 p-6 mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <Badge kind="Sponsored" />
          <h2 className="text-2xl font-black text-white mt-2">FreshMart Weekend — 20% off your entire cart</h2>
          <p className="text-zinc-300 text-sm mt-1">Stack with clipped coupons for maximum savings.</p>
        </div>
        <button className="px-6 py-3 rounded-full bg-amber-500 text-black font-bold hover:bg-amber-400">Shop Now</button>
      </div>

      <Section title="Deals & Coupons" sub="Clip coupons and stack affiliate grocery savings">
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-5">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1 ${cat === c ? "bg-emerald-500 text-black" : "bg-white/[0.05] text-zinc-300 hover:bg-white/10"}`}>
              <Tag size={13} /> {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {list.map((c) => <CouponCard key={c.id} coupon={c} />)}
        </div>
      </Section>

      <Section title="Affiliate Grocery Deals" sub="Partner offers — clearly labeled">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["FreshMart Delivery — $10 off first order", "GreenGrocer Produce Box — Free shipping", "PrimeMeats Bulk — $25 off $100", "PantryCo Bundle — Buy 3 save $5"].map((d) => (
            <div key={d} className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 flex items-center justify-between">
              <div><Badge kind="Affiliate" /><p className="text-white font-semibold mt-2">{d}</p></div>
              <button className="px-4 py-2 rounded-full bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400">Get Deal</button>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  );
};
