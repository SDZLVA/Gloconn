/**
 * Shared TypeScript types for Glooconn.
 * Import from `@/types` — domain-specific types live in separate files.
 */

export type {
  PassengersState,
  SearchData,
  SearchFormErrors,
  SearchFormState,
  TravelersState,
  TravelStyle,
} from "@/types/search";

export {
  INITIAL_PASSENGERS,
  INITIAL_SEARCH_FORM,
  INITIAL_TRAVELERS,
} from "@/types/search";

export type {
  BusResult,
  FlightResult,
  HotelResult,
  ResultType,
  ResultsFilters,
  SearchResult,
  SortOption,
  TrainResult,
} from "@/types/results";

export {
  DEFAULT_RESULTS_FILTERS,
  RESULT_TYPE_LABELS,
  SORT_OPTIONS,
} from "@/types/results";

export type { AuthFormState, AuthUser } from "@/types/auth";

export type { SavedTrip, SavedTripRow } from "@/types/trips";

export type { Destination } from "@/types/destination";
