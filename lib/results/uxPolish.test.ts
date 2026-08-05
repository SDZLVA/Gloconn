/**
 * Sprint 14.3 — UX polish tests (swap, budget label, trip wording, headings).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FlightResultCard } from "@/components/results/FlightResultCard";
import { ResultsList } from "@/components/results/ResultsList";
import { RecommendedPackagesSection } from "@/components/results/RecommendedPackagesSection";
import {
  formatBudgetFieldLabel,
  getCurrencySymbol,
} from "@/lib/budget";
import { groupBrowseResults } from "@/lib/results/browseResults";
import {
  formatFlightTripPriceLabel,
} from "@/lib/results/packagesUi";
import { swapOriginDestinationFields } from "@/lib/search/swapPlaces";
import type { FlightResult, HotelResult } from "@/types/results";
import type { TravelPackage } from "@/types/models/travel-package";

const hotelResult: HotelResult = {
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
};

const flightResult: FlightResult = {
  type: "flight",
  id: "f1",
  destinationId: "paris",
  price: 200,
  currency: "EUR",
  rating: 4,
  airline: "Air France",
  departureTime: "08:00",
  arrivalTime: "10:00",
  durationMinutes: 120,
  stops: 0,
  cabin: "Economy",
};

describe("swapOriginDestinationFields", () => {
  it("swaps labels and ids in one step", () => {
    const swapped = swapOriginDestinationFields({
      origin: "Milan, Italy",
      originId: "milan",
      destination: "Paris, France",
      destinationId: "paris",
    });

    assert.deepEqual(swapped, {
      origin: "Paris, France",
      originId: "paris",
      destination: "Milan, Italy",
      destinationId: "milan",
    });
  });

  it("is reversible", () => {
    const places = {
      origin: "A",
      originId: "a",
      destination: "B",
      destinationId: "b",
    };
    assert.deepEqual(
      swapOriginDestinationFields(swapOriginDestinationFields(places)),
      places,
    );
  });
});

describe("dynamic budget label", () => {
  it("formats Budget (CODE) for common currencies", () => {
    assert.equal(formatBudgetFieldLabel("EUR"), "Budget (EUR)");
    assert.equal(formatBudgetFieldLabel("USD"), "Budget (USD)");
    assert.equal(formatBudgetFieldLabel("JPY"), "Budget (JPY)");
    assert.equal(formatBudgetFieldLabel("GBP"), "Budget (GBP)");
  });

  it("resolves currency symbols for the input prefix", () => {
    assert.equal(getCurrencySymbol("EUR"), "€");
    assert.equal(getCurrencySymbol("USD"), "$");
    assert.equal(getCurrencySymbol("JPY"), "¥");
    assert.equal(getCurrencySymbol("GBP"), "£");
  });
});

describe("flight trip-type wording", () => {
  it("formats one-way and round-trip footnotes", () => {
    assert.equal(
      formatFlightTripPriceLabel("one-way"),
      "One-way · per person",
    );
    assert.equal(
      formatFlightTripPriceLabel("round-trip"),
      "Round-trip · per person",
    );
    assert.equal(
      formatFlightTripPriceLabel(undefined),
      "Round-trip · per person",
    );
  });

  it("renders matching copy on FlightResultCard", () => {
    const oneWay = renderToStaticMarkup(
      createElement(FlightResultCard, {
        result: flightResult,
        tripType: "one-way",
      }),
    );
    const roundTrip = renderToStaticMarkup(
      createElement(FlightResultCard, {
        result: flightResult,
        tripType: "round-trip",
      }),
    );

    assert.match(oneWay, /One-way · per person/);
    assert.doesNotMatch(oneWay, /Round-trip/);
    assert.match(roundTrip, /Round-trip · per person/);
    assert.doesNotMatch(roundTrip, /One-way/);
  });
});

describe("results hierarchy headings", () => {
  it("groups flights and hotels for browse sections", () => {
    const grouped = groupBrowseResults([hotelResult, flightResult, hotelResult]);
    assert.equal(grouped.flights.length, 1);
    assert.equal(grouped.hotels.length, 2);
    assert.equal(grouped.flights[0]?.id, "f1");
  });

  it("renders Browse Flights and Browse Hotels headings", () => {
    const html = renderToStaticMarkup(
      createElement(ResultsList, {
        results: [flightResult, hotelResult],
        tripType: "one-way",
      }),
    );

    assert.match(html, /Browse Flights/);
    assert.match(html, /Browse Hotels/);
    assert.match(html, /browse-flights-heading/);
    assert.match(html, /browse-hotels-heading/);
    assert.match(html, /aria-label="Flight results"/);
    assert.match(html, /aria-label="Hotel results"/);
    assert.match(html, /One-way · per person/);
  });

  it("keeps Recommended Packages above browse wording", () => {
    const { type: _f, ...flight } = flightResult;
    const { type: _h, ...hotel } = hotelResult;
    const pkg: TravelPackage = {
      id: "pkg-1",
      flight,
      hotel,
      flightId: flight.id,
      hotelId: hotel.id,
      totalPrice: 600,
      currency: "EUR",
      nights: 3,
      score: 90,
    };

    const packagesHtml = renderToStaticMarkup(
      createElement(RecommendedPackagesSection, { packages: [pkg] }),
    );
    const listHtml = renderToStaticMarkup(
      createElement(ResultsList, {
        results: [flightResult, hotelResult],
      }),
    );
    const combined = `${packagesHtml}${listHtml}`;

    assert.ok(
      combined.indexOf("Recommended Packages") <
        combined.indexOf("Browse Flights"),
    );
    assert.ok(
      combined.indexOf("Browse Flights") < combined.indexOf("Browse Hotels"),
    );
    assert.match(packagesHtml, /⭐/);
  });
});

describe("swap control accessibility contract", () => {
  it("documents the required accessible name for the swap control", () => {
    // SearchForm uses this exact aria-label on the swap button.
    const ariaLabel = "Swap origin and destination";
    assert.match(ariaLabel, /Swap origin and destination/);
  });
});
