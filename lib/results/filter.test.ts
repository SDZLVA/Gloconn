import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  collectFilterFacets,
  countActiveFilters,
  countResultsByType,
  filterResults,
} from "@/lib/results/filter";
import {
  DEFAULT_RESULTS_FILTERS,
  type BusResult,
  type FlightResult,
  type HotelResult,
  type ResultsFilters,
  type SearchResult,
  type TrainResult,
} from "@/types/results";

function hotel(overrides: Partial<HotelResult> = {}): HotelResult {
  return {
    type: "hotel",
    id: "h1",
    destinationId: "paris",
    price: 200,
    currency: "EUR",
    rating: 4.2,
    name: "Test Hotel",
    stars: 4,
    amenities: ["Wi-Fi", "Breakfast"],
    nights: 3,
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

function bus(overrides: Partial<BusResult> = {}): BusResult {
  return {
    type: "bus",
    id: "b1",
    destinationId: "paris",
    price: 40,
    currency: "EUR",
    rating: 3.8,
    operator: "FlixBus",
    departureTime: "09:00",
    arrivalTime: "17:00",
    durationMinutes: 480,
    amenities: ["Wi-Fi", "USB charging"],
    ...overrides,
  };
}

function train(overrides: Partial<TrainResult> = {}): TrainResult {
  return {
    type: "train",
    id: "t1",
    destinationId: "paris",
    price: 80,
    currency: "EUR",
    rating: 4.5,
    operator: "SNCF",
    departureTime: "07:00",
    arrivalTime: "10:00",
    durationMinutes: 180,
    trainClass: "Standard",
    ...overrides,
  };
}

const SAMPLE: SearchResult[] = [
  hotel({ id: "h1", price: 200, rating: 4.2, stars: 4 }),
  hotel({
    id: "h2",
    price: 350,
    rating: 4.8,
    stars: 5,
    amenities: ["Wi-Fi", "Spa", "Pool"],
  }),
  flight({ id: "f1", price: 150, stops: 0, airline: "Air France", cabin: "Economy" }),
  flight({
    id: "f2",
    price: 90,
    stops: 2,
    airline: "Ryanair",
    cabin: "Economy",
    durationMinutes: 300,
  }),
  flight({
    id: "f3",
    price: 400,
    stops: 1,
    airline: "Lufthansa",
    cabin: "Business",
    rating: 4.6,
  }),
  bus({ id: "b1", operator: "FlixBus" }),
  bus({
    id: "b2",
    operator: "BlaBlaBus",
    amenities: ["USB charging"],
    price: 35,
  }),
  train({ id: "t1", operator: "SNCF" }),
  train({ id: "t2", operator: "Trenitalia", price: 95 }),
];

function withDefaults(
  overrides: Partial<ResultsFilters> = {},
): ResultsFilters {
  return {
    ...DEFAULT_RESULTS_FILTERS,
    // Unit tests cover all result types; MVP UI defaults to hotel+flight only.
    types: ["hotel", "flight", "bus", "train"],
    minPrice: 0,
    maxPrice: 10_000,
    ...overrides,
  };
}

describe("filterResults", () => {
  it("returns all results when filters are wide open", () => {
    const filtered = filterResults(SAMPLE, withDefaults());
    assert.equal(filtered.length, SAMPLE.length);
  });

  it("filters by result type", () => {
    const filtered = filterResults(
      SAMPLE,
      withDefaults({ types: ["flight"] }),
    );
    assert.equal(filtered.length, 3);
    assert.ok(filtered.every((result) => result.type === "flight"));
  });

  it("filters by price range", () => {
    const filtered = filterResults(
      SAMPLE,
      withDefaults({ minPrice: 100, maxPrice: 200 }),
    );
    assert.deepEqual(
      filtered.map((result) => result.id).sort(),
      ["f1", "h1"],
    );
  });

  it("filters by minimum rating", () => {
    const filtered = filterResults(
      SAMPLE,
      withDefaults({ minRating: 4.5 }),
    );
    assert.ok(filtered.every((result) => result.rating >= 4.5));
    assert.ok(filtered.some((result) => result.id === "h2"));
    assert.ok(filtered.some((result) => result.id === "t1"));
  });

  it("filters flights by max stops without dropping other types", () => {
    const filtered = filterResults(
      SAMPLE,
      withDefaults({ maxStops: 0 }),
    );
    const flights = filtered.filter((result) => result.type === "flight");
    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.id, "f1");
    assert.ok(filtered.some((result) => result.type === "hotel"));
    assert.ok(filtered.some((result) => result.type === "bus"));
  });

  it("filters flights by cabin", () => {
    const filtered = filterResults(
      SAMPLE,
      withDefaults({ cabins: ["Business"] }),
    );
    const flights = filtered.filter((result) => result.type === "flight");
    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.id, "f3");
    assert.ok(filtered.some((result) => result.type === "hotel"));
  });

  it("filters flights by airline", () => {
    const filtered = filterResults(
      SAMPLE,
      withDefaults({ airlines: ["Ryanair", "Lufthansa"] }),
    );
    const flightIds = filtered
      .filter((result) => result.type === "flight")
      .map((result) => result.id)
      .sort();
    assert.deepEqual(flightIds, ["f2", "f3"]);
  });

  it("filters bus/train by operator", () => {
    const filtered = filterResults(
      SAMPLE,
      withDefaults({ operators: ["FlixBus", "SNCF"] }),
    );
    const transport = filtered.filter(
      (result) => result.type === "bus" || result.type === "train",
    );
    assert.deepEqual(
      transport.map((result) => result.id).sort(),
      ["b1", "t1"],
    );
  });

  it("filters hotels by minimum stars", () => {
    const filtered = filterResults(
      SAMPLE,
      withDefaults({ minStars: 5 }),
    );
    const hotels = filtered.filter((result) => result.type === "hotel");
    assert.equal(hotels.length, 1);
    assert.equal(hotels[0]?.id, "h2");
  });

  it("requires all selected amenities (hotel + bus)", () => {
    const filtered = filterResults(
      SAMPLE,
      withDefaults({ amenities: ["Wi-Fi", "Breakfast"] }),
    );
    const hotelOrBus = filtered.filter(
      (result) => result.type === "hotel" || result.type === "bus",
    );
    assert.deepEqual(
      hotelOrBus.map((result) => result.id).sort(),
      ["h1"],
    );
    // Trains and flights are unaffected by amenity filters.
    assert.ok(filtered.some((result) => result.type === "flight"));
    assert.ok(filtered.some((result) => result.type === "train"));
  });

  it("returns empty array for empty input", () => {
    assert.deepEqual(filterResults([], withDefaults()), []);
  });

  it("handles duplicate amenity facet values without inventing extras", () => {
    const results: SearchResult[] = [
      hotel({ id: "a", amenities: ["Wi-Fi", "Wi-Fi", "Breakfast"] }),
      bus({ id: "b", amenities: ["Wi-Fi"] }),
    ];
    const facets = collectFilterFacets(results);
    assert.deepEqual(facets.amenities, ["Breakfast", "Wi-Fi"]);
  });
});

