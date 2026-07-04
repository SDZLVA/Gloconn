/**
 * Provider selection configuration.
 *
 * Provider names and mock flag come from environment variables.
 * See `.env.example` and `lib/config/`.
 */

import { getAppConfig } from "@/lib/config";
import type { ProviderName } from "@/lib/config/types";

export type ProviderConfig = {
  useMockProviders: boolean;
  destinations: ProviderName;
  hotels: ProviderName;
  flights: ProviderName;
  transport: ProviderName;
};

/** Reads which provider implementations should be active. */
export function getProviderConfig(): ProviderConfig {
  const { providers } = getAppConfig();
  return providers;
}
