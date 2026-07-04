/**
 * API environment — backward-compatible re-export from centralized config.
 * @deprecated Prefer `getAppConfig()` from `@/lib/config`.
 */

import { getAppConfig, type ApiEnv } from "@/lib/config";

export type { ApiEnv };

/**
 * Reads API-related environment variables.
 * Defaults to mock providers so local development works without API keys.
 */
export function getApiEnv(): ApiEnv {
  const { providers } = getAppConfig();
  return { useMockProviders: providers.useMockProviders };
}
