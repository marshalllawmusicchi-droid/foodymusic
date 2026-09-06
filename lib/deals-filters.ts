export type DealFilter = "nearby" | "groceryItems" | "coupons" | "weekly";

export type Deal = {
  id: string;
  productName: string;
  store: string;
  regularPrice: number;
  salePrice: number;
  couponLabel?: string;
  category: string;
  searchTerms: string[];
  nearby: boolean;
  weeklyDeal: boolean;
  hasCoupon: boolean;
  isGrocery: boolean;
  distanceMiles?: number;
};

export type DealSearchParams = {
  query?: string;
  filters?: DealFilter[];
  zipCode?: string;
  radiusMiles?: number;
};

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
