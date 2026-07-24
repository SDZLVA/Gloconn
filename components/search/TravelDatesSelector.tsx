"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TravelCalendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/Button";
import { FormError, FormLabel } from "@/components/ui/FormField";
import { useAnchoredPopover } from "@/hooks/useAnchoredPopover";
import { formatTravelDatesSummary, TRIP_TYPE_OPTIONS } from "@/lib/search";
import { formatShortDate, todayISO } from "@/lib/calendar";
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

type DateChipProps = {
  label: string;
  value: string;
  placeholder: string;
  active?: boolean;
};

function DateChip({ label, value, placeholder, active = false }: DateChipProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg border px-3 py-2.5 sm:py-2",
        active
          ? "border-brand-700 bg-brand-50"
          : "border-slate-200 bg-slate-50/80",
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span
        className={cn(
          "truncate text-sm font-semibold",
          value ? "text-slate-900" : "text-slate-400",
        )}
      >
        {value ? formatShortDate(value) : placeholder}
      </span>
    </div>
  );
}

type TravelDatesPanelProps = {
  tripType: TripType;
  departureDate: string;
  returnDate: string;
  awaitingReturn: boolean;
  onTripTypeChange: (tripType: TripType) => void;
  onDatesChange: (departureDate: string, returnDate: string) => void;
  onClose: () => void;
};

function TravelDatesPanel({
  tripType,
  departureDate,
  returnDate,
  awaitingReturn,
  onTripTypeChange,
  onDatesChange,
  onClose,
}: TravelDatesPanelProps) {
  const calendarMode = tripType === "one-way" ? "single" : "range";
  const isRoundTrip = tripType === "round-trip";

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
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
                onClick={() => onTripTypeChange(option.value)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-sm font-semibold motion-safe:transition-all motion-safe:duration-200 sm:py-2.5",
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

        {isRoundTrip && (
          <div className="mb-4 flex gap-2">
            <DateChip
              label="Departure"
              value={departureDate}
              placeholder="Select"
              active={!departureDate || awaitingReturn}
            />
            <DateChip
              label="Return"
              value={returnDate}
              placeholder="Select"
              active={Boolean(departureDate && !returnDate)}
            />
          </div>
        )}

        <TravelCalendar
          mode={calendarMode}
          startDate={departureDate}
          endDate={returnDate}
          onChange={onDatesChange}
          minDate={todayISO()}
          monthsToShow={isRoundTrip ? 2 : 1}
          stackMonthsOnMobile={isRoundTrip}
        />
      </div>

      <div className="shrink-0 border-t border-slate-100 pt-4">
        <Button
          type="button"
          onClick={onClose}
          className="w-full sm:ml-auto sm:w-auto sm:min-w-[100px]"
        >
          Done
        </Button>
      </div>
    </>
  );
}

/**
 * TravelDatesSelector — round-trip or one-way date picker for the search form.
 * Renders the calendar in a portal, anchored below the trigger (not page bottom).
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
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const popoverPosition = useAnchoredPopover(isOpen, triggerRef);

  const summary = formatTravelDatesSummary(tripType, departureDate, returnDate);
  const error = departureError ?? returnError;
  const awaitingReturn =
    tripType === "round-trip" && Boolean(departureDate && !returnDate);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
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

  const portalContent =
    isOpen && popoverPosition && mounted
      ? createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label="Select travel dates"
            style={{
              position: "fixed",
              top: popoverPosition.top,
              left: popoverPosition.left,
              width: popoverPosition.width,
              maxHeight: popoverPosition.maxHeight,
              zIndex: 50,
            }}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 sm:p-5"
          >
            <TravelDatesPanel
              tripType={tripType}
              departureDate={departureDate}
              returnDate={returnDate}
              awaitingReturn={awaitingReturn}
              onTripTypeChange={handleTripTypeChange}
              onDatesChange={onDatesChange}
              onClose={closePanel}
            />
          </div>,
          document.body,
        )
      : null;

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
          "flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3.5 text-left text-sm motion-safe:transition-all motion-safe:duration-200 focus:outline-none focus:ring-2 sm:py-3",
          focusRing,
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-slate-200 motion-safe:hover:border-slate-300 focus:border-brand-700 focus:ring-brand-100",
        )}
      >
        <CalendarIcon className="h-5 w-5 shrink-0 text-brand-700" />
        <span className="min-w-0 flex-1 truncate font-medium text-slate-900">
          {summary}
        </span>
        <span
          className={cn(
            "shrink-0 text-slate-400 motion-safe:transition-transform motion-safe:duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {portalContent}

      {error && <FormError id={errorId} message={error} />}
    </div>
  );
}
