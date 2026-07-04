/**
 * Bus model — a coach travel search result.
 */

import type { CurrencyCode } from "@/types/models/currency";

/**
 * A bus or coach journey option for a trip.
 * Provider-independent — no Omio or Flixbus-specific fields.
 */
export type Bus = {
  /** Unique result identifier within Glooconn. */
  id: string;

  /** Glooconn destination id for the arrival city. */
  destinationId: string;

  /** Total ticket price in `currency`. */
  price: number;

  /** ISO 4217 currency code for `price`. */
  currency: CurrencyCode;

  /** Guest or aggregate rating from 0.0 to 5.0. */
  rating: number;

  /** Bus operator or brand name. */
  operator: string;

  /** Scheduled departure time (ISO 8601 or localized display string). */
  departureTime: string;

  /** Scheduled arrival time (ISO 8601 or localized display string). */
  arrivalTime: string;

  /** Total journey duration in minutes. */
  durationMinutes: number;

  /** On-board amenities (e.g. "Wi-Fi", "USB charging"). */
  amenities: string[];
};
