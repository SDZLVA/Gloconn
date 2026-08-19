/**
 * Pure helpers for Recommended Packages UI.
 * No React — kept testable without a component harness.
 */

import type { TravelPackage } from "@/types/models/travel-package";
import type { Budget } from "@/types/models/budget";

/**
 * Task 1 (Sprint 15.3) — UI-level visible cap for recommended packages.
 * The underlying API response and composer output are not affected.
 * Exported so tests can assert consistent behavior without hard-coding the number.
 */
export const PACKAGES_INITIAL_VISIBLE = 5;

/** True when the Recommended Packages section should render. */
export function shouldShowRecommendedPackages(
  packages: readonly TravelPackage[] | null | undefined,
): boolean {
  return Array.isArray(packages) && packages.length > 0;
}

/**
 * Returns packages for display, or an empty array when none.
 * Never invents placeholders — empty means hide the section.
 */
export function selectPackagesForDisplay(
  packages: readonly TravelPackage[] | null | undefined,
): TravelPackage[] {
  if (!shouldShowRecommendedPackages(packages)) {
    return [];
  }
  return [...packages!];
}

/** Flight stops label — matches FlightResultCard copy. */
export function formatPackageStopsLabel(stops: number): string {
  if (stops === 0) {
    return "Direct";
  }
  return `${stops} stop${stops > 1 ? "s" : ""}`;
}

/**
 * Price footnote for flight result cards.
 * Matches the search trip type so one-way searches are not labeled round-trip.
 */
export function formatFlightTripPriceLabel(
  tripType: "round-trip" | "one-way" | null | undefined,
): string {
  if (tripType === "one-way") {
    return "One-way · per person";
  }
  return "Round-trip · per person";
}

/**
 * P0.2 — Qualitative package badge replacing the opaque "Match 73.4" score.
 *
 * Thresholds (score is 0–100):
 *   ≥ 80 → "Top Pick"
 *   ≥ 60 → "Good Match"
 *   < 60 → no badge (returns null — caller should hide the badge element)
 *
 * The score number is intentionally NOT shown to users.
 */
export function formatPackageQualityBadge(
  score: number,
): "Top Pick" | "Good Match" | null {
  if (!Number.isFinite(score)) return null;
  if (score >= 80) return "Top Pick";
  if (score >= 60) return "Good Match";
  return null;
}

/** Nights label for package footer. */
export function formatPackageNightsLabel(nights: number): string {
  const safe = Number.isFinite(nights) && nights >= 1 ? Math.floor(nights) : 1;
  return `${safe} night${safe === 1 ? "" : "s"}`;
}

/**
 * P0.1 — Honest package price breakdown label.
 *
 * The combined package price is NOT a guaranteed trip total:
 *   - Flight price is per person (SerpAPI returns per-person pricing).
 *   - Hotel price is for the room configuration returned (typically 1 room).
 *
 * This label makes the composition explicit so users are not misled.
 */
export function formatPackagePriceBreakdownLabel(
  nights: number,
): string {
  const nightsLabel = formatPackageNightsLabel(nights);
  return `Flight (per person) + hotel (${nightsLabel}, 1 room)`;
}

/**
 * Task 2 (Sprint 15.3) — One-line "What's included" summary for a package card.
 *
 * Format: "Flight + {N} nights at {hotelName}"
 * Keeps wording concise so it sits comfortably as a single subtitle line.
 */
export function formatPackageIncludesSummary(
  nights: number,
  hotelName: string,
): string {
  const nightsLabel = formatPackageNightsLabel(nights);
  const name = hotelName?.trim() || "hotel";
  return `Flight + ${nightsLabel} at ${name}`;
}

/**
 * Task 4 (Sprint 15.3) — Flight route label from IATA codes.
 *
 * Returns "{origin} → {destination}" when both codes are non-empty strings.
 * Returns null when either is missing — callers must omit the element entirely
 * rather than showing a placeholder or invented code.
 */
export function formatFlightRoute(
  originIata: string | null | undefined,
  destinationIata: string | null | undefined,
): string | null {
  const origin = originIata?.trim().toUpperCase();
  const dest = destinationIata?.trim().toUpperCase();
  if (!origin || !dest) return null;
  return `${origin} → ${dest}`;
}

/**
 * Task 5 (Sprint 15.3) — Detects whether a one-way search has produced a
 * hotels-domain warning. When true, the UI should show a specific message
 * explaining that hotel results require a return date, rather than a generic
 * provider-unavailable message.
 *
 * This does NOT suppress the generic warning — both can appear if relevant.
 */
export function isOneWayHotelWarning(
  tripType: string | null | undefined,
  warnings: ReadonlyArray<{ domain: string; code: string }>,
): boolean {
  if (tripType !== "one-way") return false;
  return warnings.some(
    (w) => w.domain === "hotels" && w.code === "PROVIDER_UNAVAILABLE",
  );
}

/** Copy shown when a one-way search produced no hotel results. */
export const ONE_WAY_HOTEL_WARNING_MESSAGE =
  "Hotel results require a return date. Try a round-trip search to see flights and hotels together.";

/** Copy shown when user budget does not cover any composed package. */
export const BUDGET_COMPATIBILITY_WARNING_MESSAGE =
  "Your budget may be too low for this trip. Try increasing your budget to see more suitable options.";

/**
 * Returns true when a user-set budget exists but no composed package is within it.
 *
 * Compatibility rule:
 *   - package currency must match budget currency
 *   - package totalPrice must be <= budget amount
 */
export function shouldShowBudgetCompatibilityWarning(
  budget: Budget | null | undefined,
  packages: readonly TravelPackage[] | null | undefined,
): boolean {
  if (!budget || !Number.isFinite(budget.amount) || budget.amount < 0) {
    return false;
  }
  if (!packages || packages.length === 0) {
    return false;
  }

  const matchingCurrencyPackages = packages.filter(
    (pkg) => pkg.currency === budget.currency,
  );
  if (matchingCurrencyPackages.length === 0) {
    return false;
  }

  const hasCompatiblePackage = matchingCurrencyPackages.some(
    (pkg) =>
      Number.isFinite(pkg.totalPrice) && pkg.totalPrice <= budget.amount,
  );
  return !hasCompatiblePackage;
}

/**
 * P0.3 — Hotel price footnote.
 *
 * Always states the room count explicitly (currently always 1 room,
 * as the hotels provider does not support multi-room queries yet).
 */
export function formatHotelPriceLabel(nights: number): string {
  const nightsLabel = formatPackageNightsLabel(nights);
  return `${nightsLabel} · 1 room`;
}

/**
 * P0.3 — Returns a multi-traveler room warning when the adult count
 * suggests more than 1 room may be needed (> 2 adults).
 *
 * Returns null when no warning is necessary (≤ 2 adults or count unknown).
 * Caller is responsible for rendering the warning visibly.
 */
export function getHotelRoomWarning(adults: number | null | undefined): string | null {
  if (adults == null || !Number.isFinite(adults) || adults <= 2) return null;
  return "Hotel price shown for 1 room. You may need additional rooms for your group.";
}

/**
 * P1.4 — Star display label for hotels.
 *
 * Returns a string of star characters for 1–5 stars.
 * Returns "Unrated" for 0 or invalid values rather than an empty string.
 */
export function formatHotelStarsLabel(stars: number): string {
  if (!Number.isFinite(stars) || stars < 1) return "Unrated";
  const clamped = Math.min(5, Math.floor(stars));
  return "★".repeat(clamped);
}
