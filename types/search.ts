/**
 * Types for the trip search form feature.
 */

import type { CurrencyCode } from "@/lib/budget";

/** Budget, Standard, or Luxury — chosen in the search card. */
export type TravelStyle = "budget" | "standard" | "luxury";

/** Round-trip or one-way — chosen in the travel dates selector. */
export type TripType = "round-trip" | "one-way";

/** Adults, children, infants, and rooms for the passengers selector. */
export type PassengersState = {
  adults: number;
  children: number;
  infants: number;
  rooms: number;
};

/** @deprecated Use PassengersState — kept for existing search form code. */
export type TravelersState = PassengersState;

/** Raw form values stored in React state. */
export type SearchFormState = {
  destination: string;
  tripType: TripType;
  departureDate: string;
  returnDate: string;
  budget: string;
  budgetCurrency: CurrencyCode;
  travelers: PassengersState;
  travelStyle: TravelStyle;
};

/** Validation error messages keyed by field name. */
export type SearchFormErrors = Partial<
  Record<keyof Omit<SearchFormState, "travelers">, string>
> & {
  travelers?: string;
};

/** Clean search payload produced after successful validation. */
export type SearchData = {
  destination: string;
  tripType: TripType;
  departureDate: string;
  returnDate: string | null;
  budget: number | null;
  budgetCurrency: CurrencyCode | null;
  travelers: PassengersState;
  totalGuests: number;
  travelStyle: TravelStyle;
};

/** Default passenger counts when the search form first loads. */
export const INITIAL_PASSENGERS: PassengersState = {
  adults: 2,
  children: 0,
  infants: 0,
  rooms: 1,
};

/** @deprecated Use INITIAL_PASSENGERS — kept for existing search form code. */
export const INITIAL_TRAVELERS: PassengersState = INITIAL_PASSENGERS;

/** Default values when the search form first loads. */
export const INITIAL_SEARCH_FORM: SearchFormState = {
  destination: "",
  tripType: "round-trip",
  departureDate: "",
  returnDate: "",
  budget: "",
  budgetCurrency: "EUR",
  travelers: INITIAL_TRAVELERS,
  travelStyle: "standard",
};
