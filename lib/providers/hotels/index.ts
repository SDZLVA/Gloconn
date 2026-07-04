import { getApiEnv } from "@/lib/api/env";
import { mockHotelsProvider } from "@/lib/providers/hotels/mock";
import type { HotelsProvider } from "@/lib/providers/types";

/**
 * Returns the active hotels provider based on environment configuration.
 */
export function getHotelsProvider(): HotelsProvider {
  const { useMockProviders } = getApiEnv();

  if (useMockProviders) {
    return mockHotelsProvider;
  }

  return mockHotelsProvider;
}
