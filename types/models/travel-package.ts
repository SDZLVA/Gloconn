/**
 * TravelPackage model — a recommended flight + hotel combination.
 *
 * Product-layer construct composed from shared Flight and Hotel models.
 * Provider-independent — no vendor bundle IDs or adapter fields.
 */

import type { CurrencyCode } from "@/types/models/currency";
import type { Flight } from "@/types/models/flight";
import type { Hotel } from "@/types/models/hotel";

/**
 * A recommended trip package pairing one flight option with one hotel stay.
 * Produced by PackageComposer from existing domain results.
 */
export type TravelPackage = {
  /** Stable package id derived from flight and hotel ids. */
  id: string;

  /** Embedded flight option for this package. */
  flight: Flight;

  /** Embedded hotel stay for this package. */
  hotel: Hotel;

  /** Flight id (mirrors `flight.id` for convenient indexing). */
  flightId: string;

  /** Hotel id (mirrors `hotel.id` for convenient indexing). */
  hotelId: string;

  /** Combined trip price: flight.price + hotel.price in `currency`. */
  totalPrice: number;

  /** ISO 4217 currency shared by flight and hotel (mismatches are skipped). */
  currency: CurrencyCode;

  /** Number of nights covered by the package stay. */
  nights: number;

  /**
   * Deterministic recommendation score (0–100, one decimal).
   * Higher is better. Produced by PackageComposer scoring.
   */
  score: number;
};
