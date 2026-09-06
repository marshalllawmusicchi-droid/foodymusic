import { isKrogerConfigured } from "../lib/kroger-config.js";
import { isValidZipCode, searchKrogerDeals, type KrogerDealsSearchParams } from "../lib/kroger-deals.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isKrogerConfigured()) {
    res.status(503).json({ error: "Kroger API credentials are not configured." });
    return;
  }

  const body = (req.body ?? {}) as KrogerDealsSearchParams;
  const zipCode = typeof body.zipCode === "string" ? body.zipCode.trim() : "";

  if (zipCode && !isValidZipCode(zipCode)) {
    res.status(400).json({ error: "A valid 5-digit US ZIP code is required." });
    return;
  }

  try {
    const deals = await searchKrogerDeals({
      query: body.query,
      filters: body.filters,
      zipCode: zipCode || undefined,
      radiusMiles: body.radiusMiles,
    });

    res.status(200).json({ deals, source: "external" });
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : "Unable to load Kroger deals.",
    });
  }
}
