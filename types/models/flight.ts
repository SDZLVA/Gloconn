/**
 * Flight model — an air travel search result.
 */

import type { CurrencyCode } from "@/types/models/currency";

/**
 * A flight option for a trip.
 * Provider-independent — no airline API-specific fields.
 */
export type Flight = {
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

  /** Marketing airline name. */
  airline: string;

  /** Scheduled departure time (ISO 8601 or localized display string). */
  departureTime: string;

  /** Scheduled arrival time (ISO 8601 or localized display string). */
  arrivalTime: string;

  /** Total journey duration in minutes. */
  durationMinutes: number;

  /** Number of stops (0 = non-stop). */
  stops: number;

  /** Cabin class label (e.g. "Economy", "Business"). */
  cabin: string;
};
