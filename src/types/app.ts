import type { LucideIcon } from "lucide-react";

export type AppRouteId =
  | "landing"
  | "concierge"
  | "recipes"
  | "grocery"
  | "kitchen"
  | "music"
  | "artists"
  | "deals"
  | "brands"
  | "profile"
  | "subscription"
  | "admin";

export interface NavItem {
  id: AppRouteId;
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  premium?: boolean;
}

export interface PageMeta {
  title: string;
  description: string;
  eyebrow?: string;
  icon: LucideIcon;
}
