/**
 * Pure helpers for SerpAPI Google Hotels → Glooconn Hotel mapping.
 *
 * No I/O. No provider wiring. Safe to unit-test in isolation.
 * Currency and price parsing reuse the SerpAPI flights helpers.
 */

import { createHash } from "node:crypto";
import {
  DEFAULT_SERPAPI_CURRENCY,
  mapPrice,
  resolveFlightCurrency,
  type CurrencyValidationResult,
} from "@/lib/providers/flights/serpapi/mappingHelpers";
import type { SerpApiHotelProperty } from "@/lib/providers/hotels/serpapi/types";
import type { CurrencyCode } from "@/types/models/currency";

/**
 * Default currency when the search request has no budget currency.
 * SerpAPI Hotels defaults to USD; Glooconn prefers EUR for EU-first development.
 */
export const DEFAULT_SERPAPI_HOTELS_CURRENCY: CurrencyCode =
  DEFAULT_SERPAPI_CURRENCY;

export type { CurrencyValidationResult };

export { mapPrice };

/**
 * Resolves stay total price from a property.
 * Prefers `total_rate.extracted_lowest` (Hotel.price is stay total), then
 * `extracted_price`, then nightly rate as last resort.
 */
export function mapHotelPrice(property: SerpApiHotelProperty): number | null {
  const fromTotal = mapPrice(property.total_rate?.extracted_lowest);
  if (fromTotal !== null) {
    return fromTotal;
  }

  const fromExtracted = mapPrice(property.extracted_price);
  if (fromExtracted !== null) {
    return fromExtracted;
  }

  return mapPrice(property.rate_per_night?.extracted_lowest);
}

/**
 * Maps guest rating into the Hotel 0.0–5.0 range.
 * Missing → 0. Out-of-range values are clamped.
 */
export function mapRating(overallRating: number | undefined): number {
  if (typeof overallRating !== "number" || !Number.isFinite(overallRating)) {
    return 0;
  }

  if (overallRating < 0) {
    return 0;
  }

  if (overallRating > 5) {
    return 5;
  }

  return overallRating;
}

/**
 * Maps hotel star class from `extracted_hotel_class` or `hotel_class`.
 * Missing / unparseable → 0.
 */
export function mapStars(property: SerpApiHotelProperty): number {
  if (
    typeof property.extracted_hotel_class === "number" &&
    Number.isFinite(property.extracted_hotel_class)
  ) {
    return clampStars(Math.floor(property.extracted_hotel_class));
  }

  if (typeof property.hotel_class === "number" && Number.isFinite(property.hotel_class)) {
    return clampStars(Math.floor(property.hotel_class));
  }

  if (typeof property.hotel_class === "string") {
    const match = /(\d+)/.exec(property.hotel_class);
    if (match) {
      return clampStars(Number(match[1]));
    }
  }

  return 0;
}

function clampStars(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  if (value > 5) {
    return 5;
  }
  return value;
}

/**
 * Copies amenity strings; drops empties / non-strings.
 */
export function mapAmenities(amenities: unknown): string[] {
  if (!Array.isArray(amenities)) {
    return [];
  }

  const result: string[] = [];
  for (const item of amenities) {
    if (typeof item !== "string") {
      continue;
    }
    const trimmed = item.trim();
    if (trimmed) {
      result.push(trimmed);
    }
  }
  return result;
}

/**
 * Computes nights between YYYY-MM-DD check-in and check-out (UTC calendar days).
 * Returns null when dates are invalid or checkout is not after check-in.
 */
export function computeNights(
  checkInDate: string,
  checkOutDate: string,
): number | null {
  const checkIn = parseIsoDateOnly(checkInDate);
  const checkOut = parseIsoDateOnly(checkOutDate);
  if (!checkIn || !checkOut) {
    return null;
  }

  const diffMs = checkOut.getTime() - checkIn.getTime();
  const nights = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (nights < 1) {
    return null;
  }

  return nights;
}

function parseIsoDateOnly(value: string): Date | null {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Display location for Hotel.location.
 * Prefers a non-empty nearby place name; otherwise the search destination label.
 */
export function mapLocation(
  property: SerpApiHotelProperty,
  destinationFallback: string,
): string {
  const places = property.nearby_places;
  if (Array.isArray(places)) {
    for (const place of places) {
      const name = place?.name?.trim();
      if (name) {
        return name;
      }
    }
  }

  const fallback = destinationFallback.trim();
  return fallback || "Unknown";
}

/**
 * Resolves currency with ordered fallbacks (shared with flights — Sprint 11.2).
 */
export function resolveHotelCurrency(options: {
  responseCurrency?: string;
  requestCurrency?: string;
}): CurrencyValidationResult {
  return resolveFlightCurrency(options);
}

/**
 * Builds a deterministic Hotel id from property identity fields.
 */
export function buildDeterministicHotelId(property: SerpApiHotelProperty): string {
  const seed = [
    property.property_token?.trim() ?? "",
    property.name?.trim() ?? "",
    String(property.total_rate?.extracted_lowest ?? property.extracted_price ?? ""),
    String(property.gps_coordinates?.latitude ?? ""),
    String(property.gps_coordinates?.longitude ?? ""),
  ].join("::");

  const digest = createHash("sha256").update(seed).digest("hex").slice(0, 16);
  return `serpapi-hotel-${digest}`;
}
