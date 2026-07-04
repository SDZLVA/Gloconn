"use client";

import { FormError, FormLabel } from "@/components/ui/FormField";
import { TRAVEL_STYLE_OPTIONS } from "@/lib/search";
import { cn } from "@/lib/utils";
import { focusRing } from "@/lib/styles";
import type { TravelStyle } from "@/types/search";

type TravelStyleSelectorProps = {
  value: TravelStyle;
  onChange: (value: TravelStyle) => void;
  error?: string;
  required?: boolean;
  className?: string;
};

/** TravelStyleSelector — Budget, Standard, or Luxury picker for the search form. */
export function TravelStyleSelector({
  value,
  onChange,
  error,
  required = false,
  className,
}: TravelStyleSelectorProps) {
  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <FormLabel required={required}>Travel style</FormLabel>

      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        role="radiogroup"
        aria-label="Travel style"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "travel-style-error" : undefined}
      >
        {TRAVEL_STYLE_OPTIONS.map((style) => {
          const isSelected = value === style.value;

          return (
            <button
              key={style.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(style.value)}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm font-semibold motion-safe:transition-all motion-safe:duration-200",
                focusRing,
                isSelected
                  ? "border-brand-700 bg-brand-50 text-brand-800 shadow-sm shadow-brand-100"
                  : "border-slate-200 bg-white text-slate-600 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-slate-300 motion-safe:hover:bg-slate-50 motion-safe:hover:shadow-sm",
              )}
            >
              {style.label}
            </button>
          );
        })}
      </div>

      {error && <FormError id="travel-style-error" message={error} />}
    </fieldset>
  );
}
