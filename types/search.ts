/**
 * Types for the trip search form feature.
 */

import type { CurrencyCode } from "@/lib/budget";
import type {
  SearchRequest,
  Traveler,
  TravelStyle,
  TripType,
} from "@/types/models";

export type { SearchRequest, Traveler, TravelStyle, TripType };

/** @deprecated Use Traveler — kept for existing search form code. */
export type PassengersState = Traveler;

/** @deprecated Use Traveler — kept for existing search form code. */
export type TravelersState = Traveler;

/** Raw form values stored in React state. */
export type SearchFormState = {
  destination: string;
  tripType: TripType;
  departureDate: string;
  returnDate: string;
  budget: string;
  budgetCurrency: CurrencyCode;
  travelers: Traveler;
  travelStyle: TravelStyle;
};

/** Validation error messages keyed by field name. */
export type SearchFormErrors = Partial<
  Record<keyof Omit<SearchFormState, "travelers">, string>
> & {
  travelers?: string;
};

/**
 * Clean search payload produced after successful validation.
 * @deprecated Use SearchRequest for new code — flat budget fields kept for URL params and saved trips.
 */
export type SearchData = {
  destination: string;
  tripType: TripType;
  departureDate: string;
  returnDate: string | null;
  budget: number | null;
  budgetCurrency: CurrencyCode | null;
  travelers: Traveler;
  totalGuests: number;
  travelStyle: TravelStyle;
};

/** Default passenger counts when the search form first loads. */
export const INITIAL_PASSENGERS: Traveler = {
  adults: 2,
  children: 0,
  infants: 0,
  rooms: 1,
};

/** @deprecated Use INITIAL_PASSENGERS — kept for existing search form code. */
export const INITIAL_TRAVELERS: Traveler = INITIAL_PASSENGERS;

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
