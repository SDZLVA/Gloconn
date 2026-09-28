"use client";

import { FormLabel } from "@/components/ui/FormField";
import { FLEX_DAYS_OPTIONS } from "@/lib/search/flexibleDates";
import { cn } from "@/lib/utils";
import { focusRing } from "@/lib/styles";
import type { FlexDays } from "@/lib/search/flexibleDates";

type FlexibleDatesSelectorProps = {
  value: FlexDays;
  onChange: (value: FlexDays) => void;
  className?: string;
};

/**
 * Compact segmented control for Exact / ±1 / ±2 / ±3 days.
 * Keyboard: Tab to group, arrow keys move focus between radios (browser default
 * for role="radio" buttons inside a radiogroup when using sequential tab — we
 * also support click/tap). Does not change the search dates themselves.
 */
export function FlexibleDatesSelector({
  value,
  onChange,
  className,
}: FlexibleDatesSelectorProps) {
  return (
    <fieldset className={cn("flex flex-col gap-2", className)}>
      <FormLabel>Flexible dates</FormLabel>

      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        role="radiogroup"
        aria-label="Flexible dates"
      >
        {FLEX_DAYS_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-xl border px-2.5 py-2.5 text-center text-xs font-semibold motion-safe:transition-all motion-safe:duration-200 sm:px-3 sm:text-sm",
                focusRing,
                isSelected
                  ? "border-brand-700 bg-brand-50 text-brand-800 shadow-sm shadow-brand-100"
                  : "border-slate-200 bg-white text-slate-600 motion-safe:hover:border-slate-300 motion-safe:hover:bg-slate-50",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
