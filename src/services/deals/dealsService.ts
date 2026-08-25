import { dealsConfig } from "@/lib/deals-config";
import type {
  Deal,
  DealFilter,
  DealSearchParams,
  DealsDataProvider,
  DealsProviderId,
  DealsSearchResult,
  NearbyDealsParams,
} from "@/types/deals";
import { externalDealsProvider } from "./externalDealsProvider";
import { mockDealsProvider } from "./mockDealsProvider";

const resolvePrimaryProvider = (): DealsDataProvider =>
  dealsConfig.provider === "external" ? externalDealsProvider : mockDealsProvider;

const toSearchResult = (
  deals: Deal[],
  source: DealsProviderId,
  usedFallback: boolean,
  fallbackReason?: string,
): DealsSearchResult => ({
  deals,
  source,
  usedFallback,
  ...(fallbackReason ? { fallbackReason } : {}),
});

const withMockFallback = async (
  params: DealSearchParams,
  reason: string,
): Promise<DealsSearchResult> => {
  const deals = await mockDealsProvider.searchDeals(params);
  return toSearchResult(deals, "mock", true, reason);
};

export const searchDeals = async (params: DealSearchParams = {}): Promise<DealsSearchResult> => {
  const primary = resolvePrimaryProvider();

  if (primary.id === "mock") {
    const deals = await primary.searchDeals(params);
    return toSearchResult(deals, "mock", false);
  }

  if (!dealsConfig.isExternalConfigured()) {
    if (dealsConfig.fallbackToMock) {
      return withMockFallback(
        params,
        "External deals provider is not configured. Showing sample deals.",
      );
    }
    throw new Error("External deals provider is not configured.");
  }

  try {
    const deals = await primary.searchDeals(params);
    return toSearchResult(deals, "external", false);
  } catch (error) {
    if (!dealsConfig.fallbackToMock) {
      throw error;
    }

    const reason =
      error instanceof Error ? error.message : "External deals provider failed. Showing sample deals.";
    return withMockFallback(params, reason);
  }
};

export const getNearbyDeals = async (params: NearbyDealsParams = {}): Promise<DealsSearchResult> => {
  const filters = Array.from(new Set<DealFilter>([...(params.filters ?? []), "nearby"]));
  return searchDeals({
    query: params.query,
    filters,
  });
};

/** Backward-compatible helper that returns deals only. */
export const fetchDeals = async (params: DealSearchParams = {}): Promise<Deal[]> => {
  const result = await searchDeals(params);
  return result.deals;
};

export const dealSavingsAmount = (deal: Deal): number =>
  Math.max(0, +(deal.regularPrice - deal.salePrice).toFixed(2));

export const dealSavingsPercent = (deal: Deal): number => {
  if (deal.regularPrice <= 0) return 0;
  return Math.round((dealSavingsAmount(deal) / deal.regularPrice) * 100);
};
