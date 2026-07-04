/**
 * Provider registry — selects which implementation to use at runtime.
 */

export { getDestinationProvider } from "@/lib/providers/destinations";
export { getSearchProvider } from "@/lib/providers/search";

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
