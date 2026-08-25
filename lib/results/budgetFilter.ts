/**
 * Initial results price-filter defaults (Sprint 17.7).
 *
 * When the user entered a budget, the filter max starts at that amount.
 * The sidebar still allows raising max up to the observed result price range.
 */

import type { Budget } from "@/types/models/budget";
import {
  DEFAULT_RESULTS_FILTERS,
  type ResultsFilters,
} from "@/types/results";

export type PriceRangeBounds = {
  min: number;
  max: number;
};

/**
 * Builds the initial ResultsFilters for a search.
 *
 * - No budget → max = observed result max (or broad default when empty).
 * - With budget → max = budget.amount (currency is display-only here;
 *   search results are already in the request currency).
 */
export function buildInitialResultsFilters(
  priceRange: PriceRangeBounds,
  budget: Budget | null | undefined,
): ResultsFilters {
  const hasBudget =
    budget != null &&
    Number.isFinite(budget.amount) &&
    budget.amount >= 0;

  const maxPrice = hasBudget ? budget!.amount : priceRange.max;
  // Keep min ≤ max so the slider / inputs stay usable when all results
  // sit above the entered budget.
  const minPrice = Math.min(priceRange.min, maxPrice);

  return {
    ...DEFAULT_RESULTS_FILTERS,
    minPrice,
    maxPrice,
  };
}
