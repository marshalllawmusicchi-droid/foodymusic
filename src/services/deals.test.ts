import { describe, expect, it } from "vitest";
import { dealSavingsAmount, dealSavingsPercent, fetchDeals } from "./deals";

describe("fetchDeals", () => {
  it("filters deals by search query", async () => {
    const deals = await fetchDeals({ query: "chicken" });
    expect(deals.length).toBeGreaterThan(0);
    expect(deals.every((deal) => deal.productName.toLowerCase().includes("chicken") || deal.searchTerms.join(" ").includes("chicken"))).toBe(true);
  });

  it("filters deals by grocery items", async () => {
    const deals = await fetchDeals({ filters: ["groceryItems"] });
    expect(deals.length).toBeGreaterThan(0);
    expect(deals.every((deal) => deal.isGrocery)).toBe(true);
  });

  it("filters deals by nearby and coupon filters", async () => {
    const deals = await fetchDeals({ filters: ["nearby", "coupons"] });
    expect(deals.every((deal) => deal.nearby && (deal.hasCoupon || deal.couponLabel))).toBe(true);
  });

  it("throws for the mock error query", async () => {
    await expect(fetchDeals({ query: "__error__" })).rejects.toThrow("Unable to load deals");
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
