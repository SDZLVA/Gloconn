import { compareDates, isBeforeMinDate } from "@/lib/calendar";

export type RangeSelectionPhase = "idle" | "selecting-end" | "complete";

/** Where the user is in a two-click range selection flow. */
export function getRangeSelectionPhase(
  startDate: string,
  endDate: string,
): RangeSelectionPhase {
  if (!startDate) {
    return "idle";
  }

  if (!endDate) {
    return "selecting-end";
  }

  return "complete";
}

/**
 * End date used for range highlighting — committed end, or hover preview
 * while the user is picking a return date.
 */
export function getRangeHighlightEnd(
  startDate: string,
  committedEndDate: string,
  hoverDate: string | null,
  minDate: string,
): string {
  if (committedEndDate) {
    return committedEndDate;
  }

  if (!startDate || !hoverDate || isBeforeMinDate(hoverDate, minDate)) {
    return "";
  }

  if (compareDates(hoverDate, startDate) >= 0) {
    return hoverDate;
  }

  return "";
}

/** Resolves the next start/end after a day click in range mode. */
export function resolveRangeDayClick(
  iso: string,
  startDate: string,
  endDate: string,
): { startDate: string; endDate: string } {
  if (!startDate || endDate) {
    return { startDate: iso, endDate: "" };
  }

  if (compareDates(iso, startDate) < 0) {
    return { startDate: iso, endDate: "" };
  }

  return { startDate, endDate: iso };
}
