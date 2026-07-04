/**
 * Provider selection configuration.
 *
 * Today only mock adapters exist. When external APIs are added, extend this
 * module to read per-domain env vars (e.g. HOTELS_PROVIDER=booking).
 */

import { getApiEnv } from "@/lib/api/env";

export type ProviderConfig = {
  /** When true, mock adapters are used (default for local development). */
  useMockProviders: boolean;
};

/** Reads which provider implementations should be active. */
export function getProviderConfig(): ProviderConfig {
  return {
    useMockProviders: getApiEnv().useMockProviders,
  };
}
