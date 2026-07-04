import {
  Crown,
  ChefHat,
  Home,
  LayoutDashboard,
  ListChecks,
  Mic2,
  Music2,
  Sparkles,
  Store,
  Tag,
  User,
  UtensilsCrossed,
} from "lucide-react";
import type { View } from "@/context/AppContext";
import type { AppRouteId, NavItem } from "@/types/app";

export const appRouteToPath = (route: AppRouteId | View): string => {
  switch (route) {
    case "concierge":
      return "/concierge";
    case "recipes":
      return "/recipes";
    case "grocery":
      return "/grocery";
    case "kitchen":
      return "/kitchen";
    case "music":
      return "/music";
    case "artists":
      return "/artists";
    case "deals":
      return "/deals";
    case "brands":
      return "/brands";
    case "profile":
      return "/profile";
    case "subscription":
      return "/subscription";
    case "admin":
      return "/admin";
    case "landing":
    default:
      return "/";
  }
};

export const pathToAppRoute = (pathname: string): AppRouteId => {
  switch (pathname) {
    case "/concierge":
      return "concierge";
    case "/recipes":
      return "recipes";
    case "/grocery":
      return "grocery";
    case "/kitchen":
      return "kitchen";
    case "/music":
      return "music";
    case "/artists":
      return "artists";
    case "/deals":
      return "deals";
    case "/brands":
      return "brands";
    case "/profile":
      return "profile";
    case "/subscription":
      return "subscription";
    case "/admin":
      return "admin";
    case "/":
    default:
      return "landing";
  }
};

export const getNavigationItems = (): NavItem[] => [
  {
    id: "concierge",
    label: "AI Concierge",
    href: appRouteToPath("concierge"),
    description: "Meal plans, pantry matching, and smart guidance",
    icon: Sparkles,
  },
  {
    id: "recipes",
    label: "Recipes",
    href: appRouteToPath("recipes"),
    description: "Searchable recipes tuned to your lifestyle",
    icon: UtensilsCrossed,
  },
  {
    id: "music",
    label: "Spotify Music",
    href: appRouteToPath("music"),
    description: "Mood-based playlists matched to every meal",
    icon: Music2,
  },
  {
    id: "deals",
    label: "Deals",
    href: appRouteToPath("deals"),
    description: "Coupon clipping and grocery savings",
    icon: Tag,
  },
  {
    id: "grocery",
    label: "Grocery Savings",
    href: appRouteToPath("grocery"),
    description: "Budget-aware shopping lists and savings",
    icon: ListChecks,
  },
  {
    id: "kitchen",
    label: "Kitchen+",
    href: appRouteToPath("kitchen"),
    description: "Affiliate tools and gear for every cook",
    icon: ChefHat,
  },
  {
    id: "artists",
    label: "Artists",
    href: appRouteToPath("artists"),
    description: "Discover creators and playlists",
    icon: Mic2,
  },
  {
    id: "brands",
    label: "Brands",
    href: "/brands",
    description: "Partner brands and featured collaborations",
    icon: Store,
  },
  {
    id: "subscription",
    label: "Subscription",
    href: appRouteToPath("subscription"),
    description: "Premium features and billing",
    icon: Crown,
    premium: true,
  },
  {
    id: "profile",
    label: "Profile",
    href: appRouteToPath("profile"),
    description: "Preferences, saved content, and account state",
    icon: User,
  },
  {
    id: "admin",
    label: "Admin Dashboard",
    href: appRouteToPath("admin"),
    description: "Monitor placements, revenue, and operations",
    icon: LayoutDashboard,
  },
];

export const getPrimaryNavigationItems = (): NavItem[] =>
  getNavigationItems().filter((item) => !["admin"].includes(item.id));

export const getMobileNavigationItems = (): NavItem[] =>
  getNavigationItems().filter((item) => !["brands"].includes(item.id));

export const getHomeNavItem = (): NavItem => ({
  id: "landing",
  label: "Home",
  href: appRouteToPath("landing"),
  description: "Return to the landing experience",
  icon: Home,
});
