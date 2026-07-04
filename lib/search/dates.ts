import type { TripType } from "@/types/search";
import { formatShortDate } from "@/lib/calendar";

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
