/**
 * Search results helpers — backward-compatible re-exports.
 * New code should call `@/lib/services/searchService` instead.
 */

import {
  ALL_MOCK_RESULTS,
  searchMockResults,
} from "@/lib/providers/search/mock/search";

/** @deprecated Use `searchTrips` from `@/lib/services` for new code. */
export function getResultsForSearch(
  destination: string,
  travelStyle: Parameters<typeof searchMockResults>[1] = "standard",
) {
  return searchMockResults(destination, travelStyle);
}

/** Returns the full mock results pool (used for price range defaults). */
export function getAllMockResults() {
  return ALL_MOCK_RESULTS;
}

export { resolveDestinationIdFromLabel as resolveDestinationId } from "@/lib/providers/destinations/mock/helpers";
