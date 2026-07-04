import { getApiEnv } from "@/lib/api/env";
import { mockDestinationProvider } from "@/lib/providers/destinations/mock";
import type { DestinationProvider } from "@/lib/providers/types";

/**
 * Returns the active destination provider based on environment configuration.
 * Add new providers here when connecting external APIs.
 */
export function getDestinationProvider(): DestinationProvider {
  const { useMockProviders } = getApiEnv();

  if (useMockProviders) {
    return mockDestinationProvider;
  }

  // Future: return amadeusDestinationProvider, googlePlacesProvider, etc.
  return mockDestinationProvider;
}
