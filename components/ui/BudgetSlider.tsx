"use client";

import { useId } from "react";
import { FormError, FormLabel } from "@/components/ui/FormField";
import {
  CURRENCY_OPTIONS,
  formatBudget,
  type CurrencyCode,
} from "@/lib/budget";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

type BudgetSliderProps = {
  id?: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  min: number;
  max: number;
  step?: number;
  currencies?: ReadonlyArray<(typeof CURRENCY_OPTIONS)[number]>;
  /** When false, the value display shows an optional / unset state. */
  isSet?: boolean;
  unsetLabel?: string;
  onClear?: () => void;
  error?: string;
  required?: boolean;
  className?: string;
};

/**
 * BudgetSlider — reusable range control with currency selector and live value.
 *
 * Controlled component: parent owns `value`, `currency`, and change handlers.
 */
export function BudgetSlider({
  id,
  label = "Budget",
  value,
  onChange,
  currency,
  onCurrencyChange,
  min,
  max,
  step = 100,
  currencies = CURRENCY_OPTIONS,
  isSet = true,
  unsetLabel = "No limit",
  onClear,
  error,
  required = false,
  className,
}: BudgetSliderProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const sliderId = `${fieldId}-slider`;
  const currencyId = `${fieldId}-currency`;
  const valueId = `${fieldId}-value`;
  const errorId = `${fieldId}-error`;

  const clampedValue = Math.min(Math.max(value, min), max);
  const fillPercent = ((clampedValue - min) / (max - min)) * 100;
  const displayValue = isSet ? formatBudget(clampedValue, currency) : unsetLabel;

  function handleSliderChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange(Number(event.target.value));
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <FormLabel htmlFor={sliderId} required={required}>
          {label}
        </FormLabel>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <label htmlFor={currencyId} className="sr-only">
            Currency
          </label>
          <select
            id={currencyId}
            value={currency}
            onChange={(event) =>
              onCurrencyChange(event.target.value as CurrencyCode)
            }
            className={cn(
              "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 motion-safe:transition-colors motion-safe:duration-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:border-brand-700 focus:ring-brand-100",
              focusRing,
            )}
          >
            {currencies.map((option) => (
              <option key={option.code} value={option.code}>
                {option.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={cn(
          "rounded-xl border bg-white px-4 py-4 motion-safe:transition-colors motion-safe:duration-200",
          error
            ? "border-red-300"
            : "border-slate-200 motion-safe:hover:border-slate-300",
        )}
      >
        <p
          id={valueId}
          className={cn(
            "mb-4 text-2xl font-bold tabular-nums tracking-tight sm:text-3xl",
            isSet ? "text-brand-800" : "text-slate-400",
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {displayValue}
        </p>

        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={clampedValue}
          onChange={handleSliderChange}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clampedValue}
          aria-valuetext={displayValue}
          aria-describedby={error ? errorId : valueId}
          aria-invalid={error ? true : undefined}
          style={
            { "--range-progress": `${fillPercent}%` } as React.CSSProperties
          }
          className="budget-range w-full"
        />

        <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>{formatBudget(min, currency)}</span>
          <span>{formatBudget(max, currency)}</span>
        </div>
      </div>

      {isSet && onClear && (
        <button
          type="button"
          onClick={onClear}
          className={cn(
            "self-start text-sm font-medium text-slate-500 underline-offset-2 motion-safe:transition-colors motion-safe:duration-200 hover:text-brand-700 hover:underline",
            focusRing,
          )}
        >
          Clear budget
        </button>
      )}

      {error && <FormError id={errorId} message={error} />}
    </div>
  );
}
