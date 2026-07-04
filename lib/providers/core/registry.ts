/**
 * Central provider factory — returns the active adapter per domain.
 *
 * Planned: getHotelsProvider(), getFlightsProvider(), getTransportProvider(),
 * getRestaurantsProvider(), getAttractionsProvider().
 * Not implemented yet — see lib/providers/core/types.ts for interfaces.
 */

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
