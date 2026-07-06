/**
 * Provider contracts — re-exported from core interfaces.
 *
 * Legacy `SearchProvider` remains for the monolithic mock search adapter
 * until it is split into HotelsProvider, FlightsProvider, and TransportProvider.
 */

import type { SearchResult } from "@/types/results";
import type { SearchData } from "@/types/search";

export type { BaseProvider } from "@/lib/providers/core/base";

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

/**
 * @deprecated Monolithic search adapter — use HotelsProvider, FlightsProvider,
 * and TransportProvider via searchOrchestrator instead.
 */
export type SearchProvider = {
  readonly name: string;
  search(searchData: SearchData): Promise<SearchResult[]>;
  getAllResults(): Promise<SearchResult[]>;
};
