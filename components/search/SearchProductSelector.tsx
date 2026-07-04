"use client";

import { FormError, FormLabel } from "@/components/ui/FormField";
import { SEARCH_PRODUCT_TYPE_OPTIONS } from "@/lib/search/constants";
import { cn } from "@/lib/utils";
import { focusRing } from "@/lib/styles";
import type { SearchProductType } from "@/types/search";

type SearchProductSelectorProps = {
  value: SearchProductType[];
  onChange: (value: SearchProductType[]) => void;
  error?: string;
  required?: boolean;
  className?: string;
};

/**
 * SearchProductSelector — choose which result types to search (stays, flights, transport).
 * At least one type must remain selected.
 */
export function SearchProductSelector({
  value,
  onChange,
  error,
  required = false,
  className,
}: SearchProductSelectorProps) {
  function toggleType(type: SearchProductType) {
    const isSelected = value.includes(type);

    if (isSelected) {
      onChange(value.filter((item) => item !== type));
      return;
    }

    onChange([...value, type]);
  }

  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <FormLabel required={required}>Search for</FormLabel>

      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        role="group"
        aria-label="Result types to search"
        aria-describedby={error ? "search-product-types-error" : undefined}
      >
        {SEARCH_PRODUCT_TYPE_OPTIONS.map((option) => {
          const isSelected = value.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleType(option.value)}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm font-semibold motion-safe:transition-all motion-safe:duration-200",
                focusRing,
                isSelected
                  ? "border-brand-700 bg-brand-50 text-brand-800 shadow-sm shadow-brand-100"
                  : "border-slate-200 bg-white text-slate-600 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-slate-300 motion-safe:hover:bg-slate-50 motion-safe:hover:shadow-sm",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {error && <FormError id="search-product-types-error" message={error} />}
    </fieldset>
  );
}
