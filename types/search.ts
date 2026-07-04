/**
 * Types for validated search payloads (URL params, saved trips, service layer).
 *
 * Form-specific types live in `types/search-form.ts`.
 */

import type { CurrencyCode } from "@/lib/budget";
import type {
  SearchProductType,
  SearchRequest,
  TravelStyle,
  TripType,
} from "@/types/models";

export type { SearchRequest, SearchProductType, TravelStyle, TripType };

export type {
  PlaceSelection,
  SearchFormActions,
  SearchFormController,
  SearchFormErrors,
  SearchFormState,
  UseSearchFormOptions,
} from "@/types/search-form";

export {
  INITIAL_PASSENGERS,
  INITIAL_SEARCH_FORM,
} from "@/types/search-form";

/** @deprecated Use Traveler from `@/types/models` — kept for existing imports. */
export type { Traveler as PassengersState } from "@/types/models";

/** @deprecated Use Traveler from `@/types/models` — kept for existing imports. */
export type { Traveler as TravelersState } from "@/types/models";

/** @deprecated Use INITIAL_PASSENGERS — kept for existing imports. */
export { INITIAL_PASSENGERS as INITIAL_TRAVELERS } from "@/types/search-form";

/**
 * Clean search payload produced after successful validation.
 * @deprecated Use SearchRequest for new provider code — flat budget fields kept for URL params.
 */
export type SearchData = {
  destination: string;
  destinationId?: string;
  origin?: string;
  originId?: string;
  tripType: TripType;
  departureDate: string;
  returnDate: string | null;
  budget: number | null;
  budgetCurrency: CurrencyCode | null;
  travelers: import("@/types/models").Traveler;
  totalGuests: number;
  travelStyle: TravelStyle;
  productTypes?: SearchProductType[];
};
