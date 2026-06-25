import React, { useState } from "react";
import { Crown, Heart, Music2, Scissors, ListChecks, Settings, LogOut, Mail, Lock, Loader2 } from "lucide-react";
import { Page, Section, StatPill } from "../components/ui/common";
import { ForkClef } from "../components/ui/Logo";
import { useApp } from "../context/AppContext";
import { recipes, playlists, coupons } from "../data/seed";
import { RecipeCard, PlaylistCard, CouponCard } from "../components/Cards";

const DIET_OPTIONS = ["Vegetarian", "Gluten-Free", "Low Carb", "Dairy-Free", "Pescatarian", "Keto", "Vegan", "Nut-Free"];

const AuthForm: React.FC = () => {
  const { signUp, signIn, authError, authBusy } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [localError, setLocalError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (!email || !password) { setLocalError("Email and password are required."); return; }
    if (mode === "signup" && password.length < 6) { setLocalError("Password must be at least 6 characters."); return; }

    if (mode === "signup") {
      const ok = await signUp(email, password, name || email.split("@")[0]);
      if (ok) {
        fetch("https://famous.ai/api/crm/6a3cdd2b6d854d2dc292b0cc/subscribe", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: name || undefined, phone: phone || undefined, sms_opt_in: smsOptIn === true, source: "signup", tags: ["app-user"] }),
        }).catch(() => {});
      }
    } else {
      await signIn(email, password);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <div className="flex justify-center mb-5"><ForkClef size={56} /></div>
      <h1 className="text-2xl font-black text-white">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
      <p className="text-zinc-400 mt-1">Save recipes, clip coupons, and sync across devices.</p>
      <form onSubmit={submit} className="mt-6 space-y-3 text-left">
        {mode === "signup" && (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50" />
        )}
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.05] border border-white/10 px-4 focus-within:border-amber-500/50">
          <Mail size={16} className="text-zinc-500" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="flex-1 bg-transparent py-3 text-white text-sm outline-none" />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.05] border border-white/10 px-4 focus-within:border-amber-500/50">
          <Lock size={16} className="text-zinc-500" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="flex-1 bg-transparent py-3 text-white text-sm outline-none" />
        </div>
        {mode === "signup" && (
          <>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number (optional)" className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50" />
            <label className="flex items-start gap-2 text-xs text-zinc-400">
              <input type="checkbox" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} className="mt-0.5" />
              <span>Text me recipe & deal updates. Msg & data rates may apply. Reply STOP to unsubscribe.</span>
            </label>
          </>
        )}
        {(localError || authError) && <p className="text-sm text-red-400">{localError || authError}</p>}
        <button type="submit" disabled={authBusy} className="w-full py-3 rounded-full bg-amber-500 text-black font-bold hover:bg-amber-400 disabled:opacity-60 flex items-center justify-center gap-2">
          {authBusy && <Loader2 size={16} className="animate-spin" />}
          {mode === "signup" ? "Sign Up" : "Log In"}
        </button>
      </form>
      <button onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setLocalError(""); }} className="mt-4 text-sm text-zinc-400 hover:text-amber-400">
        {mode === "signup" ? "Already have an account? Log in" : "New here? Create an account"}
      </button>
    </div>
  );
};

export const Profile: React.FC = () => {
  const { user, logout, premium, saved, clipped, navigate, dietary, toggleDietary, authReady } = useApp();

  if (!authReady) {
    return <Page><div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-amber-400" /></div></Page>;
  }
  if (!user) return <Page><AuthForm /></Page>;

  const savedRecipes = recipes.filter((r) => saved.includes(r.id));
  const clippedCoupons = coupons.filter((c) => clipped.includes(c.id));

  return (
    <Page>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center text-black text-2xl font-black">{user.name[0].toUpperCase()}</div>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">{user.name}</h1>
          <p className="text-zinc-400 text-sm">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            {premium ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300"><Crown size={13} /> Premium</span> : <button onClick={() => navigate("subscription")} className="text-xs font-semibold text-amber-400">Upgrade to Premium →</button>}
          </div>
        </div>
        <button onClick={logout} className="px-4 py-2 rounded-full bg-white/10 text-zinc-300 text-sm hover:bg-white/20 flex items-center gap-1"><LogOut size={14} /> Sign out</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatPill label="Saved Recipes" value={String(saved.length)} accent="text-amber-400" />
        <StatPill label="Clipped Coupons" value={String(clipped.length)} accent="text-emerald-400" />
        <StatPill label="Playlists" value="6" accent="text-[#1db954]" />
        <StatPill label="Plan" value={premium ? "Premium" : "Free"} accent="text-white" />
      </div>

      <Section title="Dietary Preferences" sub="Saved to your account">
        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map((d) => {
            const on = dietary.includes(d);
            return (
              <button key={d} onClick={() => toggleDietary(d)} className={`px-4 py-1.5 rounded-full text-sm transition ${on ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-white/[0.05] text-zinc-400 border border-transparent hover:bg-white/10"}`}>{d}</button>
            );
          })}
        </div>
      </Section>

      <Section title="Saved Recipes" action={<Heart size={18} className="text-amber-400" />}>
        {savedRecipes.length ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{savedRecipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}</div>
        ) : <p className="text-zinc-500 text-sm">No saved recipes yet — tap the heart on any recipe.</p>}
      </Section>

      <Section title="Saved Playlists" action={<Music2 size={18} className="text-[#1db954]" />}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{playlists.slice(0, 3).map((p) => <PlaylistCard key={p.id} playlist={p} compact />)}</div>
      </Section>

      <Section title="Clipped Coupons" action={<Scissors size={18} className="text-emerald-400" />}>
        {clippedCoupons.length ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{clippedCoupons.map((c) => <CouponCard key={c.id} coupon={c} />)}</div>
        ) : <p className="text-zinc-500 text-sm">No clipped coupons yet — clip one from the Deals tab.</p>}
      </Section>

      <Section title="Settings" action={<Settings size={18} className="text-zinc-400" />}>
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 divide-y divide-white/5">
          {["Account & Security", "Notifications", "Linked Spotify Account", "Payment Methods", "Privacy"].map((s) => (
            <button key={s} className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/[0.02] flex items-center gap-2"><ListChecks size={14} className="text-zinc-500" /> {s}</button>
          ))}
        </div>
      </Section>
    </Page>
  );
};
