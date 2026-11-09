import { test } from "node:test";
import assert from "node:assert/strict";
import { mapGoogleFlights, mapSkyItineraries, skyscannerUrl } from "@/features/flightsFallback/map";

const search = { origin: "ROM", destination: "LON", departureDate: "2026-11-23", returnDate: "2026-11-27", adults: 2, children: 0, infants: 0, currency: "EUR" };

test("mapSkyItineraries reads Skyscanner Flights results (per person unless group price)", () => {
  const raw = {
    success: true,
    results: [
      {
        id: "11493-2611230640--30596-0-13771-2611230830|13771-2611272145--30596-0-11493-2611280120",
        price_raw: 154,
        carriers: ["Wizz Air Malta"],
        legs: [
          { from: "FCO", to: "LTN", dep: "2026-11-23T06:40:00", arr: "2026-11-23T08:30:00", dur_min: 170, stops: 0, segments: [{ flight: "W46001" }] },
          { from: "LTN", to: "FCO", dep: "2026-11-27T21:45:00", arr: "2026-11-28T01:20:00", dur_min: 155, stops: 0, segments: [{ flight: "W46006" }] },
        ],
        queryLegs: [{ resolvedOrigin: { iata: "ROME" }, resolvedDest: { iata: "LOND" } }],
      },
      { price_raw: 99, legs: [{ dep: "2026-11-24T06:00:00" }, { dep: "2026-11-27T09:10:00" }] },
    ],
  };
  const each = mapSkyItineraries(raw, search, { groupPrice: false });
  assert.equal(each.length, 1);
  assert.equal(each[0].price, 154);
  assert.equal(each[0].airlineCode, "W4");
  assert.equal(each[0].airline, "Wizz Air Malta");
  assert.equal(each[0].departureTime, "2026-11-23 06:40");
  assert.equal(each[0].arrivalTime, "2026-11-23 08:30");
  assert.equal(each[0].returnDepartureTime, "2026-11-27 21:45");
  assert.equal(each[0].returnDurationMinutes, 155);
  assert.equal(each[0].originAirport, "FCO");
  assert.equal(each[0].source, "skyscanner");
  assert.ok(each[0].sourceUrl?.startsWith("https://www.skyscanner.net/transport/flights/rome/lond/261123/261127/config/11493-2611230640--30596-0-13771-2611230830%7C13771-"));
  assert.ok(each[0].bookingUrl?.includes("aviasales"));
  assert.equal(mapSkyItineraries(raw, search, { groupPrice: true })[0].price, 77);
});

test("mapGoogleFlights reads best and other flights for the exact date", () => {
  const raw = {
    search_metadata: { google_flights_url: "https://www.google.com/travel/flights?x" },
    best_flights: [
      {
        price: 180,
        total_duration: 165,
        flights: [
          { departure_airport: { id: "FCO", time: "2026-11-23 06:40" }, arrival_airport: { id: "LTN", time: "2026-11-23 08:25" }, airline: "Wizz Air", flight_number: "W4 6010" },
        ],
      },
    ],
    other_flights: [
      {
        price: 120,
        total_duration: 300,
        flights: [
          { departure_airport: { id: "CIA", time: "2026-11-23 09:00" }, arrival_airport: { id: "BGY", time: "2026-11-23 10:10" }, airline: "Ryanair", flight_number: "FR 1" },
          { departure_airport: { id: "BGY", time: "2026-11-23 12:00" }, arrival_airport: { id: "STN", time: "2026-11-23 13:00" }, airline: "Ryanair", flight_number: "FR 2" },
        ],
      },
    ],
  };
  const flights = mapGoogleFlights(raw, search, { groupPrice: true });
  assert.equal(flights.length, 2);
  assert.equal(flights[0].price, 60);
  assert.equal(flights[0].stops, 1);
  assert.equal(flights[1].airlineCode, "W4");
  assert.equal(flights[1].sourceUrl, "https://www.google.com/travel/flights?x");
});

test("skyscannerUrl builds the dated search link", () => {
  assert.equal(
    skyscannerUrl("ROME", "LOND", search),
    "https://www.skyscanner.net/transport/flights/rome/lond/261123/261127/?adultsv2=2&cabinclass=economy",
  );
});
