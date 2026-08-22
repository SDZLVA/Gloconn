/**
 * Sprint 16.2 — deterministic flight/hotel candidate selection for PackageComposer.
 *
 * Flight quality slots use stops + duration (never Flight.rating — SerpAPI is always 0).
 * Hotel quality slots use stars + guest rating + price (not rating alone).
 * Budget nudges quality-slot ordering when budget currency matches pair currency.
 */

import type { Flight } from "@/types/models/flight";
import type { Hotel } from "@/types/models/hotel";
import type { SearchRequest } from "@/types/models/search-request";
import type { PackageScoreInput } from "@/lib/packages/score";

/** Quality slots reserved beyond the cheapest price window (6 + 2 when cap is 8). */
export const QUALITY_SLOTS = 2;

type CandidateBudgetContext = {
  amount: number | null;
  currency: string | null;
  /** When true, `amount` may influence quality-slot ordering. */
  appliesToSelection: boolean;
};

/**
 * Builds budget context for candidate selection.
 *
 * - No budget / non-positive amount → selection ignores budget.
 * - Budget currency must match at least one flight+hotel currency pair;
 *   otherwise numeric amounts are not compared (same rule as scoring).
 */
export function buildCandidateBudgetContext(
  request: SearchRequest,
  flights: Flight[],
  hotels: Hotel[],
): CandidateBudgetContext {
  const budget = request.budget;
  if (!budget || !Number.isFinite(budget.amount) || budget.amount <= 0) {
    return { amount: null, currency: null, appliesToSelection: false };
  }

  const minHotelPriceByCurrency = minPriceByCurrency(hotels);
  const canApply = flights.some(
    (f) =>
      f.currency === budget.currency &&
      minHotelPriceByCurrency.has(f.currency),
  );

  return {
    amount: budget.amount,
    currency: budget.currency,
    appliesToSelection: canApply,
  };
}

/**
 * Budget amount passed into scoring for one package candidate.
 * Returns null when budget is missing, invalid, or currency mismatches the pair.
 */
export function resolveScoringBudgetAmount(
  request: SearchRequest,
  entry: PackageScoreInput,
): number | null {
  const budget = request.budget;
  if (!budget || !Number.isFinite(budget.amount) || budget.amount <= 0) {
    return null;
  }
  if (entry.flight.currency !== budget.currency) {
    return null;
  }
  return budget.amount;
}

/** Pre-select flights: cheapest window + convenience quality slots. */
export function selectFlightCandidates(
  flights: Flight[],
  limit: number,
  request: SearchRequest,
  hotels: Hotel[],
): Flight[] {
  const budgetCtx = buildCandidateBudgetContext(request, flights, hotels);
  const minHotelPriceByCurrency = minPriceByCurrency(hotels);

  return selectSplitCandidates(
    flights,
    limit,
    QUALITY_SLOTS,
    (a, b) => byPriceAscFlight(a, b),
    (a, b) =>
      compareBudgetFitFirst(
        a,
        b,
        budgetCtx,
        (f) => flightLikelyFitsBudget(f, budgetCtx, minHotelPriceByCurrency),
        byConvenienceAscFlight,
      ),
    (a, b) => byPriceAscFlight(a, b),
  );
}

/** Pre-select hotels: cheapest window + stars/rating quality slots. */
export function selectHotelCandidates(
  hotels: Hotel[],
  limit: number,
  request: SearchRequest,
  flights: Flight[],
): Hotel[] {
  const budgetCtx = buildCandidateBudgetContext(request, flights, hotels);
  const minFlightPriceByCurrency = minPriceByCurrency(flights);

  return selectSplitCandidates(
    hotels,
    limit,
    QUALITY_SLOTS,
    (a, b) => byPriceAscHotel(a, b),
    (a, b) =>
      compareBudgetFitFirst(
        a,
        b,
        budgetCtx,
        (h) => hotelLikelyFitsBudget(h, budgetCtx, minFlightPriceByCurrency),
        byStarsRatingDescHotel,
      ),
    (a, b) => byPriceAscHotel(a, b),
  );
}

