import { describe, expect, it, vi } from "vitest";
import {
  dealSavingsAmount,
  dealSavingsPercent,
  fetchDeals,
  getNearbyDeals,
  searchDeals,
} from "./dealsService";
import { mockDealsProvider } from "./mockDealsProvider";

describe("mockDealsProvider", () => {
  it("filters deals by search query", async () => {
    const deals = await mockDealsProvider.searchDeals({ query: "chicken" });
    expect(deals.length).toBeGreaterThan(0);
    expect(
      deals.every(
        (deal) =>
          deal.productName.toLowerCase().includes("chicken") ||
          deal.searchTerms.join(" ").includes("chicken"),
      ),
    ).toBe(true);
  });

  it("filters deals by grocery items", async () => {
    const deals = await mockDealsProvider.searchDeals({ filters: ["groceryItems"] });
    expect(deals.length).toBeGreaterThan(0);
    expect(deals.every((deal) => deal.isGrocery)).toBe(true);
  });

  it("returns nearby deals with distance filtering", async () => {
    const deals = await mockDealsProvider.getNearbyDeals({ radiusMiles: 2 });
    expect(deals.every((deal) => deal.nearby)).toBe(true);
    expect(deals.every((deal) => deal.distanceMiles === undefined || deal.distanceMiles <= 2)).toBe(true);
  });
});

describe("searchDeals", () => {
  it("returns mock deals by default", async () => {
    const result = await searchDeals({ query: "rice" });
    expect(result.source).toBe("mock");
    expect(result.usedFallback).toBe(false);
    expect(result.deals.length).toBeGreaterThan(0);
  });

  it("filters deals by nearby and coupon filters", async () => {
    const result = await searchDeals({ filters: ["nearby", "coupons"] });
    expect(
      result.deals.every((deal) => deal.nearby && (deal.hasCoupon || deal.couponLabel)),
    ).toBe(true);
  });

  it("throws for the mock error query when fallback is disabled", async () => {
    await expect(searchDeals({ query: "__error__" })).rejects.toThrow("Unable to load deals");
  });

  it("falls back to mock data when external provider is not configured", async () => {
    vi.resetModules();
    vi.doMock("@/lib/deals-config", () => ({
      dealsConfig: {
        provider: "external",
        apiBaseUrl: "",
        fallbackToMock: true,
        isExternalConfigured: () => false,
      },
    }));

    const { searchDeals: searchWithExternalConfig } = await import("./dealsService");
    const result = await searchWithExternalConfig({ query: "rice" });

    expect(result.source).toBe("mock");
    expect(result.usedFallback).toBe(true);
    expect(result.fallbackReason).toMatch(/not configured/i);
    expect(result.deals.length).toBeGreaterThan(0);

    vi.doUnmock("@/lib/deals-config");
    vi.resetModules();
  });
});

describe("fetchDeals", () => {
  it("returns deals without metadata", async () => {
    const deals = await fetchDeals({ filters: ["weekly"] });
    expect(deals.every((deal) => deal.weeklyDeal)).toBe(true);
  });
});

describe("getNearbyDeals", () => {
  it("includes the nearby filter", async () => {
    const result = await getNearbyDeals({ query: "lemon" });
    expect(result.deals.every((deal) => deal.nearby)).toBe(true);
  });
});

describe("deal savings helpers", () => {
  it("calculates savings amount and percent", () => {
    const deal = {
      id: "x",
      productName: "Test",
      store: "FreshMart",
      regularPrice: 10,
      salePrice: 7.5,
      category: "Pantry",
      searchTerms: [],
      nearby: true,
      weeklyDeal: false,
      hasCoupon: false,
      isGrocery: true,
    };

    expect(dealSavingsAmount(deal)).toBe(2.5);
    expect(dealSavingsPercent(deal)).toBe(25);
  });
});
