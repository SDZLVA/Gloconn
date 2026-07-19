/**
 * Pure helpers for Amadeus → Glooconn Flight mapping.
 *
 * No I/O. No provider wiring. Safe to unit-test in isolation.
 */

import type {
  AmadeusDictionaries,
  AmadeusFlightSegment,
} from "@/lib/providers/flights/amadeus/types";
import type { CurrencyCode } from "@/types/models/currency";

/** Currency codes accepted by the Glooconn `Flight` model. */
const SUPPORTED_CURRENCY_CODES = new Set<string>([
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "JPY",
  "AUD",
  "CAD",
]);

export type CurrencyValidationResult =
  | { ok: true; currency: CurrencyCode }
  | { ok: false; received: string | undefined };

/**
 * Parses an Amadeus ISO-8601 duration (e.g. "PT2H10M", "PT45M", "P1DT3H")
 * into total minutes. Returns `null` when the value is missing or unparseable.
 */
export function parseDuration(isoDuration: string | undefined): number | null {
  if (!isoDuration || typeof isoDuration !== "string") {
    return null;
  }

  const trimmed = isoDuration.trim().toUpperCase();
  if (!trimmed.startsWith("P")) {
    return null;
  }

  // Amadeus uses forms like PT2H10M or P1DT2H10M (days + time).
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(
    trimmed,
  );
  if (!match) {
    return null;
  }

  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  const seconds = Number(match[4] ?? 0);

  if (
    !Number.isFinite(days) ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    !Number.isFinite(seconds)
  ) {
    return null;
  }

  // Require at least one duration component so bare "P" / "PT" are rejected.
  if (
    match[1] === undefined &&
    match[2] === undefined &&
    match[3] === undefined &&
    match[4] === undefined
  ) {
    return null;
  }

  return days * 24 * 60 + hours * 60 + minutes + Math.floor(seconds / 60);
}

/**
 * Formats an Amadeus endpoint `at` value to a display clock time "HH:mm".
 * Uses the literal clock digits from the string (timezone-independent).
 * Returns `null` when the value cannot be read safely.
 */
export function formatTime(at: string | undefined): string | null {
  if (!at || typeof at !== "string") {
    return null;
  }

  const match = /(\d{2}):(\d{2})/.exec(at.trim());
  if (!match) {
    return null;
  }

  return `${match[1]}:${match[2]}`;
}

/**
 * Connection stops for a journey: segment count minus one.
 * Empty / missing segments → 0.
 */
export function calculateStops(
  segments: AmadeusFlightSegment[] | undefined,
): number {
  if (!Array.isArray(segments) || segments.length === 0) {
    return 0;
  }

  return Math.max(0, segments.length - 1);
}

/**
 * Resolves a display airline name from carrier codes + dictionaries.
 * Prefers dictionary name, then raw code, then validating-airline fallback.
 */
export function mapAirline(options: {
  carrierCode?: string;
  validatingAirlineCodes?: string[];
  dictionaries?: AmadeusDictionaries;
}): string {
  const carriers = options.dictionaries?.carriers;
  const primary = options.carrierCode?.trim();

  if (primary) {
    const named = carriers?.[primary]?.trim();
    return named && named.length > 0 ? named : primary;
  }

  const fallbackCode = options.validatingAirlineCodes?.find(
    (code) => typeof code === "string" && code.trim().length > 0,
  )?.trim();

  if (fallbackCode) {
    const named = carriers?.[fallbackCode]?.trim();
    return named && named.length > 0 ? named : fallbackCode;
  }

  return "Unknown airline";
}

/**
 * Maps an Amadeus cabin enum to a Glooconn display label.
 * Missing / unknown values default to "Economy".
 */
export function mapCabin(cabin: string | undefined): string {
  if (!cabin || typeof cabin !== "string") {
    return "Economy";
  }

  const normalized = cabin.trim().toUpperCase().replace(/[\s-]+/g, "_");

  switch (normalized) {
    case "ECONOMY":
      return "Economy";
    case "PREMIUM_ECONOMY":
      return "Premium Economy";
    case "BUSINESS":
      return "Business";
    case "FIRST":
      return "First";
    default: {
      // Title-case unknown tokens rather than inventing a cabin.
      const words = normalized
        .toLowerCase()
        .split("_")
        .filter((part) => part.length > 0);
      if (words.length === 0) {
        return "Economy";
      }
      return words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }
}

/**
 * Parses Amadeus price `total` (decimal string) into a finite number.
 * Returns `null` when missing, empty, or not a usable number.
 */
export function parsePrice(total: string | undefined): number | null {
  if (total === undefined || total === null) {
    return null;
  }

  if (typeof total !== "string") {
    return null;
  }

  const trimmed = total.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  return value;
}

/**
 * Validates that a currency string is representable as Glooconn `CurrencyCode`.
 * Does not invent a fallback — callers must surface `{ ok: false }` as an error.
 */
export function validateCurrency(
  currency: string | undefined,
): CurrencyValidationResult {
  if (currency === undefined || currency === null) {
    return { ok: false, received: undefined };
  }

  if (typeof currency !== "string") {
    return { ok: false, received: undefined };
  }

  const normalized = currency.trim().toUpperCase();
  if (!SUPPORTED_CURRENCY_CODES.has(normalized)) {
    return { ok: false, received: currency };
  }

  return { ok: true, currency: normalized as CurrencyCode };
}
