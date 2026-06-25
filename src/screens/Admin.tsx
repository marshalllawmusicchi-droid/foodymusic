import React, { useState } from "react";
import { Users, DollarSign, TrendingUp, Award } from "lucide-react";
import { Page, Section } from "../components/ui/common";
import { Badge } from "../components/ui/Logo";
import { adminRevenue, adminMetrics, coupons, recipes, artists, foodBrands, products } from "../data/seed";

const tabs = ["Overview", "Coupons", "Recipes", "Artists", "Brands", "Kitchen"];

const Metric: React.FC<{ icon: React.ElementType; label: string; value: string; sub: string; color: string }> = ({ icon: Icon, label, value, sub, color }) => (
  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5">
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-400">{label}</span>
      <Icon size={18} className={color} />
    </div>
    <p className="text-2xl font-black text-white mt-2">{value}</p>
    <p className="text-xs text-emerald-400 mt-1">{sub}</p>
  </div>
);

const Toggle: React.FC<{ on?: boolean }> = ({ on }) => {
  const [v, setV] = useState(!!on);
  return (
    <button onClick={() => setV(!v)} className={`w-10 h-5 rounded-full transition relative ${v ? "bg-amber-500" : "bg-white/15"}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${v ? "left-5" : "left-0.5"}`} />
    </button>
  );
};

export const Admin: React.FC = () => {
  const [tab, setTab] = useState("Overview");
  const max = Math.max(...adminRevenue.map((r) => r.amount));
  const totalRev = adminRevenue.reduce((s, r) => s + r.amount, 0);

  return (
    <Page>
      <Section title="Admin Dashboard" sub="Monitor revenue streams and manage sponsored placements">
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium ${tab === t ? "bg-amber-500 text-black" : "bg-white/[0.05] text-zinc-300 hover:bg-white/10"}`}>{t}</button>
          ))}
        </div>

        {tab === "Overview" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              <Metric icon={Users} label="Subscribers" value={adminMetrics.subscribers.toLocaleString()} sub="+8.2% MoM" color="text-amber-400" />
              <Metric icon={DollarSign} label="MRR" value={"$" + adminMetrics.mrr.toLocaleString()} sub="+12.4% MoM" color="text-emerald-400" />
              <Metric icon={TrendingUp} label="Affiliate Revenue" value={"$" + adminMetrics.affiliateRevenue.toLocaleString()} sub="+5.7% MoM" color="text-[#1db954]" />
              <Metric icon={Award} label="Total Revenue" value={"$" + totalRev.toLocaleString()} sub="This month" color="text-violet-400" />
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 mb-8">
              <h3 className="font-bold text-white mb-5">Revenue by Stream</h3>
              <div className="space-y-3">
                {adminRevenue.map((r) => (
                  <div key={r.stream}>
                    <div className="flex justify-between text-sm mb-1"><span className="text-zinc-300">{r.stream}</span><span className="text-white font-semibold">${r.amount.toLocaleString()}</span></div>
                    <div className="h-2.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(r.amount / max) * 100}%`, background: r.color }} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
              <h3 className="font-bold text-white mb-4">Top Recipes</h3>
              <ol className="space-y-2">
                {adminMetrics.topRecipes.map((r, i) => (
                  <li key={r} className="flex items-center gap-3 text-sm"><span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">{i + 1}</span><span className="text-zinc-200">{r}</span></li>
                ))}
              </ol>
            </div>
          </>
        )}

        {tab !== "Overview" && (
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
            <div className="px-5 py-3 bg-white/[0.03] flex items-center justify-between">
              <span className="font-semibold text-white text-sm">Manage Sponsored {tab}</span>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500 text-black">+ New Placement</button>
            </div>
            <div className="divide-y divide-white/5">
              {(tab === "Coupons" ? coupons.slice(0, 8).map((c) => ({ id: c.id, name: c.brand + " · " + c.discount, sponsored: c.sponsored }))
                : tab === "Recipes" ? recipes.slice(0, 8).map((r) => ({ id: r.id, name: r.title, sponsored: r.sponsored }))
                : tab === "Artists" ? artists.slice(0, 8).map((a) => ({ id: a.id, name: a.name + " · " + a.genre, sponsored: a.promoted }))
                : tab === "Brands" ? foodBrands.slice(0, 8).map((b) => ({ id: b.id, name: b.name, sponsored: b.sponsored }))
                : products.slice(0, 8).map((p) => ({ id: p.id, name: p.name, sponsored: p.sponsored }))
              ).map((row) => (
                <div key={row.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3"><span className="text-sm text-zinc-200">{row.name}</span>{row.sponsored && <Badge kind="Sponsored" />}</div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-500 hidden sm:block">${(120 + Math.random() * 400 | 0)}/mo</span>
                    <Toggle on={row.sponsored} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>
    </Page>
  );
};
