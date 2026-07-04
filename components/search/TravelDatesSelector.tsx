"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TravelCalendar } from "@/components/ui/TravelCalendar";
import { Button } from "@/components/ui/Button";
import { FormError, FormLabel } from "@/components/ui/FormField";
import { formatTravelDatesSummary, TRIP_TYPE_OPTIONS } from "@/lib/search";
import { cn } from "@/lib/utils";
import { focusRing } from "@/lib/styles";
import type { TripType } from "@/types/search";

type TravelDatesSelectorProps = {
  tripType: TripType;
  departureDate: string;
  returnDate: string;
  onTripTypeChange: (tripType: TripType) => void;
  onDatesChange: (departureDate: string, returnDate: string) => void;
  departureError?: string;
  returnError?: string;
  required?: boolean;
  className?: string;
};

/**
 * TravelDatesSelector — round-trip or one-way date picker for the search form.
 * Opens a dropdown with trip type toggle and the reusable TravelCalendar.
 */
export function TravelDatesSelector({
  tripType,
  departureDate,
  returnDate,
  onTripTypeChange,
  onDatesChange,
  departureError,
  returnError,
  required = false,
  className,
}: TravelDatesSelectorProps) {
  const triggerId = useId();
  const panelId = `${triggerId}-panel`;
  const errorId = `${triggerId}-error`;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const summary = formatTravelDatesSummary(tripType, departureDate, returnDate);
  const error = departureError ?? returnError;
  const calendarMode = tripType === "one-way" ? "single" : "range";

  function closePanel() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function togglePanel() {
    setIsOpen((open) => !open);
  }

  function handleTripTypeChange(nextTripType: TripType) {
    onTripTypeChange(nextTripType);

    if (nextTripType === "one-way" && returnDate) {
      onDatesChange(departureDate, "");
    }
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
    <div
      ref={containerRef}
      className={cn("relative flex flex-col gap-2", className)}
    >
      <FormLabel htmlFor={triggerId} required={required}>
        Dates
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
          aria-label="Select travel dates"
          className="absolute top-full z-20 mt-1 w-full min-w-[min(100vw-2rem,360px)] rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60 sm:min-w-[min(100vw-2rem,640px)] sm:p-5"
        >
          <div
            className="mb-4 grid grid-cols-2 gap-2"
            role="radiogroup"
            aria-label="Trip type"
          >
            {TRIP_TYPE_OPTIONS.map((option) => {
              const isSelected = tripType === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleTripTypeChange(option.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-semibold motion-safe:transition-all motion-safe:duration-200",
                    focusRing,
                    isSelected
                      ? "border-brand-700 bg-brand-50 text-brand-800"
                      : "border-slate-200 bg-white text-slate-600 motion-safe:hover:border-slate-300 motion-safe:hover:bg-slate-50",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <TravelCalendar
            mode={calendarMode}
            startDate={departureDate}
            endDate={returnDate}
            onChange={onDatesChange}
            monthsToShow={tripType === "round-trip" ? 2 : 1}
          />

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
