/**
 * Search orchestration — coordinates domain providers from the service layer.
 *
 * Provider failures are isolated: successful domains still return results, and
 * failed domains become SearchResponse.warnings (Sprint 10.2).
 *
 * Travel packages are composed after flights + hotels resolve (Sprint 13.3).
 * Packages are product-layer only — never trigger provider calls.
 */

import {
  buildSearchResponse,
  createCatalogSearchRequest,
  createProviderUnavailableWarning,
} from "@/lib/api/searchMappers";
import { createProviderError, createValidationError } from "@/lib/api/errors";
import { composePackages } from "@/lib/packages";
import { normalizeProductTypes } from "@/lib/search/productTypes";
import { getServiceProviders } from "@/lib/services/context";
import {
  enrichSearchRequestWithAirports,
  hasResolvedFlightAirports,
} from "@/lib/services/iataResolution";
import type { ServiceProviders } from "@/lib/services/types";
import type { Bus, Flight, Hotel, Train, TravelPackage } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";
import type {
  SearchResponse,
  SearchResponseWarning,
} from "@/types/models/search-response";
import type { TransportSearchResult } from "@/lib/providers/core/types";

type DomainKey = "hotels" | "flights" | "transport";

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

function emptyTransport(): TransportSearchResult {
  return { buses: [], trains: [] };
}

/**
 * Runs selected search domains in parallel with partial-failure isolation.
 * Throws only when every requested domain fails.
 */
async function searchAllDomains(
  request: SearchRequest,
  providers: ServiceProviders,
): Promise<SearchResponse> {
  const productTypes = normalizeProductTypes(request.productTypes);
  const requested: DomainKey[] = [];

  if (productTypes.includes("hotels")) {
    requested.push("hotels");
  }
  if (productTypes.includes("flights")) {
    requested.push("flights");
  }
  if (productTypes.includes("transport")) {
    requested.push("transport");
  }

  const hotelsPromise: Promise<Hotel[]> = requested.includes("hotels")
    ? providers.hotels.search(request)
    : Promise.resolve([]);
  const flightsPromise: Promise<Flight[]> = requested.includes("flights")
    ? providers.flights.search(request)
    : Promise.resolve([]);
  const transportPromise: Promise<TransportSearchResult> = requested.includes(
    "transport",
  )
    ? providers.transport.search(request)
    : Promise.resolve(emptyTransport());

  const [hotelsSettled, flightsSettled, transportSettled] =
    await Promise.allSettled([hotelsPromise, flightsPromise, transportPromise]);

  let hotels: Hotel[] = [];
  let flights: Flight[] = [];
  let buses: Bus[] = [];
  let trains: Train[] = [];
  const warnings: SearchResponseWarning[] = [];
  let succeeded = 0;
  let failed = 0;

  if (requested.includes("hotels")) {
    if (hotelsSettled.status === "fulfilled") {
      hotels = hotelsSettled.value;
      succeeded += 1;
    } else {
      failed += 1;
      warnings.push(createProviderUnavailableWarning("hotels"));
    }
  }

  if (requested.includes("flights")) {
    if (flightsSettled.status === "fulfilled") {
      flights = flightsSettled.value;
      succeeded += 1;
    } else {
      failed += 1;
      warnings.push(createProviderUnavailableWarning("flights"));
    }
  }

  if (requested.includes("transport")) {
    if (transportSettled.status === "fulfilled") {
      buses = transportSettled.value.buses;
      trains = transportSettled.value.trains;
      succeeded += 1;
    } else {
      failed += 1;
      warnings.push(createProviderUnavailableWarning("transport"));
    }
  }

  // Every requested domain failed — surface a hard provider error (not partial).
  if (requested.length > 0 && succeeded === 0 && failed > 0) {
    throw createProviderError(
      "Could not load travel results. Please try again.",
    );
  }

  const packages = composePackagesIfPossible(flights, hotels, request);

  return buildSearchResponse({
    hotels,
    flights,
    buses,
    trains,
    packages,
    warnings,
  });
}

/**
 * Composes TravelPackage[] when both flights and hotels have results.
 * Never calls providers. Empty when either side is missing or empty.
 */
function composePackagesIfPossible(
  flights: Flight[],
  hotels: Hotel[],
  request: SearchRequest,
): TravelPackage[] {
  if (flights.length === 0 || hotels.length === 0) {
    return [];
  }

  return composePackages(flights, hotels, request);
}

/** Runs hotels, flights, and transport providers in parallel. */
export async function orchestrateTripSearch(
  request: SearchRequest,
  providers: ServiceProviders = getServiceProviders(),
): Promise<SearchResponse> {
  const enriched = await enrichSearchRequest(request, providers);
  assertFlightAirportsResolved(enriched);
  return searchAllDomains(enriched, providers);
}

/** Returns the full result catalog via active providers (price-range defaults). */
export async function getAllTripSearchResults(
  providers: ServiceProviders = getServiceProviders(),
): Promise<SearchResponse> {
  return searchAllDomains(createCatalogSearchRequest(), providers);
}