describe("collectFilterFacets", () => {
  it("collects unique sorted airlines, cabins, operators, amenities", () => {
    const facets = collectFilterFacets(SAMPLE);
    assert.deepEqual(facets.airlines, ["Air France", "Lufthansa", "Ryanair"]);
    assert.deepEqual(facets.cabins, ["Business", "Economy"]);
    assert.ok(facets.operators.includes("FlixBus"));
    assert.ok(facets.operators.includes("SNCF"));
    assert.ok(facets.amenities.includes("Wi-Fi"));
    assert.equal(facets.maxStopsInResults, 2);
  });
});

describe("countActiveFilters", () => {
  it("counts only constrained filter groups", () => {
    const defaults = withDefaults({ minPrice: 0, maxPrice: 500 });
    assert.equal(countActiveFilters(defaults, defaults), 0);

    const active = countActiveFilters(
      {
        ...defaults,
        types: ["flight"],
        maxStops: 0,
        airlines: ["Air France"],
        minStars: 4,
        amenities: ["Wi-Fi"],
      },
      defaults,
    );
    assert.equal(active, 5);
  });
});

describe("countResultsByType", () => {
  it("tallies each type", () => {
    assert.deepEqual(countResultsByType(SAMPLE), {
      hotel: 2,
      flight: 3,
      bus: 2,
      train: 2,
    });
  });
});
