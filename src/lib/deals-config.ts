import type { DealsProviderId } from "@/types/deals";

const readEnv = (name: string): string => (import.meta.env[name as keyof ImportMetaEnv] as string | undefined)?.trim() ?? "";

const parseProvider = (value: string): DealsProviderId =>
  value === "external" ? "external" : "mock";

const parseBoolean = (value: string, defaultValue: boolean): boolean => {
  if (!value) return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

/**
 * Client-safe deals integration config.
 * API keys must never be stored here — use a server proxy when a real provider is wired up.
 */
export const dealsConfig = {
  /** Active provider: "mock" (default) or "external". */
  provider: parseProvider(readEnv("VITE_DEALS_PROVIDER")),
  /** Base URL for a future external deals API (no trailing slash). */
  apiBaseUrl: readEnv("VITE_DEALS_API_BASE_URL"),
  /** When true, failed external requests fall back to mock sample data. */
  fallbackToMock: parseBoolean(readEnv("VITE_DEALS_FALLBACK_TO_MOCK"), true),
  isExternalConfigured(): boolean {
    return this.provider === "external" && Boolean(this.apiBaseUrl);
  },
};
