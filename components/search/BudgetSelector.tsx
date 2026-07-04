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
  className?: string;
};

/**
 * BudgetSelector — search-form budget field backed by BudgetSlider.
 *
 * Keeps the form's string-based budget value while the slider works with numbers.
 * An empty string means no budget limit (optional field).
 */
export function BudgetSelector({
  value,
  currency,
  onChange,
  onCurrencyChange,
  error,
  className,
}: BudgetSelectorProps) {
  const isSet = value.trim() !== "";
  const numericValue = isSet ? Number(value) : BUDGET_LIMITS.min;

  function handleSliderChange(next: number) {
    onChange(String(next));
  }

  function handleClear() {
    onChange("");
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
      unsetLabel="No limit — slide to set"
      onClear={handleClear}
      error={error}
      className={cn(className)}
    />
  );
}
