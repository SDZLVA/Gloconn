/**
 * Stay-length helpers for package composition.
 * Pure — no provider or calendar side effects beyond date parsing.
 */

import type { SearchRequest } from "@/types/models/search-request";

const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * UTC calendar nights between YYYY-MM-DD check-in and check-out.
 * Returns null when dates are invalid or checkout is not after check-in.
 */
export function computeNightsBetween(
  checkInDate: string,
  checkOutDate: string,
): number | null {
  const checkIn = parseIsoDateOnlyUtc(checkInDate);
  const checkOut = parseIsoDateOnlyUtc(checkOutDate);
  if (!checkIn || !checkOut) {
    return null;
  }

  const diffMs = checkOut.getTime() - checkIn.getTime();
  const nights = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (nights < 1) {
    return null;
  }

  return nights;
}

/**
 * Resolves package nights from hotel quote first, then search dates, else 1.
 */
export function resolvePackageNights(
  hotelNights: number,
  request: SearchRequest,
): number {
  if (Number.isFinite(hotelNights) && hotelNights >= 1) {
    return Math.floor(hotelNights);
  }

  if (request.returnDate) {
    const fromDates = computeNightsBetween(
      request.departureDate,
      request.returnDate,
    );
    if (fromDates != null) {
      return fromDates;
    }
  }

  return 1;
}

function parseIsoDateOnlyUtc(value: string): Date | null {
  const trimmed = value.trim();
  const match = ISO_DATE_ONLY.exec(trimmed);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}
