/**
 * Calendar utilities — date formatting and grid helpers.
 * Import from `@/lib/calendar` in components.
 */

export {
  addMonths,
  compareDates,
  formatDateISO,
  formatMonthYear,
  formatShortDate,
  getMonthGrid,
  getWeekdayLabels,
  isBeforeMinDate,
  isDateInRange,
  isPastDate,
  isSameDate,
  parseDateISO,
  sanitizeSelectableDate,
  startOfMonth,
  todayISO,
  compareMonths,
} from "@/lib/calendar/dates";
export {
  getRangeHighlightEnd,
  getRangeSelectionPhase,
  resolveRangeDayClick,
  type RangeSelectionPhase,
} from "@/lib/calendar/rangeSelection";
