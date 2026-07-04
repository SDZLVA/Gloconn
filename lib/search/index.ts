/**
 * Search feature helpers — validation, payload building, and constants.
 * Import from `@/lib/search` in hooks and components.
 */

export { TRAVEL_STYLE_OPTIONS } from "@/lib/search/constants";
export { buildSearchData, logSearchData } from "@/lib/search/payload";
export { hasSearchFormErrors, validateSearchForm } from "@/lib/search/validation";
