/**
 * Date helpers for the travel calendar.
 * All dates use local timezone and YYYY-MM-DD strings (same as HTML date inputs).
 */

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Formats a Date as YYYY-MM-DD in local time. */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parses YYYY-MM-DD into a local Date, or null when invalid. */
export function parseDateISO(iso: string): Date | null {
  const match = ISO_DATE_PATTERN.exec(iso);
  if (!match) {
    return null;
  }

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );

  return formatDateISO(date) === iso ? date : null;
}

/** Today's date as YYYY-MM-DD. */
export function todayISO(): string {
  return formatDateISO(new Date());
}

/** Compares two ISO date strings. Returns negative when a < b. */
export function compareDates(a: string, b: string): number {
  return a.localeCompare(b);
}

/** Returns true when the date is strictly before minDate. */
export function isBeforeMinDate(date: string, minDate: string): boolean {
  return compareDates(date, minDate) < 0;
}

/** Returns true when the date is before today (not selectable). */
export function isPastDate(date: string, minDate: string = todayISO()): boolean {
  return isBeforeMinDate(date, minDate);
}

/** Drops invalid or past dates; returns an empty string when not selectable. */
export function sanitizeSelectableDate(
  date: string,
  minDate: string = todayISO(),
): string {
  if (!date || isBeforeMinDate(date, minDate)) {
    return "";
  }

  return date;
}

/** Compares two months (year + month only). Negative when a is before b. */
export function compareMonths(a: Date, b: Date): number {
  const aKey = a.getFullYear() * 12 + a.getMonth();
  const bKey = b.getFullYear() * 12 + b.getMonth();
  return aKey - bKey;
}

/** Returns true when date falls between start and end (inclusive). */
export function isDateInRange(
  date: string,
  start: string,
  end: string,
): boolean {
  return compareDates(date, start) >= 0 && compareDates(date, end) <= 0;
}

/** Returns true when two ISO strings refer to the same calendar day. */
export function isSameDate(a: string, b: string): boolean {
  return a === b;
}

/** First day of the month containing the given date. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Adds months to a date and returns the first day of that month. */
export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

/** Short weekday headers for the calendar grid (Sunday first). */
export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

/**
 * Builds a 6-row calendar grid for a month.
 * Each cell is a Date or null (padding before the 1st).
 */
export function getMonthGrid(year: number, month: number): Array<Date | null> {
  const firstDay = new Date(year, month, 1);
  const leadingEmpty = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let index = 0; index < leadingEmpty; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

/** Formats a month heading, e.g. "July 2026". */
export function formatMonthYear(date: Date): string {
  return MONTH_YEAR_FORMATTER.format(date);
}

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/** Short display date, e.g. "Jul 4". */
export function formatShortDate(iso: string): string {
  const date = parseDateISO(iso);
  return date ? SHORT_DATE_FORMATTER.format(date) : "";
}
