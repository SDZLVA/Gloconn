import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  airportChangeNotes,
  arrivalDayOffset,
  displayLegs,
  legAirlines,
  legStopovers,
  legStops,
} from "@/lib/results/flightLegs";
import type { Flight, FlightLeg } from "@/types/models/flight";

const OUT: FlightLeg = {
  airlineCode: "U2",
  airline: "easyJet",
  departureTime: "2026-11-23 19:05",
  arrivalTime: "2026-11-23 20:40",
  durationMinutes: 95,
  airports: ["MXP", "CDG"],
};
const BACK: FlightLeg = {
  airlineCode: "FR",
  airline: "Ryanair",
  departureTime: "2026-11-28 12:30",
  arrivalTime: "2026-11-28 19:55",
  durationMinutes: 445,
  airports: ["BVA", "CAG", "MXP"],
};

const FLIGHT: Flight = {
  id: "x",
  destinationId: "paris",
  price: 61,
  currency: "EUR",
  rating: 0,
  airline: "easyJet",
  departureTime: OUT.departureTime,
  arrivalTime: "",
  durationMinutes: 95,
  stops: 0,
  cabin: "",
  returnDepartureTime: BACK.departureTime,
  returnStops: 1,
};

describe("flight legs", () => {
  it("uses decoded legs when present", () => {
    const legs = displayLegs({ ...FLIGHT, outboundLeg: OUT, returnLeg: BACK });
    assert.equal(legs.outbound, OUT);
    assert.equal(legs.back, BACK);
    assert.deepEqual(legAirlines(legs), ["easyJet", "Ryanair"]);
  });

  it("falls back to the flat fields without inventing airports", () => {
    const legs = displayLegs(FLIGHT);
    assert.equal(legs.back?.departureTime, "2026-11-28 12:30");
    assert.deepEqual(legs.back?.airports, ["", ""]);
    assert.equal(legs.back && legStops(legs.back, 1), 1);
  });

  it("lists stopovers and counts stops from airports", () => {
    assert.deepEqual(legStopovers(BACK), ["CAG"]);
    assert.equal(legStops(BACK, 0), 1);
  });

  it("flags airport changes the traveller must notice", () => {
    const notes = airportChangeNotes({ outbound: OUT, back: BACK });
    assert.deepEqual(notes.map((n) => n.text), ["Return leaves from BVA — you land at CDG."]);
    const toBergamo = airportChangeNotes({
      outbound: { ...OUT, airports: ["MXP", "BVA"] },
      back: { ...BACK, airports: ["BVA", "BGY"] },
    });
    assert.deepEqual(toBergamo.map((n) => n.text), ["Return lands at BGY, not MXP."]);
  });

  it("marks overnight arrivals", () => {
    assert.equal(arrivalDayOffset({ ...OUT, arrivalTime: "2026-11-24 06:10" }), 1);
    assert.equal(arrivalDayOffset(OUT), 0);
  });
});
