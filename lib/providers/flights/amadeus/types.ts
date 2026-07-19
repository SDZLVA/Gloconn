/**
 * Raw Amadeus Flight Offers API shapes.
 *
 * Internal to the Amadeus adapter package — never import from UI, services,
 * or shared domain models. Mapping to Glooconn `Flight` happens in a later sprint.
 */

/**
 * One flight offer from Amadeus Flight Offers Search.
 * Only fields needed to identify an offer; full offer details stay untyped until mapping.
 */
export type AmadeusFlightOffer = {
  /** Amadeus offer id within the response. */
  id: string;

  /** Resource type when present (typically "flight-offer"). */
  type?: string;
};

/**
 * Successful Flight Offers Search JSON body (GET /v2/shopping/flight-offers).
 */
export type AmadeusFlightOffersResponse = {
  /** Flight offers returned by Amadeus (may be empty). */
  data?: AmadeusFlightOffer[];

  /** Response metadata when present. */
  meta?: {
    count?: number;
  };

  /**
   * Lookup tables (carriers, aircraft, etc.).
   * Kept opaque until the mapper sprint needs specific keys.
   */
  dictionaries?: Record<string, unknown>;
};

/**
 * One error object from an Amadeus error payload.
 */
export type AmadeusApiError = {
  status?: number;
  code?: number | string;
  title?: string;
  detail?: string;
};

/**
 * Error JSON body returned by Amadeus when a request fails.
 */
export type AmadeusApiErrorResponse = {
  errors?: AmadeusApiError[];
};
