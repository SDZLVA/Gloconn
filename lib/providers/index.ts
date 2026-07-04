/**
 * Provider registry — selects which implementation to use at runtime.
 */

export {
  getDestinationProvider,
  getFlightsProvider,
  getHotelsProvider,
  getProviderRegistry,
  getTransportProvider,
  resetProviderRegistry,
  useMockProviders,
} from "@/lib/providers/core/registry";

export { getSearchProvider } from "@/lib/providers/search";

export type { ProviderRegistry } from "@/lib/providers/core/registry";

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
