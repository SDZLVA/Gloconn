/**
 * Train model — a rail travel search result.
 */

import type { CurrencyCode } from "@/types/models/currency";

/**
 * A train journey option for a trip.
 * Provider-independent — no rail API-specific fields.
 */
export type Train = {
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

  /** Rail operator or brand name. */
  operator: string;

  /** Scheduled departure time (ISO 8601 or localized display string). */
  departureTime: string;

  /** Scheduled arrival time (ISO 8601 or localized display string). */
  arrivalTime: string;

  /** Total journey duration in minutes. */
  durationMinutes: number;

  /** Service class label (e.g. "Standard", "First Class"). */
  trainClass: string;
};
