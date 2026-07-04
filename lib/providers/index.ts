/**
 * Provider registry — selects which implementation to use at runtime.
 */

export { getDestinationProvider } from "@/lib/providers/destinations";
export { getFlightsProvider } from "@/lib/providers/flights";
export { getTransportProvider } from "@/lib/providers/ground";
export { getHotelsProvider } from "@/lib/providers/hotels";
export { getSearchProvider } from "@/lib/providers/search";

export {
  getAllTripSearchResults,
  orchestrateTripSearch,
} from "@/lib/providers/orchestrate";

export type { BaseProvider } from "@/lib/providers/core/base";

export type {
  AttractionsProvider,
  DestinationProvider,
  FlightsProvider,
  HotelsProvider,
  RestaurantsProvider,
  SearchProvider,
  TransportProvider,
  TransportSearchResult,
} from "@/lib/providers/types";
