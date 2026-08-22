/**
 * Sprint 16.2 — candidate selection unit tests.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  QUALITY_SLOTS,
  buildCandidateBudgetContext,
  resolveScoringBudgetAmount,
  selectFlightCandidates,
  selectHotelCandidates,
} from "@/lib/packages/candidates";
import { MAX_FLIGHT_CANDIDATES, MAX_HOTEL_CANDIDATES } from "@/lib/packages/constants";
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

describe("selectFlightCandidates (Sprint 16.2)", () => {
  it("includes an expensive direct/fast flight that pure price-sort would exclude", () => {
    const cheapFlights = Array.from({ length: 10 }, (_, i) =>
      flight({
        id: `cheap${i}`,
        price: 100 + i,
        rating: 0,
        stops: 2,
        durationMinutes: 1200 + i,
      }),
    );
    const directFlight = flight({
      id: "direct",
      price: 500,
      rating: 0,
      stops: 0,
      durationMinutes: 480,
    });
    const hotels = [hotel({ price: 200 })];

    const selected = selectFlightCandidates(
      [...cheapFlights, directFlight],
      MAX_FLIGHT_CANDIDATES,
      baseRequest(),
      hotels,
    );

    assert.equal(selected.length, MAX_FLIGHT_CANDIDATES);
    assert.ok(
      selected.some((f) => f.id === "direct"),
      "direct flight should enter via convenience quality slot",
    );
    assert.ok(selected.some((f) => f.id === "cheap0"));
  });

  it("does not use Flight.rating for quality slots when rating differs but convenience is equal", () => {
    const cheapFlights = Array.from({ length: 10 }, (_, i) =>
      flight({
        id: `cheap${i}`,
        price: 100 + i,
        rating: 0,
        stops: 2,
        durationMinutes: 1000,
      }),
    );
    const highRatingSlow = flight({
      id: "rated-slow",
      price: 450,
      rating: 5,
      stops: 2,
      durationMinutes: 1000,
    });
    const lowRatingFast = flight({
      id: "unrated-fast",
      price: 460,
      rating: 0,
      stops: 0,
      durationMinutes: 400,
    });

    const selected = selectFlightCandidates(
      [...cheapFlights, highRatingSlow, lowRatingFast],
      MAX_FLIGHT_CANDIDATES,
      baseRequest({ budget: null }),
      [hotel()],
    );

    assert.ok(
      selected.some((f) => f.id === "unrated-fast"),
      "convenience wins over rating",
    );
    assert.ok(!selected.some((f) => f.id === "rated-slow"));
  });

  it("never exceeds the candidate cap", () => {
    const flights = Array.from({ length: 25 }, (_, i) =>
      flight({ id: `f${i}`, price: 100 + i * 5, stops: i % 3 }),
    );
    const selected = selectFlightCandidates(
      flights,
      MAX_FLIGHT_CANDIDATES,
      baseRequest(),
      [hotel()],
    );
    assert.equal(selected.length, MAX_FLIGHT_CANDIDATES);
  });

  it("is deterministic for identical inputs", () => {
    const flights = Array.from({ length: 15 }, (_, i) =>
      flight({
        id: `f${String(i).padStart(2, "0")}`,
        price: 100 + i * 10,
        stops: i % 2,
        durationMinutes: 600 + i * 20,
      }),
    );
    const hotels = [hotel()];
    const request = baseRequest();

    const first = selectFlightCandidates(
      flights,
      MAX_FLIGHT_CANDIDATES,
      request,
      hotels,
    );
    const second = selectFlightCandidates(
      flights,
      MAX_FLIGHT_CANDIDATES,
      request,
      hotels,
    );

    assert.deepEqual(
      first.map((f) => f.id),
      second.map((f) => f.id),
    );
  });

  it("includes all flights when count <= cap", () => {
    const flights = [
      flight({ id: "f1", price: 300, stops: 0 }),
      flight({ id: "f2", price: 100, stops: 2 }),
    ];
    const selected = selectFlightCandidates(
      flights,
      MAX_FLIGHT_CANDIDATES,
      baseRequest(),
      [hotel()],
    );
    assert.equal(selected.length, 2);
    assert.deepEqual(
      selected.map((f) => f.id).sort(),
      ["f1", "f2"],
    );
  });
});

describe("selectHotelCandidates (Sprint 16.2)", () => {
  it("includes a higher-priced 4★ hotel over a high-rated hostel in quality slots", () => {
    const cheapHotels = Array.from({ length: 10 }, (_, i) =>
      hotel({
        id: `cheap${i}`,
        price: 200 + i,
        stars: 1,
        rating: 3.5,
      }),
    );
    const hostel = hotel({
      id: "hostel",
      price: 350,
      stars: 0,
      rating: 5,
      name: "Backpacker Hostel",
    });
    const fourStar = hotel({
      id: "four-star",
      price: 900,
      stars: 4,
      rating: 4.2,
      name: "Grand Hotel",
    });

    const selected = selectHotelCandidates(
      [...cheapHotels, hostel, fourStar],
      MAX_HOTEL_CANDIDATES,
      baseRequest({ budget: null }),
      [flight({ price: 150 })],
    );

    assert.ok(
      selected.some((h) => h.id === "four-star"),
      "4★ hotel should enter via stars quality slot",
    );
    assert.ok(selected.some((h) => h.id === "cheap0"));
    assert.ok(!selected.some((h) => h.id === "hostel"));
  });

  it("prefers higher stars when guest ratings are equal", () => {
    const hotels = [
      ...Array.from({ length: 8 }, (_, i) =>
        hotel({
          id: `budget${i}`,
          price: 100 + i,
          stars: 2,
          rating: 4,
        }),
      ),
      hotel({ id: "three-star", price: 500, stars: 3, rating: 4 }),
      hotel({ id: "five-star", price: 520, stars: 5, rating: 4 }),
    ];

    const selected = selectHotelCandidates(
      hotels,
      MAX_HOTEL_CANDIDATES,
      baseRequest({ budget: null }),
      [flight()],
    );

    assert.ok(selected.some((h) => h.id === "five-star"));
    // Both may appear when two quality slots are available; five-star must win a slot.
    const qualityIds = selected
      .filter((h) => h.id === "five-star" || h.id === "three-star")
      .map((h) => h.id);
    assert.ok(qualityIds.includes("five-star"));
  });

  it("never exceeds the candidate cap", () => {
    const hotels = Array.from({ length: 20 }, (_, i) =>
      hotel({ id: `h${i}`, price: 200 + i * 10, stars: (i % 5) + 1 }),
    );
    const selected = selectHotelCandidates(
      hotels,
      MAX_HOTEL_CANDIDATES,
      baseRequest(),
      [flight()],
    );
    assert.equal(selected.length, MAX_HOTEL_CANDIDATES);
  });

  it("is deterministic for identical inputs", () => {
    const hotels = Array.from({ length: 15 }, (_, i) =>
      hotel({
        id: `h${String(i).padStart(2, "0")}`,
        price: 200 + i * 15,
        stars: i % 5,
        rating: 3 + (i % 3) * 0.3,
      }),
    );
    const flights = [flight()];
    const request = baseRequest();

    const first = selectHotelCandidates(
      hotels,
      MAX_HOTEL_CANDIDATES,
      request,
      flights,
    );
    const second = selectHotelCandidates(
      hotels,
      MAX_HOTEL_CANDIDATES,
      request,
      flights,
    );

    assert.deepEqual(
      first.map((h) => h.id),
      second.map((h) => h.id),
    );
  });
});

describe("budget-aware candidate selection (Sprint 16.2)", () => {
  it("prefers budget-likely flights in quality slots when budget currency matches", () => {
    const cheapFlights = Array.from({ length: 10 }, (_, i) =>
      flight({
        id: `cheap${i}`,
        price: 100 + i,
        stops: 2,
        durationMinutes: 1200,
      }),
    );
    const overBudgetDirect = flight({
      id: "over-direct",
      price: 900,
      stops: 0,
      durationMinutes: 400,
    });
    const inBudgetDirect = flight({
      id: "in-direct",
      price: 400,
      stops: 0,
      durationMinutes: 420,
    });
    const hotels = [hotel({ price: 300, currency: "EUR" })];

    const selected = selectFlightCandidates(
      [...cheapFlights, overBudgetDirect, inBudgetDirect],
      MAX_FLIGHT_CANDIDATES,
      baseRequest({ budget: { amount: 800, currency: "EUR" } }),
      hotels,
    );

    assert.ok(
      selected.some((f) => f.id === "in-direct"),
      "in-budget direct flight should win quality slot",
    );
    assert.ok(!selected.some((f) => f.id === "over-direct"));
  });

  it("prefers budget-likely hotels in quality slots when budget currency matches", () => {
    const cheapHotels = Array.from({ length: 10 }, (_, i) =>
      hotel({
        id: `cheap${i}`,
        price: 50 + i,
        stars: 2,
        rating: 3.5,
      }),
    );
    const overBudgetLuxury = hotel({
      id: "over-luxury",
      price: 1200,
      stars: 5,
      rating: 4.9,
    });
    const inBudgetFourStar = hotel({
      id: "in-four",
      price: 350,
      stars: 4,
      rating: 4.4,
    });
    const flights = [flight({ price: 400, currency: "EUR" })];

    const selected = selectHotelCandidates(
      [...cheapHotels, overBudgetLuxury, inBudgetFourStar],
      MAX_HOTEL_CANDIDATES,
      baseRequest({ budget: { amount: 800, currency: "EUR" } }),
      flights,
    );

    assert.ok(selected.some((h) => h.id === "in-four"));
    assert.ok(!selected.some((h) => h.id === "over-luxury"));
  });

  it("does not hard-filter over-budget items from the price window", () => {
    const flights = Array.from({ length: 12 }, (_, i) =>
      flight({
        id: `f${i}`,
        price: 500 + i * 50,
        stops: 1,
        durationMinutes: 800,
      }),
    );
    const hotels = [hotel({ price: 400 })];

    const selected = selectFlightCandidates(
      flights,
      MAX_FLIGHT_CANDIDATES,
      baseRequest({ budget: { amount: 600, currency: "EUR" } }),
      hotels,
    );

    // Cheapest flights are all over budget (500+400 > 600) but still selected.
    assert.ok(selected.some((f) => f.id === "f0"));
    assert.equal(selected.length, MAX_FLIGHT_CANDIDATES);
  });

  it("ignores budget amounts when budget currency does not match pair currency", () => {
    const cheapFlights = Array.from({ length: 10 }, (_, i) =>
      flight({
        id: `cheap${i}`,
        price: 100 + i,
        stops: 2,
        durationMinutes: 1200,
      }),
    );
    const inBudgetDirect = flight({
      id: "in-direct",
      price: 200,
      stops: 0,
      durationMinutes: 400,
    });
    const overBudgetDirect = flight({
      id: "over-direct",
      price: 900,
      stops: 0,
      durationMinutes: 380,
    });
    const hotels = [hotel({ price: 300, currency: "EUR" })];

    const selected = selectFlightCandidates(
      [...cheapFlights, inBudgetDirect, overBudgetDirect],
      MAX_FLIGHT_CANDIDATES,
      baseRequest({ budget: { amount: 800, currency: "USD" } }),
      hotels,
    );

    // Faster over-budget USD flight should win quality slot (budget not applied).
    assert.ok(selected.some((f) => f.id === "over-direct"));
  });
});

describe("buildCandidateBudgetContext", () => {
  it("returns appliesToSelection false when budget is null", () => {
    const ctx = buildCandidateBudgetContext(
      baseRequest({ budget: null }),
      [flight()],
      [hotel()],
    );
    assert.equal(ctx.appliesToSelection, false);
    assert.equal(ctx.amount, null);
  });

  it("returns appliesToSelection false when no matching currency pair exists", () => {
    const ctx = buildCandidateBudgetContext(
      baseRequest({ budget: { amount: 1000, currency: "USD" } }),
      [flight({ currency: "EUR" })],
      [hotel({ currency: "EUR" })],
    );
    assert.equal(ctx.appliesToSelection, false);
    assert.equal(ctx.amount, 1000);
  });

  it("returns appliesToSelection true when budget currency matches pairs", () => {
    const ctx = buildCandidateBudgetContext(
      baseRequest({ budget: { amount: 1000, currency: "EUR" } }),
      [flight({ currency: "EUR" })],
      [hotel({ currency: "EUR" })],
    );
    assert.equal(ctx.appliesToSelection, true);
  });
});

describe("resolveScoringBudgetAmount", () => {
  it("returns null when budget is missing", () => {
    assert.equal(
      resolveScoringBudgetAmount(baseRequest({ budget: null }), {
        flight: flight(),
        hotel: hotel(),
        totalPrice: 600,
      }),
      null,
    );
  });

  it("returns null when package currency differs from budget currency", () => {
    assert.equal(
      resolveScoringBudgetAmount(
        baseRequest({ budget: { amount: 1000, currency: "USD" } }),
        {
          flight: flight({ currency: "EUR" }),
          hotel: hotel({ currency: "EUR" }),
          totalPrice: 600,
        },
      ),
      null,
    );
  });

  it("returns budget amount when currencies match", () => {
    assert.equal(
      resolveScoringBudgetAmount(baseRequest(), {
        flight: flight({ currency: "EUR" }),
        hotel: hotel({ currency: "EUR" }),
        totalPrice: 600,
      }),
      1500,
    );
  });
});

describe("QUALITY_SLOTS", () => {
  it("reserves 2 quality slots (6+2 when cap is 8)", () => {
    assert.equal(QUALITY_SLOTS, 2);
    assert.equal(MAX_FLIGHT_CANDIDATES - QUALITY_SLOTS, 6);
  });
});
