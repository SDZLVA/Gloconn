/**
 * Sprint 17.7 — initial price filter from search budget.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildInitialResultsFilters } from "@/lib/results/budgetFilter";
import {
  shouldShowBudgetCompatibilityWarning,
} from "@/lib/results/packagesUi";
import type { TravelPackage } from "@/types/models/travel-package";
import type { Flight } from "@/types/models/flight";
import type { Hotel } from "@/types/models/hotel";

function pkg(totalPrice: number, currency: "EUR" | "USD" = "EUR"): TravelPackage {
  const flight: Flight = {
    id: "f1",
    destinationId: "paris",
    price: 100,
    currency,
    rating: 4,
    airline: "AF",
    departureTime: "08:00",
    arrivalTime: "10:00",
    durationMinutes: 120,
    stops: 0,
    cabin: "Economy",
  };
  const hotel: Hotel = {
    id: "h1",
    destinationId: "paris",
    price: totalPrice - 100,
    currency,
    rating: 4,
    name: "Hotel",
    stars: 4,
    amenities: [],
    nights: 3,
    location: "Center",
  };
  return {
    id: `pkg-${totalPrice}`,
    flight,
    hotel,
    flightId: flight.id,
    hotelId: hotel.id,
    totalPrice,
    currency,
    nights: 3,
    score: 70,
  };
}

describe("buildInitialResultsFilters", () => {
  it("sets max to €500 when budget is 500", () => {
    const filters = buildInitialResultsFilters(
      { min: 0, max: 2500 },
      { amount: 500, currency: "EUR" },
    );
    assert.equal(filters.maxPrice, 500);
    assert.equal(filters.minPrice, 0);
  });

  it("sets max to €1000 when budget is 1000", () => {
    const filters = buildInitialResultsFilters(
      { min: 100, max: 4000 },
      { amount: 1000, currency: "EUR" },
    );
    assert.equal(filters.maxPrice, 1000);
    assert.equal(filters.minPrice, 100);
  });

  it("uses observed range when budget is null", () => {
    const filters = buildInitialResultsFilters(
      { min: 50, max: 2500 },
      null,
    );
    assert.equal(filters.minPrice, 50);
    assert.equal(filters.maxPrice, 2500);
  });

  it("applies USD budget amount the same way (currency consistent)", () => {
    const filters = buildInitialResultsFilters(
      { min: 0, max: 3000 },
      { amount: 750, currency: "USD" },
    );
    assert.equal(filters.maxPrice, 750);
  });

  it("keeps min ≤ max when all results exceed budget", () => {
    const filters = buildInitialResultsFilters(
      { min: 800, max: 2500 },
      { amount: 500, currency: "EUR" },
    );
    assert.equal(filters.maxPrice, 500);
    assert.equal(filters.minPrice, 500);
  });

  it("allows manual increase beyond budget (priceRange max unchanged)", () => {
    const priceRange = { min: 0, max: 2500 };
    const filters = buildInitialResultsFilters(priceRange, {
      amount: 500,
      currency: "EUR",
    });
    assert.equal(filters.maxPrice, 500);
    // Sidebar still exposes priceRange.max — user can raise filter to 2500.
    assert.equal(priceRange.max, 2500);
    assert.ok(priceRange.max > filters.maxPrice);
  });
});

describe("budget over-limit packages remain visible via warning", () => {
  it("shows warning when all packages exceed budget", () => {
    assert.equal(
      shouldShowBudgetCompatibilityWarning(
        { amount: 500, currency: "EUR" },
        [pkg(900), pkg(1200)],
      ),
      true,
    );
  });

  it("hides warning when one package is within budget", () => {
    assert.equal(
      shouldShowBudgetCompatibilityWarning(
        { amount: 500, currency: "EUR" },
        [pkg(400), pkg(1200)],
      ),
      false,
    );
  });
});
