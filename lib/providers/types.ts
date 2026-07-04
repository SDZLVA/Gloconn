/**
 * Provider contracts — any external API (Amadeus, Booking.com, etc.)
 * implements these interfaces and maps responses to Glooconn domain types.
 */

import type { Destination } from "@/types/destination";
import type { SearchResult } from "@/types/results";
import type { SearchData } from "@/types/search";

/** Contract for destination lookup and autocomplete providers. */
export type DestinationProvider = {
  readonly name: string;
  searchDestinations(query: string): Promise<Destination[]>;
  getPopularDestinations(): Promise<Destination[]>;
  getDestinationById(id: string): Promise<Destination | null>;
  resolveDestinationId(destinationLabel: string): Promise<string>;
};

/** Contract for travel search providers (hotels, flights, buses, trains). */
export type SearchProvider = {
  readonly name: string;
  search(searchData: SearchData): Promise<SearchResult[]>;
  getAllResults(): Promise<SearchResult[]>;
};
