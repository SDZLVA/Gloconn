/**
 * Client-safe hotel projection helpers (Sprint 17.2).
 *
 * `providerPropertyRef` is opaque and must never be rendered.
 * These helpers keep UI / tests from accidentally leaking internals.
 */

import type { Hotel } from "@/types/models/hotel";

const INTERNAL_HOTEL_KEYS = ["providerPropertyRef"] as const;

/**
 * True when a string looks like a raw SerpAPI property token
 * Recognizes common SerpAPI property_token shapes
 * (base64-ish Google Hotels tokens), not our opaque `gpref-` / `gpref1.` refs.
 */
export function looksLikeRawSerpApiPropertyToken(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("gpref")) {
    return false;
  }
  // Typical SerpAPI tokens: Ch… / Cho… / Chk… / Cgs… base64-ish payloads.
  return /^(Ch[a-zA-Z0-9_-]{8,}|Cgo[a-zA-Z0-9_-]{8,}|Cgs[a-zA-Z0-9_-]{8,})/.test(
    trimmed,
  );
}

/**
 * Returns hotel fields safe to surface in UI copy/tests.
 * Omits opaque provider refs and never invents values.
 */
export function getHotelPublicFields(hotel: Hotel): Omit<
  Hotel,
  "providerPropertyRef"
> {
  const { providerPropertyRef: _ref, ...publicFields } = hotel;
  return publicFields;
}

/** Keys that must never appear as visible UI text from hotel internals. */
export function getHotelInternalFieldNames(): readonly string[] {
  return INTERNAL_HOTEL_KEYS;
}
