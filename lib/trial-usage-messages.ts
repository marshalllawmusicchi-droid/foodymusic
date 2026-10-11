import type { UsageCheckResult } from "./supabase-admin.js";

const TRIAL_DENIED_MESSAGES: Record<string, string> = {
  trial_expired:
    "Your 3-day trial has ended. Subscribe to keep using the AI Concierge.",
  trial_cap_reached:
    "You've reached your trial limit for the AI Concierge. Try again tomorrow or subscribe for full access.",
};

export const buildTrialDeniedPayload = (result: UsageCheckResult) => {
  const error =
    TRIAL_DENIED_MESSAGES[result.reason] ??
    "This feature is not available on your current plan.";

  const statusCode = result.reason === "trial_cap_reached" ? 429 : 403;

  return {
    statusCode,
    payload: {
      error,
      reason: result.reason,
      status: result.status,
      feature: result.feature,
    },
  };
};
