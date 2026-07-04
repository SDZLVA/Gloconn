"use client";

import { useEffect, useId, useRef, useState } from "react";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { FormError, FormLabel } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import {
  formatTravelersSummary,
  TRAVELERS_FIELD_CONFIG,
  TRAVELERS_LIMITS,
} from "@/lib/search";
import { cn } from "@/lib/utils";
import { focusRing } from "@/lib/styles";
import type { TravelersState } from "@/types/search";

type TravelersSelectorProps = {
  value: TravelersState;
  onChange: (value: TravelersState) => void;
  error?: string;
  required?: boolean;
  className?: string;
};

/**
 * TravelersSelector — pick adults, children, infants, and rooms.
 * Opens a dropdown panel with NumberStepper controls for each field.
 */
export function TravelersSelector({
  value,
  onChange,
  error,
  required = false,
  className,
}: TravelersSelectorProps) {
  const triggerId = useId();
  const panelId = `${triggerId}-panel`;
  const errorId = `${triggerId}-error`;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const summary = formatTravelersSummary(value);

  function updateField<K extends keyof TravelersState>(
    field: K,
    fieldValue: TravelersState[K],
  ) {
    onChange({ ...value, [field]: fieldValue });
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
        Travelers &amp; rooms
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
        <span className="font-medium text-slate-900">{summary}</span>
        <span
          className={cn(
            "ml-2 text-slate-400 motion-safe:transition-transform motion-safe:duration-200",
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
          aria-label="Select travelers and rooms"
          className="absolute top-full z-20 mt-1 w-full min-w-[280px] rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60 sm:min-w-[320px]"
        >
          <div className="flex flex-col gap-4">
            {TRAVELERS_FIELD_CONFIG.map((field) => {
              const limits = TRAVELERS_LIMITS[field.key];

              return (
                <NumberStepper
                  key={field.key}
                  id={`${triggerId}-${field.key}`}
                  label={field.label}
                  description={field.description}
                  value={value[field.key]}
                  min={limits.min}
                  max={limits.max}
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
