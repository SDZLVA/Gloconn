import type { CurrencyCode } from "@/types/models/currency";
import { getCurrencyOptions } from "@/lib/providers/currencies/mock/helpers";

export type { CurrencyCode };

/** Select-friendly currency options from mock data. */
export const CURRENCY_OPTIONS = getCurrencyOptions();

/** Default min, max, and step for trip budget selection. */
export const BUDGET_LIMITS = {
  min: 0,
  max: 10_000,
  step: 100,
} as const;

/** Formats a whole-number amount with the user's locale and currency code. */
export function formatBudget(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
