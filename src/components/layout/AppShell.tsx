import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAppShell } from "@/contexts/AppShellContext";
import { getHomeNavItem, getNavigationItems } from "@/services/navigation";
import { cn } from "@/lib/utils";

const AppShell: React.FC = () => {
  const { mobileNavOpen, toggleMobileNav, closeMobileNav } = useAppShell();
  const location = useLocation();
  const navItems = getNavigationItems();
  const homeItem = getHomeNavItem();

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d0d0f]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to={homeItem.href} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
              <span className="text-sm font-black">FM</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">FoodyMusic</p>
              <p className="text-xs text-zinc-500">AI cooking, savings & music</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={toggleMobileNav}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition",
                    active ? "bg-amber-500/15 text-amber-300" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-white/10 bg-[#0d0d0f] px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    onClick={closeMobileNav}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-sm font-medium",
                      active ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-white/10 bg-white/[0.03] text-zinc-300"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
