/**
 * Raw Amadeus Flight Offers API shapes.
 *
 * Internal to the Amadeus adapter package — never import from UI, services,
 * or shared domain models. Only fields the Glooconn mapper needs are typed;
 * the full Amadeus schema is intentionally not mirrored.
 */

/**
 * Departure or arrival endpoint on a flight segment.
 * Used to read scheduled times (`at`) for display mapping.
 */
export type AmadeusFlightEndpoint = {
  /** Scheduled date-time (ISO 8601), e.g. "2026-07-20T08:15:00". */
  at?: string;
};

/**
 * One flight segment within an itinerary (one takeoff → landing).
 * Used for airline code, schedule endpoints, and stop counting via segment list length.
 */
export type AmadeusFlightSegment = {
  /** Departure airport / time. */
  departure?: AmadeusFlightEndpoint;

  /** Arrival airport / time. */
  arrival?: AmadeusFlightEndpoint;

  /** Marketing carrier IATA code (e.g. "AF"). */
  carrierCode?: string;
};

/**
 * One origin→destination journey (outbound or return).
 * The mapper uses the first itinerary for schedule fields on `Flight`.
 */
export type AmadeusItinerary = {
  /** Total journey duration in ISO 8601 (e.g. "PT2H10M"). */
  duration?: string;

  /** Ordered flight segments for this journey. */
  segments?: AmadeusFlightSegment[];
};

/**
 * Offer-level price summary.
 * Mapped to Glooconn `Flight.price` and `Flight.currency`.
 */
export type AmadeusFlightOfferPrice = {
  /** Total price as a decimal string (e.g. "531.32"). */
  total?: string;

  /** ISO 4217 currency code as returned by Amadeus (e.g. "EUR"). */
  currency?: string;
};

/**
 * Cabin / fare detail for one segment under a traveler pricing.
 * Used only to derive Glooconn `Flight.cabin`.
 */
export type AmadeusFareDetailsBySegment = {
  /** Amadeus cabin enum string (e.g. "ECONOMY", "BUSINESS"). */
  cabin?: string;
};

/**
 * Per-traveler fare breakdown.
 * Mapper reads the first traveler’s first segment cabin as the card cabin label.
 */
export type AmadeusTravelerPricing = {
  /** Cabin/fare details keyed by segment (order follows itinerary segments). */
  fareDetailsBySegment?: AmadeusFareDetailsBySegment[];
};

/**
 * Response dictionaries used to resolve codes to display names.
 */
export type AmadeusDictionaries = {
  /** Carrier code → airline name (e.g. "AF" → "AIR FRANCE"). */
  carriers?: Record<string, string>;
};

/**
 * One flight offer from Amadeus Flight Offers Search.
 * Fields are optional at the type level so incomplete JSON can be handled by the mapper.
 */
export type AmadeusFlightOffer = {
  /** Amadeus offer id within the response. */
  id: string;

  /** Resource type when present (typically "flight-offer"). */
  type?: string;

  /** Journeys in this offer (index 0 = outbound for mapping). */
  itineraries?: AmadeusItinerary[];

  /** Total price for the offer. */
  price?: AmadeusFlightOfferPrice;

  /** Per-traveler fare details (cabin comes from here). */
  travelerPricings?: AmadeusTravelerPricing[];

  /**
   * Validating airline IATA codes when present.
   * Fallback for airline mapping if segment `carrierCode` is missing.
   */
  validatingAirlineCodes?: string[];
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

  /** Lookup tables (carriers used by the mapper). */
  dictionaries?: AmadeusDictionaries;
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
