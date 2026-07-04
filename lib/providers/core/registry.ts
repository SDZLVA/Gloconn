/**
 * Central provider factory — returns the active adapter per domain.
 */

import { getApiEnv } from "@/lib/api/env";
import { getDestinationProvider } from "@/lib/providers/destinations";
import { getFlightsProvider } from "@/lib/providers/flights";
import { getTransportProvider } from "@/lib/providers/ground";
import { getHotelsProvider } from "@/lib/providers/hotels";

export {
  getDestinationProvider,
  getFlightsProvider,
  getHotelsProvider,
  getTransportProvider,
};

export type { BaseProvider } from "@/lib/providers/core/base";

export type {
  AttractionsProvider,
  DestinationProvider,
  FlightsProvider,
  HotelsProvider,
  RestaurantsProvider,
  TransportProvider,
  TransportSearchResult,
} from "@/lib/providers/core/types";

/** Returns whether mock adapters are active (default true). */
export function useMockProviders(): boolean {
  return getApiEnv().useMockProviders;
}
