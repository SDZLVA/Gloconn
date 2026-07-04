import { getApiEnv } from "@/lib/api/env";
import { mockFlightsProvider } from "@/lib/providers/flights/mock";
import type { FlightsProvider } from "@/lib/providers/types";

/**
 * Returns the active flights provider based on environment configuration.
 */
export function getFlightsProvider(): FlightsProvider {
  const { useMockProviders } = getApiEnv();

  if (useMockProviders) {
    return mockFlightsProvider;
  }

  return mockFlightsProvider;
}
