/**
 * Shared TypeScript types for Glooconn.
 */

/** Budget, Standard, or Luxury — chosen in the search card. */
export type TravelStyle = "budget" | "standard" | "luxury";

/** Raw form values stored in React state (all strings except travelStyle). */
export type SearchFormState = {
  destination: string;
  departureDate: string;
  returnDate: string;
  budget: string;
  travelers: string;
  travelStyle: TravelStyle;
};

/** Validation error messages keyed by field name. */
export type SearchFormErrors = Partial<Record<keyof SearchFormState, string>>;

/** Clean search payload logged to the console after a successful validation. */
export type SearchData = {
  destination: string;
  departureDate: string;
  returnDate: string;
  budget: number | null;
  travelers: number;
  travelStyle: TravelStyle;
};

/** Default values when the search form first loads. */
export const INITIAL_SEARCH_FORM: SearchFormState = {
  destination: "",
  departureDate: "",
  returnDate: "",
  budget: "",
  travelers: "1",
  travelStyle: "standard",
};
