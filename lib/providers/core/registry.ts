/**
 * Central provider registry — single place that picks active adapters.
 */

import { getAppConfig } from "@/lib/config";
import {
  createCurrencyProvider,
  createDestinationProvider,
  createFlightsProvider,
  createHotelsProvider,
  createTransportProvider,
} from "@/lib/providers/core/factories";
import type {
  CurrencyProvider,
  DestinationProvider,
  FlightsProvider,
  HotelsProvider,
  TransportProvider,
} from "@/lib/providers/core/types";

/** Active provider instances for all travel domains. */
export type ProviderRegistry = {
  currencies: CurrencyProvider;
  destinations: DestinationProvider;
  hotels: HotelsProvider;
  flights: FlightsProvider;
  transport: TransportProvider;
};

let registry: ProviderRegistry | null = null;

function createProviderRegistry(): ProviderRegistry {
  return {
    currencies: createCurrencyProvider(),
    destinations: createDestinationProvider(),
    hotels: createHotelsProvider(),
    flights: createFlightsProvider(),
    transport: createTransportProvider(),
  };
}

/**
 * Returns the active provider registry.
 * Selection is driven by env vars — see `lib/providers/core/factories.ts`.
 */
export function getProviderRegistry(): ProviderRegistry {
  if (registry) {
    return registry;
  }

  const { validation } = getAppConfig();

  if (!validation.isValid) {
    console.error(
      "[Glooconn] Configuration errors:",
      validation.errors.map((issue) => issue.message).join(" "),
    );
  }

  registry = createProviderRegistry();
  return registry;
}

/** Clears the cached registry (useful in tests). */
export function resetProviderRegistry(): void {
  registry = null;
}

export function getDestinationProvider(): DestinationProvider {
  return getProviderRegistry().destinations;
}

export function getCurrencyProvider(): CurrencyProvider {
  return getProviderRegistry().currencies;
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

/** Returns whether mock adapters are forced by configuration. */
export function useMockProviders(): boolean {
  return getAppConfig().providers.useMockProviders;
}
