import React from "react";
import { ArrowLeft, Clock, Users, Heart, ListPlus, Check } from "lucide-react";
import { Page } from "../components/ui/common";
import { Badge } from "../components/ui/Logo";
import { PlaylistCard, ProductCard, CouponCard } from "../components/Cards";
import { useApp } from "../context/AppContext";
import { recipes, playlists, products, coupons } from "../data/seed";

const money = (n: number) => "$" + n.toFixed(2);

export const RecipeDetail: React.FC = () => {
  const { activeRecipe, navigate, saved, toggleSave, addGrocery } = useApp();
  const recipe = recipes.find((r) => r.id === activeRecipe) || recipes[0];
  const playlist = playlists.find((p) => p.title.includes(recipe.cuisine)) || playlists[0];
  const isSaved = saved.includes(recipe.id);

  return (
    <Page>
      <button onClick={() => navigate("recipes")} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white mb-4"><ArrowLeft size={16} /> Back to recipes</button>

      <div className="relative rounded-3xl overflow-hidden aspect-[21/9] mb-6">
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 p-6">
          {recipe.sponsored && <Badge kind="Sponsored" className="mb-2 inline-block" />}
          <h1 className="text-3xl sm:text-4xl font-black text-white">{recipe.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-zinc-300">
            <span className="flex items-center gap-1"><Clock size={15} /> {recipe.time} min</span>
            <span className="flex items-center gap-1"><Users size={15} /> {recipe.servings} servings</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{recipe.cuisine}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <p className="text-zinc-300">{recipe.description}</p>

          <div className="flex gap-3">
            <button onClick={() => toggleSave(recipe.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm ${isSaved ? "bg-white/10 text-amber-300" : "bg-amber-500 text-black hover:bg-amber-400"}`}>
              <Heart size={16} className={isSaved ? "fill-amber-400" : ""} /> {isSaved ? "Saved" : "Save Recipe"}
            </button>
            <button onClick={() => { addGrocery(recipe.ingredients.map((i) => i.name)); navigate("grocery"); }} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400">
              <ListPlus size={16} /> Shopping List
            </button>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">Ingredients</h2>
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 divide-y divide-white/5">
              {recipe.ingredients.map((ing) => (
                <div key={ing.name} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-zinc-200 text-sm flex items-center gap-2"><Check size={14} className="text-emerald-400" /> {ing.name}</span>
                  <span className="text-zinc-500 text-sm">{ing.qty}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">Instructions</h2>
            <ol className="space-y-3">
              {recipe.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-sm">{i + 1}</span>
                  <p className="text-zinc-300 text-sm pt-0.5">{s}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 to-emerald-500/10 border border-amber-500/20 p-5">
            <h3 className="font-semibold text-white mb-3">Cost Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-zinc-400">Estimated meal cost</span><span className="text-white font-bold">{money(recipe.mealCost)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Estimated savings</span><span className="text-emerald-400 font-bold">{money(recipe.savings)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Cost per serving</span><span className="text-amber-400 font-bold">{money(recipe.costPerServing)}</span></div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Matched Playlist</h3>
            <PlaylistCard playlist={playlist} compact />
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mt-10 mb-4">Recommended Kitchen+ Tools</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      <h2 className="text-xl font-bold text-white mt-10 mb-4">Related Coupons</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.slice(0, 3).map((c) => <CouponCard key={c.id} coupon={c} />)}
      </div>
    </Page>
  );
};
