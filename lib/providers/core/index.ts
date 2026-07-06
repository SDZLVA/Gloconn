export {
  createCurrencyProvider,
  createDestinationProvider,
  createFlightsProvider,
  createHotelsProvider,
  createTransportProvider,
} from "@/lib/providers/core/factories";

export {
  getCurrencyProvider,
  getDestinationProvider,
  getFlightsProvider,
  getHotelsProvider,
  getProviderRegistry,
  getTransportProvider,
  resetProviderRegistry,
  useMockProviders,
  type ProviderRegistry,
} from "@/lib/providers/core/registry";

export type {
  AttractionsProvider,
  CurrencyProvider,
  DestinationProvider,
  FlightsProvider,
  HotelsProvider,
  RestaurantsProvider,
  TransportProvider,
  TransportSearchResult,
} from "@/lib/providers/core/types";
