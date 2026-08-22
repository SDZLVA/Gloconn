/**
 * Sprint 14.2 — MVP UI simplification smoke tests.
 *
 * Verifies hidden features are not rendered and architecture components remain.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FlightResultCard } from "@/components/results/FlightResultCard";
import { HotelResultCard } from "@/components/results/HotelResultCard";
import { BusResultCard } from "@/components/results/BusResultCard";
import { TrainResultCard } from "@/components/results/TrainResultCard";
import { ResultsFilterSidebar } from "@/components/results/ResultsFilterSidebar";
import { ResultsHeader } from "@/components/results/ResultsHeader";
import { RecommendedPackagesSection } from "@/components/results/RecommendedPackagesSection";
import { SearchProductSelector } from "@/components/search/SearchProductSelector";
import { SEARCH_PRODUCT_TYPE_OPTIONS } from "@/lib/search/constants";
import { formatPassengersSummary } from "@/lib/search/passengers";
import { NAV_LINKS, FOOTER_SECTIONS } from "@/lib/navigation";
import {
  filterMvpVisibleResults,
  MVP_RESULT_TYPES,
  MVP_SEARCH_PRODUCT_TYPES,
} from "@/lib/results/mvpUi";
import { DEFAULT_SEARCH_PRODUCT_TYPES } from "@/types/models/search-request";
import { DEFAULT_RESULTS_FILTERS } from "@/types/results";
import type { FlightResult, HotelResult, SearchResult } from "@/types/results";
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
  providerPropertyRef: "gpref1.mock-test-sealed-ref-for-ui-only",
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

function travelPackage(): TravelPackage {
  const { type: _hotelType, ...hotel } = hotelResult;
  const { type: _flightType, ...flight } = flightResult;
  return {
    id: "pkg-f1-h1",
    flight,
    hotel,
    flightId: flight.id,
    hotelId: hotel.id,
    totalPrice: 600,
    currency: "EUR",
    nights: 3,
    score: 88,
  };
}

describe("MVP navigation", () => {
  it("exposes only Search and My Trips in the header nav", () => {
    assert.deepEqual(
      NAV_LINKS.map((link) => link.href),
      ["/", "/my-trips"],
    );
    assert.deepEqual(
      NAV_LINKS.map((link) => link.label),
      ["Search", "My Trips"],
    );
  });

  it("does not link Destinations or About in nav or footer", () => {
    const hrefs: string[] = [
      ...NAV_LINKS.map((link) => link.href),
      ...FOOTER_SECTIONS.flatMap((section) =>
        section.links.map((link) => link.href),
      ),
    ];
    assert.equal(hrefs.includes("/destinations"), false);
    assert.equal(hrefs.includes("/about"), false);
  });
});

describe("MVP search product toggles", () => {
  it("defaults to hotels + flights only", () => {
    assert.deepEqual(DEFAULT_SEARCH_PRODUCT_TYPES, ["hotels", "flights"]);
    assert.deepEqual(MVP_SEARCH_PRODUCT_TYPES, ["hotels", "flights"]);
  });

  it("renders Stays and Flights but not Trains & buses", () => {
    assert.deepEqual(
      SEARCH_PRODUCT_TYPE_OPTIONS.map((option) => option.label),
      ["Stays", "Flights"],
    );

    const html = renderToStaticMarkup(
      createElement(SearchProductSelector, {
        value: ["hotels", "flights"],
        onChange: () => {},
      }),
    );

    assert.match(html, /Stays/);
    assert.match(html, /Flights/);
    assert.doesNotMatch(html, /Trains|buses|Transport/i);
  });
});

describe("MVP results visibility", () => {
  it("filters bus and train out of the visible list", () => {
    const mixed: SearchResult[] = [
      hotelResult,
      flightResult,
      {
        type: "bus",
        id: "b1",
        destinationId: "paris",
        price: 40,
        currency: "EUR",
        rating: 3,
        operator: "FlixBus",
        departureTime: "09:00",
        arrivalTime: "17:00",
        durationMinutes: 480,
        amenities: [],
      },
      {
        type: "train",
        id: "t1",
        destinationId: "paris",
        price: 80,
        currency: "EUR",
        rating: 4,
        operator: "SNCF",
        departureTime: "07:00",
        arrivalTime: "10:00",
        durationMinutes: 180,
        trainClass: "Standard",
      },
    ];

    const visible = filterMvpVisibleResults(mixed);
    assert.equal(visible.length, 2);
    assert.ok(visible.every((result) => MVP_RESULT_TYPES.includes(result.type)));
  });

  it("defaults filters to hotel + flight only", () => {
    assert.deepEqual(DEFAULT_RESULTS_FILTERS.types, ["hotel", "flight"]);
  });
});

describe("MVP result cards — no fake booking CTAs", () => {
  it("hotel and flight cards show price without booking buttons", () => {
    const hotelHtml = renderToStaticMarkup(
      createElement(HotelResultCard, { result: hotelResult }),
    );
    const flightHtml = renderToStaticMarkup(
      createElement(FlightResultCard, { result: flightResult }),
    );

    assert.match(hotelHtml, /Hotel Paris/);
    assert.match(flightHtml, /Air France/);
    assert.match(hotelHtml, /View hotel/);
    assert.doesNotMatch(hotelHtml, /View deal|Select flight|Book /i);
    assert.doesNotMatch(flightHtml, /View deal|Select flight|Book /i);
  });

  it("bus and train cards also have no fake CTAs (architecture retained)", () => {
    const busHtml = renderToStaticMarkup(
      createElement(BusResultCard, {
        result: {
          type: "bus",
          id: "b1",
          destinationId: "paris",
          price: 40,
          currency: "EUR",
          rating: 3,
          operator: "FlixBus",
          departureTime: "09:00",
          arrivalTime: "17:00",
          durationMinutes: 480,
          amenities: ["Wi-Fi"],
        },
      }),
    );
    const trainHtml = renderToStaticMarkup(
      createElement(TrainResultCard, {
        result: {
          type: "train",
          id: "t1",
          destinationId: "paris",
          price: 80,
          currency: "EUR",
          rating: 4,
          operator: "SNCF",
          departureTime: "07:00",
          arrivalTime: "10:00",
          durationMinutes: 180,
          trainClass: "Standard",
        },
      }),
    );

    assert.doesNotMatch(busHtml, /Book bus|View deal|Select /i);
    assert.doesNotMatch(trainHtml, /Book train|View deal|Select /i);
  });
});

describe("MVP filter sidebar", () => {
  it("shows Hotels and Flights but not Buses or Trains", () => {
    const html = renderToStaticMarkup(
      createElement(ResultsFilterSidebar, {
        filters: DEFAULT_RESULTS_FILTERS,
        onFiltersChange: () => {},
        priceRange: { min: 0, max: 1000 },
        facets: {
          airlines: [],
          cabins: [],
          operators: ["FlixBus"],
          amenities: [],
          maxStopsInResults: 0,
        },
      }),
    );

    assert.match(html, /Hotels/);
    assert.match(html, /Flights/);
    assert.doesNotMatch(html, />Buses</);
    assert.doesNotMatch(html, />Trains</);
    assert.doesNotMatch(html, /Operators/);
  });
});

describe("MVP results chrome copy", () => {
  it("header no longer mentions ground transport", () => {
    const html = renderToStaticMarkup(
      createElement(ResultsHeader, {
        origin: "Milan",
        destination: "Paris",
      }),
    );
    assert.match(html, /hotels and flights/i);
    assert.doesNotMatch(html, /transport|buses|trains/i);
  });

  it("traveler summary omits rooms in MVP mode", () => {
    const summary = formatPassengersSummary(
      { adults: 2, children: 0, infants: 0, rooms: 1 },
      { includeRooms: false },
    );
    assert.equal(summary, "2 Adults");
    assert.doesNotMatch(summary, /Room/i);
  });
});

describe("MVP packages still render", () => {
  it("Recommended Packages section still appears with packages", () => {
    const html = renderToStaticMarkup(
      createElement(RecommendedPackagesSection, {
        packages: [travelPackage()],
      }),
    );
    assert.match(html, /Recommended Packages/);
    assert.match(html, /Air France/);
    assert.match(html, /Hotel Paris/);
  });
});
