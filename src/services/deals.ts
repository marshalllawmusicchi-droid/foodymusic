import { mockGroceryDeals } from "@/data/deals";
import type { DealFilter, FetchDealsParams, GroceryDeal } from "@/types/deals";

const MOCK_DELAY_MS = 350;

const matchesFilter = (deal: GroceryDeal, filter: DealFilter): boolean => {
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

const matchesQuery = (deal: GroceryDeal, query: string): boolean => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    deal.productName.toLowerCase().includes(normalized) ||
    deal.store.toLowerCase().includes(normalized) ||
    deal.category.toLowerCase().includes(normalized) ||
    deal.searchTerms.some((term) => term.toLowerCase().includes(normalized))
  );
};

const filterDeals = (deals: GroceryDeal[], params: FetchDealsParams): GroceryDeal[] => {
  const activeFilters = params.filters ?? [];

  return deals.filter((deal) => {
    if (activeFilters.length > 0 && !activeFilters.every((filter) => matchesFilter(deal, filter))) {
      return false;
    }
    return matchesQuery(deal, params.query ?? "");
  });
};

/**
 * Mock deals provider. Swap this implementation for an external coupon/deals API later.
 */
export const fetchDeals = async (params: FetchDealsParams = {}): Promise<GroceryDeal[]> => {
  if (params.query?.trim().toLowerCase() === "__error__") {
    throw new Error("Unable to load deals right now. Please try again.");
  }

  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return filterDeals(mockGroceryDeals, params);
};

export const dealSavingsAmount = (deal: GroceryDeal): number =>
  Math.max(0, +(deal.regularPrice - deal.salePrice).toFixed(2));

export const dealSavingsPercent = (deal: GroceryDeal): number => {
  if (deal.regularPrice <= 0) return 0;
  return Math.round((dealSavingsAmount(deal) / deal.regularPrice) * 100);
};
