/**
 * Pure helpers for SerpAPI Google Flights → Glooconn Flight mapping.
 *
 * No I/O. No provider wiring. Safe to unit-test in isolation.
 */

import { createHash } from "node:crypto";
import type {
  SerpApiFlightOption,
  SerpApiFlightSegment,
} from "@/lib/providers/flights/serpapi/types";
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
 * Formats a SerpAPI airport `time` value to display clock time "HH:mm".
 * Accepts forms like "2026-08-01 08:15" or ISO-like strings with HH:mm.
 */
export function formatSerpApiTime(time: string | undefined): string | null {
  if (!time || typeof time !== "string") {
    return null;
  }

  const match = /(\d{2}):(\d{2})/.exec(time.trim());
  if (!match) {
    return null;
  }

  return `${match[1]}:${match[2]}`;
}

/**
 * Parses SerpAPI numeric price into a finite non-negative number.
 * Returns `null` when missing or unusable.
 */
export function mapPrice(price: number | undefined): number | null {
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return null;
  }

  return price;
}

/**
 * Resolves total journey duration in minutes.
 * Prefers `total_duration`; falls back to summing segment durations.
 */
export function mapDuration(
  option: Pick<SerpApiFlightOption, "total_duration" | "flights">,
): number | null {
  if (
    typeof option.total_duration === "number" &&
    Number.isFinite(option.total_duration) &&
    option.total_duration >= 0
  ) {
    return Math.floor(option.total_duration);
  }

  const segments = option.flights;
  if (!Array.isArray(segments) || segments.length === 0) {
    return null;
  }

  let total = 0;
  let sawDuration = false;

  for (const segment of segments) {
    if (
      typeof segment.duration === "number" &&
      Number.isFinite(segment.duration) &&
      segment.duration >= 0
    ) {
      total += Math.floor(segment.duration);
      sawDuration = true;
    }
  }

  return sawDuration ? total : null;
}

/**
 * Connection stops for a journey: segment count minus one.
 * Empty / missing segments → 0.
 */
export function mapStops(segments: SerpApiFlightSegment[] | undefined): number {
  if (!Array.isArray(segments) || segments.length === 0) {
    return 0;
  }

  return Math.max(0, segments.length - 1);
}

/**
 * Marketing airline from the first segment; falls back to "Unknown airline".
 */
export function mapAirline(segments: SerpApiFlightSegment[] | undefined): string {
  const name = segments?.[0]?.airline?.trim();
  return name && name.length > 0 ? name : "Unknown airline";
}

/**
 * Maps SerpAPI `travel_class` to a Glooconn cabin label.
 * Missing / unknown values default to "Economy".
 */
export function mapCabin(travelClass: string | undefined): string {
  if (!travelClass || typeof travelClass !== "string") {
    return "Economy";
  }

  const normalized = travelClass.trim().toLowerCase().replace(/[_-]+/g, " ");

  switch (normalized) {
    case "economy":
      return "Economy";
    case "premium economy":
      return "Premium Economy";
    case "business":
      return "Business";
    case "first":
    case "first class":
      return "First";
    default: {
      const words = normalized.split(" ").filter((part) => part.length > 0);
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

/**
 * Builds a deterministic Flight id from itinerary seed fields.
 * Stable across identical fixtures; prefixed with `serpapi-`.
 */
export function buildDeterministicFlightId(option: SerpApiFlightOption): string {
  const segmentSeed = (option.flights ?? [])
    .map((segment) =>
      [
        segment.flight_number?.trim() ?? "",
        segment.departure_airport?.id?.trim() ?? "",
        segment.departure_airport?.time?.trim() ?? "",
        segment.arrival_airport?.id?.trim() ?? "",
        segment.arrival_airport?.time?.trim() ?? "",
        segment.airline?.trim() ?? "",
      ].join("|"),
    )
    .join(";");

  const seed = [
    segmentSeed,
    String(option.price ?? ""),
    String(option.total_duration ?? ""),
    option.type?.trim() ?? "",
  ].join("::");

  const digest = createHash("sha256").update(seed).digest("hex").slice(0, 16);
  return `serpapi-${digest}`;
}
