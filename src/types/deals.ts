export type DealFilter = "nearby" | "groceryItems" | "coupons" | "weekly";

export type GroceryDeal = {
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

export type FetchDealsParams = {
  query?: string;
  filters?: DealFilter[];
};
