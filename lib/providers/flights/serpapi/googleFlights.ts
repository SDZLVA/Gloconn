/**
 * SerpAPI Google Flights — pure query parameter builders.
 *
 * Converts Glooconn `SearchRequest` + SerpAPI config into query params.
 * No HTTP — a later sprint will send these parameters.
 *
 * Parameter names and numeric codes follow SerpAPI docs:
 * https://serpapi.com/google-flights-api
 */

import { createProviderError } from "@/lib/api/errors";
import type { SerpApiConfig } from "@/lib/config/types";
import type {
  SearchRequest,
  TravelStyle,
  TripType,
} from "@/types/models/search-request";

/** Minimal config slice required by the query builder. */
export type SerpApiQueryConfig = Pick<SerpApiConfig, "deepSearch">;

/** SerpAPI `type` values. */
export type SerpApiTripTypeCode = 1 | 2 | 3;

/** SerpAPI `travel_class` values. */
export type SerpApiTravelClassCode = 1 | 2 | 3 | 4;

/**
 * Maps Glooconn trip type to SerpAPI `type`.
 * Round trip → 1, One way → 2, Multi-city → 3 (unused in Glooconn today).
 */
export function mapTripTypeToSerpApiType(tripType: TripType): SerpApiTripTypeCode {
  switch (tripType) {
    case "round-trip":
      return 1;
    case "one-way":
      return 2;
    default: {
      const _exhaustive: never = tripType;
      return _exhaustive;
    }
  }
}

/**
 * Maps a cabin label to SerpAPI `travel_class`.
 * Isolated so cabin strings can evolve independently of SearchRequest.
 *
 * Economy → 1, Premium Economy → 2, Business → 3, First → 4
 */
export function mapCabinLabelToSerpApiTravelClass(
  label: string,
): SerpApiTravelClassCode | undefined {
  const normalized = label.trim().toLowerCase().replace(/[_-]+/g, " ");

  switch (normalized) {
    case "economy":
      return 1;
    case "premium economy":
      return 2;
    case "business":
      return 3;
    case "first":
    case "first class":
      return 4;
    default:
      return undefined;
  }
}

/**
 * Maps Glooconn `travelStyle` to SerpAPI `travel_class`.
 * budget/standard → Economy (1); luxury → Business (3).
 */
export function mapTravelStyleToSerpApiTravelClass(
  travelStyle: TravelStyle,
): SerpApiTravelClassCode {
  switch (travelStyle) {
    case "luxury":
      return 3;
    case "budget":
    case "standard":
      return 1;
    default: {
      const _exhaustive: never = travelStyle;
      return _exhaustive;
    }
  }
}

/**
 * Builds SerpAPI Google Flights query parameters from a SearchRequest.
 *
 * Expects an enriched SearchRequest with originIata and destinationIata.
 * Omits empty / zero optional passenger fields and missing currency.
 * Does not include `api_key` (added by the HTTP client in a later sprint).
 */
export function buildSerpApiSearchParams(
  request: SearchRequest,
  config: SerpApiQueryConfig,
): URLSearchParams {
  const departureId = request.originIata?.trim().toUpperCase();
  const arrivalId = request.destinationIata?.trim().toUpperCase();
  const outboundDate = request.departureDate?.trim();
  const adults = request.travelers.adults;

  if (!departureId) {
    throw createProviderError(
      "Flight search requires an origin airport code (originIata).",
    );
  }

  if (!arrivalId) {
    throw createProviderError(
      "Flight search requires a destination airport code (destinationIata).",
    );
  }

  if (!outboundDate) {
    throw createProviderError("Flight search requires a departure date.");
  }

  if (!Number.isFinite(adults) || adults < 1) {
    throw createProviderError("Flight search requires at least one adult.");
  }

  const serpType = mapTripTypeToSerpApiType(request.tripType);
  const returnDate = request.returnDate?.trim();

  if (serpType === 1 && !returnDate) {
    throw createProviderError(
      "Round-trip flight search requires a return date.",
    );
  }

  const params = new URLSearchParams();

  params.set("engine", "google_flights");
  params.set("departure_id", departureId);
  params.set("arrival_id", arrivalId);
  params.set("outbound_date", outboundDate);
  params.set("type", String(serpType));
  params.set("adults", String(adults));
  params.set(
    "travel_class",
    String(mapTravelStyleToSerpApiTravelClass(request.travelStyle)),
  );
  params.set("deep_search", config.deepSearch ? "true" : "false");

  if (serpType === 1 && returnDate) {
    params.set("return_date", returnDate);
  }

  if (request.travelers.children > 0) {
    params.set("children", String(request.travelers.children));
  }

  // Glooconn has a single infants count; Google Flights defaults infants to on-lap.
  if (request.travelers.infants > 0) {
    params.set("infants_on_lap", String(request.travelers.infants));
  }

  const currency = request.budget?.currency?.trim().toUpperCase();
  if (currency) {
    params.set("currency", currency);
  }

  return params;
}
