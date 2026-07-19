/**
 * Known Amadeus Self-Service hosts — no arbitrary base URLs.
 */

import type { AmadeusEnvName } from "@/lib/config/types";

export const AMADEUS_HOSTS: Record<AmadeusEnvName, string> = {
  test: "https://test.api.amadeus.com",
  production: "https://api.amadeus.com",
};

/** Default OAuth request timeout (ms). */
export const DEFAULT_AMADEUS_OAUTH_TIMEOUT_MS = 10_000;

/** Default authenticated API request timeout (ms). */
export const DEFAULT_AMADEUS_FETCH_TIMEOUT_MS = 15_000;

export function resolveAmadeusBaseUrl(env: AmadeusEnvName): string {
  return AMADEUS_HOSTS[env];
}
