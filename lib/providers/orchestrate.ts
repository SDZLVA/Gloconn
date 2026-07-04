/**
 * Provider orchestration — parallel search across domain adapters.
 * Used by the service layer; does not import from lib/services.
 */

import { getFlightsProvider } from "@/lib/providers/flights";
import { getTransportProvider } from "@/lib/providers/ground";
import { getHotelsProvider } from "@/lib/providers/hotels";
import {
  ALL_MOCK_SEARCH_RESULTS,
  mergeSearchResults,
  toSearchRequest,
} from "@/lib/providers/mock/shared";
import type { SearchResult } from "@/types/results";
import type { SearchData } from "@/types/search";

/** Runs hotels, flights, and transport providers in parallel. */
export async function orchestrateTripSearch(
  search: SearchData,
): Promise<SearchResult[]> {
  const request = toSearchRequest(search);

  const [hotels, flights, transport] = await Promise.all([
    getHotelsProvider().search(request),
    getFlightsProvider().search(request),
    getTransportProvider().search(request),
  ]);

  return mergeSearchResults(
    hotels,
    flights,
    transport.buses,
    transport.trains,
  );
}

/** Full static result pool for price-range defaults. */
export async function getAllTripSearchResults(): Promise<SearchResult[]> {
  return ALL_MOCK_SEARCH_RESULTS;
}
