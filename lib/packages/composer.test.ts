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

    // Cheapest candidates are preferred for the cap window.
    const flightIds = new Set(packages.map((p) => p.flightId));
    const hotelIds = new Set(packages.map((p) => p.hotelId));
    assert.ok(flightIds.has("f00"));
    assert.ok(!flightIds.has("f11"));
    assert.ok(hotelIds.has("h00"));
    assert.ok(!hotelIds.has("h11"));
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

  it("orders by score descending, then price, then id", () => {
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
    for (let i = 1; i < packages.length; i++) {
      const prev = packages[i - 1]!;
      const curr = packages[i]!;
      if (prev.score !== curr.score) {
        assert.ok(prev.score > curr.score);
      } else if (prev.totalPrice !== curr.totalPrice) {
        assert.ok(prev.totalPrice < curr.totalPrice);
      } else {
        assert.ok(prev.id.localeCompare(curr.id) <= 0);
      }
    }

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
