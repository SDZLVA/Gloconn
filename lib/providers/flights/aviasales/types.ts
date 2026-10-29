/**
 * Raw Aviasales Data API shapes (Milestone 19).
 *
 * Source: Travelpayouts Help Center, "Aviasales Data API" (article
 * 203956163), endpoint /aviasales/v3/prices_for_dates. Every field is
 * optional here because the response is external input and is validated
 * field by field in mappers.ts.
 *
 * Prices come from a cache of searches other travellers made (kept 2–7
 * days), not a live search.
 */

export type AviasalesTicket = {
  origin?: string;
  destination?: string;
  origin_airport?: string;
  destination_airport?: string;
  /**
   * "price of the ticket". The documentation does NOT say whether this is
   * the round-trip total or whether it is per passenger — see provider.ts.
   */
  price?: number;
  /** IATA code of the airline, e.g. "U2". */
  airline?: string;
  flight_number?: string | number;
  /** Local departure date-time with offset, e.g. "2023-07-28T07:00:00+02:00". */
  departure_at?: string;
  return_at?: string;
  /** Stops on the way to the destination. */
  transfers?: number;
  /** Stops on the way back. */
  return_transfers?: number;
  /** "total round trip duration in minutes". */
  duration?: number;
  /** Outbound flight duration in minutes. */
  duration_to?: number;
  /** Return flight duration in minutes. */
  duration_back?: number;
  /** Path to append to https://www.aviasales.com/ for this fare. */
  link?: string;
};

export type AviasalesPricesForDatesResponse = {
  success?: boolean;
  data?: AviasalesTicket[];
  currency?: string;
  error?: string | null;
};
