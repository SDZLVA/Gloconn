"use client";

import { useId, useState } from "react";
import {
  addMonths,
  compareDates,
  formatDateISO,
  formatMonthYear,
  getMonthGrid,
  getWeekdayLabels,
  isBeforeMinDate,
  isDateInRange,
  isSameDate,
  parseDateISO,
  startOfMonth,
  todayISO,
} from "@/lib/calendar";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

export type TravelCalendarMode = "single" | "range";

type TravelCalendarProps = {
  mode: TravelCalendarMode;
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  minDate?: string;
  monthsToShow?: 1 | 2;
  className?: string;
};

type MonthViewProps = {
  monthDate: Date;
  mode: TravelCalendarMode;
  startDate: string;
  endDate: string;
  minDate: string;
  today: string;
  onDayClick: (iso: string) => void;
  onDayHover: (iso: string | null) => void;
};

/**
 * TravelCalendar — reusable date picker with single or range selection.
 *
 * Highlights selected dates, shows in-range days, and disables past dates.
 * Shows one or two months side by side (responsive via `monthsToShow`).
 */
export function TravelCalendar({
  mode,
  startDate,
  endDate,
  onChange,
  minDate = todayISO(),
  monthsToShow = 2,
  className,
}: TravelCalendarProps) {
  const baseId = useId();
  const [viewMonth, setViewMonth] = useState(() => {
    const initial = parseDateISO(startDate) ?? parseDateISO(minDate) ?? new Date();
    return startOfMonth(initial);
  });
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const today = todayISO();
  const visibleMonths = monthsToShow === 1 ? [viewMonth] : [viewMonth, addMonths(viewMonth, 1)];

  function handlePreviousMonth() {
    setViewMonth((current) => addMonths(current, -1));
  }

  function handleNextMonth() {
    setViewMonth((current) => addMonths(current, 1));
  }

  function handleDayClick(iso: string) {
    if (isBeforeMinDate(iso, minDate)) {
      return;
    }

    if (mode === "single") {
      onChange(iso, "");
      return;
    }

    if (!startDate || (startDate && endDate)) {
      onChange(iso, "");
      return;
    }

    if (compareDates(iso, startDate) < 0) {
      onChange(iso, "");
      return;
    }

    onChange(startDate, iso);
  }

  const previewEnd =
    mode === "range" && startDate && !endDate && hoverDate && compareDates(hoverDate, startDate) >= 0
      ? hoverDate
      : endDate;

  return (
    <div className={cn("select-none", className)}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handlePreviousMonth}
          aria-label="Previous month"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 motion-safe:transition-colors motion-safe:duration-200 motion-safe:hover:border-slate-300 motion-safe:hover:bg-slate-50",
            focusRing,
          )}
        >
          <span aria-hidden="true">‹</span>
        </button>

        <div
          className={cn(
            "grid flex-1 gap-4 text-center text-sm font-semibold text-slate-800",
            monthsToShow === 2 ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {visibleMonths.map((monthDate) => (
            <p key={formatDateISO(monthDate)}>{formatMonthYear(monthDate)}</p>
          ))}
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="Next month"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 motion-safe:transition-colors motion-safe:duration-200 motion-safe:hover:border-slate-300 motion-safe:hover:bg-slate-50",
            focusRing,
          )}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div
        className={cn(
          "grid gap-6",
          monthsToShow === 2 ? "sm:grid-cols-2" : "grid-cols-1",
        )}
      >
        {visibleMonths.map((monthDate, index) => (
          <MonthView
            key={`${baseId}-${formatDateISO(monthDate)}`}
            monthDate={monthDate}
            mode={mode}
            startDate={startDate}
            endDate={previewEnd}
            minDate={minDate}
            today={today}
            onDayClick={handleDayClick}
            onDayHover={setHoverDate}
          />
        ))}
      </div>
    </div>
  );
}

function MonthView({
  monthDate,
  mode,
  startDate,
  endDate,
  minDate,
  today,
  onDayClick,
  onDayHover,
}: MonthViewProps) {
  const weekdayLabels = getWeekdayLabels();
  const cells = getMonthGrid(monthDate.getFullYear(), monthDate.getMonth());

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-xs font-medium uppercase tracking-wide text-slate-400"
            aria-hidden="true"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" role="grid">
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} role="presentation" />;
          }

          const iso = formatDateISO(date);
          const isDisabled = isBeforeMinDate(iso, minDate);
          const isStart = Boolean(startDate && isSameDate(iso, startDate));
          const isEnd = Boolean(endDate && isSameDate(iso, endDate));
          const inRange =
            mode === "range" &&
            startDate &&
            endDate &&
            isDateInRange(iso, startDate, endDate) &&
            !isStart &&
            !isEnd;
          const isToday = isSameDate(iso, today);
          const isSelected = isStart || isEnd;

          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              disabled={isDisabled}
              aria-label={date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              aria-selected={isSelected}
              onClick={() => onDayClick(iso)}
              onMouseEnter={() => {
                if (!isDisabled && mode === "range" && startDate && !endDate) {
                  onDayHover(iso);
                }
              }}
              onMouseLeave={() => onDayHover(null)}
              className={cn(
                "relative flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium motion-safe:transition-colors motion-safe:duration-150",
                isDisabled && "cursor-not-allowed text-slate-300",
                !isDisabled && !isSelected && !inRange && "text-slate-700 motion-safe:hover:bg-slate-100",
                inRange && "bg-brand-50 text-brand-800",
                isSelected && "bg-brand-700 text-white shadow-sm shadow-brand-200",
                isToday && !isSelected && "font-bold text-brand-700",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
