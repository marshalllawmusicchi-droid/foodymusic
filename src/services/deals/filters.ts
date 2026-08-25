import type { Deal, DealFilter, DealSearchParams } from "@/types/deals";

export const matchesFilter = (deal: Deal, filter: DealFilter): boolean => {
  switch (filter) {
    case "nearby":
      return deal.nearby;
    case "groceryItems":
      return deal.isGrocery;
    case "coupons":
      return deal.hasCoupon || Boolean(deal.couponLabel);
    case "weekly":
      return deal.weeklyDeal;
    default:
      return true;
  }
};

export const matchesQuery = (deal: Deal, query: string): boolean => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    deal.productName.toLowerCase().includes(normalized) ||
    deal.store.toLowerCase().includes(normalized) ||
    deal.category.toLowerCase().includes(normalized) ||
    deal.searchTerms.some((term) => term.toLowerCase().includes(normalized))
  );
};

export const filterDeals = (deals: Deal[], params: DealSearchParams): Deal[] => {
  const activeFilters = params.filters ?? [];

  return deals.filter((deal) => {
    if (activeFilters.length > 0 && !activeFilters.every((filter) => matchesFilter(deal, filter))) {
      return false;
    }
    return matchesQuery(deal, params.query ?? "");
  });
};
