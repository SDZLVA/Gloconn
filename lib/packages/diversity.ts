/**
 * Sprint 16.3 — deterministic diversity selection over scored packages.
 *
 * Applied after scoring, before returning TravelPackage[] from PackageComposer.
 * Preserves the top-scoring package; subsequent slots balance score with variety.
 */

import type { TravelPackage } from "@/types/models/travel-package";

/** Max times the same flight may appear in a diversified result set. */
export const DIVERSITY_MAX_FLIGHT_REPEAT = 2;

/** Max times the same hotel may appear in a diversified result set. */
export const DIVERSITY_MAX_HOTEL_REPEAT = 2;

/** Target unique flights in the first top-N window when the pool allows it. */
export const DIVERSITY_TARGET_UNIQUE_FLIGHTS = 3;

/** Target unique hotels in the first top-N window when the pool allows it. */
export const DIVERSITY_TARGET_UNIQUE_HOTELS = 4;

/** Window size used for diversity targets (UI shows 5 initially). */
export const DIVERSITY_TOP_N = 5;

export type DiversityMetrics = {
  count: number;
  uniqueFlights: number;
  uniqueHotels: number;
  maxFlightRepeat: number;
  maxHotelRepeat: number;
  scoreRange: [number, number];
};

type DiversityPickContext = {
  inTopN: boolean;
  uniqueFlightsSoFar: number;
  uniqueHotelsSoFar: number;
  targetFlights: number;
  targetHotels: number;
  selectedFlightIds: ReadonlySet<string>;
  selectedHotelIds: ReadonlySet<string>;
};

/** Primary score sort: higher score, lower price, id ascending. */
export function comparePackagesByScore(
  a: TravelPackage,
  b: TravelPackage,
): number {
  if (a.score !== b.score) {
    return b.score - a.score;
  }
  if (a.totalPrice !== b.totalPrice) {
    return a.totalPrice - b.totalPrice;
  }
  return a.id.localeCompare(b.id);
}

/**
 * Greedy diversity selection from an unscored or pre-sorted package list.
 *
 * 1. Sort by score (desc), price (asc), id.
 * 2. Drop exact duplicate package ids (same flightId + hotelId).
 * 3. Greedily fill up to `limit`, preferring new hotels/flights within repeat caps.
 *
 * When the pool lacks enough unique flights/hotels, targets shrink automatically.
 */
export function selectDiversePackages(
  packages: TravelPackage[],
  limit: number,
): TravelPackage[] {
  if (packages.length === 0 || limit <= 0) {
    return [];
  }

  const deduped = dedupePackagesById([...packages].sort(comparePackagesByScore));
  if (deduped.length === 0) {
    return [];
  }

  const poolFlightCount = new Set(deduped.map((p) => p.flightId)).size;
  const poolHotelCount = new Set(deduped.map((p) => p.hotelId)).size;

  const effectiveLimit = Math.min(limit, deduped.length);
  const maxFlightRepeat = effectiveRepeatCap(
    poolFlightCount,
    effectiveLimit,
    DIVERSITY_MAX_FLIGHT_REPEAT,
  );
  const maxHotelRepeat = effectiveRepeatCap(
    poolHotelCount,
    effectiveLimit,
    DIVERSITY_MAX_HOTEL_REPEAT,
  );

  const targetFlights = Math.min(
    DIVERSITY_TARGET_UNIQUE_FLIGHTS,
    poolFlightCount,
  );
  const targetHotels = Math.min(
    DIVERSITY_TARGET_UNIQUE_HOTELS,
    poolHotelCount,
  );

  const selected: TravelPackage[] = [];
  const remaining = [...deduped];
  const flightCounts = new Map<string, number>();
  const hotelCounts = new Map<string, number>();

  while (selected.length < effectiveLimit && remaining.length > 0) {
    const position = selected.length;
    const selectedFlightIds = new Set(selected.map((p) => p.flightId));
    const selectedHotelIds = new Set(selected.map((p) => p.hotelId));

    const ctx: DiversityPickContext = {
      inTopN: position < DIVERSITY_TOP_N,
      uniqueFlightsSoFar: selectedFlightIds.size,
      uniqueHotelsSoFar: selectedHotelIds.size,
      targetFlights,
      targetHotels,
      selectedFlightIds,
      selectedHotelIds,
    };

    const eligible = remaining.filter((pkg) =>
      isWithinRepeatCaps(
        pkg,
        flightCounts,
        hotelCounts,
        maxFlightRepeat,
        maxHotelRepeat,
      ),
    );

    if (eligible.length === 0) {
      break;
    }

    const pick = pickBestDiverseCandidate(eligible, ctx);

    selected.push(pick);
    flightCounts.set(pick.flightId, (flightCounts.get(pick.flightId) ?? 0) + 1);
    hotelCounts.set(pick.hotelId, (hotelCounts.get(pick.hotelId) ?? 0) + 1);

    const removeIndex = remaining.findIndex((p) => p.id === pick.id);
    remaining.splice(removeIndex, 1);
  }

  return selected;
}

