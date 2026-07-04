import React, { createContext, useContext, useMemo, useState } from "react";

interface AppShellContextValue {
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export const AppShellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const value = useMemo<AppShellContextValue>(
    () => ({
      mobileNavOpen,
      openMobileNav: () => setMobileNavOpen(true),
      closeMobileNav: () => setMobileNavOpen(false),
      toggleMobileNav: () => setMobileNavOpen((open) => !open),
    }),
    [mobileNavOpen]
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
};

export const useAppShell = () => {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used within an AppShellProvider");
  }
  return context;
};
