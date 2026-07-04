/**
 * Central provider registry — single place that picks active adapters.
 *
 * Domain folders re-export these getters so callers can import from
 * `@/lib/providers/hotels` or `@/lib/providers/core/registry`.
 */

import { getProviderConfig } from "@/lib/providers/core/config";
import { mockDestinationProvider } from "@/lib/providers/destinations/mock";
import { mockFlightsProvider } from "@/lib/providers/flights/mock";
import { mockTransportProvider } from "@/lib/providers/ground/mock";
import { mockHotelsProvider } from "@/lib/providers/hotels/mock";
import type {
  DestinationProvider,
  FlightsProvider,
  HotelsProvider,
  TransportProvider,
} from "@/lib/providers/core/types";

export type ProviderRegistry = {
  destinations: DestinationProvider;
  hotels: HotelsProvider;
  flights: FlightsProvider;
  transport: TransportProvider;
};

let registry: ProviderRegistry | null = null;

/** Builds the default mock registry (only option until external APIs are wired). */
function createMockRegistry(): ProviderRegistry {
  return {
    destinations: mockDestinationProvider,
    hotels: mockHotelsProvider,
    flights: mockFlightsProvider,
    transport: mockTransportProvider,
  };
}

/**
 * Returns the active provider registry.
 * Selection is driven by `USE_MOCK_PROVIDERS` — see `lib/providers/core/config.ts`.
 */
export function getProviderRegistry(): ProviderRegistry {
  if (registry) {
    return registry;
  }

  const { useMockProviders } = getProviderConfig();

  if (!useMockProviders) {
    console.warn(
      "[Glooconn] USE_MOCK_PROVIDERS=false but no external providers are configured yet. Using mock adapters.",
    );
  }

  registry = createMockRegistry();
  return registry;
}

/** Clears the cached registry (useful in tests). */
export function resetProviderRegistry(): void {
  registry = null;
}

export function getDestinationProvider(): DestinationProvider {
  return getProviderRegistry().destinations;
}

export function getHotelsProvider(): HotelsProvider {
  return getProviderRegistry().hotels;
}

export function getFlightsProvider(): FlightsProvider {
  return getProviderRegistry().flights;
}

export function getTransportProvider(): TransportProvider {
  return getProviderRegistry().transport;
}

/** Returns whether mock adapters are active (default true). */
export function useMockProviders(): boolean {
  return getProviderConfig().useMockProviders;
}
