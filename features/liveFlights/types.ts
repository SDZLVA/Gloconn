import type { ComponentType } from "react";

/** The traveller's search, in the form any live engine needs. */
export type LiveFlightsSearch = {
  /** City or airport IATA codes, e.g. "MIL", "PAR". */
  originCode: string;
  destinationCode: string;
  /** ISO dates. returnDate is null for one-way. */
  departureDate: string;
  returnDate: string | null;
  adults: number;
  children: number;
  infants: number;
  /** ISO 4217, e.g. "EUR". */
  currency: string;
};

export type LiveFlightsPanelProps = {
  search: LiveFlightsSearch;
  filters: LiveFlightsFilters;
  onFacets?: (facets: LiveFlightsFacets) => void;
};

export type LiveFlightsEngine = {
  /** Value of NEXT_PUBLIC_LIVE_FLIGHTS_ENGINE that selects this engine. */
  id: string;
  /** Partner name shown to travellers. */
  partnerName: string;
  /** Renders the live results for a search, filtered by Glooconn's sidebar. */
  Panel: ComponentType<LiveFlightsPanelProps>;
};

/**
 * Milestone 24: Glooconn's sidebar filters, as far as a live engine can
 * apply them. One filter for both lists.
 */
export type LiveFlightsFilters = {
  /** Show the live list at all (sidebar "Result type → Flights"). */
  showFlights: boolean;
  /** Maximum stops; null = any. */
  maxStops: number | null;
  /** Airline names to include; empty = any. */
  airlines: string[];
  /** Only fares with checked baggage. */
  baggageIncluded: boolean;
};

/** What the live engine can offer to Glooconn's sidebar. */
export type LiveFlightsFacets = {
  /** Airline names present in the live results. */
  airlines: string[];
  /** True once the engine has taken over filtering (its own UI is hidden). */
  bridged: boolean;
};

export const NO_LIVE_FILTERS: LiveFlightsFilters = {
  showFlights: true,
  maxStops: null,
  airlines: [],
  baggageIncluded: false,
};
