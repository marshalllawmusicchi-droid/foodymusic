import React from "react";
import {
  Sparkles, UtensilsCrossed, Music2, Tag, ListChecks, ChefHat,
  Mic2, Store, Crown, User, LayoutDashboard, LogIn,
} from "lucide-react";
import { Logo } from "./ui/Logo";
import { useApp, View } from "../context/AppContext";

const items: { view: View; label: string; icon: React.ElementType }[] = [
  { view: "concierge", label: "Concierge", icon: Sparkles },
  { view: "recipes", label: "Recipes", icon: UtensilsCrossed },
  { view: "music", label: "Music", icon: Music2 },
  { view: "deals", label: "Deals", icon: Tag },
  { view: "grocery", label: "Grocery", icon: ListChecks },
  { view: "kitchen", label: "Kitchen+", icon: ChefHat },
  { view: "artists", label: "Artists", icon: Mic2 },
  { view: "brands", label: "Brands", icon: Store },
  { view: "subscription", label: "Premium", icon: Crown },
  { view: "admin", label: "Admin", icon: LayoutDashboard },
];

const mobileTabs: { view: View; label: string; icon: React.ElementType }[] = [
  { view: "concierge", label: "Concierge", icon: Sparkles },
  { view: "recipes", label: "Recipes", icon: UtensilsCrossed },
  { view: "music", label: "Music", icon: Music2 },
  { view: "deals", label: "Deals", icon: Tag },
  { view: "profile", label: "Profile", icon: User },
];

export const Sidebar: React.FC = () => {
  const { view, navigate, user } = useApp();
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-white/10 bg-[#0d0d0f] p-4">
      <Logo size={34} onClick={() => navigate(user ? "concierge" : "landing")} />
      <nav className="mt-8 flex-1 space-y-1">
        {items.map((it) => {
          const active = view === it.view;
          return (
            <button
              key={it.view}
              onClick={() => navigate(it.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                active ? "bg-amber-500/15 text-amber-300" : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <it.icon size={18} /> {it.label}
            </button>
          );
        })}
      </nav>
      <button
        onClick={() => navigate("profile")}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-white/5"
      >
        {user ? (
          <>
            <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-xs">
              {user.name[0]}
            </div>
            <span className="truncate">{user.name}</span>
          </>
        ) : (
          <><LogIn size={18} /> Sign In</>
        )}
      </button>
    </aside>
  );
};

export const TopBar: React.FC = () => {
  const { navigate, user } = useApp();
  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-white/10 bg-[#0d0d0f]/95 backdrop-blur">
      <Logo size={28} onClick={() => navigate(user ? "concierge" : "landing")} />
      <button onClick={() => navigate("profile")} className="p-2 rounded-full bg-white/5">
        {user ? (
          <div className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-xs">{user.name[0]}</div>
        ) : <User size={18} className="text-zinc-300" />}
      </button>
    </header>
  );
};

export const BottomNav: React.FC = () => {
  const { view, navigate } = useApp();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-5 border-t border-white/10 bg-[#0d0d0f]/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      {mobileTabs.map((t) => {
        const active = view === t.view;
        return (
          <button key={t.view} onClick={() => navigate(t.view)} className="flex flex-col items-center gap-0.5 py-2.5">
            <t.icon size={20} className={active ? "text-amber-400" : "text-zinc-500"} />
            <span className={`text-[10px] ${active ? "text-amber-400" : "text-zinc-500"}`}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
