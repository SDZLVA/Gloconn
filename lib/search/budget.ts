import { BUDGET_LIMITS, formatBudget, type CurrencyCode } from "@/lib/budget";

/**
 * Validates the budget slider value.
 * Returns an error message when invalid, or undefined when valid.
 */
export function validateBudget(
  budget: string,
  currency: CurrencyCode,
): string | undefined {
  const trimmed = budget.trim();

  if (!trimmed) {
    return undefined;
  }

  const amount = Number(trimmed);

  if (Number.isNaN(amount)) {
    return "Please enter a valid budget amount.";
  }

  if (amount < BUDGET_LIMITS.min) {
    return `Budget must be at least ${formatBudget(BUDGET_LIMITS.min, currency)}.`;
  }

  if (amount > BUDGET_LIMITS.max) {
    return `Budget cannot exceed ${formatBudget(BUDGET_LIMITS.max, currency)}.`;
  }

  return undefined;
}
