const normalize = (value: string | undefined): string => (value ?? "").trim();

export const getKrogerClientId = (): string | undefined => {
  const clientId = normalize(process.env.KROGER_CLIENT_ID);
  return clientId || undefined;
};

export const getKrogerClientSecret = (): string | undefined => {
  const clientSecret = normalize(process.env.KROGER_CLIENT_SECRET);
  return clientSecret || undefined;
};

export const isKrogerConfigured = (): boolean =>
  Boolean(getKrogerClientId() && getKrogerClientSecret());

export const KROGER_API_BASE = "https://api.kroger.com/v1";
