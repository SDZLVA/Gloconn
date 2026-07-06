import type { TripType } from "@/types/search";
import {
  compareDates,
  formatShortDate,
  isBeforeMinDate,
  sanitizeSelectableDate,
  todayISO,
} from "@/lib/calendar";

/** Builds the trigger label for the travel dates selector. */
export function formatTravelDatesSummary(
  tripType: TripType,
  departureDate: string,
  returnDate: string,
): string {
  if (!departureDate) {
    return "Select dates";
  }

  if (tripType === "one-way") {
    return formatShortDate(departureDate);
  }

  if (returnDate) {
    return `${formatShortDate(departureDate)} — ${formatShortDate(returnDate)}`;
  }

  return `${formatShortDate(departureDate)} — Select return`;
}

/** Sanitizes departure and return — clears past or invalid dates. */
export function sanitizeTravelDates(
  departureDate: string,
  returnDate: string,
  minDate: string = todayISO(),
): { departureDate: string; returnDate: string } {
  const safeDeparture = sanitizeSelectableDate(departureDate, minDate);
  let safeReturn = sanitizeSelectableDate(returnDate, minDate);

  if (
    safeDeparture &&
    safeReturn &&
    compareDates(safeReturn, safeDeparture) < 0
  ) {
    safeReturn = "";
  }

  return { departureDate: safeDeparture, returnDate: safeReturn };
}

/** Validation messages for past departure or return dates. */
export function getPastTravelDateErrors(
  departureDate: string,
  returnDate: string,
  minDate: string = todayISO(),
): { departureDate?: string; returnDate?: string } {
  const errors: { departureDate?: string; returnDate?: string } = {};

  if (departureDate && isBeforeMinDate(departureDate, minDate)) {
    errors.departureDate = "Departure date cannot be in the past.";
  }

  if (returnDate && isBeforeMinDate(returnDate, minDate)) {
    errors.returnDate = "Return date cannot be in the past.";
  }

  return errors;
}
