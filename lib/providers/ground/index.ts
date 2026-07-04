import { getApiEnv } from "@/lib/api/env";
import { mockTransportProvider } from "@/lib/providers/ground/mock";
import type { TransportProvider } from "@/lib/providers/types";

/**
 * Returns the active ground transport provider based on environment configuration.
 */
export function getTransportProvider(): TransportProvider {
  const { useMockProviders } = getApiEnv();

  if (useMockProviders) {
    return mockTransportProvider;
  }

  return mockTransportProvider;
}
