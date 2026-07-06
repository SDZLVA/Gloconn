import { isDateInRange, isSameDate } from "@/lib/calendar";
import type { DayRangePosition, TravelCalendarMode } from "@/components/ui/calendar/types";

/** Determines how a day sits inside a selected range for styling. */
export function getDayRangePosition(
  iso: string,
  mode: TravelCalendarMode,
  startDate: string,
  endDate: string,
): DayRangePosition {
  if (mode !== "range" || !startDate) {
    return "none";
  }

  if (!endDate) {
    return isSameDate(iso, startDate) ? "single" : "none";
  }

  if (isSameDate(iso, startDate) && isSameDate(iso, endDate)) {
    return "single";
  }

  if (isSameDate(iso, startDate)) {
    return "start";
  }

  if (isSameDate(iso, endDate)) {
    return "end";
  }

  if (isDateInRange(iso, startDate, endDate)) {
    return "middle";
  }

  return "none";
}
