import { getDayRangePosition } from "@/components/ui/calendar/rangePosition";
import type { TravelCalendarMode } from "@/components/ui/calendar/types";
import { isBeforeMinDate, isSameDate } from "@/lib/calendar";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

type DayCellProps = {
  date: Date;
  iso: string;
  mode: TravelCalendarMode;
  startDate: string;
  /** End date used for range highlighting (includes hover preview). */
  highlightEndDate: string;
  /** True while waiting for the second click to complete the range. */
  isSelectingEnd: boolean;
  minDate: string;
  today: string;
  onSelect: (iso: string) => void;
  onHover: (iso: string | null) => void;
};

/**
 * DayCell — one day in the travel calendar grid.
 * Handles disabled, today, selected endpoints, and in-range highlighting.
 */
export function DayCell({
  date,
  iso,
  mode,
  startDate,
  highlightEndDate,
  isSelectingEnd,
  minDate,
  today,
  onSelect,
  onHover,
}: DayCellProps) {
  const isDisabled = isBeforeMinDate(iso, minDate);
  const isToday = isSameDate(iso, today);
  const isSingleSelected =
    mode === "single" && Boolean(startDate && isSameDate(iso, startDate));
  const rangePosition = isDisabled
    ? "none"
    : mode === "range"
      ? getDayRangePosition(iso, mode, startDate, highlightEndDate)
      : "none";
  const isEndpoint =
    !isDisabled &&
    (isSingleSelected ||
      rangePosition === "start" ||
      rangePosition === "end" ||
      rangePosition === "single");
  const inRange = isEndpoint || rangePosition === "middle";

  return (
    <div
      className={cn(
        "relative p-0.5",
        rangePosition === "middle" && "bg-brand-50",
        rangePosition === "start" && "rounded-l-full bg-brand-50",
        rangePosition === "end" && "rounded-r-full bg-brand-50",
        rangePosition === "single" && "rounded-full bg-brand-50",
      )}
      role="presentation"
    >
      <button
        type="button"
        role="gridcell"
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-label={date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
        aria-selected={inRange && !isDisabled}
        tabIndex={isDisabled ? -1 : undefined}
        onClick={() => {
          if (!isDisabled) {
            onSelect(iso);
          }
        }}
        onMouseEnter={() => {
          if (!isDisabled && mode === "range" && isSelectingEnd) {
            onHover(iso);
          }
        }}
        onMouseLeave={() => onHover(null)}
        className={cn(
          "relative z-10 flex h-11 w-full touch-manipulation items-center justify-center text-sm font-medium motion-safe:transition-colors motion-safe:duration-150 sm:h-10",
          focusRing,
          isDisabled &&
            "pointer-events-none cursor-not-allowed rounded-lg bg-slate-50/80 text-slate-300 line-through decoration-slate-300/80",
          !isDisabled && !inRange && "rounded-lg text-slate-700 motion-safe:hover:bg-slate-100",
          rangePosition === "middle" && "rounded-none text-brand-800",
          isEndpoint && "rounded-full bg-brand-700 text-white shadow-sm shadow-brand-200",
          isToday && !inRange && "font-bold text-brand-700",
        )}
      >
        {date.getDate()}
      </button>
    </div>
  );
}
