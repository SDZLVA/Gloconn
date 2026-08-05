/**
 * Pure helpers for Recommended Packages UI (Sprint 13.4).
 * No React — kept testable without a component harness.
 */

import type { TravelPackage } from "@/types/models/travel-package";

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

/** Compact score label for package cards (0–100). */
export function formatPackageScoreLabel(score: number): string {
  const rounded = Math.round(score * 10) / 10;
  const display = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1);
  return `Match ${display}`;
}

/** Nights label for package footer. */
export function formatPackageNightsLabel(nights: number): string {
  const safe = Number.isFinite(nights) && nights >= 1 ? Math.floor(nights) : 1;
  return `${safe} night${safe === 1 ? "" : "s"}`;
}
