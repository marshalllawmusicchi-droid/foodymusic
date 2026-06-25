import React from "react";
import { Sparkles, ArrowRight, UtensilsCrossed, Music2, PiggyBank, ChefHat, Check } from "lucide-react";
import { Badge } from "../components/ui/Logo";
import { useApp } from "../context/AppContext";
import { recipes, coupons, artists, IMG } from "../data/seed";
import { RecipeCard, ArtistCard } from "../components/Cards";

const valueProps = [
  { icon: UtensilsCrossed, title: "Food", desc: "AI recipes tuned to your taste, budget, and pantry.", color: "text-amber-400" },
  { icon: Music2, title: "Music", desc: "Curated Spotify playlists matched to every meal.", color: "text-[#1db954]" },
  { icon: PiggyBank, title: "Savings", desc: "Stacked coupons & affiliate grocery deals.", color: "text-emerald-400" },
  { icon: ChefHat, title: "Kitchen+", desc: "Pro tools and gear that level up your cooking.", color: "text-violet-400" },
];

export const Landing: React.FC = () => {
  const { navigate } = useApp();
  return (
    <div className="bg-[#0a0a0b]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img src={IMG.hero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/60 via-[#0a0a0b]/80 to-[#0a0a0b]" />
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
          <img src="/logo.PNG" alt="Foody Music logo" className="mx-auto mb-6 w-[220px] h-auto" />
          <p className="text-amber-400 font-semibold tracking-widest text-sm uppercase">Foody Music</p>
          <h1 className="mt-3 text-5xl sm:text-7xl font-black text-white tracking-tight">
            Cook. <span className="text-amber-400">Listen.</span> <span className="text-emerald-400">Save.</span>
          </h1>
          <p className="mt-5 text-lg text-zinc-300 max-w-2xl mx-auto">
            Your AI concierge for food, music, grocery savings, and kitchen gear — all in one premium, mobile-first experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <button onClick={() => navigate("concierge")} className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-amber-500 text-black font-bold hover:bg-amber-400 transition shadow-[0_0_30px_-5px_rgba(245,158,11,0.6)]">
              <Sparkles size={18} /> Ask the Concierge
            </button>
            <button onClick={() => navigate("subscription")} className="px-6 py-3.5 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition">
              Go Premium · $4.99/mo
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Value props */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-10 relative">
          {valueProps.map((v) => (
            <div key={v.title} className="rounded-2xl bg-white/[0.05] border border-white/10 p-5 backdrop-blur">
              <v.icon className={v.color} size={28} />
              <h3 className="mt-3 font-bold text-white">{v.title}</h3>
              <p className="text-sm text-zinc-400 mt-1">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Featured recipes */}
        <div className="mt-16 flex items-end justify-between mb-5">
          <h2 className="text-2xl font-bold text-white">Featured Recipes</h2>
          <button onClick={() => navigate("recipes")} className="text-amber-400 text-sm font-semibold flex items-center gap-1">View all <ArrowRight size={15} /></button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {recipes.slice(0, 4).map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>

        {/* Featured deals */}
        <div className="mt-16 mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-white">Featured Deals</h2>
          <button onClick={() => navigate("deals")} className="text-emerald-400 text-sm font-semibold flex items-center gap-1">View all <ArrowRight size={15} /></button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {coupons.slice(0, 4).map((c) => (
            <div key={c.id} className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-white/[0.03] border border-emerald-500/20 p-4">
              <p className="text-xs text-zinc-400">{c.brand}</p>
              <p className="text-emerald-300 font-bold text-2xl mt-1">{c.discount}</p>
              <p className="text-sm text-zinc-300 mt-1">{c.detail}</p>
              {c.sponsored && <Badge kind="Sponsored" className="mt-3 inline-block" />}
            </div>
          ))}
        </div>

        {/* Sample artists */}
        <div className="mt-16 mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-white">Sample Artists</h2>
          <button onClick={() => navigate("artists")} className="text-[#1db954] text-sm font-semibold flex items-center gap-1">View all <ArrowRight size={15} /></button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {artists.slice(0, 4).map((a) => <ArtistCard key={a.id} artist={a} />)}
        </div>

        {/* Pricing teaser */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-amber-500/15 to-emerald-500/10 border border-amber-500/20 p-8 text-center">
          <h2 className="text-3xl font-black text-white">Foody Music Premium</h2>
          <p className="text-zinc-300 mt-2">Unlimited concierge plans, exclusive playlists, and the best savings.</p>
          <p className="mt-4 text-5xl font-black text-amber-400">$4.99<span className="text-lg text-zinc-400 font-medium">/mo</span></p>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-300">
            {["Unlimited AI meal plans", "Premium playlists", "Max coupon stacking", "Kitchen+ discounts"].map((f) => (
              <span key={f} className="flex items-center gap-1.5"><Check size={15} className="text-emerald-400" /> {f}</span>
            ))}
          </div>
          <button onClick={() => navigate("subscription")} className="mt-6 px-8 py-3.5 rounded-full bg-amber-500 text-black font-bold hover:bg-amber-400 transition">Start Free Trial</button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#08080a] px-6 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.PNG" alt="Foody Music logo" className="w-7 h-auto" />
              <span className="font-bold text-white">FoodyMusic</span>
            </div>
            <p className="text-sm text-zinc-500 mt-3">Cook. Listen. Save.</p>
          </div>
          {[
            { h: "Explore", l: ["Recipes", "Music", "Deals", "Kitchen+"] },
            { h: "Company", l: ["About", "Careers", "Press", "Contact"] },
            { h: "Legal", l: ["Privacy", "Terms", "Affiliate Disclosure", "Cookies"] },
          ].map((col) => (
            <div key={col.h}>
              <h4 className="font-semibold text-white text-sm mb-3">{col.h}</h4>
              <ul className="space-y-2">{col.l.map((x) => <li key={x}><span className="text-sm text-zinc-500 hover:text-amber-400 cursor-pointer">{x}</span></li>)}</ul>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-zinc-600 mt-10">© 2026 Foody Music. Affiliate links and sponsored content are clearly labeled. Spotify content via embeds only.</p>
      </footer>
    </div>
  );
};
