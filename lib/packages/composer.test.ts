/**
 * Sprint 13.2 — PackageComposer unit tests.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_FLIGHT_CANDIDATES,
  MAX_HOTEL_CANDIDATES,
  MAX_PACKAGES,
  PACKAGE_SCORE_WEIGHTS,
  buildPackageId,
  composePackages,
  computeNightsBetween,
  resolvePackageNights,
} from "@/lib/packages";
import type { Flight } from "@/types/models/flight";
import type { Hotel } from "@/types/models/hotel";
import type { SearchRequest } from "@/types/models/search-request";

function baseRequest(
  overrides: Partial<SearchRequest> = {},
): SearchRequest {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    destination: "Paris, France",
    destinationId: "paris",
    tripType: "round-trip",
    departureDate: "2026-08-10",
    returnDate: "2026-08-17",
    budget: { amount: 1500, currency: "EUR" },
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard",
    productTypes: ["hotels", "flights"],
    ...overrides,
  };
}

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
    rating: 4.2,
    name: "Hotel Paris",
    stars: 4,
    amenities: ["Wi-Fi", "Breakfast"],
    nights: 7,
    location: "Center",
    ...overrides,
  };
}

describe("PACKAGE_SCORE_WEIGHTS", () => {
  it("sums to 1.0", () => {
    const sum =
      PACKAGE_SCORE_WEIGHTS.budgetFit +
      PACKAGE_SCORE_WEIGHTS.flightQuality +
      PACKAGE_SCORE_WEIGHTS.hotelQuality +
      PACKAGE_SCORE_WEIGHTS.totalPrice +
      PACKAGE_SCORE_WEIGHTS.convenience;
    assert.equal(sum, 1);
  });
});

describe("buildPackageId", () => {
  it("builds stable ids from flight and hotel ids", () => {
    assert.equal(buildPackageId("f-a", "h-b"), "pkg-f-a-h-b");
    assert.equal(buildPackageId("f-a", "h-b"), buildPackageId("f-a", "h-b"));
  });
});

describe("nights helpers", () => {
  it("computes nights between ISO date-only strings", () => {
    assert.equal(computeNightsBetween("2026-08-10", "2026-08-17"), 7);
    assert.equal(computeNightsBetween("2026-08-10", "2026-08-11"), 1);
    assert.equal(computeNightsBetween("2026-08-10", "2026-08-10"), null);
    assert.equal(computeNightsBetween("bad", "2026-08-17"), null);
  });

  it("prefers hotel nights, then request dates, else 1", () => {
    const request = baseRequest();
    assert.equal(resolvePackageNights(5, request), 5);
    assert.equal(resolvePackageNights(0, request), 7);
    assert.equal(
      resolvePackageNights(0, baseRequest({ returnDate: null, tripType: "one-way" })),
      1,
    );
  });
});

describe("composePackages", () => {
  it("returns empty when flights or hotels are empty", () => {
    const request = baseRequest();
    assert.deepEqual(composePackages([], [hotel()], request), []);
    assert.deepEqual(composePackages([flight()], [], request), []);
    assert.deepEqual(composePackages([], [], request), []);
  });

  it("composes matching-currency pairs with totalPrice and nights", () => {
    const packages = composePackages(
      [flight({ id: "f1", price: 200 })],
      [hotel({ id: "h1", price: 400, nights: 7 })],
      baseRequest(),
    );

    assert.equal(packages.length, 1);
    const pkg = packages[0]!;
    assert.equal(pkg.id, "pkg-f1-h1");
    assert.equal(pkg.flightId, "f1");
    assert.equal(pkg.hotelId, "h1");
    assert.equal(pkg.totalPrice, 600);
    assert.equal(pkg.currency, "EUR");
    assert.equal(pkg.nights, 7);
    assert.equal(pkg.flight.id, "f1");
    assert.equal(pkg.hotel.id, "h1");
    assert.ok(pkg.score >= 0 && pkg.score <= 100);
  });

  it("skips currency mismatches", () => {
    const packages = composePackages(
      [
        flight({ id: "eur", currency: "EUR", price: 100 }),
        flight({ id: "usd", currency: "USD", price: 100 }),
      ],
      [
        hotel({ id: "eur-h", currency: "EUR", price: 200 }),
        hotel({ id: "gbp-h", currency: "GBP", price: 200 }),
      ],
      baseRequest(),
    );

    assert.equal(packages.length, 1);
    assert.equal(packages[0]!.id, "pkg-eur-eur-h");
    assert.equal(packages[0]!.currency, "EUR");
  });

  it("returns empty when every combination mismatches currency", () => {
    const packages = composePackages(
      [flight({ currency: "EUR" })],
      [hotel({ currency: "USD" })],
      baseRequest(),
    );
    assert.deepEqual(packages, []);
  });

  it("produces cartesian combinations within caps", () => {
    const flights = [
      flight({ id: "f1", price: 100 }),
      flight({ id: "f2", price: 150 }),
    ];
    const hotels = [
      hotel({ id: "h1", price: 200 }),
      hotel({ id: "h2", price: 250 }),
      hotel({ id: "h3", price: 300 }),
    ];

    const packages = composePackages(flights, hotels, baseRequest());
    assert.equal(packages.length, 6);

    const ids = new Set(packages.map((p) => p.id));
    assert.equal(ids.size, 6);
    assert.ok(ids.has("pkg-f1-h1"));
    assert.ok(ids.has("pkg-f2-h3"));
  });

  it("caps flight and hotel candidates before pairing", () => {
    const flights = Array.from({ length: 12 }, (_, i) =>
      flight({ id: `f${String(i).padStart(2, "0")}`, price: 100 + i }),
    );
    const hotels = Array.from({ length: 12 }, (_, i) =>
      hotel({ id: `h${String(i).padStart(2, "0")}`, price: 200 + i }),
    );

    const packages = composePackages(flights, hotels, baseRequest());

    assert.ok(packages.length <= MAX_PACKAGES);
    assert.ok(
      packages.length <= MAX_FLIGHT_CANDIDATES * MAX_HOTEL_CANDIDATES,
    );

    // Cheapest candidates are in the pool (6 price slots + 2 quality slots).
    // With uniform convenience, quality slots fall to cheapest remaining → f06, f07.
    // f11 is the most expensive — still excluded unless it wins on convenience.
    const flightIds = new Set(packages.map((p) => p.flightId));
    const hotelIds = new Set(packages.map((p) => p.hotelId));
    assert.ok(flightIds.has("f00"));
    assert.ok(!flightIds.has("f11"));
    assert.ok(hotelIds.has("h00"));
    assert.ok(!hotelIds.has("h11"));
  });

  // -------------------------------------------------------------------------
  // Sprint 16.2 — balanced candidate selection
  // -------------------------------------------------------------------------

  it("S16.2: includes a direct/fast expensive flight via convenience quality slot", () => {
    const cheapFlights = Array.from({ length: 10 }, (_, i) =>
      flight({
        id: `cheap${i}`,
        price: 100 + i,
        rating: 0,
        stops: 2,
        durationMinutes: 1200,
      }),
    );
    const directFlight = flight({
      id: "direct",
      price: 400,
      rating: 0,
      stops: 0,
      durationMinutes: 480,
    });

    const packages = composePackages(
      [...cheapFlights, directFlight],
      [hotel({ id: "h1", price: 200 })],
      baseRequest(),
    );

    const flightIds = new Set(packages.map((p) => p.flightId));
    assert.ok(
      flightIds.has("direct"),
      "direct flight should enter composition via convenience slot",
    );
    assert.ok(flightIds.has("cheap0"));
  });

  it("S16.2: includes a high-star expensive hotel that pure price-sort would exclude", () => {
    const cheapHotels = Array.from({ length: 10 }, (_, i) =>
      hotel({ id: `cheap${i}`, price: 200 + i, rating: 2.0, stars: 2 }),
    );
    const qualityHotel = hotel({ id: "luxury", price: 900, rating: 4.2, stars: 5 });

    const packages = composePackages(
      [flight({ id: "f1", price: 150 })],
      [...cheapHotels, qualityHotel],
      baseRequest(),
    );

    const hotelIds = new Set(packages.map((p) => p.hotelId));
    assert.ok(
      hotelIds.has("luxury"),
      "luxury hotel should enter composition via stars quality slot",
    );
    assert.ok(hotelIds.has("cheap0"));
  });

  it("S16.2: does not apply budget penalty when budget currency mismatches package currency", () => {
    const packages = composePackages(
      [flight({ id: "f1", price: 800, currency: "EUR" })],
      [hotel({ id: "h1", price: 900, currency: "EUR" })],
      baseRequest({ budget: { amount: 1000, currency: "USD" } }),
    );

    assert.equal(packages.length, 1);
    // budgetFit should be 1.0 (no penalty) — score should reflect no budget constraint.
    assert.ok(packages[0]!.score >= 50);
  });

  it("P1.7: quality-aware selection does not exceed the candidate cap", () => {
    const flights = Array.from({ length: 20 }, (_, i) =>
      flight({ id: `f${i}`, price: 100 + i * 10, rating: i % 5 === 0 ? 5.0 : 3.0 }),
    );
    const hotels = Array.from({ length: 20 }, (_, i) =>
      hotel({ id: `h${i}`, price: 200 + i * 10, rating: i % 5 === 0 ? 5.0 : 3.0 }),
    );

    const packages = composePackages(flights, hotels, baseRequest());

    // Total candidate pairs ≤ MAX_FLIGHT_CANDIDATES × MAX_HOTEL_CANDIDATES
    const flightIds = new Set(packages.map((p) => p.flightId));
    const hotelIds = new Set(packages.map((p) => p.hotelId));
    assert.ok(flightIds.size <= MAX_FLIGHT_CANDIDATES);
    assert.ok(hotelIds.size <= MAX_HOTEL_CANDIDATES);
    assert.ok(packages.length <= MAX_PACKAGES);
  });

  it("P1.7: when all items fit within limit, behavior is unchanged (all included)", () => {
    // Fewer items than cap — all should appear regardless of quality-aware logic.
    const flights = [
      flight({ id: "f1", price: 300, rating: 5.0 }),
      flight({ id: "f2", price: 100, rating: 2.0 }),
    ];
    const hotels = [hotel({ id: "h1", price: 200 })];

    const packages = composePackages(flights, hotels, baseRequest());
    assert.equal(packages.length, 2);
    const flightIds = new Set(packages.map((p) => p.flightId));
    assert.ok(flightIds.has("f1"));
    assert.ok(flightIds.has("f2"));
  });

  it("S16.3: top-scored package is first after diversity pass", () => {
    const flights = Array.from({ length: 10 }, (_, i) =>
      flight({ id: `f${i}`, price: 150 + i * 20, rating: (10 - i) / 2 }),
    );
    const hotels = Array.from({ length: 10 }, (_, i) =>
      hotel({ id: `h${i}`, price: 300 + i * 30, rating: (10 - i) / 2, stars: Math.max(1, 5 - i) }),
    );

    const packages = composePackages(flights, hotels, baseRequest());
    assert.ok(packages.length >= 2);

    const allScores = packages.map((p) => p.score);
    assert.equal(packages[0]!.score, Math.max(...allScores));
  });

  it("P1.7: currency mismatch behavior is unchanged", () => {
    // Quality-aware selection should not affect currency mismatch skipping.
    const eurFlights = Array.from({ length: 5 }, (_, i) =>
      flight({ id: `eur${i}`, currency: "EUR", price: 100 + i, rating: 4.0 }),
    );
    const usdHotels = Array.from({ length: 5 }, (_, i) =>
      hotel({ id: `usd${i}`, currency: "USD", price: 200 + i }),
    );

    const packages = composePackages(eurFlights, usdHotels, baseRequest());
    assert.deepEqual(packages, []);
  });

  it("respects maxPackages override", () => {
    const flights = [
      flight({ id: "f1", price: 100 }),
      flight({ id: "f2", price: 120 }),
    ];
    const hotels = [
      hotel({ id: "h1", price: 200 }),
      hotel({ id: "h2", price: 220 }),
      hotel({ id: "h3", price: 240 }),
    ];

    const packages = composePackages(flights, hotels, baseRequest(), {
      maxPackages: 3,
    });
    assert.equal(packages.length, 3);
  });

  it("S16.3: diversity pass keeps global best package first", () => {
    const packages = composePackages(
      [
        flight({
          id: "f-good",
          price: 100,
          rating: 4.8,
          stops: 0,
          durationMinutes: 90,
        }),
        flight({
          id: "f-bad",
          price: 400,
          rating: 2.0,
          stops: 2,
          durationMinutes: 400,
        }),
      ],
      [
        hotel({
          id: "h-good",
          price: 200,
          rating: 4.9,
          stars: 5,
          amenities: ["A", "B", "C", "D"],
        }),
        hotel({
          id: "h-bad",
          price: 500,
          rating: 2.5,
          stars: 2,
          amenities: [],
        }),
      ],
      baseRequest({ budget: { amount: 400, currency: "EUR" } }),
    );

    assert.ok(packages.length >= 2);
    assert.equal(packages[0]!.id, "pkg-f-good-h-good");
  });

  it("is deterministic for identical inputs", () => {
    const flights = [
      flight({ id: "f2", price: 180 }),
      flight({ id: "f1", price: 150 }),
    ];
    const hotels = [
      hotel({ id: "h2", price: 300 }),
      hotel({ id: "h1", price: 250 }),
    ];
    const request = baseRequest();

    const first = composePackages(flights, hotels, request);
    const second = composePackages(flights, hotels, request);

    assert.deepEqual(
      first.map((p) => ({ id: p.id, score: p.score, totalPrice: p.totalPrice })),
      second.map((p) => ({ id: p.id, score: p.score, totalPrice: p.totalPrice })),
    );
  });

  it("does not mutate input arrays", () => {
    const flights = [flight({ id: "f1" }), flight({ id: "f0", price: 50 })];
    const hotels = [hotel({ id: "h1" }), hotel({ id: "h0", price: 100 })];
    const flightOrder = flights.map((f) => f.id);
    const hotelOrder = hotels.map((h) => h.id);

    composePackages(flights, hotels, baseRequest());

    assert.deepEqual(
      flights.map((f) => f.id),
      flightOrder,
    );
    assert.deepEqual(
      hotels.map((h) => h.id),
      hotelOrder,
    );
  });

  it("falls back to request nights when hotel nights invalid", () => {
    const packages = composePackages(
      [flight()],
      [hotel({ nights: 0 })],
      baseRequest({
        departureDate: "2026-09-01",
        returnDate: "2026-09-04",
      }),
    );

    assert.equal(packages[0]!.nights, 3);
  });
});
