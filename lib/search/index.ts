/**
 * Search feature helpers — validation, payload building, and constants.
 * Import from `@/lib/search` in hooks and components.
 */

export {
  SEARCH_PRODUCT_TYPE_OPTIONS,
  TRAVEL_STYLE_OPTIONS,
  TRIP_TYPE_OPTIONS,
} from "@/lib/search/constants";
export { formatTravelDatesSummary, getPastTravelDateErrors, sanitizeTravelDates } from "@/lib/search/dates";
export { buildSearchData, logSearchData } from "@/lib/search/payload";
export {
  buildHomeSearchUrl,
  buildHomeSearchUrlFromRequest,
  buildResultsUrl,
  formToSearchParams,
  parseSearchParams,
  parseSearchParamsToForm,
  searchDataToParams,
} from "@/lib/search/params";
export {
  buildResultsUrlFromRequest,
  buildSearchRequest,
  buildSearchRequestFromData,
  parseSearchRequestFromParams,
  partialSearchRequestToSearchData,
  searchRequestToParams,
  searchRequestToSearchData,
  serializeSearchRequest,
  validateAndBuildSearchRequest,
  isSearchRequestInput,
  normalizeSearchInput,
  type BuildSearchRequestResult,
} from "@/lib/search/request";
export {
  normalizeProductTypes,
  parseProductTypesParam,
  resolveProductTypes,
  serializeProductTypesParam,
} from "@/lib/search/productTypes";
export {
  applyPassengerFieldUpdate,
  formatPassengersSummary,
  getInfantMax,
  getTotalPassengers,
  PASSENGERS_FIELD_CONFIG,
  PASSENGERS_LIMITS,
  validatePassengers,
  type PassengerField,
} from "@/lib/search/passengers";
export {
  formatTravelersSummary,
  getTotalGuests,
  TRAVELERS_FIELD_CONFIG,
  TRAVELERS_LIMITS,
} from "@/lib/search/travelers";
export { validateBudget } from "@/lib/search/budget";
export {
  swapOriginDestinationFields,
  type SwappablePlaces,
} from "@/lib/search/swapPlaces";
export {
  countSearchFormErrors,
  hasSearchFormErrors,
  validateSearchForm,
} from "@/lib/search/validation";
