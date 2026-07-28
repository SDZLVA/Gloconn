/**
 * Maps SerpAPI Google Hotels JSON to Glooconn `Hotel[]`.
 *
 * Pure orchestration over `mappingHelpers` — no HTTP or provider side effects.
 * Maps `properties[]` only (ignores sponsored `ads[]`).
 */

import { createProviderError } from "@/lib/api/errors";
import {
  buildDeterministicHotelId,
  computeNights,
  mapAmenities,
  mapHotelPrice,
  mapLocation,
  mapRating,
  mapStars,
  resolveHotelCurrency,
} from "@/lib/providers/hotels/serpapi/mappingHelpers";
import type {
  SerpApiGoogleHotelsResponse,
  SerpApiHotelProperty,
} from "@/lib/providers/hotels/serpapi/types";
import type { CurrencyCode } from "@/types/models/currency";
import type { Hotel } from "@/types/models";

/** Context the SerpAPI JSON cannot supply alone. */
export type MapSerpApiHotelsContext = {
  /** Glooconn destination id for the stay city. */
  destinationId: string;

  /**
   * Optional currency from the original SearchRequest budget.
   * Used when the response omits `search_parameters.currency`.
   */
  requestCurrency?: string;

  /**
   * Fallback for Hotel.location when the property has no nearby place name.
   * Typically `SearchRequest.destination`.
   */
  locationFallback: string;

  /**
   * Check-in / check-out used for `Hotel.nights`.
   * Prefer response echo; caller should pass request dates as fallback.
   */
  checkInDate: string;
  checkOutDate: string;
};

/**
 * Maps one SerpAPI property to a Glooconn `Hotel`.
 * Returns `null` when required identity/price/nights fields are missing.
 */
export function mapSerpApiPropertyToHotel(
  property: SerpApiHotelProperty,
  options: {
    destinationId: string;
    currency: CurrencyCode;
    locationFallback: string;
    nights: number;
  },
): Hotel | null {
  const destinationId = options.destinationId?.trim();
  if (!destinationId) {
    return null;
  }

  const name = property.name?.trim();
  if (!name) {
    return null;
  }

  const price = mapHotelPrice(property);
  if (price === null) {
    return null;
  }

  if (!Number.isFinite(options.nights) || options.nights < 1) {
    return null;
  }

  return {
    id: buildDeterministicHotelId(property),
    destinationId,
    price,
    currency: options.currency,
    rating: mapRating(property.overall_rating),
    name,
    stars: mapStars(property),
    amenities: mapAmenities(property.amenities),
    nights: options.nights,
    location: mapLocation(property, options.locationFallback),
  };
}

/**
 * Maps a full SerpAPI Google Hotels response to Glooconn `Hotel[]`.
 *
 * - Uses `properties` only (not `ads`)
 * - Missing / empty arrays → `[]`
 * - Per-property `null` results are dropped
 * - Currency uses response → request → EUR fallbacks
 */
export function mapSerpApiHotelsResponse(
  rawResponse: SerpApiGoogleHotelsResponse,
  context: MapSerpApiHotelsContext,
): Hotel[] {
  if (typeof rawResponse !== "object" || rawResponse === null) {
    throw createProviderError(
      "Hotel search returned an invalid response. Please try again.",
    );
  }

  const properties = Array.isArray(rawResponse.properties)
    ? rawResponse.properties
    : [];

  if (properties.length === 0) {
    return [];
  }

  const currencyResult = resolveHotelCurrency({
    responseCurrency: rawResponse.search_parameters?.currency,
    requestCurrency: context.requestCurrency,
  });
  if (!currencyResult.ok) {
    const received = currencyResult.received?.trim() || "(missing)";
    throw createProviderError(
      `Hotel offer currency "${received}" is not supported by Glooconn.`,
      { cause: { currency: currencyResult.received } },
    );
  }

  const checkIn =
    rawResponse.search_parameters?.check_in_date?.trim() ||
    context.checkInDate.trim();
  const checkOut =
    rawResponse.search_parameters?.check_out_date?.trim() ||
    context.checkOutDate.trim();

  const nights = computeNights(checkIn, checkOut);
  if (nights === null) {
    throw createProviderError(
      "Hotel search could not compute stay nights from check-in and check-out dates.",
    );
  }

  const hotels: Hotel[] = [];

  for (const property of properties) {
    const hotel = mapSerpApiPropertyToHotel(property, {
      destinationId: context.destinationId,
      currency: currencyResult.currency,
      locationFallback: context.locationFallback,
      nights,
    });
    if (hotel !== null) {
      hotels.push(hotel);
    }
  }

  return hotels;
}
