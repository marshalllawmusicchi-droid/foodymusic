import { dealsConfig } from "@/lib/deals-config";
import type { Deal, DealFilter, DealSearchParams, DealsDataProvider, NearbyDealsParams } from "@/types/deals";

/**
 * Stub for a future external grocery/deals API.
 * Does not call any third-party service until implemented server-side.
 */
export class ExternalDealsProvider implements DealsDataProvider {
  readonly id = "external" as const;

  async searchDeals(_params: DealSearchParams): Promise<Deal[]> {
    if (!dealsConfig.isExternalConfigured()) {
      throw new Error("External deals provider is not configured.");
    }

    throw new Error("External deals provider is not implemented yet.");
  }

  async getNearbyDeals(params: NearbyDealsParams = {}): Promise<Deal[]> {
    const filters = Array.from(new Set<DealFilter>(["nearby", ...(params.filters ?? [])]));
    return this.searchDeals({
      query: params.query,
      filters,
    });
  }
}

export const externalDealsProvider = new ExternalDealsProvider();
