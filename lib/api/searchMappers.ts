/**
 * Search request/response mapping — shared by services and mock providers.
 * No provider or mock data imports here.
 */

import type { Bus, Flight, Hotel, Train, TravelPackage } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";
import type {
  SearchResponse,
  SearchResponseWarning,
} from "@/types/models/search-response";
import type { SearchResult } from "@/types/results";
import type { SearchData } from "@/types/search";
import { buildSearchRequestFromData } from "@/lib/search/request";
import { INITIAL_PASSENGERS } from "@/types/search-form";

/**
 * Special destination value that tells mock providers to return their full catalog.
 * Used by the service layer for price-range defaults — not shown in the UI.
 */
export const CATALOG_SEARCH_DESTINATION = "__catalog__";

/** Safe, provider-agnostic message for partial domain failures. */
export const PROVIDER_UNAVAILABLE_WARNING_MESSAGE =
  "Some travel results are temporarily unavailable. Showing available results.";

/** Converts validated SearchData into the canonical SearchRequest model. */
export function toSearchRequest(search: SearchData): SearchRequest {
  return buildSearchRequestFromData(search);
}

/** Builds a catalog search request that returns all items from each provider. */
export function createCatalogSearchRequest(): SearchRequest {
  return {
    origin: "",
    destination: CATALOG_SEARCH_DESTINATION,
    tripType: "round-trip",
    departureDate: new Date().toISOString().slice(0, 10),
    returnDate: null,
    budget: null,
    travelers: { ...INITIAL_PASSENGERS },
    totalGuests: INITIAL_PASSENGERS.adults,
    travelStyle: "standard",
  };
}

/** Merges domain results into the SearchResult union used by the UI. */
export function mergeSearchResults(
  hotels: Hotel[],
  flights: Flight[],
  buses: Bus[],
  trains: Train[],
): SearchResult[] {
  return [
    ...hotels.map((hotel) => ({ ...hotel, type: "hotel" as const })),
    ...flights.map((flight) => ({ ...flight, type: "flight" as const })),
    ...buses.map((bus) => ({ ...bus, type: "bus" as const })),
    ...trains.map((train) => ({ ...train, type: "train" as const })),
  ];
}

/** Builds a provider-agnostic unavailable warning for one search domain. */
/** Error cause reason a flights provider uses when its cache has no prices. */
export const NO_RECENT_PRICES_REASON = "no_recent_prices";

export const NO_RECENT_FLIGHT_PRICES_MESSAGE =
  "No recent flight prices were found for these dates. Prices come from recent searches by other travellers, so dates closer to today usually have more. Try different dates.";

/**
 * Flights warning for "the data source has nothing for these dates" — not
 * an outage, so "temporarily unavailable" would be untrue.
 */
export function createNoRecentFlightPricesWarning(): SearchResponseWarning {
  return {
    code: "NO_RECENT_PRICES",
    domain: "flights",
    message: NO_RECENT_FLIGHT_PRICES_MESSAGE,
  };
}

/** True when a flights failure means "no recent prices", not an outage. */
export function isNoRecentPricesError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("cause" in error)) {
    return false;
  }
  const cause = (error as { cause?: unknown }).cause;
  return (
    typeof cause === "object" &&
    cause !== null &&
    (cause as { reason?: unknown }).reason === NO_RECENT_PRICES_REASON
  );
}

export function createProviderUnavailableWarning(
  domain: SearchResponseWarning["domain"],
): SearchResponseWarning {
  return {
    code: "PROVIDER_UNAVAILABLE",
    domain,
    message: PROVIDER_UNAVAILABLE_WARNING_MESSAGE,
  };
}

type BuildSearchResponseInput = {
  hotels?: Hotel[];
  flights?: Flight[];
  buses?: Bus[];
  trains?: Train[];
  restaurants?: SearchResponse["restaurants"];
  attractions?: SearchResponse["attractions"];
  packages?: TravelPackage[];
  warnings?: SearchResponseWarning[];
  searchedAt?: string;
  route?: SearchResponse["route"];
};

/** Assembles the canonical SearchResponse from domain arrays + optional warnings. */
export function buildSearchResponse(
  input: BuildSearchResponseInput = {},
): SearchResponse {
  const hotels = input.hotels ?? [];
  const flights = input.flights ?? [];
  const buses = input.buses ?? [];
  const trains = input.trains ?? [];
  const restaurants = input.restaurants ?? [];
  const attractions = input.attractions ?? [];
  const packages = input.packages ?? [];
  const warnings = input.warnings?.length ? input.warnings : undefined;

  return {
    hotels,
    flights,
    buses,
    trains,
    restaurants,
    attractions,
    packages,
    totalCount:
      hotels.length +
      flights.length +
      buses.length +
      trains.length +
      restaurants.length +
      attractions.length,
    searchedAt: input.searchedAt ?? new Date().toISOString(),
    warnings,
    ...(input.route ? { route: input.route } : {}),
  };
}

/** Flattens SearchResponse into the UI SearchResult[] card list. */
export function searchResponseToResults(
  response: SearchResponse,
): SearchResult[] {
  return mergeSearchResults(
    response.hotels,
    response.flights,
    response.buses,
    response.trains,
  );
}
