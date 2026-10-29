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

  /**
   * True when `price` comes from recent searches by other travellers
   * (Aviasales Data API cache, 2–7 days old) rather than a live search.
   * Verified 2026-10-29: such prices drifted 10–20% from live fares, so the
   * UI must say the price may have changed. Omitted for live sources.
   */
  priceIsRecent?: boolean;

  /**
   * Actual airports for this flight (e.g. "BGY", "BVA"). A whole-city
   * search returns flights from different airports, so the search-level
   * route ("MIL → PAR") would misdescribe them. Omitted when unknown.
   */
  originAirport?: string;
  destinationAirport?: string;

  /** Return leg, when the source provides it (display format as departureTime). */
  returnDepartureTime?: string;
  returnStops?: number;
  returnDurationMinutes?: number;

  /**
   * Milestone 20: two-letter IATA code of the airline (e.g. "U2"), used to
   * narrow a partner search to this airline. Omitted when unknown.
   */
  airlineCode?: string;

  /**
   * Milestone 20: aviasales.com page for this exact ticket (plain brand
   * URL, no tracking — the click goes through /api/out/aviasales, which
   * adds attribution). Omitted when the source gave no usable ticket link.
   */
  bookingUrl?: string;

  /**
   * True when this result is sample (mock) data, not a real offer. The UI
   * labels it so a sample price is never mistaken for a real one — most
   * importantly inside packages that mix live and sample data.
   */
  isSample?: boolean;
};
