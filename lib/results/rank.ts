/**
 * Client-side result ranking — pure, deterministic, no AI/ML.
 *
 * Weights (sum to 1.0 for the base score before budget adjustment):
 * - priceCompetitiveness  0.35  — cheaper relative to the set scores higher
 * - ratingQuality         0.25  — guest rating / 5
 * - journeyEfficiency     0.25  — shorter duration + fewer flight stops
 * - stayQuality           0.15  — hotel stars / 5 (hotels); neutral for others
 *
 * Optional budget fit multiplies the score:
 * - at or under budget → 1.0
 * - over budget → linearly down to 0.5 at 2× budget (floored at 0.5)
 */

import type { SearchResult } from "@/types/results";

/** Documented weight constants — keep in sync with the file header. */
export const RANK_WEIGHTS = {
  priceCompetitiveness: 0.35,
  ratingQuality: 0.25,
  journeyEfficiency: 0.25,
  stayQuality: 0.15,
} as const;

export type RankContext = {
  /** Cheapest price in the ranked set (inclusive). */
  minPrice: number;

  /** Most expensive price in the ranked set (inclusive). */
  maxPrice: number;

  /** Shortest journey duration in minutes (hotels use nights×24×60). */
  minDurationMinutes: number;

  /** Longest journey duration in minutes. */
  maxDurationMinutes: number;

  /** Highest flight stop count in the set (0 when no flights). */
  maxStops: number;

  /** Optional trip budget amount for budget-fit adjustment. */
  budgetAmount?: number | null;
};

function getDurationMinutes(result: SearchResult): number {
  if (result.type === "hotel") {
    return result.nights * 24 * 60;
  }
  return result.durationMinutes;
}

function getStops(result: SearchResult): number {
  return result.type === "flight" ? result.stops : 0;
}

function getStars(result: SearchResult): number {
  return result.type === "hotel" ? result.stars : 0;
}

/** Builds ranking context from a result list (call once per sort). */
export function buildRankContext(
  results: SearchResult[],
  budgetAmount?: number | null,
): RankContext {
  if (results.length === 0) {
    return {
      minPrice: 0,
      maxPrice: 0,
      minDurationMinutes: 0,
      maxDurationMinutes: 0,
      maxStops: 0,
      budgetAmount: budgetAmount ?? null,
    };
  }

  const prices = results.map((result) => result.price);
  const durations = results.map(getDurationMinutes);
  const stops = results.map(getStops);

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minDurationMinutes: Math.min(...durations),
    maxDurationMinutes: Math.max(...durations),
    maxStops: Math.max(...stops),
    budgetAmount: budgetAmount ?? null,
  };
}

function normalizeInverse(
  value: number,
  min: number,
  max: number,
): number {
  if (max <= min) {
    return 1;
  }
  return 1 - (value - min) / (max - min);
}

function normalizeDirect(value: number, min: number, max: number): number {
  if (max <= min) {
    return 1;
  }
  return (value - min) / (max - min);
}

/**
 * Budget fit multiplier in [0.5, 1].
 * At/under budget → 1. Over budget → decreases to 0.5 at 2× budget.
 */
export function budgetFitMultiplier(
  price: number,
  budgetAmount: number | null | undefined,
): number {
  if (budgetAmount == null || budgetAmount <= 0) {
    return 1;
  }

  if (price <= budgetAmount) {
    return 1;
  }

  const overRatio = (price - budgetAmount) / budgetAmount;
  // At 100% over budget (2×), multiplier is 0.5; beyond that stays at 0.5.
  return Math.max(0.5, 1 - overRatio * 0.5);
}

/**
 * Scores one result from 0–100 (higher is better).
 * Pure function — same inputs always produce the same score.
 */
export function scoreResult(
  result: SearchResult,
  context: RankContext,
): number {
  const priceScore = normalizeInverse(
    result.price,
    context.minPrice,
    context.maxPrice,
  );

  const ratingScore = Math.min(1, Math.max(0, result.rating / 5));

  const durationScore = normalizeInverse(
    getDurationMinutes(result),
    context.minDurationMinutes,
    context.maxDurationMinutes,
  );

  const stopsScore =
    result.type === "flight"
      ? normalizeInverse(result.stops, 0, Math.max(context.maxStops, 1))
      : 1;

  const journeyScore = durationScore * 0.7 + stopsScore * 0.3;

  const stayScore =
    result.type === "hotel"
      ? normalizeDirect(getStars(result), 0, 5)
      : 0.5; // neutral mid-point so non-hotels are not punished

  const base =
    priceScore * RANK_WEIGHTS.priceCompetitiveness +
    ratingScore * RANK_WEIGHTS.ratingQuality +
    journeyScore * RANK_WEIGHTS.journeyEfficiency +
    stayScore * RANK_WEIGHTS.stayQuality;

  const withBudget = base * budgetFitMultiplier(result.price, context.budgetAmount);

  return Math.round(withBudget * 1000) / 10; // one decimal, 0–100
}

/**
 * Value score for “Best value”: rating per euro, with a small duration bonus.
 * Higher is better. Deterministic.
 */
export function scoreValue(result: SearchResult): number {
  const safePrice = Math.max(result.price, 1);
  const ratingPerEuro = result.rating / safePrice;

  // Prefer slightly shorter trips when value is otherwise equal.
  const durationPenalty =
    result.type === "hotel"
      ? result.nights * 0.0001
      : result.durationMinutes * 0.00001;

  return ratingPerEuro - durationPenalty;
}

/** Stable tie-break: higher score first, then lower price, then id. */
function compareByScoreThenPrice(
  a: SearchResult,
  b: SearchResult,
  scoreA: number,
  scoreB: number,
): number {
  if (scoreB !== scoreA) {
    return scoreB - scoreA;
  }
  if (a.price !== b.price) {
    return a.price - b.price;
  }
  return a.id.localeCompare(b.id);
}

/** Ranks results by the recommended score (highest first). */
export function rankResults(
  results: SearchResult[],
  budgetAmount?: number | null,
): SearchResult[] {
  const context = buildRankContext(results, budgetAmount);
  const scored = results.map((result) => ({
    result,
    score: scoreResult(result, context),
  }));

  scored.sort((a, b) =>
    compareByScoreThenPrice(a.result, b.result, a.score, b.score),
  );

  return scored.map((entry) => entry.result);
}

/** Ranks by best-value score (highest first). */
export function rankByValue(results: SearchResult[]): SearchResult[] {
  const scored = results.map((result) => ({
    result,
    score: scoreValue(result),
  }));

  scored.sort((a, b) =>
    compareByScoreThenPrice(a.result, b.result, a.score, b.score),
  );

  return scored.map((entry) => entry.result);
}
