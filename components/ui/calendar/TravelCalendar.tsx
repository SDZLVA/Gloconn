"use client";

import { useEffect, useId, useState } from "react";
import { CalendarNav } from "@/components/ui/calendar/CalendarNav";
import { MonthView } from "@/components/ui/calendar/MonthView";
import type { TravelCalendarMode } from "@/components/ui/calendar/types";
import {
  addMonths,
  compareMonths,
  formatDateISO,
  getRangeHighlightEnd,
  getRangeSelectionPhase,
  isBeforeMinDate,
  parseDateISO,
  resolveRangeDayClick,
  startOfMonth,
  todayISO,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";

export type { TravelCalendarMode } from "@/components/ui/calendar/types";

type TravelCalendarProps = {
  mode: TravelCalendarMode;
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  minDate?: string;
  monthsToShow?: 1 | 2;
  /** With `monthsToShow={2}`, show one month on small screens and two from `sm` up. */
  stackMonthsOnMobile?: boolean;
  className?: string;
};

/**
 * TravelCalendar — reusable date picker with single or range selection.
 *
 * Highlights selected dates, shows in-range days, and disables past dates.
 * Shows one or two months side by side (controlled via `monthsToShow`).
 */
export function TravelCalendar({
  mode,
  startDate,
  endDate,
  onChange,
  minDate = todayISO(),
  monthsToShow = 2,
  stackMonthsOnMobile = false,
  className,
}: TravelCalendarProps) {
  const baseId = useId();
  const [viewMonth, setViewMonth] = useState(() => {
    const initial =
      parseDateISO(startDate) ?? parseDateISO(minDate) ?? new Date();
    return startOfMonth(initial);
  });
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const minMonth = startOfMonth(parseDateISO(minDate) ?? new Date());
  const today = todayISO();
  const visibleMonths =
    monthsToShow === 1
      ? [viewMonth]
      : [viewMonth, addMonths(viewMonth, 1)];
  const stackOnMobile = stackMonthsOnMobile && monthsToShow === 2;
  const canGoPrevious = compareMonths(viewMonth, minMonth) > 0;

  useEffect(() => {
    const boundedMinMonth = startOfMonth(parseDateISO(minDate) ?? new Date());
    setViewMonth((current) =>
      compareMonths(current, boundedMinMonth) < 0 ? boundedMinMonth : current,
    );
  }, [minDate]);

  function handlePreviousMonth() {
    if (!canGoPrevious) {
      return;
    }

    setViewMonth((current) => addMonths(current, -1));
  }

  function handleDayClick(iso: string) {
    if (isBeforeMinDate(iso, minDate)) {
      return;
    }

    if (mode === "single") {
      onChange(iso, "");
      setHoverDate(null);
      return;
    }

    const next = resolveRangeDayClick(iso, startDate, endDate);
    onChange(next.startDate, next.endDate);
    setHoverDate(null);
    return;
  }

  const highlightEndDate = getRangeHighlightEnd(
    startDate,
    endDate,
    hoverDate,
    minDate,
  );
  const isSelectingEnd =
    mode === "range" && getRangeSelectionPhase(startDate, endDate) === "selecting-end";

  return (
    <div className={cn("select-none", className)}>
      <CalendarNav
        visibleMonths={visibleMonths}
        stackMonthsOnMobile={stackOnMobile}
        canGoPrevious={canGoPrevious}
        onPrevious={handlePreviousMonth}
        onNext={() => setViewMonth((current) => addMonths(current, 1))}
      />

      <div
        className={cn(
          "grid gap-4 sm:gap-6",
          monthsToShow === 2 && !stackOnMobile
            ? "sm:grid-cols-2"
            : stackOnMobile
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1",
        )}
      >
        {visibleMonths.map((monthDate, index) => (
          <div
            key={`${baseId}-${formatDateISO(monthDate)}`}
            className={cn(
              stackOnMobile && index === 1 && "hidden sm:block",
            )}
          >
            <MonthView
              monthDate={monthDate}
              mode={mode}
              startDate={startDate}
              highlightEndDate={highlightEndDate}
              isSelectingEnd={isSelectingEnd}
              minDate={minDate}
              today={today}
              onDayClick={handleDayClick}
              onDayHover={setHoverDate}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
