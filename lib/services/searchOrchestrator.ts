/**
 * Search orchestration — coordinates domain providers from the service layer.
 */

import {
  createCatalogSearchRequest,
  mergeSearchResults,
} from "@/lib/api/searchMappers";
import { createValidationError } from "@/lib/api/errors";
import { normalizeProductTypes } from "@/lib/search/productTypes";
import { getServiceProviders } from "@/lib/services/context";
import {
  enrichSearchRequestWithAirports,
  hasResolvedFlightAirports,
} from "@/lib/services/iataResolution";
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

/**
 * Enriches a search request with catalog ids and optional IATA codes.
 * Does not validate or fail — missing airports are left empty for later checks.
 */
async function enrichSearchRequest(
  request: SearchRequest,
  providers: ServiceProviders,
): Promise<SearchRequest> {
  try {
    const { request: enriched } = await enrichSearchRequestWithAirports(
      request,
      providers.destinations,
    );
    return enriched;
  } catch {
    // Soft-fail enrichment only — flight validation runs after this step.
    return request;
  }
}

/**
 * When flights are requested, both origin and destination must have IATA codes.
 * Throws a validation error instead of silently skipping flights.
 */
function assertFlightAirportsResolved(request: SearchRequest): void {
  const productTypes = normalizeProductTypes(request.productTypes);
  if (!productTypes.includes("flights")) {
    return;
  }

  if (hasResolvedFlightAirports(request)) {
    return;
  }

  const missingOrigin = !request.originIata?.trim();
  const missingDestination = !request.destinationIata?.trim();

  if (missingOrigin && missingDestination) {
    throw createValidationError(
      "We could not determine airports for your origin and destination. Please select cities from the autocomplete suggestions.",
    );
  }

  if (missingOrigin) {
    throw createValidationError(
      "We could not determine an airport for your origin. Please select a city from the autocomplete suggestions.",
      { field: "origin" },
    );
  }

  throw createValidationError(
    "We could not determine an airport for your destination. Please select a city from the autocomplete suggestions.",
    { field: "destination" },
  );
}

/** Runs hotels, flights, and transport providers in parallel. */
export async function orchestrateTripSearch(
  request: SearchRequest,
  providers: ServiceProviders = getServiceProviders(),
): Promise<SearchResult[]> {
  const enriched = await enrichSearchRequest(request, providers);
  assertFlightAirportsResolved(enriched);
  return searchAllDomains(enriched, providers);
}

/** Returns the full result catalog via active providers (price-range defaults). */
export async function getAllTripSearchResults(
  providers: ServiceProviders = getServiceProviders(),
): Promise<SearchResult[]> {
  return searchAllDomains(createCatalogSearchRequest(), providers);
}
