"use client";

import { useId } from "react";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { FormError, FormLabel } from "@/components/ui/FormField";
import type { CurrencyCode } from "@/lib/budget";
import { cn } from "@/lib/utils";

type BudgetSelectorProps = {
  value: string;
  currency: CurrencyCode;
  onChange: (value: string) => void;
  onCurrencyChange: (currency: CurrencyCode) => void;
  error?: string;
  required?: boolean;
  className?: string;
};

/**
 * BudgetSelector — search-form budget field with a numeric input and currency selector.
 *
 * Keeps the form's string-based budget value. Validation stays in `validateBudget`.
 */
export function BudgetSelector({
  value,
  currency,
  onChange,
  onCurrencyChange,
  error,
  required = false,
  className,
}: BudgetSelectorProps) {
  const generatedId = useId();
  const inputId = `${generatedId}-budget`;
  const currencyId = `${generatedId}-currency`;
  const errorId = `${generatedId}-error`;

  /** Allow digits only (no negatives, no decimals) so typing stays simple. */
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value.replace(/[^\d]/g, "");
    onChange(next);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <FormLabel htmlFor={inputId} required={required}>
          Budget (€)
        </FormLabel>

        <CurrencySelector
          id={currencyId}
          value={currency}
          onChange={onCurrencyChange}
        />
      </div>

      <div
        className={cn(
          "flex w-full items-center gap-2 rounded-xl border bg-white px-4 py-3 motion-safe:transition-all motion-safe:duration-200 focus-within:outline-none focus-within:ring-2",
          error
            ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-100"
            : "border-slate-200 motion-safe:hover:border-slate-300 focus-within:border-brand-700 focus-within:ring-brand-100",
        )}
      >
        <span
          className="shrink-0 text-base font-semibold text-slate-600 sm:text-sm"
          aria-hidden="true"
        >
          €
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          placeholder="Example: 1500"
          value={value}
          onChange={handleInputChange}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-sm"
        />
      </div>

      {error && <FormError id={errorId} message={error} />}
    </div>
  );
}
