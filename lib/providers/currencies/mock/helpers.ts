/**
 * Sync helpers for mock currency data — used by lib/budget and UI fallbacks.
 */

import { MOCK_CURRENCIES } from "@/lib/providers/currencies/mock/data";
import type { Currency, CurrencyCode } from "@/types/models/currency";

export type CurrencyOption = Currency & {
  /** Human-readable label for select options (e.g. "Euro (EUR)"). */
  label: string;
};

function toCurrencyOption(currency: Currency): CurrencyOption {
  return {
    ...currency,
    label: `${currency.name} (${currency.code})`,
  };
}

/** Returns all mock currencies as select-friendly options. */
export function getCurrencyOptions(): CurrencyOption[] {
  return MOCK_CURRENCIES.map(toCurrencyOption);
}

/** Looks up one currency by ISO code. */
export function findCurrencyByCode(code: CurrencyCode): Currency | undefined {
  return MOCK_CURRENCIES.find((currency) => currency.code === code);
}
