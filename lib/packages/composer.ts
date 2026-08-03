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

/** Pre-select flights: price asc, then rating desc, then id (deterministic). */
function selectFlightCandidates(
  flights: Flight[],
  limit: number,
): Flight[] {
  const sorted = [...flights].sort((a, b) => {
    if (a.price !== b.price) {
      return a.price - b.price;
    }
    if (a.rating !== b.rating) {
      return b.rating - a.rating;
    }
    return a.id.localeCompare(b.id);
  });
  return sorted.slice(0, limit);
}

/** Pre-select hotels: price asc, then rating desc, then id (deterministic). */
function selectHotelCandidates(hotels: Hotel[], limit: number): Hotel[] {
  const sorted = [...hotels].sort((a, b) => {
    if (a.price !== b.price) {
      return a.price - b.price;
    }
    if (a.rating !== b.rating) {
      return b.rating - a.rating;
    }
    return a.id.localeCompare(b.id);
  });
  return sorted.slice(0, limit);
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
