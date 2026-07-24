/**
 * Maps SerpAPI Google Flights JSON to Glooconn `Flight[]`.
 *
 * Pure orchestration over `mappingHelpers` — no HTTP or provider side effects.
 */

import { createProviderError } from "@/lib/api/errors";
import {
  buildDeterministicFlightId,
  formatSerpApiTime,
  mapAirline,
  mapCabin,
  mapDuration,
  mapPrice,
  mapStops,
  validateCurrency,
} from "@/lib/providers/flights/serpapi/mappingHelpers";
import type {
  SerpApiFlightOption,
  SerpApiGoogleFlightsResponse,
} from "@/lib/providers/flights/serpapi/types";
import type { CurrencyCode } from "@/types/models/currency";
import type { Flight } from "@/types/models";

/** Context the SerpAPI JSON cannot supply (Glooconn destination id). */
export type MapSerpApiFlightsContext = {
  /** Glooconn destination id for the arrival city. */
  destinationId: string;
};

/**
 * Maps one SerpAPI itinerary option to a Glooconn `Flight`.
 *
 * Returns `null` when required schedule/identity/price fields are missing.
 * Throws a controlled provider error when currency cannot be represented
 * by the `Flight` model (does not silently drop a priced offer).
 */
export function mapSerpApiOptionToFlight(
  option: SerpApiFlightOption,
  options: {
    destinationId: string;
    currency: CurrencyCode;
  },
): Flight | null {
  const destinationId = options.destinationId?.trim();
  if (!destinationId) {
    return null;
  }

  const segments = option.flights;
  if (!Array.isArray(segments) || segments.length === 0) {
    return null;
  }

  const departureTime = formatSerpApiTime(segments[0]?.departure_airport?.time);
  const arrivalTime = formatSerpApiTime(
    segments[segments.length - 1]?.arrival_airport?.time,
  );
  if (!departureTime || !arrivalTime) {
    return null;
  }

  const price = mapPrice(option.price);
  if (price === null) {
    return null;
  }

  const durationMinutes = mapDuration(option);
  if (durationMinutes === null) {
    return null;
  }

  return {
    id: buildDeterministicFlightId(option),
    destinationId,
    price,
    currency: options.currency,
    rating: 0,
    airline: mapAirline(segments),
    departureTime,
    arrivalTime,
    durationMinutes,
    stops: mapStops(segments),
    cabin: mapCabin(segments[0]?.travel_class),
  };
}

/**
 * Maps a full SerpAPI Google Flights response to Glooconn `Flight[]`.
 *
 * - Combines `best_flights` then `other_flights`
 * - Missing / empty arrays → `[]`
 * - Per-option `null` results are dropped
 * - Unsupported / missing currency throws `createProviderError` when any priced option exists
 */
export function mapSerpApiFlightsResponse(
  rawResponse: SerpApiGoogleFlightsResponse,
  context: MapSerpApiFlightsContext,
): Flight[] {
  if (typeof rawResponse !== "object" || rawResponse === null) {
    throw createProviderError(
      "Flight search returned an invalid response. Please try again.",
    );
  }

  const best = Array.isArray(rawResponse.best_flights)
    ? rawResponse.best_flights
    : [];
  const other = Array.isArray(rawResponse.other_flights)
    ? rawResponse.other_flights
    : [];
  const options = [...best, ...other];

  if (options.length === 0) {
    return [];
  }

  const currencyResult = validateCurrency(rawResponse.search_parameters?.currency);
  if (!currencyResult.ok) {
    const received = currencyResult.received?.trim() || "(missing)";
    throw createProviderError(
      `Flight offer currency "${received}" is not supported by Glooconn.`,
      { cause: { currency: currencyResult.received } },
    );
  }

  const destinationId = context.destinationId;
  const flights: Flight[] = [];

  for (const option of options) {
    const flight = mapSerpApiOptionToFlight(option, {
      destinationId,
      currency: currencyResult.currency,
    });
    if (flight !== null) {
      flights.push(flight);
    }
  }

  return flights;
}
