"use client";

import { useId } from "react";
import { useCurrencies } from "@/hooks/useCurrencies";
import { getCurrencyOptions } from "@/lib/providers/currencies/mock/helpers";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { Currency, CurrencyCode } from "@/types/models/currency";

type CurrencySelectorProps = {
  id?: string;
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  /** Optional override — defaults to mock data from the service layer. */
  currencies?: Currency[];
  className?: string;
  "aria-label"?: string;
};

function formatOptionLabel(currency: Currency): string {
  return `${currency.symbol} ${currency.name} (${currency.code})`;
}

/**
 * CurrencySelector — reusable dropdown backed by mock currency data.
 *
 * Loads options via `useCurrencies` (service → mock provider). Falls back to
 * sync mock helpers while the first fetch is in flight.
 */
export function CurrencySelector({
  id,
  value,
  onChange,
  currencies: currenciesOverride,
  className,
  "aria-label": ariaLabel = "Currency",
}: CurrencySelectorProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const { currencies: loadedCurrencies, isLoading } = useCurrencies();

  const options =
    currenciesOverride ??
    (loadedCurrencies.length > 0 ? loadedCurrencies : getCurrencyOptions());

  return (
    <select
      id={selectId}
      value={value}
      disabled={isLoading && options.length === 0}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value as CurrencyCode)}
      className={cn(
        "min-w-[9.5rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 motion-safe:transition-colors motion-safe:duration-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:border-brand-700 focus:ring-brand-100 disabled:cursor-wait disabled:opacity-60",
        focusRing,
        className,
      )}
    >
      {options.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {formatOptionLabel(currency)}
        </option>
      ))}
    </select>
  );
}
