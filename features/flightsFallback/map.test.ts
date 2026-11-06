import { test } from "node:test";
import assert from "node:assert/strict";
import { mapGoogleFlights, mapSkyItineraries, pickSkyPlace, skyscannerUrl } from "@/features/flightsFallback/map";

const search = { origin: "ROM", destination: "LON", departureDate: "2026-11-23", returnDate: "2026-11-27", adults: 2, children: 0, infants: 0, currency: "EUR" };

test("mapSkyItineraries reads legs, airline and price (per person unless group price)", () => {
  const raw = {
    data: {
      itineraries: [
        {
          id: "13554-2611230640--30596-0-13771-2611230830",
          price: { raw: 154 },
          legs: [
            {
              origin: { displayCode: "FCO" },
              destination: { displayCode: "LTN" },
              departure: "2026-11-23T06:40:00",
              arrival: "2026-11-23T08:30:00",
              durationInMinutes: 170,
              stopCount: 0,
              carriers: { marketing: [{ name: "Wizz Air Malta", alternateId: "W4" }] },
              segments: [{ flightNumber: "6010", marketingCarrier: { displayCode: "W4", name: "Wizz Air Malta" } }],
            },
            { departure: "2026-11-27T09:10:00", stopCount: 0, durationInMinutes: 155 },
          ],
        },
        { price: { raw: 99 }, legs: [{ departure: "2026-11-24T06:00:00" }, { departure: "2026-11-27T09:10:00" }] },
      ],
    },
  };
  const each = mapSkyItineraries(raw, search, { groupPrice: false, sourceUrl: "https://www.skyscanner.net/x" });
  assert.equal(each.length, 1);
  assert.equal(each[0].price, 154);
  assert.equal(each[0].airlineCode, "W4");
  assert.equal(each[0].airline, "Wizz Air Malta");
  assert.equal(each[0].departureTime, "2026-11-23 06:40");
  assert.equal(each[0].arrivalTime, "2026-11-23 08:30");
  assert.equal(each[0].returnDepartureTime, "2026-11-27 09:10");
  assert.equal(each[0].source, "skyscanner");
  assert.equal(each[0].sourceUrl, "https://www.skyscanner.net/x");
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

test("pickSkyPlace prefers the exact code, then the city", () => {
  const raw = {
    data: [
      { navigation: { entityType: "AIRPORT", relevantFlightParams: { skyId: "FCO", entityId: "95565065" } } },
      { navigation: { entityType: "CITY", relevantFlightParams: { skyId: "ROME", entityId: "27539793" } } },
    ],
  };
  assert.deepEqual(pickSkyPlace(raw, "ROM"), { skyId: "ROME", entityId: "27539793" });
  assert.deepEqual(pickSkyPlace(raw, "FCO"), { skyId: "FCO", entityId: "95565065" });
  assert.equal(pickSkyPlace({ data: [] }, "ROM"), null);
});

test("skyscannerUrl builds the dated search link", () => {
  assert.equal(
    skyscannerUrl("ROME", "LOND", search),
    "https://www.skyscanner.net/transport/flights/rome/lond/261123/261127/?adultsv2=2&cabinclass=economy",
  );
});
