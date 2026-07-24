import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sortResults } from "@/lib/results/sort";
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
    stars: 3,
    amenities: [],
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
    price: 150,
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

const SAMPLE: SearchResult[] = [
  hotel({ id: "h-expensive", price: 400, rating: 4.9, nights: 5 }),
  hotel({ id: "h-cheap", price: 80, rating: 3.5, nights: 1 }),
  flight({ id: "f-fast", price: 200, durationMinutes: 90, rating: 4.1 }),
  flight({ id: "f-slow", price: 100, durationMinutes: 400, rating: 3.8 }),
];

describe("sortResults", () => {
  it("sorts cheapest by price ascending with id tie-break", () => {
    const sorted = sortResults(SAMPLE, "price-asc");
    assert.deepEqual(
      sorted.map((result) => result.id),
      ["h-cheap", "f-slow", "f-fast", "h-expensive"],
    );
  });

  it("sorts highest rated descending", () => {
    const sorted = sortResults(SAMPLE, "rating-desc");
    assert.equal(sorted[0]?.id, "h-expensive");
    assert.equal(sorted[sorted.length - 1]?.id, "h-cheap");
  });

  it("sorts fastest by duration (hotels use nights×24×60)", () => {
    const sorted = sortResults(SAMPLE, "duration-asc");
    // f-fast 90m, f-slow 400m, h-cheap 1 night, h-expensive 5 nights
    assert.equal(sorted[0]?.id, "f-fast");
    assert.equal(sorted[1]?.id, "f-slow");
    assert.equal(sorted[2]?.id, "h-cheap");
    assert.equal(sorted[3]?.id, "h-expensive");
  });

  it("recommended uses ranking and accepts budget", () => {
    const without = sortResults(SAMPLE, "recommended");
    const withBudget = sortResults(SAMPLE, "recommended", {
      budgetAmount: 120,
    });

    assert.equal(without.length, SAMPLE.length);
    assert.equal(withBudget.length, SAMPLE.length);

    // With budget 120: h-cheap (80) and f-slow (100) are under; others over.
    const underBudgetIds = withBudget
      .filter((result) => result.price <= 120)
      .map((result) => result.id);
    const overBudgetIds = withBudget
      .filter((result) => result.price > 120)
      .map((result) => result.id);

    assert.deepEqual(underBudgetIds.sort(), ["f-slow", "h-cheap"]);
    assert.ok(overBudgetIds.includes("h-expensive"));
    // Both under-budget results must appear before any over-budget result.
    const firstOverIndex = withBudget.findIndex((result) => result.price > 120);
    const lastUnderIndex = Math.max(
      ...withBudget
        .map((result, index) => (result.price <= 120 ? index : -1))
        .filter((index) => index >= 0),
    );
    assert.ok(lastUnderIndex < firstOverIndex);
  });

  it("best value ranks by rating per euro", () => {
    const sorted = sortResults(SAMPLE, "value-desc");
    // h-cheap: 3.5/80 ≈ 0.04375; f-slow: 3.8/100 = 0.038 → cheap hotel first
    assert.equal(sorted[0]?.id, "h-cheap");
  });

  it("does not mutate the input array", () => {
    const input = [...SAMPLE];
    const before = input.map((result) => result.id);
    sortResults(input, "price-asc");
    assert.deepEqual(
      input.map((result) => result.id),
      before,
    );
  });

  it("handles empty input for every sort mode", () => {
    const modes = [
      "recommended",
      "price-asc",
      "duration-asc",
      "rating-desc",
      "value-desc",
    ] as const;

    for (const mode of modes) {
      assert.deepEqual(sortResults([], mode), []);
    }
  });

  it("ties on price break by id for cheapest", () => {
    const tied: SearchResult[] = [
      flight({ id: "z", price: 100 }),
      flight({ id: "a", price: 100 }),
    ];
    assert.deepEqual(
      sortResults(tied, "price-asc").map((result) => result.id),
      ["a", "z"],
    );
  });
});
