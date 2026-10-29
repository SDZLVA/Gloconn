import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  canPickDepartureAndReturn,
  departureKey,
  groupByDeparture,
} from "@/lib/results/flightPairs";
import type { FlightResult } from "@/types/results";

function ticket(id: string, over: Partial<FlightResult>): FlightResult {
  return {
    type: "flight",
    id,
    destinationId: "paris",
    price: 50,
    currency: "EUR",
    rating: 0,
    airline: "Ryanair",
    airlineCode: "FR",
    departureTime: "2026-11-23 15:45",
    arrivalTime: "",
    durationMinutes: 95,
    stops: 0,
    cabin: "",
    originAirport: "MXP",
    destinationAirport: "BVA",
    returnDepartureTime: "2026-11-28 13:25",
    returnStops: 0,
    ...over,
  };
}

// Order as the page sorted them (e.g. "recommended").
const SORTED: FlightResult[] = [
  ticket("fr-a", { price: 58, returnDepartureTime: "2026-11-28 12:30", returnStops: 1 }),
  ticket("u2-a", { airline: "easyJet", airlineCode: "U2", departureTime: "2026-11-23 19:05", destinationAirport: "CDG", price: 46 }),
  ticket("fr-b", { price: 40 }),
  ticket("u2-b", { airline: "easyJet", airlineCode: "U2", departureTime: "2026-11-23 19:05", destinationAirport: "CDG", price: 57, returnDepartureTime: "2026-11-28 07:05" }),
  ticket("fr-c", { price: 135, returnDepartureTime: "2026-11-28 13:20" }),
];

describe("groupByDeparture", () => {
  const groups = groupByDeparture(SORTED);

  it("one group per outbound flight, in the page's sort order", () => {
    assert.deepEqual(groups.map((g) => g.outbound.airline), ["Ryanair", "easyJet"]);
  });

  it("lists every return sold with that departure, cheapest first", () => {
    assert.deepEqual(groups[0].returns.map((t) => t.id), ["fr-b", "fr-a", "fr-c"]);
    assert.deepEqual(groups[1].returns.map((t) => t.id), ["u2-a", "u2-b"]);
  });

  it("shows the cheapest round-trip price as 'from'", () => {
    assert.equal(groups[0].fromPrice, 40);
    assert.equal(groups[1].fromPrice, 46);
  });

  it("treats a different airport or time as a different departure", () => {
    const a = ticket("x", {});
    assert.notEqual(departureKey(a), departureKey({ ...a, originAirport: "BGY" }));
    assert.notEqual(departureKey(a), departureKey({ ...a, departureTime: "2026-11-23 07:55" }));
    assert.equal(departureKey(a), departureKey({ ...a, id: "y", price: 99, returnDepartureTime: "2026-11-28 23:00" }));
  });
});

describe("canPickDepartureAndReturn", () => {
  it("only for round trips where every flight knows its return", () => {
    assert.equal(canPickDepartureAndReturn(SORTED, "round-trip"), true);
    assert.equal(canPickDepartureAndReturn(SORTED, "one-way"), false);
    assert.equal(canPickDepartureAndReturn([], "round-trip"), false);
    assert.equal(
      canPickDepartureAndReturn([...SORTED, ticket("mock", { returnDepartureTime: undefined })], "round-trip"),
      false,
    );
  });
});
