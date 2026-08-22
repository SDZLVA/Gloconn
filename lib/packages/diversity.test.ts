/**
 * Sprint 16.3 — package diversity selection tests.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DIVERSITY_MAX_FLIGHT_REPEAT,
  DIVERSITY_MAX_HOTEL_REPEAT,
  comparePackagesByScore,
  measureDiversityMetrics,
  selectDiversePackages,
  selectNaiveTopPackages,
} from "@/lib/packages/diversity";
import type { Flight } from "@/types/models/flight";
import type { Hotel } from "@/types/models/hotel";
import type { TravelPackage } from "@/types/models/travel-package";

function flight(overrides: Partial<Flight> = {}): Flight {
  return {
    id: "f1",
    destinationId: "paris",
    price: 200,
    currency: "EUR",
    rating: 0,
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
    rating: 4.2,
    name: "Hotel Paris",
    stars: 4,
    amenities: ["Wi-Fi"],
    nights: 7,
    location: "Center",
    ...overrides,
  };
}

function pkg(
  flightId: string,
  hotelId: string,
  score: number,
  overrides: Partial<TravelPackage> = {},
): TravelPackage {
  const f = flight({ id: flightId, airline: `Airline-${flightId}` });
  const h = hotel({ id: hotelId, name: `Hotel-${hotelId}` });
  return {
    id: `pkg-${flightId}-${hotelId}`,
    flight: f,
    hotel: h,
    flightId,
    hotelId,
    totalPrice: f.price + h.price,
    currency: "EUR",
    nights: 7,
    score,
    ...overrides,
  };
}

describe("selectDiversePackages", () => {
  it("A: one flight + many hotels — preserves hotel variety in top 5", () => {
    const packages = [
      pkg("f1", "h1", 90),
      pkg("f1", "h2", 89),
      pkg("f1", "h3", 88),
      pkg("f1", "h4", 87),
      pkg("f1", "h5", 86),
      pkg("f1", "h6", 85),
    ];

    const naive = selectNaiveTopPackages(packages, 5);
    assert.equal(measureDiversityMetrics(naive, 5).uniqueHotels, 5);
    assert.equal(measureDiversityMetrics(naive, 5).uniqueFlights, 1);

    const diverse = selectDiversePackages(packages, 5);
    const metrics = measureDiversityMetrics(diverse, 5);

    assert.equal(metrics.uniqueFlights, 1);
    assert.equal(metrics.uniqueHotels, 5);
    assert.equal(metrics.maxFlightRepeat, 5);
    assert.ok(metrics.maxHotelRepeat <= 2);
    assert.equal(diverse[0]!.score, 90);
  });

  it("B: many flights + one hotel — preserves flight variety in top 5", () => {
    const packages = [
      pkg("f1", "h1", 90),
      pkg("f2", "h1", 89),
      pkg("f3", "h1", 88),
      pkg("f4", "h1", 87),
      pkg("f5", "h1", 86),
      pkg("f6", "h1", 85),
    ];

    const diverse = selectDiversePackages(packages, 5);
    const metrics = measureDiversityMetrics(diverse, 5);

    assert.equal(metrics.uniqueHotels, 1);
    assert.equal(metrics.uniqueFlights, 5);
    assert.equal(metrics.maxHotelRepeat, 5);
    assert.ok(metrics.maxFlightRepeat <= 2);
    assert.equal(diverse[0]!.score, 90);
  });

  it("C: many flights + many hotels — achieves target diversity where possible", () => {
    const packages = [
      pkg("f1", "h1", 95),
      pkg("f1", "h2", 94),
      pkg("f1", "h3", 93),
      pkg("f2", "h1", 92),
      pkg("f2", "h2", 91),
      pkg("f3", "h4", 90),
      pkg("f4", "h5", 89),
      pkg("f5", "h6", 88),
    ];

    const diverse = selectDiversePackages(packages, 5);
    const metrics = measureDiversityMetrics(diverse, 5);

    assert.ok(metrics.uniqueFlights >= 3);
    assert.ok(metrics.uniqueHotels >= 4);
    assert.ok(metrics.maxFlightRepeat <= 2);
    assert.ok(metrics.maxHotelRepeat <= 2);
  });

  it("D: only one unique flight — does not fail or invent diversity", () => {
    const packages = [
      pkg("f1", "h1", 90),
      pkg("f1", "h2", 89),
      pkg("f1", "h3", 88),
    ];

    const diverse = selectDiversePackages(packages, 5);
    assert.equal(diverse.length, 3);
    assert.equal(measureDiversityMetrics(diverse, 3).uniqueFlights, 1);
  });

  it("E: only one unique hotel — does not fail or invent diversity", () => {
    const packages = [
      pkg("f1", "h1", 90),
      pkg("f2", "h1", 89),
      pkg("f3", "h1", 88),
    ];

    const diverse = selectDiversePackages(packages, 5);
    assert.equal(diverse.length, 3);
    assert.equal(measureDiversityMetrics(diverse, 3).uniqueHotels, 1);
  });

  it("F: highest-scoring package remains first", () => {
    const packages = [
      pkg("f1", "h1", 91),
      pkg("f2", "h2", 90),
      pkg("f3", "h3", 85),
    ];

    const diverse = selectDiversePackages(packages, 3);
    assert.equal(diverse[0]!.id, "pkg-f1-h1");
    assert.equal(diverse[0]!.score, 91);
  });

  it("G: enforces repetition limits when alternatives exist", () => {
    const packages = [
      pkg("f1", "h1", 90),
      pkg("f1", "h2", 89),
      pkg("f1", "h3", 88),
      pkg("f2", "h4", 80),
      pkg("f3", "h5", 79),
    ];

    const diverse = selectDiversePackages(packages, 5);
    const metrics = measureDiversityMetrics(diverse, diverse.length);

    assert.ok(metrics.maxFlightRepeat <= DIVERSITY_MAX_FLIGHT_REPEAT);
    assert.ok(metrics.maxHotelRepeat <= DIVERSITY_MAX_HOTEL_REPEAT);
    assert.ok(metrics.uniqueFlights >= 3);
    assert.equal(diverse.length, 4);
  });

  it("H: suppresses exact duplicate package ids", () => {
    const duplicate = pkg("f1", "h1", 90);
    const packages = [duplicate, { ...duplicate }, pkg("f2", "h2", 80)];

    const diverse = selectDiversePackages(packages, 5);
    assert.equal(diverse.length, 2);
    assert.equal(new Set(diverse.map((p) => p.id)).size, 2);
  });

  it("I: is deterministic for identical inputs", () => {
    const packages = [
      pkg("f1", "h1", 90),
      pkg("f1", "h2", 89),
      pkg("f2", "h3", 88),
      pkg("f3", "h4", 87),
      pkg("f4", "h5", 86),
    ];

    const first = selectDiversePackages(packages, 5);
    const second = selectDiversePackages(packages, 5);
    assert.deepEqual(
      first.map((p) => p.id),
      second.map((p) => p.id),
    );
  });

  it("quality vs diversity fixture — introduces variety beyond naive flight clones", () => {
    const packages = [
      pkg("fA", "hA", 90),
      pkg("fA", "hB", 89),
      pkg("fA", "hC", 88),
      pkg("fA", "hD", 87),
      pkg("fA", "hE", 86),
      pkg("fB", "hF", 85),
      pkg("fC", "hG", 84),
      pkg("fD", "hH", 83),
    ];

    const naive = selectNaiveTopPackages(packages, 5);
    assert.equal(measureDiversityMetrics(naive, 5).uniqueFlights, 1);
    assert.equal(measureDiversityMetrics(naive, 5).uniqueHotels, 5);

    const diverse = selectDiversePackages(packages, 5);
    const metrics = measureDiversityMetrics(diverse, 5);

    assert.equal(diverse[0]!.id, "pkg-fA-hA");
    assert.ok(metrics.uniqueFlights >= 3);
    assert.ok(metrics.uniqueHotels >= 4);
    assert.ok(metrics.maxFlightRepeat <= 2);
    assert.ok(metrics.maxHotelRepeat <= 2);
    assert.ok(flightIdsInclude(diverse, "fB"));

    const naiveTopScore = naive[0]!.score;
    const diverseMinScore = Math.min(...diverse.map((p) => p.score));
    assert.ok(naiveTopScore - diverseMinScore <= 7);
    assert.ok(diverseMinScore >= 83);
  });

  it("clone-dominated naive ranking — diversity introduces alternate flights", () => {
    const packages = [
      pkg("f1", "h1", 90),
      pkg("f1", "h2", 89),
      pkg("f1", "h3", 88),
      pkg("f1", "h4", 87),
      pkg("f1", "h5", 86),
      pkg("f2", "h6", 85),
    ];

    const naive = selectNaiveTopPackages(packages, 5);
    assert.equal(measureDiversityMetrics(naive, 5).uniqueFlights, 1);

    const diverse = selectDiversePackages(packages, 5);
    const metrics = measureDiversityMetrics(diverse, 5);

    assert.equal(diverse[0]!.flightId, "f1");
    assert.ok(metrics.uniqueFlights >= 2);
    assert.ok(flightIdsInclude(diverse, "f2"));
  });
});

describe("comparePackagesByScore", () => {
  it("orders by score, price, id", () => {
    const a = pkg("f1", "h1", 90, { totalPrice: 600 });
    const b = pkg("f2", "h2", 90, { totalPrice: 500 });
    assert.ok(comparePackagesByScore(a, b) > 0);
  });
});

function flightIdsInclude(packages: TravelPackage[], flightId: string): boolean {
  return packages.some((p) => p.flightId === flightId);
}
