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
  createNoRecentFlightPricesWarning,
  createProviderUnavailableWarning,
  isNoRecentPricesError,
} from "@/lib/api/searchMappers";
import { createProviderError, createValidationError } from "@/lib/api/errors";
import { prepareAviasalesPartnerLink } from "@/lib/affiliate/serverPartnerLinks";
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

/** Options for trip search orchestration (Milestone 18 scout mode). */
export type OrchestrateTripSearchOptions = {
  /**
   * When true, flights providers may use a cheaper round-trip enrichment
   * (SerpAPI: 1 return lookup instead of up to 3). Default false.
   */
  scout?: boolean;
};

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
  options: OrchestrateTripSearchOptions = {},
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

  const flightSearchOptions =
    options.scout === true ? { scout: true as const } : undefined;

  const hotelsPromise: Promise<Hotel[]> = requested.includes("hotels")
    ? providers.hotels.search(request)
    : Promise.resolve([]);
  const flightsPromise: Promise<Flight[]> = requested.includes("flights")
    ? providers.flights.search(request, flightSearchOptions)
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
    } else if (isNoRecentPricesError(flightsSettled.reason)) {
      // Milestone 22: an empty answer is not an outage. Counting it as a
      // failure turned a flights-only search into "Could not load travel
      // results" (HTTP 502) instead of the honest no-recent-prices message.
      succeeded += 1;
      warnings.push(createNoRecentFlightPricesWarning());
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
    route: resolvedRoute(request),
  });
}

/**
 * Airport codes from the enriched request, for the browser (Milestone 19).
 * Omitted entirely when neither code resolved, so hotel-only responses are
 * unchanged.
 */
function resolvedRoute(request: SearchRequest): SearchResponse["route"] {
  const originIata = request.originIata?.trim().toUpperCase() || null;
  const destinationIata = request.destinationIata?.trim().toUpperCase() || null;
  if (!originIata && !destinationIata) {
    return undefined;
  }
  return {
    originIata,
    destinationIata,
    originCityIata: request.originCityIata ?? null,
    destinationCityIata: request.destinationCityIata ?? null,
  };
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
  options: OrchestrateTripSearchOptions = {},
): Promise<SearchResponse> {
  const enriched = await enrichSearchRequest(request, providers);
  assertFlightAirportsResolved(enriched);
  // Runs alongside the search so it adds no waiting time; never throws.
  const [response, aviasales] = await Promise.all([
    searchAllDomains(enriched, providers, options),
    // Scout searches (price hints) show no buttons — don't spend link-API calls.
    options.scout ? Promise.resolve(undefined) : prepareAviasalesPartnerLink(enriched),
  ]);
  return aviasales ? { ...response, partnerLinks: { aviasales } } : response;
}

/** Returns the full result catalog via active providers (price-range defaults). */
export async function getAllTripSearchResults(
  providers: ServiceProviders = getServiceProviders(),
): Promise<SearchResponse> {
  return searchAllDomains(createCatalogSearchRequest(), providers);
}
