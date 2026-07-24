import type {
  ResultsFilterFacets,
  ResultsFilters,
  SearchResult,
} from "@/types/results";

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );
}

/** Collects facet options from the current result set for filter controls. */
export function collectFilterFacets(
  results: SearchResult[],
): ResultsFilterFacets {
  const airlines: string[] = [];
  const cabins: string[] = [];
  const operators: string[] = [];
  const amenities: string[] = [];
  let maxStopsInResults = 0;

  for (const result of results) {
    if (result.type === "flight") {
      airlines.push(result.airline);
      cabins.push(result.cabin);
      maxStopsInResults = Math.max(maxStopsInResults, result.stops);
    }

    if (result.type === "bus" || result.type === "train") {
      operators.push(result.operator);
    }

    if (result.type === "hotel" || result.type === "bus") {
      amenities.push(...result.amenities);
    }
  }

  return {
    airlines: uniqueSorted(airlines),
    cabins: uniqueSorted(cabins),
    operators: uniqueSorted(operators),
    amenities: uniqueSorted(amenities),
    maxStopsInResults,
  };
}

function hasAllAmenities(
  resultAmenities: string[],
  required: string[],
): boolean {
  if (required.length === 0) {
    return true;
  }

  const available = new Set(resultAmenities);
  return required.every((amenity) => available.has(amenity));
}

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

    // Flight-only: max stops
    if (
      result.type === "flight" &&
      filters.maxStops != null &&
      result.stops > filters.maxStops
    ) {
      return false;
    }

    // Flight-only: cabin
    if (
      result.type === "flight" &&
      filters.cabins.length > 0 &&
      !filters.cabins.includes(result.cabin)
    ) {
      return false;
    }

    // Flight-only: airline
    if (
      result.type === "flight" &&
      filters.airlines.length > 0 &&
      !filters.airlines.includes(result.airline)
    ) {
      return false;
    }

    // Bus/train-only: operator
    if (
      (result.type === "bus" || result.type === "train") &&
      filters.operators.length > 0 &&
      !filters.operators.includes(result.operator)
    ) {
      return false;
    }

    // Hotel-only: star rating
    if (
      result.type === "hotel" &&
      filters.minStars > 0 &&
      result.stars < filters.minStars
    ) {
      return false;
    }

    // Hotel + bus: amenities (must include all selected)
    if (
      (result.type === "hotel" || result.type === "bus") &&
      filters.amenities.length > 0 &&
      !hasAllAmenities(result.amenities, filters.amenities)
    ) {
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

/** How many filter groups differ from defaults (for the mobile badge). */
export function countActiveFilters(
  filters: ResultsFilters,
  defaults: ResultsFilters,
): number {
  let count = 0;

  if (filters.types.length < defaults.types.length) count += 1;
  if (filters.minPrice > defaults.minPrice) count += 1;
  if (filters.maxPrice < defaults.maxPrice) count += 1;
  if (filters.minRating > defaults.minRating) count += 1;
  if (filters.maxStops != null) count += 1;
  if (filters.cabins.length > 0) count += 1;
  if (filters.airlines.length > 0) count += 1;
  if (filters.operators.length > 0) count += 1;
  if (filters.minStars > defaults.minStars) count += 1;
  if (filters.amenities.length > 0) count += 1;

  return count;
}
