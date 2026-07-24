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

/**
 * Default currency when the search request has no budget currency.
 * SerpAPI defaults to USD; Glooconn prefers EUR for EU-first development.
 */
export const DEFAULT_SERPAPI_CURRENCY: CurrencyCode = "EUR";

export type CurrencyValidationResult =
  | { ok: true; currency: CurrencyCode }
  | { ok: false; received: string | undefined };

/**
 * Formats a SerpAPI airport `time` for the `Flight` model.
 *
 * Preserves complete local date-time when SerpAPI sends `YYYY-MM-DD HH:mm`
 * (Sprint 11.2 — live validation showed times like `"2026-09-15 06:30"`).
 * Compatible with `Flight.departureTime` / `arrivalTime` which already allow
 * ISO 8601 or localized display strings — no shared model change.
 *
 * Falls back to `HH:mm` when only a clock time is available.
 */
export function formatSerpApiDateTime(time: string | undefined): string | null {
  if (!time || typeof time !== "string") {
    return null;
  }

  const trimmed = time.trim();
  if (!trimmed) {
    return null;
  }

  const dateTimeMatch =
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})(?::\d{2})?/.exec(trimmed);
  if (dateTimeMatch) {
    return `${dateTimeMatch[1]} ${dateTimeMatch[2]}:${dateTimeMatch[3]}`;
  }

  const clockMatch = /(\d{2}):(\d{2})/.exec(trimmed);
  if (!clockMatch) {
    return null;
  }

  return `${clockMatch[1]}:${clockMatch[2]}`;
}

/**
 * @deprecated Prefer `formatSerpApiDateTime` — alias retained for existing imports.
 */
export function formatSerpApiTime(time: string | undefined): string | null {
  return formatSerpApiDateTime(time);
}

/**
 * Parses SerpAPI price into a finite non-negative number.
 * Accepts numbers or numeric strings (live payloads are usually numbers).
 */
export function mapPrice(price: number | string | undefined): number | null {
  if (typeof price === "number") {
    if (!Number.isFinite(price) || price < 0) {
      return null;
    }
    return price;
  }

  if (typeof price === "string") {
    const normalized = price.trim().replace(/,/g, "");
    if (!normalized) {
      return null;
    }
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return null;
    }
    return parsed;
  }

  return null;
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
 * Resolves currency for mapped flights with ordered fallbacks (Sprint 11.2):
 * 1. Response `search_parameters.currency`
 * 2. Request / caller fallback (budget currency)
 * 3. `DEFAULT_SERPAPI_CURRENCY` (EUR)
 *
 * Returns `{ ok: false }` only when a candidate is present but unsupported
 * (e.g. SEK) — missing currency falls through to EUR.
 */
export function resolveFlightCurrency(options: {
  responseCurrency?: string;
  requestCurrency?: string;
}): CurrencyValidationResult {
  const responseResult = validateCurrency(options.responseCurrency);
  if (responseResult.ok) {
    return responseResult;
  }

  // Explicit unsupported code on the response must not be silently replaced.
  if (
    options.responseCurrency !== undefined &&
    options.responseCurrency.trim() !== "" &&
    !responseResult.ok
  ) {
    return responseResult;
  }

  const requestResult = validateCurrency(options.requestCurrency);
  if (requestResult.ok) {
    return requestResult;
  }

  if (
    options.requestCurrency !== undefined &&
    options.requestCurrency.trim() !== "" &&
    !requestResult.ok
  ) {
    return requestResult;
  }

  return validateCurrency(DEFAULT_SERPAPI_CURRENCY);
}

/**
 * Builds a deterministic Flight id from itinerary seed fields.
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

/**
 * Deterministic id for an outbound + return package (round-trip).
 */
export function buildRoundTripFlightId(
  outbound: SerpApiFlightOption,
  returnOption: SerpApiFlightOption,
): string {
  const seed = [
    buildDeterministicFlightId(outbound),
    buildDeterministicFlightId(returnOption),
    outbound.departure_token?.trim() ?? "",
  ].join("::rt::");

  const digest = createHash("sha256").update(seed).digest("hex").slice(0, 16);
  return `serpapi-rt-${digest}`;
}
