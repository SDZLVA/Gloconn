/**
 * Hotel model — an accommodation search result.
 */

import type { CurrencyCode } from "@/types/models/currency";

/**
 * A hotel or similar accommodation option for a trip.
 * Provider-independent — no booking.com or amadeus-specific fields.
 */
export type Hotel = {
  /** Unique result identifier within Glooconn. */
  id: string;

  /** Glooconn destination id this hotel belongs to. */
  destinationId: string;

  /** Total price for the stay (or quoted period) in `currency`. */
  price: number;

  /** ISO 4217 currency code for `price`. */
  currency: CurrencyCode;

  /** Guest rating from 0.0 to 5.0. */
  rating: number;

  /** Property name. */
  name: string;

  /** Official star rating (typically 1–5). */
  stars: number;

  /** Human-readable amenities (e.g. "Free Wi-Fi", "Breakfast"). */
  amenities: string[];

  /** Number of nights included in the quoted price. */
  nights: number;

  /** Neighborhood or address summary for display. */
  location: string;

  /**
   * Optional WGS84 latitude when known.
   * Used for map links — never a substitute for a street address.
   */
  latitude?: number;

  /**
   * Optional WGS84 longitude when known.
   * Used for map links — never a substitute for a street address.
   */
  longitude?: number;

  /**
   * Opaque sealed property reference for on-demand details (Sprint 17.5.1).
   * Authenticated ciphertext — not a raw provider token. Do not render in the UI.
   */
  providerPropertyRef?: string;
};
