import { getProviderConfig } from "@/lib/providers/core/config";
import { mockSearchProvider } from "@/lib/providers/search/mock";
import type { SearchProvider } from "@/lib/providers/types";

/**
 * Returns the active search provider based on environment configuration.
 * @deprecated Use domain providers via the registry instead.
 */
export function getSearchProvider(): SearchProvider {
  const { useMockProviders } = getProviderConfig();

  if (useMockProviders) {
    return mockSearchProvider;
  }

  return mockSearchProvider;
}
