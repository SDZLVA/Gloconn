/**
 * Provider factories — select mock or external adapter per domain.
 *
 * To add a real provider (e.g. Amadeus for flights):
 * 1. Implement the provider class in `lib/providers/<domain>/<vendor>/`
 * 2. Add a case in the matching `create*Provider()` below
 * 3. Set env vars in `.env.local` — no service or UI changes required
 */

import { createProviderError } from "@/lib/api/errors";
import { getAppConfig } from "@/lib/config";
import type { ProviderName } from "@/lib/config/types";
import type {
  CurrencyProvider,
  DestinationProvider,
  FlightsProvider,
  HotelsProvider,
  TransportProvider,
} from "@/lib/providers/core/types";
import { mockCurrencyProvider } from "@/lib/providers/currencies/mock";
import { mockDestinationProvider } from "@/lib/providers/destinations/mock";
import { amadeusFlightsProvider } from "@/lib/providers/flights/amadeus";
import { mockFlightsProvider } from "@/lib/providers/flights/mock";
import { serpApiFlightsProvider } from "@/lib/providers/flights/serpapi";
import { mockTransportProvider } from "@/lib/providers/ground/mock";
import { mockHotelsProvider } from "@/lib/providers/hotels/mock";

/** Resolves the active provider name, forcing mock when the global flag is set. */
function resolveProviderName(
  configured: ProviderName,
  useMockProviders: boolean,
): ProviderName {
  if (useMockProviders) {
    return "mock";
  }

  return configured;
}

/**
 * Live flights selection when `USE_MOCK_PROVIDERS=false`.
 * Missing `FLIGHTS_PROVIDER` defaults to Amadeus (Sprint 9.8).
 */
function resolveFlightsProviderName(
  flights: ProviderName,
  flightsInput: string | undefined,
  useMockProviders: boolean,
): ProviderName {
  if (useMockProviders) {
    return "mock";
  }

  if (flightsInput === undefined) {
    return "amadeus";
  }

  return flights;
}

export function createCurrencyProvider(): CurrencyProvider {
  return mockCurrencyProvider;
}

export function createDestinationProvider(): DestinationProvider {
  const { providers } = getAppConfig();
  const name = resolveProviderName(
    providers.destinations,
    providers.useMockProviders,
  );

  switch (name) {
    case "google-maps":
      console.warn(
        "[Glooconn] Google Maps destinations provider not implemented — using mock.",
      );
      return mockDestinationProvider;
    case "mock":
    default:
      return mockDestinationProvider;
  }
}

export function createHotelsProvider(): HotelsProvider {
  const { providers } = getAppConfig();
  const name = resolveProviderName(providers.hotels, providers.useMockProviders);

  switch (name) {
    case "booking":
      console.warn(
        "[Glooconn] Booking hotels provider not implemented — using mock.",
      );
      return mockHotelsProvider;
    case "mock":
    default:
      return mockHotelsProvider;
  }
}

export function createFlightsProvider(): FlightsProvider {
  const { providers, amadeus, serpapi } = getAppConfig();

  if (providers.flightsInvalid) {
    throw createProviderError(
      `Unknown flights provider "${providers.flightsInput}". Supported values: mock, amadeus, serpapi.`,
    );
  }

  const name = resolveFlightsProviderName(
    providers.flights,
    providers.flightsInput,
    providers.useMockProviders,
  );

  switch (name) {
    case "amadeus":
      if (!amadeus.isConfigured) {
        console.warn(
          "[Glooconn] FLIGHTS_PROVIDER=amadeus but API keys are missing — using mock flights.",
        );
        return mockFlightsProvider;
      }
      return amadeusFlightsProvider;
    case "serpapi":
      if (!serpapi.isConfigured) {
        console.warn(
          "[Glooconn] FLIGHTS_PROVIDER=serpapi but API key is missing — using mock flights.",
        );
        return mockFlightsProvider;
      }
      return serpApiFlightsProvider;
    case "mock":
      return mockFlightsProvider;
    default:
      // Known ProviderName values that are not flights adapters (e.g. booking).
      return mockFlightsProvider;
  }
}

export function createTransportProvider(): TransportProvider {
  const { providers } = getAppConfig();
  const name = resolveProviderName(
    providers.transport,
    providers.useMockProviders,
  );

  switch (name) {
    case "omio":
      console.warn("[Glooconn] Omio transport provider not implemented — using mock.");
      return mockTransportProvider;
    case "mock":
    default:
      return mockTransportProvider;
  }
}
