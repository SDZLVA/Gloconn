/**
 * Deterministic TravelPackage scoring — pure, no AI/ML.
 *
 * Weights (PACKAGE_SCORE_WEIGHTS):
 * - budgetFit       0.35
 * - flightQuality   0.25
 * - hotelQuality    0.20
 * - totalPrice      0.15
 * - convenience     0.05
 */

import { PACKAGE_SCORE_WEIGHTS } from "@/lib/packages/constants";
import type { Flight } from "@/types/models/flight";
import type { Hotel } from "@/types/models/hotel";

/** Relative context built once per candidate package set. */
export type PackageScoreContext = {
  minTotalPrice: number;
  maxTotalPrice: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  maxStops: number;
  budgetAmount: number | null;
};

export type PackageScoreInput = {
  flight: Flight;
  hotel: Hotel;
  totalPrice: number;
};

/** Builds scoring context from package candidates (call once per compose). */
export function buildPackageScoreContext(
  candidates: PackageScoreInput[],
  budgetAmount?: number | null,
): PackageScoreContext {
  if (candidates.length === 0) {
    return {
      minTotalPrice: 0,
      maxTotalPrice: 0,
      minDurationMinutes: 0,
      maxDurationMinutes: 0,
      maxStops: 0,
      budgetAmount: budgetAmount ?? null,
    };
  }

  const prices = candidates.map((c) => c.totalPrice);
  const durations = candidates.map((c) => c.flight.durationMinutes);
  const stops = candidates.map((c) => c.flight.stops);

  return {
    minTotalPrice: Math.min(...prices),
    maxTotalPrice: Math.max(...prices),
    minDurationMinutes: Math.min(...durations),
    maxDurationMinutes: Math.max(...durations),
    maxStops: Math.max(...stops),
    budgetAmount: budgetAmount ?? null,
  };
}

/**
 * Budget-fit component in [0, 1].
 * At/under budget → 1. Over budget → decreases to 0 at 2× budget.
 */
export function budgetFitScore(
  totalPrice: number,
  budgetAmount: number | null | undefined,
): number {
  if (budgetAmount == null || budgetAmount <= 0) {
    return 1;
  }

  if (totalPrice <= budgetAmount) {
    return 1;
  }

  const overRatio = (totalPrice - budgetAmount) / budgetAmount;
  return Math.max(0, 1 - overRatio);
}

/** Flight quality in [0, 1]: rating, stops, duration (set-relative). */
export function flightQualityScore(
  flight: Flight,
  context: PackageScoreContext,
): number {
  const rating = clamp01(flight.rating / 5);
  const stops = normalizeInverse(
    flight.stops,
    0,
    Math.max(context.maxStops, 1),
  );
  const duration = normalizeInverse(
    flight.durationMinutes,
    context.minDurationMinutes,
    context.maxDurationMinutes,
  );

  return rating * 0.5 + stops * 0.3 + duration * 0.2;
}

/** Hotel quality in [0, 1]: rating and stars. */
export function hotelQualityScore(hotel: Hotel): number {
  const rating = clamp01(hotel.rating / 5);
  const stars = clamp01(hotel.stars / 5);
  return rating * 0.6 + stars * 0.4;
}

/** Total-price competitiveness in [0, 1] (cheaper is better). */
export function totalPriceScore(
  totalPrice: number,
  context: PackageScoreContext,
): number {
  return normalizeInverse(
    totalPrice,
    context.minTotalPrice,
    context.maxTotalPrice,
  );
}

/**
 * Convenience in [0, 1]: fewer stops + shorter flight.
 * Small amenity bonus for hotels with more listed amenities.
 */
export function convenienceScore(
  flight: Flight,
  hotel: Hotel,
  context: PackageScoreContext,
): number {
  const stops = normalizeInverse(
    flight.stops,
    0,
    Math.max(context.maxStops, 1),
  );
  const duration = normalizeInverse(
    flight.durationMinutes,
    context.minDurationMinutes,
    context.maxDurationMinutes,
  );
  const amenities = clamp01(hotel.amenities.length / 8);

  return stops * 0.5 + duration * 0.35 + amenities * 0.15;
}

/**
 * Scores one package candidate from 0–100 (higher is better).
 * Same inputs always produce the same score.
 */
export function scorePackage(
  input: PackageScoreInput,
  context: PackageScoreContext,
): number {
  const base =
    budgetFitScore(input.totalPrice, context.budgetAmount) *
      PACKAGE_SCORE_WEIGHTS.budgetFit +
    flightQualityScore(input.flight, context) *
      PACKAGE_SCORE_WEIGHTS.flightQuality +
    hotelQualityScore(input.hotel) * PACKAGE_SCORE_WEIGHTS.hotelQuality +
    totalPriceScore(input.totalPrice, context) *
      PACKAGE_SCORE_WEIGHTS.totalPrice +
    convenienceScore(input.flight, input.hotel, context) *
      PACKAGE_SCORE_WEIGHTS.convenience;

  return Math.round(base * 1000) / 10; // one decimal, 0–100
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

function normalizeInverse(value: number, min: number, max: number): number {
  if (max <= min) {
    return 1;
  }
  return 1 - (value - min) / (max - min);
}
