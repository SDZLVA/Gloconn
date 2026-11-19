import { test } from "node:test";
import assert from "node:assert/strict";
import { isoMinutes, mapDuffelOffers, offerRequestBody, summarizeOffer } from "@/features/duffel/map";

const search = { origin: "MIL", destination: "LON", departureDate: "2027-01-15", returnDate: "2027-01-18", adults: 2, children: 1, infants: 0, currency: "EUR" };

const seg = (from: string, to: string, dep: string, arr: string, no: string) => ({
  origin: { iata_code: from },
  destination: { iata_code: to },
  departing_at: dep,
  arriving_at: arr,
  marketing_carrier: { iata_code: "ZZ" },
  marketing_carrier_flight_number: no,
  passengers: [{ baggages: [{ type: "checked", quantity: 1 }, { type: "carry_on", quantity: 1 }] }],
});

const offer = {
  id: "off_0000AbC",
  total_amount: "450.00",
  total_currency: "GBP",
  expires_at: "2027-01-01T10:20:00Z",
  owner: { name: "Duffel Airways", iata_code: "ZZ" },
  passengers: [{ id: "pas_1", type: "adult" }, { id: "pas_2", type: "adult" }, { id: "pas_3", age: 10 }],
  conditions: { refund_before_departure: { allowed: false }, change_before_departure: { allowed: true } },
  slices: [
    { duration: "PT3H5M", segments: [seg("MXP", "FRA", "2027-01-15T07:00:00", "2027-01-15T08:20:00", "100"), seg("FRA", "LHR", "2027-01-15T09:10:00", "2027-01-15T09:05:00", "101")] },
    { duration: "PT1H55M", segments: [seg("LHR", "MXP", "2027-01-18T18:00:00", "2027-01-18T20:55:00", "200")] },
  ],
};

test("offerRequestBody: round trip, passengers by type/age", () => {
  const body = offerRequestBody({ ...search, infants: 1 }) as { data: { slices: unknown[]; passengers: unknown[] } };
  assert.equal(body.data.slices.length, 2);
  assert.deepEqual(body.data.passengers, [{ type: "adult" }, { type: "adult" }, { age: 10 }, { age: 1 }]);
});

test("mapDuffelOffers", () => {
  const [f] = mapDuffelOffers({ data: { offers: [offer, { id: "off_x" }] } }, search, "london");
  assert.equal(f.id, "duf-off_0000AbC");
  assert.equal(f.offerId, "off_0000AbC");
  assert.equal(f.price, 150);
  assert.equal(f.currency, "GBP");
  assert.equal(f.airline, "Duffel Airways");
  assert.equal(f.departureTime, "2027-01-15 07:00");
  assert.equal(f.durationMinutes, 185);
  assert.equal(f.stops, 1);
  assert.equal(f.originAirport, "MXP");
  assert.equal(f.destinationAirport, "LHR");
  assert.equal(f.returnDepartureTime, "2027-01-18 18:00");
  assert.equal(f.source, "duffel");
  assert.deepEqual(mapDuffelOffers(null, search), []);
});

test("summarizeOffer + isoMinutes", () => {
  const s = summarizeOffer({ data: offer })!;
  assert.equal(s.total, 450);
  assert.deepEqual(s.passengers.map((p) => p.type), ["adult", "adult", "child"]);
  assert.equal(s.checkedBags, 1);
  assert.equal(s.refundable, false);
  assert.equal(s.changeable, true);
  assert.deepEqual(s.slices[0].flights, ["ZZ100", "ZZ101"]);
  assert.equal(isoMinutes("P1DT2H"), 1560);
  assert.equal(isoMinutes("bad"), null);
});
