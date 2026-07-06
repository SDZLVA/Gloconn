import { DayCell } from "@/components/ui/calendar/DayCell";
import type { TravelCalendarMode } from "@/components/ui/calendar/types";
import { formatDateISO, getMonthGrid, getWeekdayLabels } from "@/lib/calendar";

type MonthViewProps = {
  monthDate: Date;
  mode: TravelCalendarMode;
  startDate: string;
  highlightEndDate: string;
  isSelectingEnd: boolean;
  minDate: string;
  today: string;
  onDayClick: (iso: string) => void;
  onDayHover: (iso: string | null) => void;
};

/** MonthView — weekday headers and a 6-row day grid for one month. */
export function MonthView({
  monthDate,
  mode,
  startDate,
  highlightEndDate,
  isSelectingEnd,
  minDate,
  today,
  onDayClick,
  onDayHover,
}: MonthViewProps) {
  const weekdayLabels = getWeekdayLabels();
  const cells = getMonthGrid(monthDate.getFullYear(), monthDate.getMonth());
  const monthLabel = formatDateISO(monthDate);

  return (
    <div aria-label={monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}>
      <div className="mb-2 grid grid-cols-7 gap-0.5">
        {weekdayLabels.map((label) => (
          <div
            key={`${monthLabel}-${label}`}
            className="py-1 text-center text-xs font-medium uppercase tracking-wide text-slate-400"
            aria-hidden="true"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5" role="grid">
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`${monthLabel}-empty-${index}`} role="presentation" />;
          }

          const iso = formatDateISO(date);

          return (
            <DayCell
              key={iso}
              date={date}
              iso={iso}
              mode={mode}
              startDate={startDate}
              highlightEndDate={highlightEndDate}
              isSelectingEnd={isSelectingEnd}
              minDate={minDate}
              today={today}
              onSelect={onDayClick}
              onHover={onDayHover}
            />
          );
        })}
      </div>
    </div>
  );
}
