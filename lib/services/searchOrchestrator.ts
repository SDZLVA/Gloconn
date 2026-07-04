/**
 * Search orchestration — coordinates domain providers from the service layer.
 */

import {
  createCatalogSearchRequest,
  mergeSearchResults,
  toSearchRequest,
} from "@/lib/api/searchMappers";
import { normalizeProductTypes } from "@/lib/search/productTypes";
import { getServiceProviders } from "@/lib/services/context";
import type { ServiceProviders } from "@/lib/services/types";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchResult } from "@/types/results";
import type { SearchData } from "@/types/search";

/** Runs selected search domains in parallel and merges into the UI result union. */
async function searchAllDomains(
  request: SearchRequest,
  providers: ServiceProviders,
): Promise<SearchResult[]> {
  const productTypes = normalizeProductTypes(request.productTypes);

  const [hotels, flights, transport] = await Promise.all([
    productTypes.includes("hotels")
      ? providers.hotels.search(request)
      : Promise.resolve([]),
    productTypes.includes("flights")
      ? providers.flights.search(request)
      : Promise.resolve([]),
    productTypes.includes("transport")
      ? providers.transport.search(request)
      : Promise.resolve({ buses: [], trains: [] }),
  ]);

  return mergeSearchResults(
    hotels,
    flights,
    transport.buses,
    transport.trains,
  );
}

/** Enriches a search request with a resolved destination id when possible. */
async function enrichSearchRequest(
  search: SearchData,
  providers: ServiceProviders,
): Promise<SearchRequest> {
  const request = toSearchRequest(search);

  if (search.destinationId) {
    return request;
  }

  try {
    const destinationId = await providers.destinations.resolveDestinationId(
      search.destination,
    );
    return { ...request, destinationId };
  } catch {
    return request;
  }
}

/** Runs hotels, flights, and transport providers in parallel. */
export async function orchestrateTripSearch(
  search: SearchData,
  providers: ServiceProviders = getServiceProviders(),
): Promise<SearchResult[]> {
  const request = await enrichSearchRequest(search, providers);
  return searchAllDomains(request, providers);
}

/** Returns the full result catalog via active providers (price-range defaults). */
export async function getAllTripSearchResults(
  providers: ServiceProviders = getServiceProviders(),
): Promise<SearchResult[]> {
  return searchAllDomains(createCatalogSearchRequest(), providers);
}
