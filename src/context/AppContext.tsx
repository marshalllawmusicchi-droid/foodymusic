import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export type View =
  | "landing" | "concierge" | "recipes" | "recipeDetail" | "music"
  | "deals" | "grocery" | "kitchen" | "artists" | "brands"
  | "subscription" | "profile" | "admin";

type User = { id: string; name: string; email: string };

type Ctx = {
  view: View;
  navigate: (v: View, recipeId?: string) => void;
  activeRecipe: string | null;
  user: User | null;
  authReady: boolean;
  authError: string | null;
  authBusy: boolean;
  signUp: (email: string, password: string, name: string, phone?: string, smsOptIn?: boolean) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  premium: boolean;
  setPremium: (b: boolean) => void;
  saved: string[];
  toggleSave: (id: string) => void;
  clipped: string[];
  toggleClip: (id: string) => void;
  followed: string[];
  toggleFollow: (id: string) => void;
  dietary: string[];
  toggleDietary: (id: string) => void;
  grocery: Record<string, boolean>;
  toggleGrocery: (name: string) => void;
  addGrocery: (names: string[]) => void;
};

const AppContext = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp must be inside AppProvider");
  return c;
};

const DEFAULT_DIETARY = ["Vegetarian", "Gluten-Free"];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState<View>("landing");
  const [activeRecipe, setActiveRecipe] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const [premium, setPremiumState] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [clipped, setClipped] = useState<string[]>([]);
  const [followed, setFollowed] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>(DEFAULT_DIETARY);
  const [grocery, setGrocery] = useState<Record<string, boolean>>({});

  const loadedRef = useRef(false); // true once a profile is loaded for current user

  const navigate = useCallback((v: View, recipeId?: string) => {
    if (recipeId) setActiveRecipe(recipeId);
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Load a profile row for a logged-in user
  const loadProfile = useCallback(async (u: { id: string; email: string; name: string }) => {
    loadedRef.current = false;
    const { data } = await supabase.from("fm_profiles").select("*").eq("id", u.id).maybeSingle();
    if (data) {
      setPremiumState(!!data.premium);
      setSaved(data.saved_recipes || []);
      setClipped(data.clipped_coupons || []);
      setFollowed(data.followed_artists || []);
      setDietary((data.dietary && data.dietary.length ? data.dietary : DEFAULT_DIETARY));
      setGrocery(data.grocery || {});
      setUser({ id: u.id, email: u.email, name: data.name || u.name });
    } else {
      // profile row may not exist yet (trigger lag) — create it
      await supabase.from("fm_profiles").upsert({ id: u.id, name: u.name });
      setUser({ id: u.id, email: u.email, name: u.name });
    }
    loadedRef.current = true;
  }, []);

  // Session bootstrap + auth listener
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session;
      if (s?.user && active) {
        await loadProfile({
          id: s.user.id,
          email: s.user.email || "",
          name: (s.user.user_metadata?.name as string) || (s.user.email || "Foodie").split("@")[0],
        });
      }
      if (active) setAuthReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (session?.user) {
        await loadProfile({
          id: session.user.id,
          email: session.user.email || "",
          name: (session.user.user_metadata?.name as string) || (session.user.email || "Foodie").split("@")[0],
        });
      } else {
        loadedRef.current = false;
        setUser(null);
        setPremiumState(false);
        setSaved([]); setClipped([]); setFollowed([]); setGrocery({}); setDietary(DEFAULT_DIETARY);
      }
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [loadProfile]);

  // Persist changes whenever data mutates (only after a profile is loaded)
  useEffect(() => {
    if (!user || !loadedRef.current) return;
    const t = setTimeout(() => {
      supabase.from("fm_profiles").update({
        premium,
        saved_recipes: saved,
        clipped_coupons: clipped,
        followed_artists: followed,
        dietary,
        grocery,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id).then(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [premium, saved, clipped, followed, dietary, grocery, user]);

  const signUp = async (email: string, password: string, name: string) => {
    setAuthBusy(true); setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { name } },
    });
    setAuthBusy(false);
    if (error) { setAuthError(error.message); return false; }
    // If email confirmation is off, session exists immediately
    if (data.session?.user) {
      await loadProfile({ id: data.session.user.id, email, name });
      return true;
    }
    setAuthError("Check your email to confirm your account, then log in.");
    return false;
  };

  const signIn = async (email: string, password: string) => {
    setAuthBusy(true); setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthBusy(false);
    if (error) { setAuthError(error.message); return false; }
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("landing");
  };

  const setPremium = (b: boolean) => setPremiumState(b);

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (id: string) =>
    setter((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));

  const toggleGrocery = (name: string) => setGrocery((g) => ({ ...g, [name]: !g[name] }));
  const addGrocery = (names: string[]) =>
    setGrocery((g) => {
      const next = { ...g };
      names.forEach((n) => { if (!(n in next)) next[n] = false; });
      return next;
    });

  return (
    <AppContext.Provider
      value={{
        view, navigate, activeRecipe,
        user, authReady, authError, authBusy, signUp, signIn, logout,
        premium, setPremium,
        saved, toggleSave: toggle(setSaved),
        clipped, toggleClip: toggle(setClipped),
        followed, toggleFollow: toggle(setFollowed),
        dietary, toggleDietary: toggle(setDietary),
        grocery, toggleGrocery, addGrocery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
