import { cn } from "@/lib/utils";
import { focusRing } from "@/lib/styles";

type NumberStepperProps = {
  id: string;
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
};

/**
 * NumberStepper — reusable +/- control for numeric values.
 * Used in the travelers selector and anywhere a bounded counter is needed.
 */
export function NumberStepper({
  id,
  label,
  description,
  value,
  min,
  max,
  onChange,
  className,
}: NumberStepperProps) {
  const decrementId = `${id}-decrement`;
  const incrementId = `${id}-increment`;
  const valueId = `${id}-value`;

  function decrement() {
    if (value > min) {
      onChange(value - 1);
    }
  }

  function increment() {
    if (value < max) {
      onChange(value + 1);
    }
  }

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="min-w-0 flex-1">
        <p id={`${id}-label`} className="text-sm font-semibold text-slate-800">
          {label}
        </p>
        {description && (
          <p
            id={`${id}-description`}
            className="text-xs leading-relaxed text-slate-500"
          >
            {description}
          </p>
        )}
      </div>

      <div
        className="flex shrink-0 items-center gap-2"
        role="group"
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-description` : undefined}
      >
        <button
          id={decrementId}
          type="button"
          onClick={decrement}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          aria-controls={valueId}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-semibold text-slate-700 motion-safe:transition-colors motion-safe:duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40",
            focusRing,
          )}
        >
          <span aria-hidden="true">−</span>
        </button>

        <span
          id={valueId}
          className="w-8 text-center text-sm font-semibold tabular-nums text-slate-900"
          aria-live="polite"
          aria-atomic="true"
        >
          {value}
        </span>

        <button
          id={incrementId}
          type="button"
          onClick={increment}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          aria-controls={valueId}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-semibold text-slate-700 motion-safe:transition-colors motion-safe:duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40",
            focusRing,
          )}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  );
}
