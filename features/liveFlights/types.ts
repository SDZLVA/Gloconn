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

export type LiveFlightsEngine = {
  /** Value of NEXT_PUBLIC_LIVE_FLIGHTS_ENGINE that selects this engine. */
  id: string;
  /** Partner name shown to travellers. */
  partnerName: string;
  /** Renders the live results for a search. */
  Panel: ComponentType<{ search: LiveFlightsSearch }>;
};
