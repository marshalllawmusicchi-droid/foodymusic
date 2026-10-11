import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./supabase-config.js";

export type UsageFeature = "concierge" | "image" | "hey_foody" | "pdf";

export type UsageCheckResult = {
  allowed: boolean;
  reason: string;
  status: string | null;
  feature: string;
};

let adminClient: SupabaseClient | null = null;

const getServiceRoleKey = (): string => {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local for server-side trial enforcement.",
    );
  }
  return key;
};

const getAdminClient = (): SupabaseClient => {
  adminClient ??= createClient(SUPABASE_URL, getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
};

export const incrementUsageIfAllowed = async (
  userId: string,
  feature: UsageFeature,
): Promise<UsageCheckResult> => {
  const { data, error } = await getAdminClient().rpc("increment_usage_if_allowed", {
    p_user_id: userId,
    p_feature: feature,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || typeof data !== "object") {
    throw new Error("Unexpected response from increment_usage_if_allowed.");
  }

  return data as UsageCheckResult;
};
