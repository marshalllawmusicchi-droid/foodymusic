import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, PiggyBank, Search, Tag } from "lucide-react";
import { Page, Section, StatPill } from "../components/ui/common";
import { DealCard } from "../components/deals/DealCard";
import { fetchDeals } from "../services/deals";
import type { DealFilter, GroceryDeal } from "../types/deals";

const FILTERS: { id: DealFilter; label: string }[] = [
  { id: "nearby", label: "Nearby" },
  { id: "groceryItems", label: "Grocery" },
  { id: "coupons", label: "Coupons" },
  { id: "weekly", label: "Weekly Deals" },
];

export const Deals: React.FC = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<DealFilter[]>([]);
  const [deals, setDeals] = useState<GroceryDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadDeals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDeals(
        await fetchDeals({
          query: debouncedSearch,
          filters: activeFilters,
        }),
      );
    } catch (err) {
      setDeals([]);
      setError(err instanceof Error ? err.message : "Unable to load deals.");
    } finally {
      setLoading(false);
    }
  }, [activeFilters, debouncedSearch]);

  useEffect(() => {
    void loadDeals();
  }, [loadDeals]);

  const toggleFilter = (filter: DealFilter) => {
    setActiveFilters((current) =>
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter],
    );
  };

  const totalSavings = deals.reduce(
    (sum, deal) => sum + Math.max(0, deal.regularPrice - deal.salePrice),
    0,
  );

  return (
    <Page>
      <div className="mb-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/15 to-amber-500/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-300">
              Foody Music Savings
            </p>
            <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">Deals & Grocery Savings</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Search ingredients, compare store prices, clip-style coupon labels, and send items straight to your
              grocery list.
            </p>
          </div>
          <PiggyBank size={42} className="text-emerald-300/80" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatPill label="Matching Deals" value={String(deals.length)} accent="text-white" />
        <StatPill label="Potential Savings" value={`$${totalSavings.toFixed(2)}`} accent="text-emerald-400" />
        <StatPill label="Active Filters" value={String(activeFilters.length)} accent="text-amber-400" />
      </div>

      <Section title="Find Savings" sub="Search by grocery item or ingredient">
        <label className="block">
          <span className="sr-only">Search deals</span>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 focus-within:border-emerald-500/40">
            <Search size={18} className="text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chicken, rice, lemon, olive oil..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
          </div>
        </label>

        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar"
          role="group"
          aria-label="Filter deals"
        >
          {FILTERS.map((filter) => {
            const active = activeFilters.includes(filter.id);
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={active}
                data-deal-filter={filter.id}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleFilter(filter.id);
                }}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-500 text-black"
                    : "bg-white/[0.05] text-zinc-300 hover:bg-white/10"
                }`}
              >
                <Tag size={13} /> {filter.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Available Deals" sub="Mock sample data — ready for a future external deals API">
        {loading && (
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
            <Loader2 size={18} className="animate-spin text-emerald-400" />
            Loading deals…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-400" />
              <div>
                <p className="text-sm font-semibold text-rose-200">Could not load deals</p>
                <p className="mt-1 text-sm text-zinc-300">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadDeals()}
                  className="mt-3 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && deals.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
            <PiggyBank size={36} className="mx-auto text-emerald-400" />
            <h3 className="mt-4 text-lg font-bold text-white">No deals match your search</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Try another ingredient, clear a filter, or browse weekly deals near you.
            </p>
          </div>
        )}

        {!loading && !error && deals.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </Section>
    </Page>
  );
};
