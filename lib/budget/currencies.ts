/** Supported currencies for the budget slider. */
export const CURRENCY_OPTIONS = [
  { code: "EUR", symbol: "€", label: "Euro (EUR)" },
  { code: "USD", symbol: "$", label: "US Dollar (USD)" },
  { code: "GBP", symbol: "£", label: "British Pound (GBP)" },
] as const;

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]["code"];

/** Default min, max, and step for trip budget selection. */
export const BUDGET_LIMITS = {
  min: 500,
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
