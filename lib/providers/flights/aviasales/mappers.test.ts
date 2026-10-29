import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { airlineDisplayName } from "@/lib/providers/flights/aviasales/airlines";
import {
  formatAviasalesDateTime,
  mapAviasalesResponse,
  mapAviasalesTicketToFlight,
} from "@/lib/providers/flights/aviasales/mappers";
import { ROUND_TRIP_SAMPLE } from "@/lib/providers/flights/aviasales/__fixtures__/pricesForDates.sample";

const RT = { destinationId: "barcelona", currency: "EUR" as const, tripType: "round-trip" as const };
const OW = { ...RT, tripType: "one-way" as const };
const first = ROUND_TRIP_SAMPLE.data![0]!;

describe("formatAviasalesDateTime", () => {
  it("keeps the local time as given, in the SerpAPI display format", () => {
    assert.equal(formatAviasalesDateTime("2027-07-28T07:00:00+02:00"), "2027-07-28 07:00");
  });
  it("rejects anything that is not a date-time", () => {
    for (const bad of [undefined, "", "07:00", "28/07/2027 07:00"]) {
      assert.equal(formatAviasalesDateTime(bad), null);
    }
  });
});

describe("airlineDisplayName", () => {
  it("names known carriers and falls back to the code, never a guess", () => {
    assert.equal(airlineDisplayName("U2"), "easyJet");
    assert.equal(airlineDisplayName("ib"), "Iberia");
    assert.equal(airlineDisplayName("ZZ"), "ZZ");
    assert.equal(airlineDisplayName("not a code"), null);
  });
});

describe("mapAviasalesTicketToFlight", () => {
  it("maps the documented example", () => {
    const flight = mapAviasalesTicketToFlight(first, RT);
    assert.ok(flight);
    assert.equal(flight.airline, "Iberia");
    assert.equal(flight.price, 59);
    assert.equal(flight.currency, "EUR");
    assert.equal(flight.departureTime, "2027-07-28 07:00");
    assert.equal(flight.durationMinutes, 80, "outbound leg, not the 165-minute round trip");
    assert.equal(flight.stops, 0);
  });

  it("does not invent an arrival time, rating or cabin", () => {
    const flight = mapAviasalesTicketToFlight(first, RT);
    assert.ok(flight);
    assert.equal(flight.arrivalTime, "");
    assert.equal(flight.rating, 0);
    assert.equal(flight.cabin, "");
  });

  it("drops a round-trip ticket with no return date (18.8 rule)", () => {
    assert.equal(mapAviasalesTicketToFlight({ ...first, return_at: undefined }, RT), null);
  });

  it("keeps a one-way ticket without a return date", () => {
    const flight = mapAviasalesTicketToFlight({ ...first, return_at: undefined, duration_to: undefined, duration: 80 }, OW);
    assert.ok(flight);
    assert.equal(flight.durationMinutes, 80);
  });

  it("never uses the round-trip total duration as the outbound duration", () => {
    assert.equal(mapAviasalesTicketToFlight({ ...first, duration_to: undefined }, RT), null);
  });

  it("drops tickets with unusable price, airline, time or stops", () => {
    for (const broken of [
      { price: 0 },
      { price: -5 },
      { price: Number.NaN },
      { airline: "" },
      { departure_at: "soon" },
      { transfers: -1 },
      { transfers: 1.5 },
    ]) {
      assert.equal(mapAviasalesTicketToFlight({ ...first, ...broken }, RT), null, JSON.stringify(broken));
    }
  });

  it("requires a destination id", () => {
    assert.equal(mapAviasalesTicketToFlight(first, { ...RT, destinationId: " " }), null);
  });
});

describe("mapAviasalesResponse", () => {
  it("maps every usable ticket and removes duplicates", () => {
    const doubled = { ...ROUND_TRIP_SAMPLE, data: [...ROUND_TRIP_SAMPLE.data!, first] };
    const flights = mapAviasalesResponse(doubled, RT);
    assert.equal(flights.length, 2);
    assert.deepEqual(flights.map((f) => f.airline), ["Iberia", "Vueling"]);
  });

  it("handles a missing data array", () => {
    assert.deepEqual(mapAviasalesResponse({ success: true }, RT), []);
  });
});

describe("recent-price behaviour (verified on the 2026-10-29 preview)", () => {
  it("marks every Aviasales price as a recent, not live, price", () => {
    const flight = mapAviasalesTicketToFlight(first, RT);
    assert.equal(flight?.priceIsRecent, true);
  });

  it("keeps only the cheapest ticket when tickets differ only in the return leg", () => {
    const sameOutboundPricier = {
      ...first,
      price: 67,
      return_at: "2027-08-26T20:10:00+02:00",
    };
    const flights = mapAviasalesResponse(
      { success: true, data: [sameOutboundPricier, first] },
      RT,
    );
    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.price, 59);
  });

  it("names Helvetic Airways (seen as '2L' on the preview)", () => {
    assert.equal(airlineDisplayName("2L"), "Helvetic Airways");
  });
});
