/**
 * Currency codes and models supported across Glooconn.
 * Provider-independent — mock data lives in lib/providers/currencies/mock/.
 */

/** ISO 4217 currency codes available in the budget selector and result prices. */
export type CurrencyCode =
  | "EUR"
  | "USD"
  | "GBP"
  | "CHF"
  | "JPY"
  | "AUD"
  | "CAD";

/** A displayable currency option for selectors and formatting. */
export type Currency = {
  /** ISO 4217 code. */
  code: CurrencyCode;

  /** Short symbol shown beside amounts (e.g. €, $). */
  symbol: string;

  /** Full currency name (e.g. Euro). */
  name: string;
};
