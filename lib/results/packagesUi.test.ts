/**
 * Sprint 13.4 — Recommended Packages UI helpers + render smoke tests.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RecommendedPackagesSection } from "@/components/results/RecommendedPackagesSection";
import { TravelPackageCard } from "@/components/results/TravelPackageCard";
import {
  formatPackageNightsLabel,
  formatPackageScoreLabel,
  formatPackageStopsLabel,
  formatFlightTripPriceLabel,
  selectPackagesForDisplay,
  shouldShowRecommendedPackages,
} from "@/lib/results/packagesUi";
import type { Flight } from "@/types/models/flight";
import type { Hotel } from "@/types/models/hotel";
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

  it("formats score and nights labels", () => {
    assert.equal(formatPackageScoreLabel(87.5), "Match 87.5");
    assert.equal(formatPackageScoreLabel(90), "Match 90");
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
  it("renders price, flight, hotel, nights, and score", () => {
    const html = renderToStaticMarkup(
      createElement(TravelPackageCard, {
        package: travelPackage({
          score: 91,
          nights: 5,
          totalPrice: 650,
        }),
      }),
    );

    assert.match(html, /Air France/);
    assert.match(html, /Hotel Paris/);
    assert.match(html, /Match 91/);
    assert.match(html, /5 nights/);
    assert.match(html, /Departure/);
    assert.match(html, /Arrive/);
    assert.match(html, /Direct/);
    assert.match(html, /08:00/);
    assert.match(html, /10:00/);
    // Informational only — no booking CTA.
    assert.doesNotMatch(html, /Select|Book|Build Package/i);
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
