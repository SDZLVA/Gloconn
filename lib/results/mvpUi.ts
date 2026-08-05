/**
 * Sprint 14.2 — MVP UI visibility helpers.
 *
 * Hide transport (bus/train) from the results UI without deleting providers,
 * models, or card components.
 */

import type { ResultType, SearchResult } from "@/types/results";
import type { SearchProductType } from "@/types/models/search-request";

/** Result types shown in the MVP results list and filter sidebar. */
export const MVP_RESULT_TYPES: ResultType[] = ["hotel", "flight"];

/** Product toggles shown on the MVP search form. */
export const MVP_SEARCH_PRODUCT_TYPES: SearchProductType[] = [
  "hotels",
  "flights",
];

/** True when the result type is part of the focused MVP surface. */
export function isMvpResultType(type: ResultType): boolean {
  return type === "hotel" || type === "flight";
}

/** Drops bus/train results from a list (architecture/providers unchanged). */
export function filterMvpVisibleResults(
  results: SearchResult[],
): SearchResult[] {
  return results.filter((result) => isMvpResultType(result.type));
}
