/**
 * Types for the trip search form feature.
 */

/** Budget, Standard, or Luxury — chosen in the search card. */
export type TravelStyle = "budget" | "standard" | "luxury";

/** Round-trip or one-way — chosen in the travel dates selector. */
export type TripType = "round-trip" | "one-way";

/** Adults, children, infants, and rooms for the travelers selector. */
export type TravelersState = {
  adults: number;
  children: number;
  infants: number;
  rooms: number;
};

/** Raw form values stored in React state. */
export type SearchFormState = {
  destination: string;
  tripType: TripType;
  departureDate: string;
  returnDate: string;
  budget: string;
  travelers: TravelersState;
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
  travelers: TravelersState;
  totalGuests: number;
  travelStyle: TravelStyle;
};

/** Default traveler counts when the search form first loads. */
export const INITIAL_TRAVELERS: TravelersState = {
  adults: 2,
  children: 0,
  infants: 0,
  rooms: 1,
};

/** Default values when the search form first loads. */
export const INITIAL_SEARCH_FORM: SearchFormState = {
  destination: "",
  tripType: "round-trip",
  departureDate: "",
  returnDate: "",
  budget: "",
  travelers: INITIAL_TRAVELERS,
  travelStyle: "standard",
};
