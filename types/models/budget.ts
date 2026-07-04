/**
 * Budget model — optional spending limit for a trip search.
 */

import type { CurrencyCode } from "@/types/models/currency";

/**
 * Maximum amount a traveler is willing to spend on a trip.
 * Used in search requests and future price filtering.
 */
export type Budget = {
  /** Maximum budget amount as a whole number (e.g. 2500). */
  amount: number;

  /** Currency for the budget amount. */
  currency: CurrencyCode;
};
