/**
 * Search request/response mapping — shared by services and mock providers.
 * No provider or mock data imports here.
 */

import type { Bus, Flight, Hotel, Train } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";
import type {
  SearchResponse,
  SearchResponseWarning,
} from "@/types/models/search-response";
import type { SearchResult } from "@/types/results";
import type { SearchData } from "@/types/search";
import { buildSearchRequestFromData } from "@/lib/search/request";

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
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
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
  warnings?: SearchResponseWarning[];
  searchedAt?: string;
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
  const warnings = input.warnings?.length ? input.warnings : undefined;

  return {
    hotels,
    flights,
    buses,
    trains,
    restaurants,
    attractions,
    totalCount:
      hotels.length +
      flights.length +
      buses.length +
      trains.length +
      restaurants.length +
      attractions.length,
    searchedAt: input.searchedAt ?? new Date().toISOString(),
    warnings,
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
