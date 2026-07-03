import { cn } from "@/lib/utils";

/** The three travel style options shown in the search card. */
export const TRAVEL_STYLES = [
  { value: "budget", label: "Budget" },
  { value: "standard", label: "Standard" },
  { value: "luxury", label: "Luxury" },
] as const;

export type TravelStyle = (typeof TRAVEL_STYLES)[number]["value"];

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
    <fieldset className={cn("flex flex-col gap-2", className)}>
      <legend className="text-sm font-medium text-slate-700">
        Travel style
        {required && <span className="text-red-500"> *</span>}
      </legend>

      <div
        className="grid grid-cols-3 gap-2"
        role="radiogroup"
        aria-label="Travel style"
        aria-invalid={error ? true : undefined}
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
                "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                isSelected
                  ? "border-brand-700 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              {style.label}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
