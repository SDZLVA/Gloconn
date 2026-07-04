"use client";

import { useEffect, useId, useRef, useState } from "react";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { FormError, FormLabel } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import {
  applyPassengerFieldUpdate,
  formatPassengersSummary,
  getInfantMax,
  PASSENGERS_FIELD_CONFIG,
  PASSENGERS_LIMITS,
  type PassengerField,
} from "@/lib/search/passengers";
import { cn } from "@/lib/utils";
import { focusRing } from "@/lib/styles";
import type { PassengersState } from "@/types/search";

const DEFAULT_FIELDS: readonly PassengerField[] = [
  "adults",
  "children",
  "infants",
  "rooms",
];

type PassengersSelectorProps = {
  value: PassengersState;
  onChange: (value: PassengersState) => void;
  error?: string;
  required?: boolean;
  className?: string;
  /** Visible label above the trigger button. */
  label?: string;
  /** Which rows to show in the panel. Defaults to all four fields. */
  fields?: readonly PassengerField[];
  /** Accessible name for the dropdown panel. */
  panelAriaLabel?: string;
};

/**
 * PassengersSelector — reusable dropdown for adults, children, infants, and rooms.
 * Uses NumberStepper controls with increment/decrement buttons and built-in limits.
 */
export function PassengersSelector({
  value,
  onChange,
  error,
  required = false,
  className,
  label = "Passengers & rooms",
  fields = DEFAULT_FIELDS,
  panelAriaLabel = "Select passengers and rooms",
}: PassengersSelectorProps) {
  const triggerId = useId();
  const panelId = `${triggerId}-panel`;
  const errorId = `${triggerId}-error`;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const summary = formatPassengersSummary(value);
  const visibleFields = PASSENGERS_FIELD_CONFIG.filter((field) =>
    fields.includes(field.key),
  );

  function updateField<K extends PassengerField>(
    field: K,
    fieldValue: PassengersState[K],
  ) {
    onChange(applyPassengerFieldUpdate(value, field, fieldValue));
  }

  function closePanel() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function togglePanel() {
    setIsOpen((open) => !open);
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        closePanel();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-2", className)}>
      <FormLabel htmlFor={triggerId} required={required}>
        {label}
      </FormLabel>

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        onClick={togglePanel}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-sm motion-safe:transition-all motion-safe:duration-200 focus:outline-none focus:ring-2",
          focusRing,
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-slate-200 motion-safe:hover:border-slate-300 focus:border-brand-700 focus:ring-brand-100",
        )}
      >
        <span className="truncate font-medium text-slate-900">{summary}</span>
        <span
          className={cn(
            "ml-2 shrink-0 text-slate-400 motion-safe:transition-transform motion-safe:duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-label={panelAriaLabel}
          className="absolute top-full z-20 mt-1 w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60 sm:min-w-[320px]"
        >
          <div className="flex max-h-[min(24rem,calc(100dvh-8rem))] flex-col gap-4 overflow-y-auto overscroll-contain">
            {visibleFields.map((field) => {
              const limits = PASSENGERS_LIMITS[field.key];
              const max =
                field.key === "infants" ? getInfantMax(value) : limits.max;

              return (
                <NumberStepper
                  key={field.key}
                  id={`${triggerId}-${field.key}`}
                  label={field.label}
                  description={field.description}
                  value={value[field.key]}
                  min={limits.min}
                  max={max}
                  onChange={(next) => updateField(field.key, next)}
                />
              );
            })}
          </div>

          <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
            <Button type="button" onClick={closePanel} className="min-w-[100px]">
              Done
            </Button>
          </div>
        </div>
      )}

      {error && <FormError id={errorId} message={error} />}
    </div>
  );
}
