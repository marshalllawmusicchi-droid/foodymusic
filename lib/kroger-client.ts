import {
  KROGER_API_BASE,
  getKrogerClientId,
  getKrogerClientSecret,
  isKrogerConfigured,
} from "./kroger-config.js";

type KrogerTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

export type KrogerLocation = {
  locationId: string;
  chain: string;
  name: string;
  distance?: number;
  address?: {
    addressLine1?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
};

export type KrogerProduct = {
  productId: string;
  description: string;
  brand?: string;
  categories?: string[];
  items?: Array<{
    itemId?: string;
    price?: {
      regular?: number;
      promo?: number;
    };
  }>;
};

type KrogerListResponse<T> = {
  data: T[];
  meta?: Record<string, unknown>;
};

let cachedToken: { value: string; expiresAt: number } | undefined;

const getAccessToken = async (): Promise<string> => {
  if (!isKrogerConfigured()) {
    throw new Error("Kroger API credentials are not configured.");
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const clientId = getKrogerClientId()!;
  const clientSecret = getKrogerClientSecret()!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${KROGER_API_BASE}/connect/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=product.compact",
  });

  if (!response.ok) {
    throw new Error(`Kroger authentication failed (${response.status}).`);
  }

  const payload = (await response.json()) as KrogerTokenResponse;
  cachedToken = {
    value: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
  };

  return payload.access_token;
};

const krogerGet = async <T>(path: string, searchParams: Record<string, string>): Promise<T> => {
  const token = await getAccessToken();
  const url = new URL(`${KROGER_API_BASE}${path}`);
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Kroger API request failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  return (await response.json()) as T;
};

export const findLocationsByZip = async (
  zipCode: string,
  radiusMiles = 10,
  limit = 5,
): Promise<KrogerLocation[]> => {
  const payload = await krogerGet<KrogerListResponse<KrogerLocation>>("/locations", {
    "filter.zipCode.near": zipCode,
    "filter.radiusInMiles": String(radiusMiles),
    "filter.limit": String(limit),
  });

  return payload.data ?? [];
};

export const searchProducts = async (
  term: string,
  locationId: string,
  limit = 24,
): Promise<KrogerProduct[]> => {
  const params: Record<string, string> = {
    "filter.locationId": locationId,
    "filter.limit": String(limit),
  };

  if (term.trim()) {
    params["filter.term"] = term.trim();
  }

  const payload = await krogerGet<KrogerListResponse<KrogerProduct>>("/products", params);
  return payload.data ?? [];
};

/** Test helper — clears cached OAuth token between tests. */
export const resetKrogerTokenCache = (): void => {
  cachedToken = undefined;
};
