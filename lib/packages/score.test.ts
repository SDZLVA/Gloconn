/**
 * Sprint 13.2 — isolated package scoring unit tests.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PACKAGE_SCORE_WEIGHTS,
  budgetFitScore,
  buildPackageScoreContext,
  convenienceScore,
  flightQualityScore,
  hotelQualityScore,
  scorePackage,
  totalPriceScore,
} from "@/lib/packages";
import type { Flight } from "@/types/models/flight";
import type { Hotel } from "@/types/models/hotel";

function flight(overrides: Partial<Flight> = {}): Flight {
  return {
    id: "f1",
    destinationId: "paris",
    price: 200,
    currency: "EUR",
    rating: 4.0,
    airline: "Air France",
    departureTime: "08:00",
    arrivalTime: "10:00",
    durationMinutes: 120,
    stops: 0,
    cabin: "Economy",
    ...overrides,
  };
}

function hotel(overrides: Partial<Hotel> = {}): Hotel {
  return {
    id: "h1",
    destinationId: "paris",
    price: 400,
    currency: "EUR",
    rating: 4.0,
    name: "Hotel",
    stars: 4,
    amenities: ["Wi-Fi"],
    nights: 3,
    location: "Center",
    ...overrides,
  };
}

describe("budgetFitScore", () => {
  it("returns 1 when budget is missing or non-positive", () => {
    assert.equal(budgetFitScore(500, null), 1);
    assert.equal(budgetFitScore(500, undefined), 1);
    assert.equal(budgetFitScore(500, 0), 1);
  });

  it("returns 1 when at or under budget", () => {
    assert.equal(budgetFitScore(100, 200), 1);
    assert.equal(budgetFitScore(200, 200), 1);
  });

  it("decreases linearly to 0 at 2× budget", () => {
    assert.equal(budgetFitScore(300, 200), 0.5);
    assert.equal(budgetFitScore(400, 200), 0);
    assert.equal(budgetFitScore(800, 200), 0);
  });
});

describe("scorePackage", () => {
  it("is deterministic for the same inputs", () => {
    const candidates = [
      {
        flight: flight({ id: "cheap", price: 80, durationMinutes: 100, stops: 0 }),
        hotel: hotel({ id: "stay-a", price: 180, rating: 4.8, stars: 5 }),
        totalPrice: 260,
      },
      {
        flight: flight({
          id: "pricey",
          price: 300,
          durationMinutes: 400,
          stops: 2,
        }),
        hotel: hotel({ id: "stay-b", price: 500, rating: 3.0, stars: 2 }),
        totalPrice: 800,
      },
    ];

    const context = buildPackageScoreContext(candidates, 500);
    const first = scorePackage(candidates[0]!, context);
    const second = scorePackage(candidates[0]!, context);
    assert.equal(first, second);
  });

  it("prefers cheaper, higher-quality, budget-fit packages", () => {
    const good = {
      flight: flight({
        id: "good-f",
        price: 100,
        rating: 4.9,
        stops: 0,
        durationMinutes: 90,
      }),
      hotel: hotel({
        id: "good-h",
        price: 200,
        rating: 4.8,
        stars: 5,
        amenities: ["A", "B", "C", "D", "E"],
      }),
      totalPrice: 300,
    };
    const bad = {
      flight: flight({
        id: "bad-f",
        price: 400,
        rating: 2.0,
        stops: 2,
        durationMinutes: 500,
      }),
      hotel: hotel({
        id: "bad-h",
        price: 600,
        rating: 2.0,
        stars: 2,
        amenities: [],
      }),
      totalPrice: 1000,
    };

    const context = buildPackageScoreContext([good, bad], 400);
    assert.ok(scorePackage(good, context) > scorePackage(bad, context));
  });

  it("component helpers stay in [0, 1]", () => {
    const candidates = [
      {
        flight: flight({ stops: 0, durationMinutes: 60, rating: 5 }),
        hotel: hotel({ rating: 5, stars: 5, amenities: ["a", "b", "c", "d"] }),
        totalPrice: 100,
      },
      {
        flight: flight({
          id: "f2",
          stops: 2,
          durationMinutes: 400,
          rating: 1,
        }),
        hotel: hotel({ id: "h2", rating: 1, stars: 1, amenities: [] }),
        totalPrice: 900,
      },
    ];
    const context = buildPackageScoreContext(candidates, 200);
    const f = candidates[0]!.flight;
    const h = candidates[0]!.hotel;

    for (const value of [
      budgetFitScore(100, 200),
      flightQualityScore(f, context),
      hotelQualityScore(h),
      totalPriceScore(100, context),
      convenienceScore(f, h, context),
    ]) {
      assert.ok(value >= 0 && value <= 1);
    }
  });

  it("weights remain the documented mix", () => {
    assert.equal(PACKAGE_SCORE_WEIGHTS.budgetFit, 0.35);
    assert.equal(PACKAGE_SCORE_WEIGHTS.flightQuality, 0.25);
    assert.equal(PACKAGE_SCORE_WEIGHTS.hotelQuality, 0.2);
    assert.equal(PACKAGE_SCORE_WEIGHTS.totalPrice, 0.15);
    assert.equal(PACKAGE_SCORE_WEIGHTS.convenience, 0.05);
  });
});
