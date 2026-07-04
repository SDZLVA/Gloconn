/**
 * Service-layer types — internal contracts, not part of the UI API.
 */

import type {
  DestinationProvider,
  FlightsProvider,
  HotelsProvider,
  TransportProvider,
} from "@/lib/providers/core/types";

/**
 * Provider dependencies injected into services.
 * Mirrors the registry shape so tests can pass mock implementations.
 */
export type ServiceProviders = {
  destinations: DestinationProvider;
  hotels: HotelsProvider;
  flights: FlightsProvider;
  transport: TransportProvider;
};
