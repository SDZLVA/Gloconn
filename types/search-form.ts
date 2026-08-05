/**
 * Search form types — UI state, validation errors, and hook contract.
 *
 * Form state (`SearchFormState`) is separate from the validated payload (`SearchData`
 * in `types/search.ts`) and the provider contract (`SearchRequest` in `types/models`).
 */

import type { CurrencyCode } from "@/lib/budget";
import type {
  SearchProductType,
  Traveler,
  TravelStyle,
  TripType,
} from "@/types/models";
import { DEFAULT_SEARCH_PRODUCT_TYPES } from "@/types/models/search-request";

/** Label + canonical id returned when the user picks an autocomplete suggestion. */
export type PlaceSelection = {
  label: string;
  id: string;
};

/** Raw form values stored in React state. */
export type SearchFormState = {
  destination: string;
  /** Canonical id when the user picks a suggestion; cleared when typing freely. */
  destinationId: string;
  origin: string;
  originId: string;
  tripType: TripType;
  departureDate: string;
  returnDate: string;
  budget: string;
  budgetCurrency: CurrencyCode;
  travelers: Traveler;
  travelStyle: TravelStyle;
  productTypes: SearchProductType[];
};

/** Validation error messages keyed by field name. */
export type SearchFormErrors = Partial<
  Record<keyof Omit<SearchFormState, "travelers">, string>
> & {
  travelers?: string;
};

/** Options passed to `useSearchForm`. */
export type UseSearchFormOptions = {
  /** Prefill fields (e.g. from URL params when editing a search). */
  initialForm?: Partial<SearchFormState>;
};

/**
 * Form event handlers — business logic lives in `useSearchForm`, not in UI components.
 */
export type SearchFormActions = {
  updateField: <K extends keyof SearchFormState>(
    field: K,
    value: SearchFormState[K],
  ) => void;
  updateDestination: (label: string) => void;
  selectDestination: (selection: PlaceSelection) => void;
  updateOrigin: (label: string) => void;
  selectOrigin: (selection: PlaceSelection) => void;
  updateTravelers: (travelers: Traveler) => void;
  updateTripType: (tripType: TripType) => void;
  updateDates: (departureDate: string, returnDate: string) => void;
  updateProductTypes: (productTypes: SearchProductType[]) => void;
  /** Swaps origin and destination (labels + ids) without clearing other fields. */
  swapOriginAndDestination: () => void;
  /** Validates the form and navigates to search results on success. */
  submit: () => void;
};

/**
 * Return value of `useSearchForm` — pass this to the presentational `SearchForm`.
 */
export type SearchFormController = {
  form: SearchFormState;
  errors: SearchFormErrors;
  actions: SearchFormActions;
};

/** Default passenger counts when the search form first loads. */
export const INITIAL_PASSENGERS: Traveler = {
  adults: 2,
  children: 0,
  infants: 0,
  rooms: 1,
};

/** Default values when the search form first loads. */
export const INITIAL_SEARCH_FORM: SearchFormState = {
  destination: "",
  destinationId: "",
  origin: "",
  originId: "",
  tripType: "round-trip",
  departureDate: "",
  returnDate: "",
  budget: "",
  budgetCurrency: "EUR",
  travelers: INITIAL_PASSENGERS,
  travelStyle: "standard",
  productTypes: [...DEFAULT_SEARCH_PRODUCT_TYPES],
};