/** Summarizes diversity metrics for the first `n` packages. */
export function measureDiversityMetrics(
  packages: readonly TravelPackage[],
  n: number,
): DiversityMetrics {
  const slice = packages.slice(0, n);
  const flightCounts = new Map<string, number>();
  const hotelCounts = new Map<string, number>();

  for (const pkg of slice) {
    flightCounts.set(pkg.flightId, (flightCounts.get(pkg.flightId) ?? 0) + 1);
    hotelCounts.set(pkg.hotelId, (hotelCounts.get(pkg.hotelId) ?? 0) + 1);
  }

  const scores = slice.map((p) => p.score);

  return {
    count: slice.length,
    uniqueFlights: flightCounts.size,
    uniqueHotels: hotelCounts.size,
    maxFlightRepeat: maxMapValue(flightCounts),
    maxHotelRepeat: maxMapValue(hotelCounts),
    scoreRange:
      scores.length > 0
        ? [Math.min(...scores), Math.max(...scores)]
        : [0, 0],
  };
}

/**
 * Returns the naive score-first top N (deduped by package id) for comparison.
 */
export function selectNaiveTopPackages(
  packages: TravelPackage[],
  limit: number,
): TravelPackage[] {
  return dedupePackagesById([...packages].sort(comparePackagesByScore)).slice(
    0,
    limit,
  );
}

function dedupePackagesById(packages: TravelPackage[]): TravelPackage[] {
  const seen = new Set<string>();
  const result: TravelPackage[] = [];

  for (const pkg of packages) {
    if (seen.has(pkg.id)) {
      continue;
    }
    seen.add(pkg.id);
    result.push(pkg);
  }

  return result;
}

function isWithinRepeatCaps(
  pkg: TravelPackage,
  flightCounts: Map<string, number>,
  hotelCounts: Map<string, number>,
  maxFlightRepeat: number,
  maxHotelRepeat: number,
): boolean {
  const flightUsed = flightCounts.get(pkg.flightId) ?? 0;
  const hotelUsed = hotelCounts.get(pkg.hotelId) ?? 0;
  return flightUsed < maxFlightRepeat && hotelUsed < maxHotelRepeat;
}

/**
 * Scales repetition caps when the pool cannot fill the result set at the default cap.
 * Single-flight or single-hotel pools may repeat up to the selection limit.
 */
function effectiveRepeatCap(
  poolUniqueCount: number,
  limit: number,
  defaultCap: number,
): number {
  if (poolUniqueCount <= 1) {
    return limit;
  }

  const maxAtDefaultCap = poolUniqueCount * defaultCap;
  if (maxAtDefaultCap < limit) {
    return Math.ceil(limit / poolUniqueCount);
  }

  return defaultCap;
}

function pickBestDiverseCandidate(
  eligible: TravelPackage[],
  ctx: DiversityPickContext,
): TravelPackage {
  const ranked = [...eligible].sort((a, b) =>
    compareDiversityPreference(a, b, ctx),
  );
  return ranked[0]!;
}

function compareDiversityPreference(
  a: TravelPackage,
  b: TravelPackage,
  ctx: DiversityPickContext,
): number {
  const aNewHotel = !ctx.selectedHotelIds.has(a.hotelId);
  const bNewHotel = !ctx.selectedHotelIds.has(b.hotelId);
  const aNewFlight = !ctx.selectedFlightIds.has(a.flightId);
  const bNewFlight = !ctx.selectedFlightIds.has(b.flightId);

  if (ctx.inTopN) {
    const needHotels = ctx.uniqueHotelsSoFar < ctx.targetHotels;
    const needFlights = ctx.uniqueFlightsSoFar < ctx.targetFlights;

    if (needHotels && aNewHotel !== bNewHotel) {
      return aNewHotel ? -1 : 1;
    }
    if (needFlights && aNewFlight !== bNewFlight) {
      return aNewFlight ? -1 : 1;
    }
  }

  if (aNewHotel !== bNewHotel) {
    return aNewHotel ? -1 : 1;
  }
  if (aNewFlight !== bNewFlight) {
    return aNewFlight ? -1 : 1;
  }

  return comparePackagesByScore(a, b);
}

function maxMapValue(counts: Map<string, number>): number {
  if (counts.size === 0) {
    return 0;
  }
  return Math.max(...counts.values());
}
