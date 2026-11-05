import { test } from "node:test";
import assert from "node:assert/strict";
import { mapDataFlights } from "@/features/flightsData/map";

const search = { origin: "MIL", destination: "ROM", departureDate: "2026-12-10", returnDate: "2026-12-14", adults: 2, children: 0, infants: 0, currency: "EUR" };

test("mapDataFlights reads one offer per number of stops, cheapest first", () => {
  const flights = mapDataFlights(
    {
      success: true,
      data: {
        ROM: {
          "1": { price: 120, airline: "AZ", flight_number: 2050, departure_at: "2026-12-10T09:15:00Z", return_at: "2026-12-14T18:40:00Z" },
          "0": { price: 95, airline: "FR", flight_number: 100, departure_at: "2026-12-10T06:35:00Z", return_at: "2026-12-14T21:05:00Z" },
        },
      },
    },
    search,
  );
  assert.equal(flights.length, 2);
  assert.equal(flights[0].price, 95);
  assert.equal(flights[0].stops, 0);
  assert.equal(flights[0].departureTime, "2026-12-10 06:35");
  assert.equal(flights[0].returnDepartureTime, "2026-12-14 21:05");
  assert.ok(flights[0].bookingUrl?.startsWith("https://www.aviasales.com/search/MIL1012ROM14122"));
});

test("mapDataFlights ignores empty or broken answers", () => {
  assert.deepEqual(mapDataFlights(null, search), []);
  assert.deepEqual(mapDataFlights({ data: { ROM: { "0": { price: 0 } } } }, search), []);
});

test("mapDataFlights keeps only the exact dates and trip type asked for", () => {
  const raw = {
    data: {
      ROM: {
        "0": { price: 84, airline: "U2", departure_at: "2026-12-10T20:55:00+01:00", return_at: "2026-12-14T06:45:00Z", duration_to: 160 },
        "1": { price: 60, airline: "FR", departure_at: "2026-12-11T08:00:00Z", return_at: "2026-12-14T09:00:00Z" },
      },
    },
  };
  const flights = mapDataFlights(raw, search);
  assert.equal(flights.length, 1);
  assert.equal(flights[0].durationMinutes, 160);
  assert.deepEqual(mapDataFlights(raw, { ...search, returnDate: null }), []);
});
