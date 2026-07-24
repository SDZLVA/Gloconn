import { rankByValue, rankResults } from "@/lib/results/rank";
import type { SortOption } from "@/types/results";
import type { SearchResult } from "@/types/results";

function getDuration(result: SearchResult): number {
  if (result.type === "hotel") {
    return result.nights * 24 * 60;
  }
  return result.durationMinutes;
}

/** Stable secondary keys when primary sort values tie. */
function compareTieBreak(a: SearchResult, b: SearchResult): number {
  if (a.price !== b.price) {
    return a.price - b.price;
  }
  return a.id.localeCompare(b.id);
}

export type SortResultsOptions = {
  /** Optional trip budget amount for recommended ranking. */
  budgetAmount?: number | null;
};

/** Sorts search results by the selected option (pure, provider-agnostic). */
export function sortResults(
  results: SearchResult[],
  sortBy: SortOption,
  options: SortResultsOptions = {},
): SearchResult[] {
  switch (sortBy) {
    case "recommended":
      return rankResults(results, options.budgetAmount);

    case "value-desc":
      return rankByValue(results);

    case "price-asc": {
      const sorted = [...results];
      sorted.sort((a, b) => {
        if (a.price !== b.price) {
          return a.price - b.price;
        }
        return compareTieBreak(a, b);
      });
      return sorted;
    }

    case "rating-desc": {
      const sorted = [...results];
      sorted.sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return compareTieBreak(a, b);
      });
      return sorted;
    }

    case "duration-asc": {
      const sorted = [...results];
      sorted.sort((a, b) => {
        const durationDiff = getDuration(a) - getDuration(b);
        if (durationDiff !== 0) {
          return durationDiff;
        }
        return compareTieBreak(a, b);
      });
      return sorted;
    }

    default:
      return [...results];
  }
}
