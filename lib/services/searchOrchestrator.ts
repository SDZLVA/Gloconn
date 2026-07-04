/**
 * Search orchestration — coordinates domain providers from the service layer.
 *
 * Services call this module; providers only implement their own interface.
 */

import {
  createCatalogSearchRequest,
  mergeSearchResults,
  toSearchRequest,
} from "@/lib/api/searchMappers";
import { getServiceProviders } from "@/lib/services/context";
import type { ServiceProviders } from "@/lib/services/types";
import type { SearchResult } from "@/types/results";
import type { SearchData } from "@/types/search";

/** Runs hotels, flights, and transport providers in parallel. */
export async function orchestrateTripSearch(
  search: SearchData,
  providers: ServiceProviders = getServiceProviders(),
): Promise<SearchResult[]> {
  const request = toSearchRequest(search);

  const [hotels, flights, transport] = await Promise.all([
    providers.hotels.search(request),
    providers.flights.search(request),
    providers.transport.search(request),
  ]);

  return mergeSearchResults(
    hotels,
    flights,
    transport.buses,
    transport.trains,
  );
}

/** Returns the full result catalog via active providers (price-range defaults). */
export async function getAllTripSearchResults(
  providers: ServiceProviders = getServiceProviders(),
): Promise<SearchResult[]> {
  const request = createCatalogSearchRequest();

  const [hotels, flights, transport] = await Promise.all([
    providers.hotels.search(request),
    providers.flights.search(request),
    providers.transport.search(request),
  ]);

  return mergeSearchResults(
    hotels,
    flights,
    transport.buses,
    transport.trains,
  );
}
