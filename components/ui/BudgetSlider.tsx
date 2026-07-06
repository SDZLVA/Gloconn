"use client";

import { useId, useState } from "react";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { FormError, FormLabel } from "@/components/ui/FormField";
import { formatBudget, type CurrencyCode } from "@/lib/budget";
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

  const [dragValue, setDragValue] = useState<number | null>(null);
  const shownValue = dragValue ?? Math.min(Math.max(value, min), max);
  const clampedValue = shownValue;
  const fillPercent =
    max === min ? 0 : ((clampedValue - min) / (max - min)) * 100;
  const displayValue = formatBudget(clampedValue, currency);

  function handleSliderChange(
    event: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>,
  ) {
    const next = Number(event.currentTarget.value);
    setDragValue(next);
    onChange(next);
  }

  function commitDragValue() {
    setDragValue(null);
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <FormLabel htmlFor={sliderId} required={required}>
          {label}
        </FormLabel>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <CurrencySelector
            id={currencyId}
            value={currency}
            onChange={onCurrencyChange}
          />
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
        <div className="mb-4">
          <p
            id={valueId}
            className={cn(
              "text-2xl font-bold tabular-nums tracking-tight sm:text-3xl",
              isSet ? "text-brand-800" : "text-slate-600",
            )}
            aria-live="polite"
            aria-atomic="true"
          >
            {displayValue}
          </p>

          {!isSet && unsetLabel && (
            <p className="mt-1 text-sm text-slate-500">{unsetLabel}</p>
          )}
        </div>

        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={clampedValue}
          onChange={handleSliderChange}
          onInput={handleSliderChange}
          onMouseUp={commitDragValue}
          onTouchEnd={commitDragValue}
          onKeyUp={commitDragValue}
          onBlur={commitDragValue}
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
