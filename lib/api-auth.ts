import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config.js";

export const extractBearerToken = (
  headers?: Record<string, string | string[] | undefined>,
): string => {
  const authHeader = headers?.authorization ?? headers?.Authorization;
  return typeof authHeader === "string" ? authHeader.replace(/^Bearer\s+/i, "").trim() : "";
};

export const verifySupabaseUser = async (token: string) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return data.user;
};
