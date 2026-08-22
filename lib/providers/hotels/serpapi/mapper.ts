/**
 * Maps SerpAPI Google Hotels JSON to Glooconn `Hotel[]`.
 *
 * Maps `properties[]` only (ignores sponsored `ads[]`).
 * Sprint 17.5.1: seals property tokens into `providerPropertyRef` — no
 * in-process registry on the production path.
 */

import { createProviderError } from "@/lib/api/errors";
import { getAppConfig } from "@/lib/config";
import { sealHotelPropertyRef } from "@/lib/hotels/sealedPropertyRef";
import {
  buildDeterministicHotelId,
  computeNights,
  mapAmenities,
  mapGpsCoordinates,
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
   * Typically `SearchRequest.destination` — also used as SerpAPI `q` for details.
   */
  locationFallback: string;

  /**
   * Check-in / check-out used for `Hotel.nights`.
   * Prefer response echo; caller should pass request dates as fallback.
   */
  checkInDate: string;
  checkOutDate: string;

  /** Adults count for property-details priced offers (optional). */
  adults?: number;

  /**
   * Optional seal secret override (tests).
   * Production uses `getAppConfig().propertyRefSeal.secret`.
   */
  propertyRefSealSecret?: string;
};

export type MapSerpApiPropertyOptions = {
  destinationId: string;
  currency: CurrencyCode;
  locationFallback: string;
  nights: number;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  propertyRefSealSecret?: string;
};

/**
 * Maps one SerpAPI property to a Glooconn `Hotel`.
 * Returns `null` when required identity/price/nights fields are missing.
 */
export function mapSerpApiPropertyToHotel(
  property: SerpApiHotelProperty,
  options: MapSerpApiPropertyOptions,
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

  const gps = mapGpsCoordinates(property.gps_coordinates);
  const hotelId = buildDeterministicHotelId(property);

  const token = property.property_token?.trim();
  const query = options.locationFallback.trim();
  let providerPropertyRef: string | undefined;
  if (token && query) {
    // Sealing is optional for search (Sprint 17.5.2). Missing secret → omit ref,
    // still return the Hotel. Details require a sealed ref later.
    // Explicit `propertyRefSealSecret: ""` skips sealing (tests / forced omit).
    const secret =
      options.propertyRefSealSecret !== undefined
        ? options.propertyRefSealSecret.trim()
        : getAppConfig().propertyRefSeal.secret.trim();
    if (secret) {
      providerPropertyRef = sealHotelPropertyRef(
        {
          hotelId,
          propertyToken: token,
          query,
          checkInDate: options.checkInDate,
          checkOutDate: options.checkOutDate,
          currency: options.currency,
          adults: options.adults,
        },
        secret,
      );
    }
  }

  return {
    id: hotelId,
    destinationId,
    price,
    currency: options.currency,
    rating: mapRating(property.overall_rating),
    name,
    stars: mapStars(property),
    amenities: mapAmenities(property.amenities),
    nights: options.nights,
    location: mapLocation(property, options.locationFallback),
    ...(gps
      ? { latitude: gps.latitude, longitude: gps.longitude }
      : {}),
    ...(providerPropertyRef ? { providerPropertyRef } : {}),
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
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults: context.adults,
      propertyRefSealSecret: context.propertyRefSealSecret,
    });
    if (hotel !== null) {
      hotels.push(hotel);
    }
  }

  return hotels;
}
