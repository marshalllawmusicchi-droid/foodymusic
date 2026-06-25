import React, { useState } from "react";
import { ChefHat } from "lucide-react";
import { Page, Section } from "../components/ui/common";
import { Badge } from "../components/ui/Logo";
import { ProductCard } from "../components/Cards";
import { products } from "../data/seed";

const cats = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

export const Kitchen: React.FC = () => {
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("featured");
  let list = products.filter((p) => cat === "All" || p.category === cat);
  if (sort === "price") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

  return (
    <Page>
      <div className="rounded-3xl bg-gradient-to-r from-violet-500/15 to-amber-500/10 border border-violet-500/20 p-6 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center"><ChefHat size={24} className="text-violet-300" /></div>
        <div>
          <h2 className="text-2xl font-black text-white">Kitchen+ Store</h2>
          <p className="text-zinc-300 text-sm">Pro-grade tools and gear — affiliate partner products to level up every dish.</p>
        </div>
      </div>

      <Section>
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-5">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium ${cat === c ? "bg-amber-500 text-black" : "bg-white/[0.05] text-zinc-300 hover:bg-white/10"}`}>{c}</button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full bg-white/[0.05] border border-white/10 px-4 py-2 text-sm text-white outline-none">
            <option value="featured">Featured</option>
            <option value="price">Lowest price</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
        <p className="text-xs text-zinc-500 mb-4 flex items-center gap-1"><Badge kind="Affiliate" /> Purchases support Foody Music via affiliate commissions.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>
    </Page>
  );
};
