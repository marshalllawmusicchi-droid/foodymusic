import React from "react";
import { Heart, Clock, Star, Scissors, Check, ExternalLink, ShoppingCart, Play } from "lucide-react";
import { Badge, Waveform } from "./ui/Logo";
import { useApp } from "../context/AppContext";
import type { Recipe, Coupon, Product, Artist, Playlist } from "../data/seed";

const money = (n: number) => "$" + n.toFixed(2);

export const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  const { navigate, saved, toggleSave } = useApp();
  const isSaved = saved.includes(recipe.id);
  return (
    <div
      onClick={() => navigate("recipeDetail", recipe.id)}
      className="group relative rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(245,158,11,0.3)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {recipe.sponsored && <Badge kind="Sponsored" className="absolute top-3 left-3" />}
        <button
          onClick={(e) => { e.stopPropagation(); toggleSave(recipe.id); }}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur hover:bg-black/70 transition"
        >
          <Heart size={16} className={isSaved ? "fill-amber-400 text-amber-400" : "text-white"} />
        </button>
        <span className="absolute bottom-3 left-3 text-xs font-semibold text-emerald-300">{money(recipe.costPerServing)}/serving</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm leading-snug">{recipe.title}</h3>
        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1"><Clock size={12} /> {recipe.time}m</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300">{recipe.cuisine}</span>
        </div>
      </div>
    </div>
  );
};

export const CouponCard: React.FC<{ coupon: Coupon }> = ({ coupon }) => {
  const { clipped, toggleClip } = useApp();
  const isClipped = clipped.includes(coupon.id);
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-emerald-500/10 to-white/[0.03] border border-emerald-500/20 p-4 overflow-hidden">
      {coupon.sponsored && <Badge kind="Sponsored" className="absolute top-3 right-3" />}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-sm">
          {coupon.brand.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-xs text-zinc-400">{coupon.brand}</p>
          <p className="text-emerald-300 font-bold text-lg leading-none">{coupon.discount}</p>
        </div>
      </div>
      <p className="text-sm text-zinc-300 mt-3">{coupon.detail}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-zinc-500">Expires {coupon.expiry}</span>
        <button
          onClick={() => toggleClip(coupon.id)}
          className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition ${
            isClipped ? "bg-emerald-500 text-black" : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {isClipped ? <><Check size={13} /> Clipped</> : <><Scissors size={13} /> Clip</>}
        </button>
      </div>
    </div>
  );
};

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
  <div className="group rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden hover:border-amber-500/40 transition hover:-translate-y-1">
    <div className="relative aspect-square overflow-hidden bg-zinc-900">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      {product.sponsored && <Badge kind="Sponsored" className="absolute top-3 left-3" />}
      <Badge kind="Affiliate" className="absolute top-3 right-3" />
    </div>
    <div className="p-4">
      <p className="text-[11px] text-zinc-500 uppercase tracking-wide">{product.brand}</p>
      <h3 className="font-semibold text-white text-sm mt-0.5 leading-snug">{product.name}</h3>
      <div className="flex items-center gap-1 mt-1 text-xs text-amber-400">
        <Star size={12} className="fill-amber-400" /> {product.rating}
        <span className="text-zinc-500">({product.reviews})</span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-white font-bold">${product.price.toFixed(2)}</span>
        <button className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500 text-black hover:bg-amber-400 transition">
          <ShoppingCart size={13} /> Buy
        </button>
      </div>
    </div>
  </div>
);

export const ArtistCard: React.FC<{ artist: Artist }> = ({ artist }) => {
  const { followed, toggleFollow } = useApp();
  const isFollowed = followed.includes(artist.id);
  return (
    <div className="group rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden hover:border-[#1db954]/40 transition text-center hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {artist.promoted && <Badge kind="Promoted" className="absolute top-3 left-3" />}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm">{artist.name}</h3>
        <p className="text-xs text-zinc-400">{artist.genre} · {artist.followers}</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => toggleFollow(artist.id)}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-full transition ${
              isFollowed ? "bg-white/10 text-white" : "bg-[#1db954] text-black hover:bg-[#1ed760]"
            }`}
          >
            {isFollowed ? "Following" : "Follow"}
          </button>
          <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition">
            <ExternalLink size={13} className="text-[#1db954]" />
          </a>
        </div>
      </div>
    </div>
  );
};

export const PlaylistCard: React.FC<{ playlist: Playlist; compact?: boolean }> = ({ playlist, compact }) => (
  <div className="rounded-2xl bg-gradient-to-br from-[#1db954]/10 to-white/[0.03] border border-[#1db954]/20 p-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1db954]/20 flex items-center justify-center">
          <Play size={20} className="fill-[#1db954] text-[#1db954]" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">{playlist.title}</h3>
          <p className="text-xs text-zinc-400">{playlist.mood} · {playlist.tracks} tracks</p>
        </div>
      </div>
      <Waveform />
    </div>
    {!compact && <p className="text-xs text-zinc-400 mt-3 italic">"{playlist.note}"</p>}
    {/* Spotify embed placeholder */}
    <div className="mt-3 rounded-xl bg-black/40 border border-white/10 h-16 flex items-center px-4 gap-3">
      <div className="w-2.5 h-2.5 rounded-full bg-[#1db954] animate-pulse" />
      <span className="text-xs text-zinc-500">Spotify embed placeholder</span>
    </div>
    <a
      href={`https://open.spotify.com/playlist/${playlist.spotifyId}`}
      target="_blank" rel="noopener noreferrer"
      className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-full bg-[#1db954] text-black hover:bg-[#1ed760] transition"
    >
      <ExternalLink size={13} /> Open in Spotify
    </a>
  </div>
);
