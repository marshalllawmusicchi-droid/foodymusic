import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Page, Section } from "../components/ui/common";
import { RecipeCard } from "../components/Cards";
import { recipes } from "../data/seed";

const cuisines = ["All", ...Array.from(new Set(recipes.map((r) => r.cuisine)))];

export const Recipes: React.FC = () => {
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [sort, setSort] = useState("featured");

  const list = useMemo(() => {
    let l = recipes.filter(
      (r) => (cuisine === "All" || r.cuisine === cuisine) &&
        (q === "" || r.title.toLowerCase().includes(q.toLowerCase()))
    );
    if (sort === "price") l = [...l].sort((a, b) => a.costPerServing - b.costPerServing);
    if (sort === "time") l = [...l].sort((a, b) => a.time - b.time);
    return l;
  }, [q, cuisine, sort]);

  return (
    <Page>
      <Section title="Recipes" sub="AI-curated dishes balanced for flavor, budget, and the perfect soundtrack">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex items-center gap-2 flex-1 rounded-full bg-white/[0.05] border border-white/10 px-4 py-2.5">
            <Search size={16} className="text-zinc-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search recipes…" className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-zinc-500" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full bg-white/[0.05] border border-white/10 px-4 py-2.5 text-sm text-white outline-none">
            <option value="featured">Featured</option>
            <option value="price">Lowest cost</option>
            <option value="time">Quickest</option>
          </select>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
          {cuisines.map((c) => (
            <button key={c} onClick={() => setCuisine(c)} className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${cuisine === c ? "bg-amber-500 text-black" : "bg-white/[0.05] text-zinc-300 hover:bg-white/10"}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {list.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
        {list.length === 0 && <p className="text-center text-zinc-500 py-12">No recipes found.</p>}
      </Section>
    </Page>
  );
};
