"use client";

import { BudgetSlider } from "@/components/ui/BudgetSlider";
import { BUDGET_LIMITS, type CurrencyCode } from "@/lib/budget";
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
 * BudgetSelector — search-form budget field backed by BudgetSlider.
 *
 * Keeps the form's string-based budget value while the slider works with numbers.
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
  const isSet = value.trim() !== "";
  const numericValue = isSet ? Number(value) : BUDGET_LIMITS.min;

  function handleSliderChange(next: number) {
    onChange(String(next));
  }

  return (
    <BudgetSlider
      label="Budget"
      value={numericValue}
      onChange={handleSliderChange}
      currency={currency}
      onCurrencyChange={onCurrencyChange}
      min={BUDGET_LIMITS.min}
      max={BUDGET_LIMITS.max}
      step={BUDGET_LIMITS.step}
      isSet={isSet}
      unsetLabel="Slide to set your budget"
      onClear={required ? undefined : () => onChange("")}
      error={error}
      required={required}
      className={cn(className)}
    />
  );
}
