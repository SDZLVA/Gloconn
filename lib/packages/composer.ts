/**
 * PackageComposer — pure composition of Flight[] + Hotel[] → TravelPackage[].
 *
 * No providers, HTTP, UI, or orchestrator knowledge.
 * Deterministic: same inputs always produce the same packages and scores.
 */

import {
  MAX_FLIGHT_CANDIDATES,
  MAX_HOTEL_CANDIDATES,
  MAX_PACKAGES,
} from "@/lib/packages/constants";
import { resolvePackageNights } from "@/lib/packages/nights";
import {
  buildPackageScoreContext,
  scorePackage,
  type PackageScoreInput,
} from "@/lib/packages/score";
import type { Flight } from "@/types/models/flight";
import type { Hotel } from "@/types/models/hotel";
import type { SearchRequest } from "@/types/models/search-request";
import type { TravelPackage } from "@/types/models/travel-package";

export type ComposePackagesOptions = {
  /** Override flight candidate cap (tests / future tuning). */
  maxFlightCandidates?: number;
  /** Override hotel candidate cap. */
  maxHotelCandidates?: number;
  /** Override final package cap. */
  maxPackages?: number;
};

/**
 * Builds a stable package id from flight and hotel ids.
 * Format: `pkg-{flightId}-{hotelId}`
 */
export function buildPackageId(flightId: string, hotelId: string): string {
  return `pkg-${flightId}-${hotelId}`;
}

/**
 * Composes recommended travel packages from flight and hotel results.
 *
 * Rules:
 * - Empty flights or hotels → []
 * - Currency mismatches are skipped (no FX)
 * - Candidate caps limit cartesian expansion
 * - Deterministic ordering and stable ids
 */
export function composePackages(
  flights: Flight[],
  hotels: Hotel[],
  request: SearchRequest,
  options: ComposePackagesOptions = {},
): TravelPackage[] {
  if (flights.length === 0 || hotels.length === 0) {
    return [];
  }

  const maxFlights = options.maxFlightCandidates ?? MAX_FLIGHT_CANDIDATES;
  const maxHotels = options.maxHotelCandidates ?? MAX_HOTEL_CANDIDATES;
  const maxPackages = options.maxPackages ?? MAX_PACKAGES;

  const flightCandidates = selectFlightCandidates(flights, maxFlights);
  const hotelCandidates = selectHotelCandidates(hotels, maxHotels);

  const raw: PackageScoreInput[] = [];

  for (const flight of flightCandidates) {
    for (const hotel of hotelCandidates) {
      if (flight.currency !== hotel.currency) {
        continue;
      }

      raw.push({
        flight,
        hotel,
        totalPrice: flight.price + hotel.price,
      });
    }
  }

  if (raw.length === 0) {
    return [];
  }

  const context = buildPackageScoreContext(raw, request.budget?.amount ?? null);

  const packages: TravelPackage[] = raw.map((entry) => {
    const nights = resolvePackageNights(entry.hotel.nights, request);
    const score = scorePackage(entry, context);

    return {
      id: buildPackageId(entry.flight.id, entry.hotel.id),
      flight: entry.flight,
      hotel: entry.hotel,
      flightId: entry.flight.id,
      hotelId: entry.hotel.id,
      totalPrice: entry.totalPrice,
      currency: entry.flight.currency,
      nights,
      score,
    };
  });

  packages.sort(comparePackages);

  return packages.slice(0, maxPackages);
}

/**
 * P1.7 (Sprint 15.3) — Quality-aware candidate selection.
 *
 * Previous behavior: pure price-ascending selection gave all 8 slots to the
 * cheapest options, preventing high-quality but moderately expensive candidates
 * from entering composition at all.
 *
 * New behavior: "6 + 2" split —
 *   - First (limit - QUALITY_SLOTS) slots: cheapest by price (preserves budget bias)
 *   - Remaining QUALITY_SLOTS slots: highest rating among candidates NOT already
 *     in the price window (gives quality options a guaranteed entry point)
 *
 * When limit ≤ QUALITY_SLOTS, all slots are filled by quality ranking (edge case).
 * Deduplication ensures no candidate appears twice. Order within the result set
 * is price-asc first, then quality additions — deterministic via id tiebreaker.
 */
const QUALITY_SLOTS = 2;

/** Pre-select flights using quality-aware "6 + 2" candidate selection. */
function selectFlightCandidates(
  flights: Flight[],
  limit: number,
): Flight[] {
  return selectQualityAwareCandidates(flights, limit);
}

/** Pre-select hotels using quality-aware "6 + 2" candidate selection. */
function selectHotelCandidates(hotels: Hotel[], limit: number): Hotel[] {
  return selectQualityAwareCandidates(hotels, limit);
}

/**
 * Quality-aware "N-2 + 2" candidate selection.
 *
 * - (limit - QUALITY_SLOTS) slots → cheapest by price (budget bias preserved)
 * - QUALITY_SLOTS slots → highest-rated from the remaining pool (quality diversity)
 *
 * Guarantees no duplicates. Result count equals min(items.length, limit).
 */
function selectQualityAwareCandidates<T extends { price: number; rating: number; id: string }>(
  items: T[],
  limit: number,
): T[] {
  if (items.length <= limit) {
    return [...items].sort(byPriceAscRatingDesc);
  }

  const priceSlots = Math.max(0, limit - QUALITY_SLOTS);
  const byPrice = [...items].sort(byPriceAscRatingDesc);

  // Price window: cheapest priceSlots items.
  const priceWindow = byPrice.slice(0, priceSlots);

  // Quality additions: highest-rated items NOT in the price window.
  // Since byPrice is sorted, remaining items are those beyond the price window.
  const remaining = byPrice.slice(priceSlots);
  const qualityAdditions = [...remaining]
    .sort(byRatingDescPriceAsc)
    .slice(0, QUALITY_SLOTS);

  // Sort quality additions by price for a stable, predictable final order.
  const qualityAdditionsSorted = [...qualityAdditions].sort(byPriceAscRatingDesc);

  return [...priceWindow, ...qualityAdditionsSorted];
}

function byPriceAscRatingDesc(
  a: { price: number; rating: number; id: string },
  b: { price: number; rating: number; id: string },
): number {
  if (a.price !== b.price) return a.price - b.price;
  if (a.rating !== b.rating) return b.rating - a.rating;
  return a.id.localeCompare(b.id);
}

function byRatingDescPriceAsc(
  a: { price: number; rating: number; id: string },
  b: { price: number; rating: number; id: string },
): number {
  if (a.rating !== b.rating) return b.rating - a.rating;
  if (a.price !== b.price) return a.price - b.price;
  return a.id.localeCompare(b.id);
}

/** Higher score first, then lower totalPrice, then id. */
function comparePackages(a: TravelPackage, b: TravelPackage): number {
  if (a.score !== b.score) {
    return b.score - a.score;
  }
  if (a.totalPrice !== b.totalPrice) {
    return a.totalPrice - b.totalPrice;
  }
  return a.id.localeCompare(b.id);
}
