/**
 * PackageComposer — pure composition of Flight[] + Hotel[] → TravelPackage[].
 *
 * No providers, HTTP, UI, or orchestrator knowledge.
 * Deterministic: same inputs always produce the same packages and scores.
 */

import {
  selectFlightCandidates,
  selectHotelCandidates,
  resolveScoringBudgetAmount,
} from "@/lib/packages/candidates";
import {
  comparePackagesByScore,
  selectDiversePackages,
  selectNaiveTopPackages,
} from "@/lib/packages/diversity";
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
  /**
   * When false, return score-first top N without the diversity pass.
   * Default true. Intended for validation comparisons only.
   */
  applyDiversity?: boolean;
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

  const flightCandidates = selectFlightCandidates(
    flights,
    maxFlights,
    request,
    hotels,
  );
  const hotelCandidates = selectHotelCandidates(
    hotels,
    maxHotels,
    request,
    flights,
  );

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

  const context = buildPackageScoreContext(raw, null);

  const packages: TravelPackage[] = raw.map((entry) => {
    const nights = resolvePackageNights(entry.hotel.nights, request);
    const score = scorePackage(entry, {
      ...context,
      budgetAmount: resolveScoringBudgetAmount(request, entry),
    });

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

  packages.sort(comparePackagesByScore);

  if (options.applyDiversity === false) {
    return selectNaiveTopPackages(packages, maxPackages);
  }

  return selectDiversePackages(packages, maxPackages);
}
