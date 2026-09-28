/**
 * Pure helpers for Milestone 18 flexible-date exploration.
 *
 * Shifts the whole trip earlier/later by 1..N days while keeping the same
 * number of nights. Does not call APIs or touch React.
 */

import {
  compareDates,
  formatDateISO,
  isBeforeMinDate,
  parseDateISO,
} from "@/lib/calendar";

/** Allowed flexible-day window sizes (0 = Exact / no alternatives). */
export type FlexDays = 0 | 1 | 2 | 3;

/** Labels for the search-form Flexible dates control. */
export const FLEX_DAYS_OPTIONS: ReadonlyArray<{
  value: FlexDays;
  label: string;
}> = [
  { value: 0, label: "Exact dates" },
  { value: 1, label: "± 1 day" },
  { value: 2, label: "± 2 days" },
  { value: 3, label: "± 3 days" },
] as const;

/**
 * Coerces any unknown value to a safe FlexDays (0–3).
 * Invalid, missing, or out-of-range values become 0 — never throws.
 * Used for URL params and API body validation.
 */
export function normalizeFlexDays(value: unknown): FlexDays {
  if (typeof value === "number" && isFlexDays(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.trim());
    if (isFlexDays(parsed)) {
      return parsed;
    }
  }

  return 0;
}

/** One alternative departure/return pair (same trip length as the original). */
export type FlexibleDatePair = {
  departureDate: string;
  /** Null for one-way trips (departure shifted only). */
  returnDate: string | null;
  /** Signed day offset from the original departure (−N … +N, never 0). */
  offsetDays: number;
};

export type BuildFlexibleDatePairsInput = {
  /** Original departure as YYYY-MM-DD. */
  departureDate: string;
  /**
   * Original return as YYYY-MM-DD, or null/empty for one-way.
   * When set, return shifts by the same offset as departure (same nights).
   */
  returnDate: string | null;
  /** How many days either side to explore (0–3). */
  flexDays: number;
  /**
   * "Today" as YYYY-MM-DD — injectable so tests control which past dates
   * get skipped without depending on the real clock.
   */
  today: string;
};

/**
 * True when `value` is an integer FlexDays (0, 1, 2, or 3).
 */
export function isFlexDays(value: number): value is FlexDays {
  return Number.isInteger(value) && value >= 0 && value <= 3;
}

/**
 * Adds (or subtracts) whole calendar days to a YYYY-MM-DD string.
 * Uses local Date arithmetic so month ends and leap years stay correct.
 * Returns null when the input is not a valid calendar date.
 */
function addCalendarDays(iso: string, days: number): string | null {
  const date = parseDateISO(iso);
  if (!date) {
    return null;
  }

  date.setDate(date.getDate() + days);
  return formatDateISO(date);
}

/**
 * Builds alternative date pairs for flexible search (±flexDays).
 *
 * Rules:
 * - Offset 0 (original dates) is never included — callers already have those.
 * - Order is closest first: −1, +1, −2, +2, … up to ±flexDays.
 * - Pairs whose departure is before `today` are skipped.
 * - One-way (`returnDate` null/empty): only departure moves.
 * - Round-trip: departure and return both move by the same offset.
 *
 * Invalid `flexDays` (not an integer 0–3) throws — we choose throw over clamp
 * so a bad caller value fails loudly instead of silently becoming ±3.
 * Invalid ISO dates yield an empty list (safe for bad user data).
 */
export function buildFlexibleDatePairs(
  input: BuildFlexibleDatePairsInput,
): FlexibleDatePair[] {
  const { departureDate, returnDate, flexDays, today } = input;

  if (!isFlexDays(flexDays)) {
    throw new RangeError(
      `flexDays must be an integer 0–3 (got ${String(flexDays)}).`,
    );
  }

  if (flexDays === 0) {
    return [];
  }

  if (!parseDateISO(departureDate) || !parseDateISO(today)) {
    return [];
  }

  const trimmedReturn = returnDate?.trim() ?? "";
  const isOneWay = trimmedReturn.length === 0;

  if (!isOneWay && !parseDateISO(trimmedReturn)) {
    return [];
  }

  // Round-trip: return must not be before departure on the original trip.
  if (!isOneWay && compareDates(trimmedReturn, departureDate) < 0) {
    return [];
  }

  const pairs: FlexibleDatePair[] = [];

  for (let magnitude = 1; magnitude <= flexDays; magnitude += 1) {
    // Closest first: try −magnitude, then +magnitude.
    for (const offsetDays of [-magnitude, magnitude]) {
      const shiftedDeparture = addCalendarDays(departureDate, offsetDays);
      if (!shiftedDeparture) {
        continue;
      }

      // Never offer a trip that starts in the past.
      if (isBeforeMinDate(shiftedDeparture, today)) {
        continue;
      }

      if (isOneWay) {
        pairs.push({
          departureDate: shiftedDeparture,
          returnDate: null,
          offsetDays,
        });
        continue;
      }

      const shiftedReturn = addCalendarDays(trimmedReturn, offsetDays);
      if (!shiftedReturn) {
        continue;
      }

      pairs.push({
        departureDate: shiftedDeparture,
        returnDate: shiftedReturn,
        offsetDays,
      });
    }
  }

  return pairs;
}
