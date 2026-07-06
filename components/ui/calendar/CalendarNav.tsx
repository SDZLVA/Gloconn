import { formatDateISO, formatMonthYear } from "@/lib/calendar";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

type CalendarNavProps = {
  visibleMonths: Date[];
  /** When true, only the first month title shows below `sm` (paired with stacked month grids). */
  stackMonthsOnMobile?: boolean;
  canGoPrevious: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

/** CalendarNav — previous/next month controls and month headings. */
export function CalendarNav({
  visibleMonths,
  stackMonthsOnMobile = false,
  canGoPrevious,
  onPrevious,
  onNext,
}: CalendarNavProps) {
  const columnCount = visibleMonths.length;
  const useResponsiveHeaders = stackMonthsOnMobile && columnCount === 2;

  return (
    <div className="mb-3 flex items-center justify-between gap-1 sm:mb-4 sm:gap-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        aria-label="Previous month"
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-lg motion-safe:transition-colors motion-safe:duration-200 sm:h-9 sm:w-9",
          focusRing,
          canGoPrevious
            ? "border-slate-200 bg-white text-slate-600 motion-safe:hover:border-slate-300 motion-safe:hover:bg-slate-50"
            : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300",
        )}
      >
        <span aria-hidden="true">‹</span>
      </button>

      <div
        className={cn(
          "grid min-w-0 flex-1 gap-2 text-center text-sm font-semibold text-slate-800 sm:gap-4",
          useResponsiveHeaders
            ? "grid-cols-1 sm:grid-cols-2"
            : columnCount === 2
              ? "grid-cols-2"
              : "grid-cols-1",
        )}
      >
        {visibleMonths.map((monthDate, index) => (
          <p
            key={formatDateISO(monthDate)}
            className={cn(
              useResponsiveHeaders && index === 1 && "hidden sm:block",
            )}
          >
            {formatMonthYear(monthDate)}
          </p>
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label="Next month"
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-600 motion-safe:transition-colors motion-safe:duration-200 motion-safe:hover:border-slate-300 motion-safe:hover:bg-slate-50 sm:h-9 sm:w-9",
          focusRing,
        )}
      >
        <span aria-hidden="true">›</span>
      </button>
    </div>
  );
}
