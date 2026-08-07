const readRequiredEnv = (name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY"): string => {
  const value = (process.env[name] ?? "").trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Add it to .env.local — see .env.supabase.example.`,
    );
  }
  return value;
};

export const SUPABASE_URL = readRequiredEnv("VITE_SUPABASE_URL");
export const SUPABASE_ANON_KEY = readRequiredEnv("VITE_SUPABASE_ANON_KEY");
