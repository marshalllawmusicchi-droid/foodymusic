import { dealsConfig } from "@/lib/deals-config";
import type { Deal, DealFilter, DealSearchParams, DealsDataProvider, NearbyDealsParams } from "@/types/deals";

type DealsApiResponse = {
  deals?: Deal[];
  error?: string;
};

const resolveApiUrl = (): string => {
  const base = dealsConfig.apiBaseUrl.replace(/\/$/, "");
  return base || "/api/deals";
};

export class ExternalDealsProvider implements DealsDataProvider {
  readonly id = "external" as const;

  async searchDeals(params: DealSearchParams = {}): Promise<Deal[]> {
    if (!dealsConfig.isExternalConfigured()) {
      throw new Error("External deals provider is not configured.");
    }

    const response = await fetch(resolveApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const payload = (await response.json()) as DealsApiResponse;

    if (!response.ok) {
      throw new Error(payload.error || "Unable to load external deals.");
    }

    return payload.deals ?? [];
  }

  async getNearbyDeals(params: NearbyDealsParams = {}): Promise<Deal[]> {
    const filters = Array.from(new Set<DealFilter>(["nearby", ...(params.filters ?? [])]));
    return this.searchDeals({
      query: params.query,
      filters,
      zipCode: params.zipCode,
      radiusMiles: params.radiusMiles,
    });
  }
}

export const externalDealsProvider = new ExternalDealsProvider();
