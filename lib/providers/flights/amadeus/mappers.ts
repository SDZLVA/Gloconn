/**
 * Maps a single Amadeus flight offer to a Glooconn `Flight`.
 *
 * Pure orchestration over `mappingHelpers` — no HTTP or provider side effects.
 */

import { createProviderError } from "@/lib/api/errors";
import type {
  AmadeusDictionaries,
  AmadeusFlightOffer,
  AmadeusFlightOffersResponse,
} from "@/lib/providers/flights/amadeus/types";
import {
  calculateStops,
  formatTime,
  mapAirline,
  mapCabin,
  parseDuration,
  parsePrice,
  validateCurrency,
} from "@/lib/providers/flights/amadeus/mappingHelpers";
import type { Flight } from "@/types/models";

/** Context the offer JSON cannot supply (Glooconn destination id, dictionaries). */
export type MapAmadeusOfferOptions = {
  /** Glooconn destination id for the arrival city. */
  destinationId: string;

  /** Optional Amadeus dictionaries (carrier name lookup). */
  dictionaries?: AmadeusDictionaries;
};

/** Options for mapping a full Flight Offers Search response. */
export type MapAmadeusFlightOffersResponseOptions = {
  /** Glooconn destination id applied to every mapped flight. */
  destinationId: string;
};

/**
 * Maps one Amadeus offer to a Glooconn `Flight`.
 *
 * Returns `null` when required schedule/identity/price fields are missing.
 * Throws a controlled provider error when currency cannot be represented
 * by the `Flight` model (does not silently drop a priced offer).
 */
export function mapAmadeusOfferToFlight(
  offer: AmadeusFlightOffer,
  options: MapAmadeusOfferOptions,
): Flight | null {
  const id = offer.id?.trim();
  if (!id) {
    return null;
  }

  const destinationId = options.destinationId?.trim();
  if (!destinationId) {
    return null;
  }

  const outbound = offer.itineraries?.[0];
  const segments = outbound?.segments;
  if (!Array.isArray(segments) || segments.length === 0) {
    return null;
  }

  const departureTime = formatTime(segments[0]?.departure?.at);
  const arrivalTime = formatTime(segments[segments.length - 1]?.arrival?.at);
  if (!departureTime || !arrivalTime) {
    return null;
  }

  const price = parsePrice(offer.price?.total);
  if (price === null) {
    return null;
  }

  const currencyResult = validateCurrency(offer.price?.currency);
  if (!currencyResult.ok) {
    const received = currencyResult.received?.trim() || "(missing)";
    throw createProviderError(
      `Flight offer currency "${received}" is not supported by Glooconn.`,
      { cause: { offerId: id, currency: currencyResult.received } },
    );
  }

  const durationMinutes = parseDuration(outbound?.duration) ?? 0;
  const cabinRaw =
    offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin;

  return {
    id: `amadeus-${id}`,
    destinationId,
    price,
    currency: currencyResult.currency,
    rating: 0,
    airline: mapAirline({
      carrierCode: segments[0]?.carrierCode,
      validatingAirlineCodes: offer.validatingAirlineCodes,
      dictionaries: options.dictionaries,
    }),
    departureTime,
    arrivalTime,
    durationMinutes,
    stops: calculateStops(segments),
    cabin: mapCabin(cabinRaw),
  };
}

/**
 * Maps a full Amadeus Flight Offers response to Glooconn `Flight[]`.
 *
 * - Missing / empty `data` → `[]`
 * - Per-offer `null` results are dropped
 * - ProviderErrors from `mapAmadeusOfferToFlight` (e.g. unsupported currency) propagate
 */
export function mapAmadeusFlightOffersResponse(
  response: AmadeusFlightOffersResponse,
  options: MapAmadeusFlightOffersResponseOptions,
): Flight[] {
  const offers = response.data;
  if (!Array.isArray(offers) || offers.length === 0) {
    return [];
  }

  const offerOptions: MapAmadeusOfferOptions = {
    destinationId: options.destinationId,
    dictionaries: response.dictionaries,
  };

  const flights: Flight[] = [];

  for (const offer of offers) {
    const flight = mapAmadeusOfferToFlight(offer, offerOptions);
    if (flight !== null) {
      flights.push(flight);
    }
  }

  return flights;
}
