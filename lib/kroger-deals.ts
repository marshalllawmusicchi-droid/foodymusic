import { filterDeals } from "./deals-filters.js";
import { findLocationsByZip, searchProducts, type KrogerLocation, type KrogerProduct } from "./kroger-client.js";
import { isKrogerConfigured } from "./kroger-config.js";
import type { Deal, DealSearchParams } from "./deals-filters.js";

const DEFAULT_RADIUS_MILES = 10;
const DEFAULT_ZIP = "45202";
const ZIP_PATTERN = /^\d{5}$/;

export type KrogerDealsSearchParams = DealSearchParams;

const normalizeZip = (zipCode?: string): string => {
  const normalized = zipCode?.trim() ?? "";
  if (normalized && ZIP_PATTERN.test(normalized)) {
    return normalized;
  }
  return DEFAULT_ZIP;
};

const storeLabel = (location: KrogerLocation): string => {
  const city = location.address?.city;
  const state = location.address?.state;
  if (city && state) {
    return `${location.name || location.chain} · ${city}, ${state}`;
  }
  return location.name || location.chain || "Kroger";
};

const toSearchTerms = (product: KrogerProduct): string[] => {
  const terms = new Set<string>();
  if (product.description) terms.add(product.description.toLowerCase());
  if (product.brand) terms.add(product.brand.toLowerCase());
  for (const category of product.categories ?? []) {
    terms.add(category.toLowerCase());
  }
  return Array.from(terms);
};

const mapProductToDeal = (product: KrogerProduct, location: KrogerLocation, radiusMiles: number): Deal | null => {
  const item = product.items?.[0];
  const regularPrice = item?.price?.regular;
  if (regularPrice === undefined || regularPrice <= 0) {
    return null;
  }

  const promoPrice = item?.price?.promo;
  const salePrice = promoPrice !== undefined && promoPrice > 0 ? promoPrice : regularPrice;
  const hasPromo = salePrice < regularPrice;
  const distanceMiles =
    typeof location.distance === "number" ? location.distance : undefined;

  return {
    id: `kroger-${product.productId}-${location.locationId}`,
    productName: product.description,
    store: storeLabel(location),
    regularPrice,
    salePrice,
    couponLabel: hasPromo ? "Kroger promo" : undefined,
    category: product.categories?.[0] ?? "Grocery",
    searchTerms: toSearchTerms(product),
    nearby: distanceMiles === undefined || distanceMiles <= radiusMiles,
    weeklyDeal: hasPromo,
    hasCoupon: hasPromo,
    isGrocery: true,
    distanceMiles,
  };
};

const dedupeDeals = (deals: Deal[]): Deal[] => {
  const seen = new Set<string>();
  return deals.filter((deal) => {
    if (seen.has(deal.id)) return false;
    seen.add(deal.id);
    return true;
  });
};

export const searchKrogerDeals = async (params: KrogerDealsSearchParams = {}): Promise<Deal[]> => {
  if (!isKrogerConfigured()) {
    throw new Error("Kroger API credentials are not configured.");
  }

  const zipCode = normalizeZip(params.zipCode);
  const radiusMiles = params.radiusMiles ?? DEFAULT_RADIUS_MILES;
  const locations = await findLocationsByZip(zipCode, radiusMiles, 3);

  if (locations.length === 0) {
    throw new Error(`No Kroger stores found near ZIP ${zipCode}.`);
  }

  const searchTerm = params.query?.trim() ?? "";
  const deals: Deal[] = [];

  for (const location of locations) {
    const products = await searchProducts(searchTerm, location.locationId, 24);
    for (const product of products) {
      const deal = mapProductToDeal(product, location, radiusMiles);
      if (deal) {
        deals.push(deal);
      }
    }
  }

  const uniqueDeals = dedupeDeals(deals);
  return filterDeals(uniqueDeals, {
    query: params.query,
    filters: params.filters,
  });
};

export const isValidZipCode = (zipCode: string): boolean => ZIP_PATTERN.test(zipCode.trim());
