/**
 * Sprint 14.3 — pure helpers for results list hierarchy (no React).
 */

import type { SearchResult } from "@/types/results";

export type GroupedBrowseResults = {
  flights: SearchResult[];
  hotels: SearchResult[];
};

/**
 * Splits MVP results into Browse Flights / Browse Hotels groups.
 * Preserves relative order within each type (caller supplies sorted list).
 */
export function groupBrowseResults(
  results: SearchResult[],
): GroupedBrowseResults {
  const flights: SearchResult[] = [];
  const hotels: SearchResult[] = [];

  for (const result of results) {
    if (result.type === "flight") {
      flights.push(result);
    } else if (result.type === "hotel") {
      hotels.push(result);
    }
  }

  return { flights, hotels };
}
