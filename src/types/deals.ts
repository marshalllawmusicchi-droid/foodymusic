export type DealFilter = "nearby" | "groceryItems" | "coupons" | "weekly";

/** Normalized deal model used across all providers and UI components. */
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

/** @deprecated Use {@link Deal} instead. */
export type GroceryDeal = Deal;

export type DealSearchParams = {
  query?: string;
  filters?: DealFilter[];
};

/** @deprecated Use {@link DealSearchParams} instead. */
export type FetchDealsParams = DealSearchParams;

export type NearbyDealsParams = {
  radiusMiles?: number;
  filters?: DealFilter[];
  query?: string;
};

export type DealsProviderId = "mock" | "external";

export type DealsSearchResult = {
  deals: Deal[];
  source: DealsProviderId;
  usedFallback: boolean;
  fallbackReason?: string;
};

export interface DealsDataProvider {
  readonly id: DealsProviderId;
  searchDeals(params: DealSearchParams): Promise<Deal[]>;
  getNearbyDeals(params?: NearbyDealsParams): Promise<Deal[]>;
}
