/**
 * Search orchestration — coordinates domain providers from the service layer.
 */

import {
  createCatalogSearchRequest,
  mergeSearchResults,
} from "@/lib/api/searchMappers";
import { normalizeProductTypes } from "@/lib/search/productTypes";
import { getServiceProviders } from "@/lib/services/context";
import type { ServiceProviders } from "@/lib/services/types";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchResult } from "@/types/results";

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
  request: SearchRequest,
  providers: ServiceProviders,
): Promise<SearchRequest> {
  if (request.destinationId) {
    return request;
  }

  try {
    const destinationId = await providers.destinations.resolveDestinationId(
      request.destination,
    );
    return { ...request, destinationId };
  } catch {
    return request;
  }
}

/** Runs hotels, flights, and transport providers in parallel. */
export async function orchestrateTripSearch(
  request: SearchRequest,
  providers: ServiceProviders = getServiceProviders(),
): Promise<SearchResult[]> {
  const enriched = await enrichSearchRequest(request, providers);
  return searchAllDomains(enriched, providers);
}

/** Returns the full result catalog via active providers (price-range defaults). */
export async function getAllTripSearchResults(
  providers: ServiceProviders = getServiceProviders(),
): Promise<SearchResult[]> {
  return searchAllDomains(createCatalogSearchRequest(), providers);
}
