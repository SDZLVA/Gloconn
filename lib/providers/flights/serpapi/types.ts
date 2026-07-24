/**
 * Raw SerpAPI Google Flights response shapes.
 *
 * Internal to the SerpAPI adapter package — never import from UI, services,
 * or shared domain models. Only fields Glooconn will need for a future mapper
 * are typed; the full SerpAPI schema is intentionally not mirrored.
 *
 * Field names match SerpAPI JSON (snake_case) as documented at:
 * https://serpapi.com/google-flights-results
 */

/**
 * Departure or arrival airport on a flight segment.
 * Used for IATA (`id`) and schedule display (`time`).
 */
export type SerpApiAirport = {
  /** Airport display name when present. */
  name?: string;

  /** Airport IATA code (e.g. "CDG"). */
  id?: string;

  /** Local departure/arrival time string from SerpAPI (e.g. "2026-08-01 08:15"). */
  time?: string;
};

/**
 * One flight segment (one takeoff → landing) inside an itinerary option.
 * Used for airline name, cabin, schedule endpoints, and stop counting.
 */
export type SerpApiFlightSegment = {
  departure_airport?: SerpApiAirport;
  arrival_airport?: SerpApiAirport;

  /** Segment duration in minutes when present. */
  duration?: number;

  /** Marketing airline display name (e.g. "Air France"). */
  airline?: string;

  /** Cabin / travel class label (e.g. "Economy"). */
  travel_class?: string;

  /** Flight number when present (e.g. "AF 1234"). */
  flight_number?: string;

  /** True when the segment crosses midnight. */
  overnight?: boolean;
};

/**
 * Layover between segments (optional; stops can also be inferred from segment count).
 */
export type SerpApiLayover = {
  /** Layover duration in minutes. */
  duration?: number;

  /** Airport display name. */
  name?: string;

  /** Airport IATA code. */
  id?: string;
};

/**
 * One priced itinerary option from `best_flights` or `other_flights`.
 * Maps conceptually to a future Glooconn `Flight` (price, duration, airline, times).
 */
export type SerpApiFlightOption = {
  /** Ordered segments for this option (outbound-focused for v1). */
  flights?: SerpApiFlightSegment[];

  /** Layovers between segments when SerpAPI includes them. */
  layovers?: SerpApiLayover[];

  /** End-to-end duration in minutes (including layovers). */
  total_duration?: number;

  /**
   * Total ticket price in the search currency.
   * SerpAPI typically returns an integer (sub-unit precision dropped).
   */
  price?: number;

  /** Trip shape label when present (e.g. "One way", "Round trip"). */
  type?: string;

  /**
   * Opaque token for selecting a return flight on round-trips.
   * Stored for a later sprint — not used in Sprint 9.3.
   */
  departure_token?: string;
};

/**
 * Echo of request parameters useful for mapping (especially currency).
 */
export type SerpApiSearchParameters = {
  /** ISO 4217 currency used for `price` (e.g. "EUR", "USD"). */
  currency?: string;

  departure_id?: string;
  arrival_id?: string;
  outbound_date?: string;
  return_date?: string;
  engine?: string;
};

/**
 * Lightweight search metadata from SerpAPI (status only — no secrets).
 */
export type SerpApiSearchMetadata = {
  status?: string;
  id?: string;
};

/**
 * Successful (or empty) Google Flights JSON body from SerpAPI.
 * Arrays are optional so incomplete payloads can be handled safely later.
 */
export type SerpApiGoogleFlightsResponse = {
  search_metadata?: SerpApiSearchMetadata;
  search_parameters?: SerpApiSearchParameters;

  /** Primary recommended itineraries. */
  best_flights?: SerpApiFlightOption[];

  /** Additional itineraries when present. */
  other_flights?: SerpApiFlightOption[];

  /** Present when SerpAPI reports a search-level error message. */
  error?: string;
};
