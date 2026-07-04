import type { SortOption } from "@/types/results";
import type { SearchResult } from "@/types/results";

function getDuration(result: SearchResult): number {
  if (result.type === "hotel") {
    return result.nights * 24 * 60;
  }
  return result.durationMinutes;
}

/** Sorts search results by the selected option. */
export function sortResults(
  results: SearchResult[],
  sortBy: SortOption,
): SearchResult[] {
  const sorted = [...results];

  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating-desc":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "duration-asc":
      return sorted.sort((a, b) => getDuration(a) - getDuration(b));
    default:
      return sorted;
  }
}
