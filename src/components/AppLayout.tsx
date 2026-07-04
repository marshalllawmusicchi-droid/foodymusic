import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppProvider, useApp } from "../context/AppContext";
import { Sidebar, TopBar, BottomNav } from "./Nav";
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
import ConciergePage from "../pages/ConciergePage";
import RecipesPage from "../pages/RecipesPage";
import GroceryPage from "../pages/GroceryPage";
import KitchenPage from "../pages/KitchenPage";
import MusicPage from "../pages/MusicPage";
import ArtistsPage from "../pages/ArtistsPage";
import DealsPage from "../pages/DealsPage";
import ProfilePage from "../pages/ProfilePage";
import SubscriptionPage from "../pages/SubscriptionPage";
import AdminPage from "../pages/AdminPage";

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

const pathToView = (pathname: string): import("../context/AppContext").View => {
  switch (pathname) {
    case "/concierge": return "concierge";
    case "/recipes": return "recipes";
    case "/grocery": return "grocery";
    case "/kitchen": return "kitchen";
    case "/music": return "music";
    case "/artists": return "artists";
    case "/deals": return "deals";
    case "/brands": return "brands";
    case "/profile": return "profile";
    case "/subscription": return "subscription";
    case "/admin": return "admin";
    case "/":
    default: return "landing";
  }
};

const placeholderForPath = (pathname: string) => {
  switch (pathname) {
    case "/concierge": return <Concierge />;
    case "/recipes": return <RecipesPage />;
    case "/grocery": return <GroceryPage />;
    case "/kitchen": return <KitchenPage />;
    case "/music": return <MusicPage />;
    case "/artists": return <ArtistsPage />;
    case "/deals": return <DealsPage />;
    case "/profile": return <ProfilePage />;
    case "/subscription": return <SubscriptionPage />;
    case "/admin": return <AdminPage />;
    default: return null;
  }
};

const Shell: React.FC = () => {
  const { view, navigate } = useApp();
  const location = useLocation();

  useEffect(() => {
    const nextView = pathToView(location.pathname);
    if (nextView !== view) {
      navigate(nextView);
    }
  }, [location.pathname, navigate, view]);

  if (location.pathname === "/") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <TopBar />
          <main className="pb-24 lg:pb-6"><Concierge /></main>
          <BottomNav />
        </div>
      </div>
    );
  }

  const placeholder = placeholderForPath(location.pathname);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />
        <main className="pb-24 lg:pb-6">{placeholder ?? <Screen />}</main>
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
