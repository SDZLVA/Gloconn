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

  it("keeps fares that differ only in the return leg (the card shows the return)", () => {
    const laterReturn = { ...first, price: 67, return_at: "2027-08-26T20:10:00+02:00" };
    const flights = mapAviasalesResponse({ success: true, data: [laterReturn, first] }, RT);
    assert.equal(flights.length, 2);
    assert.deepEqual(
      flights.map((f) => f.returnDepartureTime).sort(),
      ["2027-08-26 14:30", "2027-08-26 20:10"],
    );
  });

  it("keeps the cheaper price for an exact duplicate", () => {
    const flights = mapAviasalesResponse(
      { success: true, data: [{ ...first, price: 70 }, first] },
      RT,
    );
    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.price, 59);
  });

  it("records the flight's own airports and return leg", () => {
    const flight = mapAviasalesTicketToFlight(
      { ...first, origin: "MIL", destination: "PAR", origin_airport: "BGY", destination_airport: "BVA" },
      RT,
    );
    assert.equal(flight?.originAirport, "BGY");
    assert.equal(flight?.destinationAirport, "BVA");
    assert.equal(flight?.returnDepartureTime, "2027-08-26 14:30");
    assert.equal(flight?.returnStops, 0);
    assert.equal(flight?.returnDurationMinutes, 85);
  });

  it("adds no return fields to one-way flights", () => {
    const flight = mapAviasalesTicketToFlight({ ...first, return_at: undefined }, OW);
    assert.equal(flight?.returnDepartureTime, undefined);
  });

  it("names Helvetic Airways (seen as '2L' on the preview)", () => {
    assert.equal(airlineDisplayName("2L"), "Helvetic Airways");
  });
});

describe("exact-ticket fields (Milestone 20)", () => {
  const withLink = {
    ...first,
    link: "/search/MAD2807BCN26081?t=IB17852052001785210000000080MADBCN_abc_59&search_date=29102026",
  };

  it("keeps the airline code and the ticket's own aviasales.com page", () => {
    const flight = mapAviasalesTicketToFlight(withLink, RT);
    assert.ok(flight);
    assert.equal(flight.airlineCode, "IB");
    assert.equal(
      flight.bookingUrl,
      "https://www.aviasales.com/search/MAD2807BCN26081?t=IB17852052001785210000000080MADBCN_abc_59&search_date=29102026",
    );
  });

  it("prices the ticket page for the whole group of travellers", () => {
    const flight = mapAviasalesTicketToFlight(withLink, { ...RT, passengers: { adults: 2, children: 1 } });
    assert.ok(flight?.bookingUrl);
    assert.equal(new URL(flight.bookingUrl).pathname, "/search/MAD2807BCN260821");
  });

  it("leaves bookingUrl out when the link is unusable, instead of guessing one", () => {
    const flight = mapAviasalesTicketToFlight({ ...first, link: "https://evil.example/x?t=12345678" }, RT);
    assert.ok(flight);
    assert.equal(flight.bookingUrl, undefined);
  });
});