function selectSplitCandidates<T extends { id: string }>(
  items: T[],
  limit: number,
  qualitySlots: number,
  sortPriceWindow: (a: T, b: T) => number,
  sortQualityPool: (a: T, b: T) => number,
  sortQualityResult: (a: T, b: T) => number,
): T[] {
  if (items.length <= limit) {
    return [...items].sort(sortPriceWindow);
  }

  const priceSlots = Math.max(0, limit - qualitySlots);
  const byPrice = [...items].sort(sortPriceWindow);
  const priceWindow = byPrice.slice(0, priceSlots);
  const remaining = byPrice.slice(priceSlots);
  const qualityAdditions = [...remaining]
    .sort(sortQualityPool)
    .slice(0, qualitySlots);
  const qualitySorted = [...qualityAdditions].sort(sortQualityResult);

  return [...priceWindow, ...qualitySorted];
}

function minPriceByCurrency(
  items: ReadonlyArray<{ currency: string; price: number }>,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const prev = map.get(item.currency);
    if (prev === undefined || item.price < prev) {
      map.set(item.currency, item.price);
    }
  }
  return map;
}

function flightLikelyFitsBudget(
  flight: Flight,
  budget: CandidateBudgetContext,
  minHotelPriceByCurrency: Map<string, number>,
): boolean {
  if (!budget.appliesToSelection || budget.amount === null || !budget.currency) {
    return false;
  }
  if (flight.currency !== budget.currency) {
    return false;
  }
  const minHotel = minHotelPriceByCurrency.get(flight.currency);
  if (minHotel === undefined) {
    return false;
  }
  return flight.price + minHotel <= budget.amount;
}

function hotelLikelyFitsBudget(
  hotel: Hotel,
  budget: CandidateBudgetContext,
  minFlightPriceByCurrency: Map<string, number>,
): boolean {
  if (!budget.appliesToSelection || budget.amount === null || !budget.currency) {
    return false;
  }
  if (hotel.currency !== budget.currency) {
    return false;
  }
  const minFlight = minFlightPriceByCurrency.get(hotel.currency);
  if (minFlight === undefined) {
    return false;
  }
  return minFlight + hotel.price <= budget.amount;
}

function compareBudgetFitFirst<T>(
  a: T,
  b: T,
  budget: CandidateBudgetContext,
  fitsBudget: (item: T) => boolean,
  compare: (x: T, y: T) => number,
): number {
  if (budget.appliesToSelection) {
    const aFit = fitsBudget(a);
    const bFit = fitsBudget(b);
    if (aFit !== bFit) {
      return aFit ? -1 : 1;
    }
  }
  return compare(a, b);
}

/** Price-first ordering for the flight price window. */
function byPriceAscFlight(a: Flight, b: Flight): number {
  if (a.price !== b.price) return a.price - b.price;
  if (a.stops !== b.stops) return a.stops - b.stops;
  if (a.durationMinutes !== b.durationMinutes) {
    return a.durationMinutes - b.durationMinutes;
  }
  return a.id.localeCompare(b.id);
}

/** Convenience ordering for flight quality slots (never uses rating). */
function byConvenienceAscFlight(a: Flight, b: Flight): number {
  if (a.stops !== b.stops) return a.stops - b.stops;
  if (a.durationMinutes !== b.durationMinutes) {
    return a.durationMinutes - b.durationMinutes;
  }
  if (a.price !== b.price) return a.price - b.price;
  return a.id.localeCompare(b.id);
}

/** Price-first ordering for the hotel price window. */
function byPriceAscHotel(a: Hotel, b: Hotel): number {
  if (a.price !== b.price) return a.price - b.price;
  if (a.stars !== b.stars) return b.stars - a.stars;
  if (a.rating !== b.rating) return b.rating - a.rating;
  return a.id.localeCompare(b.id);
}

/** Stars + rating ordering for hotel quality slots. */
function byStarsRatingDescHotel(a: Hotel, b: Hotel): number {
  if (a.stars !== b.stars) return b.stars - a.stars;
  if (a.rating !== b.rating) return b.rating - a.rating;
  if (a.price !== b.price) return a.price - b.price;
  return a.id.localeCompare(b.id);
}
