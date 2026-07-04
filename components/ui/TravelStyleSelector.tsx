import { cn } from "@/lib/utils";
import type { TravelStyle } from "@/types/search";

/** The three travel style options shown in the search card. */
export const TRAVEL_STYLES = [
  { value: "budget", label: "Budget" },
  { value: "standard", label: "Standard" },
  { value: "luxury", label: "Luxury" },
] as const satisfies ReadonlyArray<{ value: TravelStyle; label: string }>;

type TravelStyleSelectorProps = {
  value: TravelStyle;
  onChange: (value: TravelStyle) => void;
  error?: string;
  required?: boolean;
  className?: string;
};

/**
 * TravelStyleSelector — lets the user pick Budget, Standard, or Luxury.
 *
 * Uses button-style options so it is easy to tap on mobile.
 * Only one style can be selected at a time.
 */
export function TravelStyleSelector({
  value,
  onChange,
  error,
  required = false,
  className,
}: TravelStyleSelectorProps) {
  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <legend className="text-sm font-semibold tracking-wide text-slate-800">
        Travel style
        {required && (
          <span className="text-red-500" aria-hidden="true">
            {" "}
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </legend>

      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        role="radiogroup"
        aria-label="Travel style"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "travel-style-error" : undefined}
      >
        {TRAVEL_STYLES.map((style) => {
          const isSelected = value === style.value;

          return (
            <button
              key={style.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(style.value)}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm font-semibold motion-safe:transition-all motion-safe:duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700",
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

      {error && (
        <p id="travel-style-error" className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
