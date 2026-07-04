/**
 * SearchRequest model — validated input for a trip search.
 */

import type { Budget } from "@/types/models/budget";
import type { Traveler } from "@/types/models/traveler";

/** Budget, Standard, or Luxury — influences result pricing and ranking. */
export type TravelStyle = "budget" | "standard" | "luxury";

/** Round-trip includes a return date; one-way does not. */
export type TripType = "round-trip" | "one-way";

/** Which travel domains the orchestrator should query. */
export type SearchProductType = "hotels" | "flights" | "transport";

/** Default — search stays, flights, and ground transport together. */
export const DEFAULT_SEARCH_PRODUCT_TYPES: SearchProductType[] = [
  "hotels",
  "flights",
  "transport",
];

/**
 * Complete, validated criteria for searching hotels, flights, and ground transport.
 * This is the public contract between the UI and the service layer.
 */
export type SearchRequest = {
  /** Destination label as entered or selected (e.g. "Paris, France"). */
  destination: string;

  /**
   * Resolved Glooconn destination id when available.
   * Optional on client; services may populate before calling providers.
   */
  destinationId?: string;

  /** Whether the trip includes a return journey. */
  tripType: TripType;

  /** Departure date in ISO 8601 calendar format (YYYY-MM-DD). */
  departureDate: string;

  /**
   * Return date in ISO 8601 calendar format (YYYY-MM-DD).
   * Null when `tripType` is "one-way".
   */
  returnDate: string | null;

  /** Spending limit; null only for internal catalog searches. */
  budget: Budget | null;

  /** Guest and room counts. */
  travelers: Traveler;

  /** Sum of adults, children, and infants — derived for display and provider queries. */
  totalGuests: number;

  /** Price tier preference for result ranking and filtering. */
  travelStyle: TravelStyle;

  /**
   * Origin city label (e.g. "Milan, Italy") for flight and transport searches.
   */
  origin: string;

  /**
   * Resolved Glooconn destination id for the origin city when available.
   */
  originId?: string;

  /**
   * Which result domains to query. Defaults to all three when omitted.
   */
  productTypes?: SearchProductType[];
};
