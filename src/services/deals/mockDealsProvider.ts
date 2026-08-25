import { mockGroceryDeals } from "@/data/deals";
import type { Deal, DealFilter, DealSearchParams, DealsDataProvider, NearbyDealsParams } from "@/types/deals";
import { filterDeals } from "./filters";

const MOCK_DELAY_MS = 350;

export class MockDealsProvider implements DealsDataProvider {
  readonly id = "mock" as const;

  async searchDeals(params: DealSearchParams = {}): Promise<Deal[]> {
    if (params.query?.trim().toLowerCase() === "__error__") {
      throw new Error("Unable to load deals right now. Please try again.");
    }

    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
    return filterDeals(mockGroceryDeals, params);
  }

  async getNearbyDeals(params: NearbyDealsParams = {}): Promise<Deal[]> {
    const filters = Array.from(new Set<DealFilter>(["nearby", ...(params.filters ?? [])]));

    const deals = await this.searchDeals({
      query: params.query,
      filters,
    });

    if (params.radiusMiles === undefined) {
      return deals;
    }

    return deals.filter(
      (deal) => deal.distanceMiles === undefined || deal.distanceMiles <= params.radiusMiles!,
    );
  }
}

export const mockDealsProvider = new MockDealsProvider();
