/**
 * Recommended Packages UI helpers + render smoke tests.
 * Sprint 15.2: P0.1 price trust, P0.2 quality badge, P0.3 hotel rooms, P1.4 stars.
 * Sprint 15.3: T1 visible cap, T2 includes summary, T3 result counts, T4 route, T5 one-way warning.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RecommendedPackagesSection, PACKAGES_INITIAL_VISIBLE } from "@/components/results/RecommendedPackagesSection";
import { TravelPackageCard } from "@/components/results/TravelPackageCard";
import { HotelResultCard } from "@/components/results/HotelResultCard";
import { formatResultCountBreakdown } from "@/components/results/ResultsSortBar";
import {
  BUDGET_COMPATIBILITY_WARNING_MESSAGE,
  formatPackageNightsLabel,
  formatPackageQualityBadge,
  formatPackagePriceBreakdownLabel,
  formatPackageIncludesSummary,
  formatPackageStopsLabel,
  formatFlightTripPriceLabel,
  formatHotelPriceLabel,
  formatHotelStarsLabel,
  formatFlightRoute,
  getHotelRoomWarning,
  isOneWayHotelWarning,
  ONE_WAY_HOTEL_WARNING_MESSAGE,
  PACKAGES_INITIAL_VISIBLE as PACKAGES_INITIAL_VISIBLE_LIB,
  selectPackagesForDisplay,
  shouldShowBudgetCompatibilityWarning,
  shouldShowRecommendedPackages,
} from "@/lib/results/packagesUi";
import type { Flight } from "@/types/models/flight";
import type { Hotel } from "@/types/models/hotel";
import type { HotelResult } from "@/types/results";
import type { TravelPackage } from "@/types/models/travel-package";

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
    rating: 4.5,
    name: "Hotel Paris",
    stars: 4,
    amenities: ["Wi-Fi"],
    nights: 7,
    location: "Marais",
    ...overrides,
  };
}

function travelPackage(
  overrides: Partial<TravelPackage> = {},
): TravelPackage {
  const f = overrides.flight ?? flight();
  const h = overrides.hotel ?? hotel();
  return {
    id: "pkg-f1-h1",
    flight: f,
    hotel: h,
    flightId: f.id,
    hotelId: h.id,
    totalPrice: f.price + h.price,
    currency: f.currency,
    nights: 7,
    score: 87.5,
    ...overrides,
  };
}

describe("shouldShowRecommendedPackages", () => {
  it("is true only when packages has items", () => {
    assert.equal(shouldShowRecommendedPackages([travelPackage()]), true);
    assert.equal(shouldShowRecommendedPackages([]), false);
    assert.equal(shouldShowRecommendedPackages(null), false);
    assert.equal(shouldShowRecommendedPackages(undefined), false);
  });
});

describe("selectPackagesForDisplay", () => {
  it("returns a copy when packages exist and [] when empty", () => {
    const input = [travelPackage()];
    const selected = selectPackagesForDisplay(input);
    assert.equal(selected.length, 1);
    assert.notEqual(selected, input);
    assert.deepEqual(selectPackagesForDisplay([]), []);
  });
});

describe("package label formatters", () => {
  it("formats stops like FlightResultCard", () => {
    assert.equal(formatPackageStopsLabel(0), "Direct");
    assert.equal(formatPackageStopsLabel(1), "1 stop");
    assert.equal(formatPackageStopsLabel(2), "2 stops");
  });

  it("formats nights labels", () => {
    assert.equal(formatPackageNightsLabel(1), "1 night");
    assert.equal(formatPackageNightsLabel(7), "7 nights");
  });

  it("formats flight trip price labels by trip type", () => {
    assert.equal(formatFlightTripPriceLabel("one-way"), "One-way · per person");
    assert.equal(
      formatFlightTripPriceLabel("round-trip"),
      "Round-trip · per person",
    );
  });
});

// ---------------------------------------------------------------------------
// P0.2 — Quality badge (replaces opaque "Match N" score)
// ---------------------------------------------------------------------------

describe("formatPackageQualityBadge (P0.2)", () => {
  it("returns 'Top Pick' for scores >= 80", () => {
    assert.equal(formatPackageQualityBadge(80), "Top Pick");
    assert.equal(formatPackageQualityBadge(90), "Top Pick");
    assert.equal(formatPackageQualityBadge(100), "Top Pick");
  });

  it("returns 'Good Match' for scores 60–79.9", () => {
    assert.equal(formatPackageQualityBadge(60), "Good Match");
    assert.equal(formatPackageQualityBadge(75), "Good Match");
    assert.equal(formatPackageQualityBadge(79.9), "Good Match");
  });

  it("returns null for scores below 60", () => {
    assert.equal(formatPackageQualityBadge(59.9), null);
    assert.equal(formatPackageQualityBadge(0), null);
  });

  it("returns null for non-finite scores", () => {
    assert.equal(formatPackageQualityBadge(NaN), null);
    assert.equal(formatPackageQualityBadge(Infinity), null);
  });
});

// ---------------------------------------------------------------------------
// P0.1 — Package price breakdown label
// ---------------------------------------------------------------------------

describe("formatPackagePriceBreakdownLabel (P0.1)", () => {
  it("includes 'per person' for flight and '1 room' for hotel", () => {
    const label = formatPackagePriceBreakdownLabel(7);
    assert.match(label, /per person/);
    assert.match(label, /1 room/);
    assert.match(label, /7 nights/);
  });

  it("handles singular night correctly", () => {
    const label = formatPackagePriceBreakdownLabel(1);
    assert.match(label, /1 night/);
    assert.doesNotMatch(label, /1 nights/);
  });

  it("does NOT contain 'flight + hotel total' (the old misleading wording)", () => {
    const label = formatPackagePriceBreakdownLabel(3);
    assert.doesNotMatch(label, /flight \+ hotel total/i);
  });
});

// ---------------------------------------------------------------------------
// P0.3 — Hotel price label and multi-traveler warning
// ---------------------------------------------------------------------------

describe("formatHotelPriceLabel (P0.3)", () => {
  it("formats as 'N nights · 1 room'", () => {
    assert.equal(formatHotelPriceLabel(1), "1 night · 1 room");
    assert.equal(formatHotelPriceLabel(3), "3 nights · 1 room");
    assert.equal(formatHotelPriceLabel(7), "7 nights · 1 room");
  });

  it("does NOT say 'per room' (old ambiguous wording)", () => {
    assert.doesNotMatch(formatHotelPriceLabel(3), /per room/);
  });
});

describe("getHotelRoomWarning (P0.3)", () => {
  it("returns null for 1 adult", () => {
    assert.equal(getHotelRoomWarning(1), null);
  });

  it("returns null for 2 adults (fits 1 room)", () => {
    assert.equal(getHotelRoomWarning(2), null);
  });

  it("returns a warning string for 3+ adults", () => {
    const w3 = getHotelRoomWarning(3);
    assert.ok(typeof w3 === "string" && w3.length > 0);
    assert.match(w3!, /1 room/);
  });

  it("returns a warning string for 4 adults", () => {
    const w4 = getHotelRoomWarning(4);
    assert.ok(typeof w4 === "string");
    assert.match(w4!, /room/);
  });

  it("returns null for null or undefined adults", () => {
    assert.equal(getHotelRoomWarning(null), null);
    assert.equal(getHotelRoomWarning(undefined), null);
  });

  it("returns null for non-finite values", () => {
    assert.equal(getHotelRoomWarning(NaN), null);
  });
});

// ---------------------------------------------------------------------------
// P1.4 — Hotel stars label
// ---------------------------------------------------------------------------

describe("formatHotelStarsLabel (P1.4)", () => {
  it("returns star characters for 1–5 stars", () => {
    assert.equal(formatHotelStarsLabel(1), "★");
    assert.equal(formatHotelStarsLabel(3), "★★★");
    assert.equal(formatHotelStarsLabel(5), "★★★★★");
  });

  it("returns 'Unrated' for 0 stars", () => {
    assert.equal(formatHotelStarsLabel(0), "Unrated");
  });

  it("returns 'Unrated' for negative values", () => {
    assert.equal(formatHotelStarsLabel(-1), "Unrated");
  });

  it("returns 'Unrated' for NaN", () => {
    assert.equal(formatHotelStarsLabel(NaN), "Unrated");
  });

  it("clamps to 5 stars maximum", () => {
    assert.equal(formatHotelStarsLabel(6), "★★★★★");
  });
});


describe("RecommendedPackagesSection rendering", () => {
  it("renders nothing when packages is empty", () => {
    const html = renderToStaticMarkup(
      createElement(RecommendedPackagesSection, { packages: [] }),
    );
    assert.equal(html, "");
  });

  it("renders heading and cards when packages exist", () => {
    const packages = [
      travelPackage({ id: "pkg-a" }),
      travelPackage({
        id: "pkg-b",
        flight: flight({ id: "f2", airline: "Lufthansa" }),
        hotel: hotel({ id: "h2", name: "Hotel Lyon" }),
        flightId: "f2",
        hotelId: "h2",
      }),
    ];

    const html = renderToStaticMarkup(
      createElement(RecommendedPackagesSection, { packages }),
    );

    assert.match(html, /Recommended Packages/);
    assert.match(html, /recommended-packages-heading/);
    assert.match(html, /⭐/);
    assert.match(html, /Air France/);
    assert.match(html, /Hotel Paris/);
    assert.match(html, /Lufthansa/);
    assert.match(html, /Hotel Lyon/);
    assert.match(html, /aria-label="Recommended travel packages"/);
    // Sprint 16.4: exactly one Recommended role among visible packages
    assert.match(html, />Recommended</);
    assert.doesNotMatch(html, /Top Pick|Good Match|Match \d/);
  });

  it("S16.4: assigns Recommended to highest-scoring package among visible", () => {
    const packages = [
      travelPackage({
        id: "pkg-low",
        score: 70,
        totalPrice: 900,
        flight: flight({ id: "f-low", airline: "Ryanair", durationMinutes: 200, stops: 1 }),
        hotel: hotel({ id: "h-low", name: "Budget Inn", stars: 2, rating: 3.0 }),
        flightId: "f-low",
        hotelId: "h-low",
      }),
      travelPackage({
        id: "pkg-high",
        score: 92,
        totalPrice: 1100,
        flight: flight({ id: "f-high", airline: "Swiss", durationMinutes: 100, stops: 0 }),
        hotel: hotel({ id: "h-high", name: "Grand Hotel", stars: 5, rating: 4.8 }),
        flightId: "f-high",
        hotelId: "h-high",
      }),
    ];

    const html = renderToStaticMarkup(
      createElement(RecommendedPackagesSection, {
        packages,
        budget: { amount: 1000, currency: "EUR" },
      }),
    );

    // Highest score package gets Recommended; lowest price gets a secondary role.
    assert.match(html, /Swiss \+ Grand Hotel[\s\S]*?Recommended|Recommended[\s\S]*?Swiss \+ Grand Hotel/);
    assert.match(html, /Lowest price|Best hotel|Fastest|Direct flight|Fits your budget|Best value/);
    assert.doesNotMatch(html, /Match \d/);
  });

  it("keeps package cards before any sibling browse sections in page order contract", () => {
    // Ordering contract for SearchResultsPage: packages section markup, then browse headings.
    const packagesHtml = renderToStaticMarkup(
      createElement(RecommendedPackagesSection, {
        packages: [travelPackage()],
      }),
    );
    const browseMarker = '<h2 id="browse-flights-heading">Browse Flights</h2>';
    const combined = `${packagesHtml}${browseMarker}`;

    const packagesIndex = combined.indexOf("Recommended Packages");
    const browseIndex = combined.indexOf("Browse Flights");
    assert.ok(packagesIndex >= 0);
    assert.ok(browseIndex > packagesIndex);
  });
});

describe("TravelPackageCard rendering", () => {
  it("renders price, flight, hotel, nights, and explanation badge", () => {
    const html = renderToStaticMarkup(
      createElement(TravelPackageCard, {
        package: travelPackage({
          score: 91,
          nights: 5,
          totalPrice: 650,
        }),
        explanation: {
          packageId: "pkg-f1-h1",
          role: "recommended",
          label: "Recommended",
          reason: "Direct flight · 4★ hotel",
        },
      }),
    );

    assert.match(html, /Air France/);
    assert.match(html, /Hotel Paris/);
    assert.match(html, /Recommended/);
    assert.match(html, /Direct flight · 4★ hotel/);
    assert.doesNotMatch(html, /Match 91/);
    assert.doesNotMatch(html, /Match \d/);
    assert.doesNotMatch(html, /Top Pick/);
    assert.match(html, /5 nights/);
    assert.match(html, /Departure/);
    assert.match(html, /Arrive/);
    assert.match(html, /Direct/);
    assert.match(html, /08:00/);
    assert.match(html, /10:00/);
    // P0.1: price breakdown label
    assert.match(html, /per person/);
    assert.match(html, /1 room/);
    assert.doesNotMatch(html, /flight \+ hotel total/i);
    // P0.1: "est. total" suffix
    assert.match(html, /est\. total/);
    // Informational only — no booking CTA.
    assert.doesNotMatch(html, /Select|Book|Build Package/i);
  });

  it("renders secondary role badge when provided", () => {
    const html = renderToStaticMarkup(
      createElement(TravelPackageCard, {
        package: travelPackage({ score: 70 }),
        explanation: {
          packageId: "pkg-f1-h1",
          role: "lowest_price",
          label: "Lowest price",
          reason: "Lowest estimated package price",
        },
      }),
    );
    assert.match(html, /Lowest price/);
    assert.match(html, /Lowest estimated package price/);
    assert.doesNotMatch(html, /Top Pick|Good Match/);
  });

  it("renders no role badge when explanation is omitted", () => {
    const html = renderToStaticMarkup(
      createElement(TravelPackageCard, {
        package: travelPackage({ score: 91 }),
      }),
    );
    assert.doesNotMatch(html, /Recommended/);
    assert.doesNotMatch(html, /Top Pick/);
    assert.doesNotMatch(html, /Good Match/);
    assert.doesNotMatch(html, /Match \d/);
  });

  it("renders 'Unrated' for 0-star hotels in package cards (P1.4)", () => {
    const html = renderToStaticMarkup(
      createElement(TravelPackageCard, {
        package: travelPackage({
          hotel: hotel({ stars: 0 }),
        }),
      }),
    );
    assert.match(html, /Unrated/);
  });

  it("renders stars for rated hotels in package cards", () => {
    const html = renderToStaticMarkup(
      createElement(TravelPackageCard, {
        package: travelPackage({
          hotel: hotel({ stars: 3 }),
        }),
      }),
    );
    assert.doesNotMatch(html, /Unrated/);
    assert.match(html, /★★★/);
  });

  it("renders 'Flight · per person' section header", () => {
    const html = renderToStaticMarkup(
      createElement(TravelPackageCard, {
        package: travelPackage(),
      }),
    );
    assert.match(html, /Flight · per person/);
    assert.match(html, /Hotel · 1 room/);
  });
});

describe("HotelResultCard rendering (P0.3 + P1.4)", () => {
  function hotelResult(overrides: Partial<HotelResult> = {}): HotelResult {
    return {
      type: "hotel",
      id: "h1",
      destinationId: "paris",
      price: 400,
      currency: "EUR",
      rating: 4.5,
      name: "Hotel Paris",
      stars: 4,
      amenities: ["Wi-Fi"],
      nights: 3,
      location: "Marais",
      ...overrides,
    };
  }

  it("shows '3 nights · 1 room' price label for standard hotel (P0.3)", () => {
    const html = renderToStaticMarkup(
      createElement(HotelResultCard, { result: hotelResult({ nights: 3 }) }),
    );
    assert.match(html, /3 nights · 1 room/);
    assert.doesNotMatch(html, /per room/);
  });

  it("shows '1 night · 1 room' for single-night hotel", () => {
    const html = renderToStaticMarkup(
      createElement(HotelResultCard, { result: hotelResult({ nights: 1 }) }),
    );
    assert.match(html, /1 night · 1 room/);
  });

  it("shows 'Unrated' for 0-star hotel (P1.4)", () => {
    const html = renderToStaticMarkup(
      createElement(HotelResultCard, { result: hotelResult({ stars: 0 }) }),
    );
    assert.match(html, /Unrated/);
  });

  it("shows star characters for rated hotel (P1.4)", () => {
    const html = renderToStaticMarkup(
      createElement(HotelResultCard, { result: hotelResult({ stars: 4 }) }),
    );
    assert.doesNotMatch(html, /Unrated/);
    assert.match(html, /★★★★/);
  });

  it("does not render empty amenities list", () => {
    const html = renderToStaticMarkup(
      createElement(HotelResultCard, {
        result: hotelResult({ amenities: [] }),
      }),
    );
    // No <ul> wrapping empty amenities
    assert.doesNotMatch(html, /<ul[^>]*>\s*<\/ul>/);
  });
});

describe("memoization exports", () => {
  it("exports memoized card and section components", () => {
    // React.memo wraps as an object with $$typeof; compare type identity.
    assert.equal(typeof TravelPackageCard, "object");
    assert.equal(typeof RecommendedPackagesSection, "object");
    assert.ok(
      TravelPackageCard &&
        "$$typeof" in TravelPackageCard &&
        TravelPackageCard.$$typeof != null,
    );
    assert.ok(
      RecommendedPackagesSection &&
        "$$typeof" in RecommendedPackagesSection &&
        RecommendedPackagesSection.$$typeof != null,
    );
  });
});

// ===========================================================================
// Sprint 15.3 — New behavior tests
// ===========================================================================

// ---------------------------------------------------------------------------
// Task 1 — Visible package cap
// ---------------------------------------------------------------------------

describe("PACKAGES_INITIAL_VISIBLE constant (Task 1)", () => {
  it("is 5 (component and lib export agree)", () => {
    assert.equal(PACKAGES_INITIAL_VISIBLE, 5);
    assert.equal(PACKAGES_INITIAL_VISIBLE_LIB, 5);
    assert.equal(PACKAGES_INITIAL_VISIBLE, PACKAGES_INITIAL_VISIBLE_LIB);
  });
});

describe("RecommendedPackagesSection visible cap (Task 1)", () => {
  function makePackages(count: number): TravelPackage[] {
    return Array.from({ length: count }, (_, i) =>
      travelPackage({
        id: `pkg-${i}`,
        score: 90 - i,
        flight: flight({ id: `f${i}`, airline: `Airline ${i}` }),
        hotel: hotel({ id: `h${i}`, name: `Hotel ${i}` }),
        flightId: `f${i}`,
        hotelId: `h${i}`,
      }),
    );
  }

  it("renders all packages when count <= PACKAGES_INITIAL_VISIBLE", () => {
    const pkgs = makePackages(PACKAGES_INITIAL_VISIBLE);
    const html = renderToStaticMarkup(
      createElement(RecommendedPackagesSection, { packages: pkgs }),
    );
    for (let i = 0; i < PACKAGES_INITIAL_VISIBLE; i++) {
      assert.match(html, new RegExp(`Hotel ${i}`));
    }
    // No "Show more" button needed
    assert.doesNotMatch(html, /Show \d+ more/);
  });

  it("renders only first 5 initially when count > PACKAGES_INITIAL_VISIBLE", () => {
    const pkgs = makePackages(8);
    const html = renderToStaticMarkup(
      createElement(RecommendedPackagesSection, { packages: pkgs }),
    );
    // First 5 visible
    for (let i = 0; i < PACKAGES_INITIAL_VISIBLE; i++) {
      assert.match(html, new RegExp(`Hotel ${i}`));
    }
    // Items 5-7 hidden (server render starts with showAll=false)
    assert.doesNotMatch(html, /Hotel 5/);
    assert.doesNotMatch(html, /Hotel 6/);
    assert.doesNotMatch(html, /Hotel 7/);
    // Show more button present
    assert.match(html, /Show 3 more packages/);
  });

  it("does not show 'Show more' when exactly 5 packages", () => {
    const pkgs = makePackages(5);
    const html = renderToStaticMarkup(
      createElement(RecommendedPackagesSection, { packages: pkgs }),
    );
    assert.doesNotMatch(html, /Show/);
  });

  it("shows 'Show 1 more package' (singular) for 6 packages", () => {
    const pkgs = makePackages(6);
    const html = renderToStaticMarkup(
      createElement(RecommendedPackagesSection, { packages: pkgs }),
    );
    assert.match(html, /Show 1 more package/);
    assert.doesNotMatch(html, /Show 1 more packages/);
  });
});

// ---------------------------------------------------------------------------
// Task 2 — Package includes summary
// ---------------------------------------------------------------------------

describe("formatPackageIncludesSummary (Task 2)", () => {
  it("formats 'Flight + N nights at HotelName'", () => {
    assert.equal(
      formatPackageIncludesSummary(7, "Hotel Paris"),
      "Flight + 7 nights at Hotel Paris",
    );
  });

  it("handles 1 night singular", () => {
    assert.equal(
      formatPackageIncludesSummary(1, "Ibis"),
      "Flight + 1 night at Ibis",
    );
  });

  it("falls back to 'hotel' when name is empty", () => {
    assert.equal(
      formatPackageIncludesSummary(3, ""),
      "Flight + 3 nights at hotel",
    );
  });
});

describe("TravelPackageCard includes summary render (Task 2)", () => {
  it("renders the includes summary line", () => {
    const html = renderToStaticMarkup(
      createElement(TravelPackageCard, {
        package: travelPackage({ nights: 5 }),
      }),
    );
    assert.match(html, /Flight \+ 5 nights at Hotel Paris/);
  });
});

// ---------------------------------------------------------------------------
// Task 3 — Result count breakdown
// ---------------------------------------------------------------------------

describe("formatResultCountBreakdown (Task 3)", () => {
  it("returns 'X flights · Y hotels' when both present", () => {
    assert.equal(formatResultCountBreakdown(12, 8), "12 flights · 8 hotels");
  });

  it("uses singular for counts of 1", () => {
    assert.equal(formatResultCountBreakdown(1, 1), "1 flight · 1 hotel");
  });

  it("omits zero-count types", () => {
    assert.equal(formatResultCountBreakdown(5, 0), "5 flights");
    assert.equal(formatResultCountBreakdown(0, 3), "3 hotels");
  });

  it("returns null when both are 0 or undefined", () => {
    assert.equal(formatResultCountBreakdown(0, 0), null);
    assert.equal(formatResultCountBreakdown(undefined, undefined), null);
  });
});

// ---------------------------------------------------------------------------
// Task 4 — Flight route
// ---------------------------------------------------------------------------

describe("formatFlightRoute (Task 4)", () => {
  it("returns 'ORIG → DEST' when both codes provided", () => {
    assert.equal(formatFlightRoute("lhr", "cdg"), "LHR → CDG");
  });

  it("uppercases codes", () => {
    assert.equal(formatFlightRoute("mxp", "jfk"), "MXP → JFK");
  });

  it("returns null when origin is missing", () => {
    assert.equal(formatFlightRoute(null, "CDG"), null);
    assert.equal(formatFlightRoute("", "CDG"), null);
  });

  it("returns null when destination is missing", () => {
    assert.equal(formatFlightRoute("LHR", null), null);
    assert.equal(formatFlightRoute("LHR", ""), null);
  });

  it("returns null when both are missing", () => {
    assert.equal(formatFlightRoute(null, null), null);
    assert.equal(formatFlightRoute(undefined, undefined), null);
  });
});

describe("TravelPackageCard route render (Task 4)", () => {
  it("renders route when IATA codes provided", () => {
    const html = renderToStaticMarkup(
      createElement(TravelPackageCard, {
        package: travelPackage(),
        originIata: "MXP",
        destinationIata: "CDG",
      }),
    );
    assert.match(html, /MXP → CDG/);
  });

  it("renders no route when IATA codes are missing", () => {
    const html = renderToStaticMarkup(
      createElement(TravelPackageCard, {
        package: travelPackage(),
      }),
    );
    assert.doesNotMatch(html, /→/);
  });
});

// ---------------------------------------------------------------------------
// Task 5 — One-way hotel warning
// ---------------------------------------------------------------------------

describe("isOneWayHotelWarning (Task 5)", () => {
  const hotelWarning = { domain: "hotels", code: "PROVIDER_UNAVAILABLE" };
  const flightWarning = { domain: "flights", code: "PROVIDER_UNAVAILABLE" };

  it("returns true for one-way with hotels PROVIDER_UNAVAILABLE warning", () => {
    assert.equal(isOneWayHotelWarning("one-way", [hotelWarning]), true);
  });

  it("returns false for round-trip even with hotels warning", () => {
    assert.equal(isOneWayHotelWarning("round-trip", [hotelWarning]), false);
  });

  it("returns false for one-way with only flights warning", () => {
    assert.equal(isOneWayHotelWarning("one-way", [flightWarning]), false);
  });

  it("returns false when no warnings", () => {
    assert.equal(isOneWayHotelWarning("one-way", []), false);
  });

  it("returns false when tripType is null/undefined", () => {
    assert.equal(isOneWayHotelWarning(null, [hotelWarning]), false);
    assert.equal(isOneWayHotelWarning(undefined, [hotelWarning]), false);
  });

  it("returns true for one-way with mixed warnings including hotels", () => {
    assert.equal(
      isOneWayHotelWarning("one-way", [flightWarning, hotelWarning]),
      true,
    );
  });
});

describe("ONE_WAY_HOTEL_WARNING_MESSAGE (Task 5)", () => {
  it("mentions return date and round-trip", () => {
    assert.match(ONE_WAY_HOTEL_WARNING_MESSAGE, /return date/);
    assert.match(ONE_WAY_HOTEL_WARNING_MESSAGE, /round-trip/);
  });
});

describe("shouldShowBudgetCompatibilityWarning", () => {
  it("returns false when budget is null", () => {
    assert.equal(
      shouldShowBudgetCompatibilityWarning(null, [travelPackage()]),
      false,
    );
  });

  it("returns false when at least one package is within budget", () => {
    assert.equal(
      shouldShowBudgetCompatibilityWarning(
        { amount: 700, currency: "EUR" },
        [travelPackage({ totalPrice: 650, currency: "EUR" })],
      ),
      false,
    );
  });

  it("returns false when package total equals budget", () => {
    assert.equal(
      shouldShowBudgetCompatibilityWarning(
        { amount: 650, currency: "EUR" },
        [travelPackage({ totalPrice: 650, currency: "EUR" })],
      ),
      false,
    );
  });

  it("returns true when all packages are above budget", () => {
    assert.equal(
      shouldShowBudgetCompatibilityWarning(
        { amount: 500, currency: "EUR" },
        [
          travelPackage({ id: "pkg-a", totalPrice: 650, currency: "EUR" }),
          travelPackage({ id: "pkg-b", totalPrice: 900, currency: "EUR" }),
        ],
      ),
      true,
    );
  });

  it("returns false when package list is mixed and one is within budget", () => {
    assert.equal(
      shouldShowBudgetCompatibilityWarning(
        { amount: 700, currency: "EUR" },
        [
          travelPackage({ id: "pkg-a", totalPrice: 650, currency: "EUR" }),
          travelPackage({ id: "pkg-b", totalPrice: 900, currency: "EUR" }),
        ],
      ),
      false,
    );
  });

  it("returns false when all package currencies mismatch budget currency", () => {
    assert.equal(
      shouldShowBudgetCompatibilityWarning(
        { amount: 1000, currency: "EUR" },
        [travelPackage({ totalPrice: 500, currency: "USD" })],
      ),
      false,
    );
  });

  it("returns false for mixed packages when none match budget currency", () => {
    assert.equal(
      shouldShowBudgetCompatibilityWarning(
        { amount: 1000, currency: "EUR" },
        [
          travelPackage({ id: "pkg-usd", totalPrice: 500, currency: "USD" }),
          travelPackage({ id: "pkg-gbp", totalPrice: 800, currency: "GBP" }),
        ],
      ),
      false,
    );
  });

  it("returns true when matching-currency packages are all over budget", () => {
    assert.equal(
      shouldShowBudgetCompatibilityWarning(
        { amount: 1000, currency: "EUR" },
        [
          travelPackage({ id: "pkg-usd", totalPrice: 500, currency: "USD" }),
          travelPackage({ id: "pkg-eur", totalPrice: 1500, currency: "EUR" }),
        ],
      ),
      true,
    );
  });

  it("returns false when one matching-currency package is within budget", () => {
    assert.equal(
      shouldShowBudgetCompatibilityWarning(
        { amount: 1000, currency: "EUR" },
        [
          travelPackage({ id: "pkg-usd", totalPrice: 500, currency: "USD" }),
          travelPackage({ id: "pkg-eur", totalPrice: 900, currency: "EUR" }),
        ],
      ),
      false,
    );
  });

  it("returns false when matching-currency package equals budget amount", () => {
    assert.equal(
      shouldShowBudgetCompatibilityWarning(
        { amount: 1000, currency: "EUR" },
        [travelPackage({ id: "pkg-eur", totalPrice: 1000, currency: "EUR" })],
      ),
      false,
    );
  });

  it("returns false for empty packages", () => {
    assert.equal(
      shouldShowBudgetCompatibilityWarning({ amount: 1000, currency: "EUR" }, []),
      false,
    );
  });
});

describe("BUDGET_COMPATIBILITY_WARNING_MESSAGE", () => {
  it("explains budget may be too low", () => {
    assert.match(BUDGET_COMPATIBILITY_WARNING_MESSAGE, /budget may be too low/i);
  });
});
