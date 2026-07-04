import { getApiEnv } from "@/lib/api/env";
import { mockSearchProvider } from "@/lib/providers/search/mock";
import type { SearchProvider } from "@/lib/providers/types";

/**
 * Returns the active search provider based on environment configuration.
 * Add new providers here when connecting external APIs.
 */
export function getSearchProvider(): SearchProvider {
  const { useMockProviders } = getApiEnv();

  if (useMockProviders) {
    return mockSearchProvider;
  }

  // Future: return amadeusSearchProvider, bookingSearchProvider, etc.
  return mockSearchProvider;
}
