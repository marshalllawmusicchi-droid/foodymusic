import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isValidZipCode, searchKrogerDeals } from "./kroger-deals.js";
import { resetKrogerTokenCache } from "./kroger-client.js";

describe("isValidZipCode", () => {
  it("accepts 5-digit ZIP codes", () => {
    expect(isValidZipCode("45202")).toBe(true);
    expect(isValidZipCode("90210")).toBe(true);
  });

  it("rejects invalid ZIP codes", () => {
    expect(isValidZipCode("4520")).toBe(false);
    expect(isValidZipCode("abcde")).toBe(false);
  });
});

describe("searchKrogerDeals", () => {
  beforeEach(() => {
    vi.stubEnv("KROGER_CLIENT_ID", "test-client-id");
    vi.stubEnv("KROGER_CLIENT_SECRET", "test-client-secret");
    resetKrogerTokenCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    resetKrogerTokenCache();
  });

  it("maps Kroger products into normalized deals", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo) => {
      const url = String(input);

      if (url.includes("/connect/oauth2/token")) {
        return new Response(JSON.stringify({ access_token: "token", expires_in: 3600, token_type: "bearer" }), {
          status: 200,
        });
      }

      if (url.includes("/locations")) {
        return new Response(
          JSON.stringify({
            data: [
              {
                locationId: "loc-1",
                chain: "Kroger",
                name: "Kroger",
                distance: 1.5,
                address: { city: "Cincinnati", state: "OH", zipCode: "45202" },
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (url.includes("/products")) {
        return new Response(
          JSON.stringify({
            data: [
              {
                productId: "prod-1",
                description: "Organic Chicken Thighs",
                brand: "Simple Truth",
                categories: ["Meat & Seafood"],
                items: [{ itemId: "item-1", price: { regular: 8.99, promo: 6.49 } }],
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response("not found", { status: 404 });
    });

    vi.stubGlobal("fetch", fetchMock);

    const deals = await searchKrogerDeals({ query: "chicken", zipCode: "45202" });

    expect(deals).toHaveLength(1);
    expect(deals[0]?.productName).toBe("Organic Chicken Thighs");
    expect(deals[0]?.store).toContain("Kroger");
    expect(deals[0]?.salePrice).toBe(6.49);
    expect(deals[0]?.regularPrice).toBe(8.99);
    expect(deals[0]?.hasCoupon).toBe(true);
    expect(deals[0]?.isGrocery).toBe(true);
  });
});
