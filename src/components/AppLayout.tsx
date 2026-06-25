import React from "react";
import { AppProvider, useApp } from "../context/AppContext";
import { Sidebar, TopBar, BottomNav } from "./Nav";
import { Landing } from "../screens/Landing";
import { Concierge } from "../screens/Concierge";
import { Recipes } from "../screens/Recipes";
import { RecipeDetail } from "../screens/RecipeDetail";
import { Music } from "../screens/Music";
import { Deals } from "../screens/Deals";
import { Grocery } from "../screens/Grocery";
import { Kitchen } from "../screens/Kitchen";
import { Artists } from "../screens/Artists";
import { Brands } from "../screens/Brands";
import { Subscription } from "../screens/Subscription";
import { Profile } from "../screens/Profile";
import { Admin } from "../screens/Admin";

const Screen: React.FC = () => {
  const { view } = useApp();
  switch (view) {
    case "concierge": return <Concierge />;
    case "recipes": return <Recipes />;
    case "recipeDetail": return <RecipeDetail />;
    case "music": return <Music />;
    case "deals": return <Deals />;
    case "grocery": return <Grocery />;
    case "kitchen": return <Kitchen />;
    case "artists": return <Artists />;
    case "brands": return <Brands />;
    case "subscription": return <Subscription />;
    case "profile": return <Profile />;
    case "admin": return <Admin />;
    default: return <Concierge />;
  }
};

const Shell: React.FC = () => {
  const { view } = useApp();

  if (view === "landing") {
    return <div className="min-h-screen bg-[#0a0a0b]"><Landing /></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />
        <main className="pb-24 lg:pb-6"><Screen /></main>
        <BottomNav />
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => (
  <AppProvider>
    <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    <Shell />
  </AppProvider>
);

export default AppLayout;
