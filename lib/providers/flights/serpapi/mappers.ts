/**
 * Maps SerpAPI Google Flights JSON to Glooconn `Flight[]`.
 *
 * Pure orchestration over `mappingHelpers` — no HTTP or provider side effects.
 */

import { createProviderError } from "@/lib/api/errors";
import {
  buildDeterministicFlightId,
  buildRoundTripFlightId,
  formatSerpApiDateTime,
  mapAirline,
  mapCabin,
  mapDuration,
  mapPrice,
  mapStops,
  resolveFlightCurrency,
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

  /**
   * Optional currency from the original SearchRequest budget.
   * Used when the response omits `search_parameters.currency` (Sprint 11.2).
   */
  requestCurrency?: string;
};

/**
 * Maps one SerpAPI itinerary option to a Glooconn `Flight`.
 *
 * Returns `null` when required schedule/identity/price fields are missing.
 * Departure/arrival times preserve full local date-time when SerpAPI provides it.
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

  const departureTime = formatSerpApiDateTime(
    segments[0]?.departure_airport?.time,
  );
  const arrivalTime = formatSerpApiDateTime(
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
 * Maps an outbound option + return option into one round-trip `Flight`.
 *
 * Schedule fields use the **outbound** leg (card still shows one journey).
 * Price uses the **return** option (SerpAPI RT total after `departure_token`).
 * Duration/stops sum both legs. No shared model change.
 */
export function mapSerpApiRoundTripPairToFlight(
  outbound: SerpApiFlightOption,
  returnOption: SerpApiFlightOption,
  options: {
    destinationId: string;
    currency: CurrencyCode;
  },
): Flight | null {
  const destinationId = options.destinationId?.trim();
  if (!destinationId) {
    return null;
  }

  const outboundSegments = outbound.flights;
  const returnSegments = returnOption.flights;
  if (
    !Array.isArray(outboundSegments) ||
    outboundSegments.length === 0 ||
    !Array.isArray(returnSegments) ||
    returnSegments.length === 0
  ) {
    return null;
  }

  const departureTime = formatSerpApiDateTime(
    outboundSegments[0]?.departure_airport?.time,
  );
  const arrivalTime = formatSerpApiDateTime(
    outboundSegments[outboundSegments.length - 1]?.arrival_airport?.time,
  );
  if (!departureTime || !arrivalTime) {
    return null;
  }

  const price = mapPrice(returnOption.price);
  if (price === null) {
    return null;
  }

  const outboundDuration = mapDuration(outbound);
  const returnDuration = mapDuration(returnOption);
  if (outboundDuration === null || returnDuration === null) {
    return null;
  }

  const outboundAirline = mapAirline(outboundSegments);
  const returnAirline = mapAirline(returnSegments);
  const airline =
    outboundAirline === returnAirline
      ? outboundAirline
      : `${outboundAirline} / ${returnAirline}`;

  return {
    id: buildRoundTripFlightId(outbound, returnOption),
    destinationId,
    price,
    currency: options.currency,
    rating: 0,
    airline,
    departureTime,
    arrivalTime,
    durationMinutes: outboundDuration + returnDuration,
    stops: mapStops(outboundSegments) + mapStops(returnSegments),
    cabin: mapCabin(outboundSegments[0]?.travel_class),
  };
}

/** Collects best_flights then other_flights into one list. */
export function collectSerpApiOptions(
  rawResponse: SerpApiGoogleFlightsResponse,
): SerpApiFlightOption[] {
  const best = Array.isArray(rawResponse.best_flights)
    ? rawResponse.best_flights
    : [];
  const other = Array.isArray(rawResponse.other_flights)
    ? rawResponse.other_flights
    : [];
  return [...best, ...other];
}

/**
 * Maps a full SerpAPI Google Flights response to Glooconn `Flight[]`.
 *
 * - Combines `best_flights` then `other_flights`
 * - Missing / empty arrays → `[]`
 * - Per-option `null` results are dropped
 * - Currency uses response → request → EUR fallbacks (unsupported codes still throw)
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

  const options = collectSerpApiOptions(rawResponse);

  if (options.length === 0) {
    return [];
  }

  const currencyResult = resolveFlightCurrency({
    responseCurrency: rawResponse.search_parameters?.currency,
    requestCurrency: context.requestCurrency,
  });
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
