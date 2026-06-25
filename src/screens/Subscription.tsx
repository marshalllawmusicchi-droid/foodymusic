import React from "react";
import { Check, X, Crown } from "lucide-react";
import { Page, Section } from "../components/ui/common";
import { useApp } from "../context/AppContext";

const features = [
  { label: "AI Concierge meal plans", free: "3 / day", premium: "Unlimited" },
  { label: "Curated Spotify playlists", free: true, premium: true },
  { label: "Coupon clipping", free: "5 active", premium: "Unlimited" },
  { label: "Affiliate deal alerts", free: false, premium: true },
  { label: "Premium playlists", free: false, premium: true },
  { label: "Kitchen+ member discounts", free: false, premium: true },
  { label: "Ad-free experience", free: false, premium: true },
  { label: "Saved recipes & lists", free: "10", premium: "Unlimited" },
];

const Cell: React.FC<{ v: boolean | string }> = ({ v }) =>
  typeof v === "boolean"
    ? v ? <Check size={17} className="text-emerald-400 mx-auto" /> : <X size={17} className="text-zinc-600 mx-auto" />
    : <span className="text-sm text-zinc-300">{v}</span>;

export const Subscription: React.FC = () => {
  const { premium, setPremium, user, navigate } = useApp();

  return (
    <Page>
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 text-amber-300 text-sm font-semibold mb-4"><Crown size={15} /> Premium</div>
        <h1 className="text-4xl font-black text-white">Unlock the full Foody Music experience</h1>
        <p className="text-zinc-400 mt-3">Unlimited AI plans, premium playlists, and the deepest savings — all for less than a coffee.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        {/* Free */}
        <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-7">
          <h3 className="text-xl font-bold text-white">Free</h3>
          <p className="text-4xl font-black text-white mt-3">$0<span className="text-base text-zinc-500 font-medium">/mo</span></p>
          <p className="text-sm text-zinc-400 mt-1">Get a taste of the concierge.</p>
          <button onClick={() => setPremium(false)} className={`mt-5 w-full py-3 rounded-full font-semibold ${!premium ? "bg-white/10 text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"}`}>{!premium ? "Current Plan" : "Downgrade"}</button>
        </div>
        {/* Premium */}
        <div className="rounded-3xl bg-gradient-to-br from-amber-500/20 to-emerald-500/10 border border-amber-500/40 p-7 relative shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]">
          <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-amber-500 text-black">Best Value</span>
          <h3 className="text-xl font-bold text-amber-300">Premium</h3>
          <p className="text-4xl font-black text-white mt-3">$4.99<span className="text-base text-zinc-400 font-medium">/mo</span></p>
          <p className="text-sm text-zinc-300 mt-1">Everything, unlimited.</p>
          <button onClick={() => { setPremium(true); if (!user) navigate("profile"); }} className={`mt-5 w-full py-3 rounded-full font-bold ${premium ? "bg-white/15 text-white" : "bg-amber-500 text-black hover:bg-amber-400"}`}>{premium ? "Subscribed ✓" : "Subscribe — $4.99/mo"}</button>
        </div>
      </div>

      <Section title="Compare plans" className="mt-12 max-w-4xl mx-auto">
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <div className="grid grid-cols-3 px-5 py-3 bg-white/[0.03] text-xs font-semibold text-zinc-400 uppercase tracking-wide">
            <span>Feature</span><span className="text-center">Free</span><span className="text-center text-amber-300">Premium</span>
          </div>
          <div className="divide-y divide-white/5">
            {features.map((f) => (
              <div key={f.label} className="grid grid-cols-3 px-5 py-3 items-center">
                <span className="text-sm text-zinc-200">{f.label}</span>
                <span className="text-center"><Cell v={f.free} /></span>
                <span className="text-center"><Cell v={f.premium} /></span>
              </div>
            ))}
          </div>
        </div>
        {premium && (
          <div className="mt-6 rounded-2xl bg-white/[0.04] border border-white/10 p-5 flex items-center justify-between">
            <div><p className="text-white font-semibold">Manage subscription</p><p className="text-sm text-zinc-400">Premium · Renews Jul 25, 2026 · $4.99/mo</p></div>
            <button onClick={() => setPremium(false)} className="px-4 py-2 rounded-full bg-white/10 text-zinc-300 text-sm hover:bg-white/20">Cancel</button>
          </div>
        )}
      </Section>
    </Page>
  );
};
