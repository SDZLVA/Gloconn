/**
 * Destination match kinds used for ranking and autocomplete grouping.
 * Derived only from existing Destination fields — no external datasets.
 */

export type DestinationMatchKind =
  | "iata-exact"
  | "iata-prefix"
  | "name-exact"
  | "name-prefix"
  | "word"
  | "contains"
  | "country"
  | "region"
  | "id"
  | "none";

/** Airport-style matches (IATA) vs city/place matches. */
export function isAirportMatchKind(kind: DestinationMatchKind): boolean {
  return kind === "iata-exact" || kind === "iata-prefix";
}
