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
import { Cookbooks } from "../screens/Cookbooks";
import { CookbookBuilder } from "../screens/CookbookBuilder";
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
  const { view, activeCookbookId } = useApp();
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
    case "cookbooks": return <Cookbooks />;
    case "cookbookDetail": return <CookbookBuilder cookbookId={activeCookbookId ?? ""} />;
    default: return <Concierge />;
  }
};

const pathToView = (pathname: string): { view: import("../context/AppContext").View; cookbookId?: string } => {
  const cookbookMatch = pathname.match(/^\/cookbooks\/([^/]+)$/);
  if (cookbookMatch) return { view: "cookbookDetail", cookbookId: cookbookMatch[1] };

  switch (pathname) {
    case "/concierge": return { view: "concierge" };
    case "/recipes": return { view: "recipes" };
    case "/grocery": return { view: "grocery" };
    case "/kitchen": return { view: "kitchen" };
    case "/music": return { view: "music" };
    case "/artists": return { view: "artists" };
    case "/deals": return { view: "deals" };
    case "/brands": return { view: "brands" };
    case "/profile": return { view: "profile" };
    case "/subscription": return { view: "subscription" };
    case "/admin": return { view: "admin" };
    case "/cookbooks": return { view: "cookbooks" };
    case "/":
    default: return { view: "landing" };
  }
};

const placeholderForPath = (pathname: string) => {
  const cookbookMatch = pathname.match(/^\/cookbooks(?:\/([^/]+))?$/);
  if (cookbookMatch) {
    const cookbookId = cookbookMatch[1];
    return cookbookId ? <CookbookBuilder cookbookId={cookbookId} /> : <Cookbooks />;
  }

  switch (pathname) {
    case "/concierge": return <Concierge />;
    case "/recipes": return <RecipesPage />;
    case "/grocery": return <GroceryPage />;
    case "/kitchen": return <KitchenPage />;
    case "/music": return <MusicPage />;
    case "/artists": return <ArtistsPage />;
    case "/deals": return <DealsPage />;
    case "/profile": return <Profile />;
    case "/subscription": return <SubscriptionPage />;
    case "/admin": return <AdminPage />;
    default: return null;
  }
};

const Shell: React.FC = () => {
  const { view, navigate } = useApp();
  const location = useLocation();

  useEffect(() => {
    const next = pathToView(location.pathname);
    if (next.view !== view) {
      navigate(next.view, next.cookbookId);
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
