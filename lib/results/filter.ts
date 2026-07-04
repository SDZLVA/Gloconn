import type { ResultsFilters } from "@/types/results";
import type { SearchResult } from "@/types/results";

/** Applies sidebar filters to a list of search results. */
export function filterResults(
  results: SearchResult[],
  filters: ResultsFilters,
): SearchResult[] {
  return results.filter((result) => {
    if (!filters.types.includes(result.type)) {
      return false;
    }
    if (result.price < filters.minPrice || result.price > filters.maxPrice) {
      return false;
    }
    if (result.rating < filters.minRating) {
      return false;
    }
    return true;
  });
}

/** Counts results by transport type. */
export function countResultsByType(
  results: SearchResult[],
): Record<SearchResult["type"], number> {
  return results.reduce(
    (counts, result) => {
      counts[result.type] += 1;
      return counts;
    },
    { hotel: 0, flight: 0, bus: 0, train: 0 },
  );
}
