/**
 * Initial results price-filter defaults (Sprint 17.7 / 18.8).
 *
 * When the user entered a budget and at least one result fits, the filter
 * max starts at that amount. When nothing fits, open to the observed range
 * so Browse Flights / Hotels are not empty while packages still warn.
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
 * True when the cheapest observed result is still above the budget
 * (so a max=budget filter would hide every browse row).
 */
export function noResultFitsBudget(
  priceRange: PriceRangeBounds,
  budgetAmount: number,
): boolean {
  if (!Number.isFinite(budgetAmount) || budgetAmount < 0) {
    return false;
  }
  if (!Number.isFinite(priceRange.min)) {
    return false;
  }
  return priceRange.min > budgetAmount;
}

/**
 * Builds the initial ResultsFilters for a search.
 *
 * - No budget → max = observed result max (or broad default when empty).
 * - With budget and at least one result ≤ budget → max = budget.amount.
 * - With budget and every result over budget → max = observed range
 *   (user still sees the over-budget package warning).
 */
export function buildInitialResultsFilters(
  priceRange: PriceRangeBounds,
  budget: Budget | null | undefined,
): ResultsFilters {
  const hasBudget =
    budget != null &&
    Number.isFinite(budget.amount) &&
    budget.amount >= 0;

  let maxPrice = priceRange.max;
  if (hasBudget) {
    maxPrice = noResultFitsBudget(priceRange, budget!.amount)
      ? priceRange.max
      : budget!.amount;
  }

  // Keep min ≤ max so the slider / inputs stay usable.
  const minPrice = Math.min(priceRange.min, maxPrice);

  return {
    ...DEFAULT_RESULTS_FILTERS,
    minPrice,
    maxPrice,
  };
}
