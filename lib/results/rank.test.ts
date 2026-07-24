import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  budgetFitMultiplier,
  buildRankContext,
  rankByValue,
  rankResults,
  RANK_WEIGHTS,
  scoreResult,
  scoreValue,
} from "@/lib/results/rank";
import type {
  FlightResult,
  HotelResult,
  SearchResult,
} from "@/types/results";

function hotel(overrides: Partial<HotelResult> = {}): HotelResult {
  return {
    type: "hotel",
    id: "h1",
    destinationId: "paris",
    price: 200,
    currency: "EUR",
    rating: 4.0,
    name: "Hotel",
    stars: 4,
    amenities: ["Wi-Fi"],
    nights: 2,
    location: "Center",
    ...overrides,
  };
}

function flight(overrides: Partial<FlightResult> = {}): FlightResult {
  return {
    type: "flight",
    id: "f1",
    destinationId: "paris",
    price: 100,
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

describe("RANK_WEIGHTS", () => {
  it("sums to 1.0", () => {
    const sum =
      RANK_WEIGHTS.priceCompetitiveness +
      RANK_WEIGHTS.ratingQuality +
      RANK_WEIGHTS.journeyEfficiency +
      RANK_WEIGHTS.stayQuality;
    assert.equal(sum, 1);
  });
});

describe("budgetFitMultiplier", () => {
  it("returns 1 when no budget is set", () => {
    assert.equal(budgetFitMultiplier(500, null), 1);
    assert.equal(budgetFitMultiplier(500, undefined), 1);
    assert.equal(budgetFitMultiplier(500, 0), 1);
  });

  it("returns 1 when price is at or under budget", () => {
    assert.equal(budgetFitMultiplier(100, 200), 1);
    assert.equal(budgetFitMultiplier(200, 200), 1);
  });

  it("decreases linearly and floors at 0.5 for 2× budget", () => {
    assert.equal(budgetFitMultiplier(300, 200), 0.75);
    assert.equal(budgetFitMultiplier(400, 200), 0.5);
    assert.equal(budgetFitMultiplier(800, 200), 0.5);
  });
});

describe("scoreResult + rankResults", () => {
  it("is deterministic for the same inputs", () => {
    const results: SearchResult[] = [
      flight({ id: "cheap", price: 80, durationMinutes: 100, stops: 0 }),
      flight({ id: "pricey", price: 300, durationMinutes: 400, stops: 2 }),
      hotel({ id: "stay", price: 180, rating: 4.8, stars: 5 }),
    ];

    const first = rankResults(results, 250).map((result) => result.id);
    const second = rankResults(results, 250).map((result) => result.id);
    assert.deepEqual(first, second);
  });

  it("prefers cheaper, shorter, fewer-stop flights when other signals are equal", () => {
    const better = flight({
      id: "better",
      price: 100,
      durationMinutes: 100,
      stops: 0,
      rating: 4,
    });
    const worse = flight({
      id: "worse",
      price: 300,
      durationMinutes: 400,
      stops: 2,
      rating: 4,
    });

    const ranked = rankResults([worse, better]);
    assert.equal(ranked[0]?.id, "better");
  });

  it("penalizes results over budget in recommended ranking", () => {
    const under = hotel({ id: "under", price: 150, rating: 4.0, stars: 3 });
    const over = hotel({ id: "over", price: 400, rating: 4.2, stars: 4 });

    const withoutBudget = rankResults([over, under]);
    const withBudget = rankResults([over, under], 160);

    // Without budget, over may rank higher on stars/rating; with budget, under wins.
    assert.equal(withBudget[0]?.id, "under");
    assert.ok(withoutBudget.map((result) => result.id).includes("over"));
  });

  it("uses stable id tie-break when scores and prices match", () => {
    const a = flight({ id: "aaa", price: 100, rating: 4, durationMinutes: 120 });
    const b = flight({ id: "zzz", price: 100, rating: 4, durationMinutes: 120 });
    const ranked = rankResults([b, a]);
    assert.deepEqual(
      ranked.map((result) => result.id),
      ["aaa", "zzz"],
    );
  });

  it("handles empty list", () => {
    assert.deepEqual(rankResults([]), []);
    const context = buildRankContext([]);
    assert.equal(context.minPrice, 0);
    assert.equal(context.maxPrice, 0);
  });

  it("scores a single result without division-by-zero", () => {
    const only = flight({ id: "only", price: 120 });
    const context = buildRankContext([only]);
    const score = scoreResult(only, context);
    assert.ok(score > 0);
    assert.ok(score <= 100);
  });
});

describe("scoreValue + rankByValue", () => {
  it("ranks higher rating-per-euro first", () => {
    const highValue = hotel({ id: "value", price: 100, rating: 5 });
    const lowValue = hotel({ id: "pricey", price: 500, rating: 4 });
    const ranked = rankByValue([lowValue, highValue]);
    assert.equal(ranked[0]?.id, "value");
  });

  it("is deterministic and prefers slightly shorter duration on equal value", () => {
    const short = flight({
      id: "short",
      price: 100,
      rating: 4,
      durationMinutes: 100,
    });
    const long = flight({
      id: "long",
      price: 100,
      rating: 4,
      durationMinutes: 400,
    });

    assert.ok(scoreValue(short) > scoreValue(long));
    assert.deepEqual(
      rankByValue([long, short]).map((result) => result.id),
      ["short", "long"],
    );
  });
});
