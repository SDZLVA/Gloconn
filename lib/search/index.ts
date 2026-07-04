/**
 * Search feature helpers — validation, payload building, and constants.
 * Import from `@/lib/search` in hooks and components.
 */

export { TRAVEL_STYLE_OPTIONS, TRIP_TYPE_OPTIONS } from "@/lib/search/constants";
export { formatTravelDatesSummary } from "@/lib/search/dates";
export { buildSearchData, logSearchData } from "@/lib/search/payload";
export {
  formatTravelersSummary,
  getTotalGuests,
  TRAVELERS_FIELD_CONFIG,
  TRAVELERS_LIMITS,
} from "@/lib/search/travelers";
export { hasSearchFormErrors, validateSearchForm } from "@/lib/search/validation";
