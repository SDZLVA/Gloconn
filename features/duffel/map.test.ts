import { test } from "node:test";
import assert from "node:assert/strict";
import { isoMinutes, mapDuffelOffers, mapSeatMaps, offerRequestBody, summarizeOffer } from "@/features/duffel/map";
import { priceExtras } from "@/features/duffel/extras";

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

test("stopovers, bags, rules and extras from an offer", () => {
  const [f] = mapDuffelOffers({ data: { offers: [{ ...offer, total_emissions_kg: "312" }] } }, search);
  assert.deepEqual(f.outboundLeg?.airports, ["MXP", "FRA", "LHR"]);
  assert.deepEqual(f.outboundLeg?.layovers, [{ airport: "FRA", minutes: 50 }]);
  assert.deepEqual(f.outboundLeg?.flightNumbers, ["ZZ100", "ZZ101"]);
  assert.equal(f.checkedBags, 1);
  assert.equal(f.carryOnBags, 1);
  assert.equal(f.refundable, false);
  assert.equal(f.co2Kg, 312);
  assert.deepEqual(f.returnLeg?.layovers, []);

  const withIds = {
    ...offer,
    slices: offer.slices.map((s, i) => ({ ...s, segments: s.segments.map((g, j) => ({ ...g, id: `seg_${i}${j}` })) })),
    available_services: [
      { id: "ase_1", type: "baggage", total_amount: "30.00", total_currency: "GBP", maximum_quantity: 2, passenger_ids: ["pas_1"], segment_ids: ["seg_00", "seg_01"], metadata: { type: "checked", maximum_weight_kg: 23 } },
      { id: "ase_2", type: "baggage", total_amount: "20.00", total_currency: "GBP", maximum_quantity: 1, passenger_ids: ["pas_2"], segment_ids: ["seg_00", "seg_01", "seg_10"], metadata: { type: "checked" } },
      { id: "ase_3", type: "cancel_for_any_reason", total_amount: "9.00", total_currency: "GBP", passenger_ids: ["pas_1"] },
    ],
  };
  const s = summarizeOffer({ data: withIds })!;
  assert.deepEqual(s.bags.map((b) => [b.id, b.passengerId, b.covers, b.maxQuantity, b.maxWeightKg]), [
    ["ase_1", "pas_1", "Outbound", 2, 23],
    ["ase_2", "pas_2", "Whole trip", 1, null],
  ]);
  assert.equal(s.slices[0].segments[1].id, "seg_01");

  const maps = mapSeatMaps(
    {
      data: [
        {
          segment_id: "seg_00",
          cabins: [
            {
              aisles: 1,
              rows: [
                { sections: [{ elements: [{ type: "exit_row" }] }] },
                {
                  sections: [
                    { elements: [{ type: "seat", designator: "1A", available_services: [{ id: "sea_a1", passenger_id: "pas_1", total_amount: "0.00", total_currency: "GBP" }] }, { type: "seat", designator: "1B", available_services: [] }] },
                    { elements: [{ type: "seat", designator: "1C", available_services: [{ id: "sea_c1", passenger_id: "pas_1", total_amount: "12.00", total_currency: "GBP" }, { id: "sea_c2", passenger_id: "pas_2", total_amount: "12.00", total_currency: "GBP" }] }] },
                  ],
                },
              ],
            },
          ],
        },
        { segment_id: "unknown", cabins: [] },
      ],
    },
    s,
  );
  assert.equal(maps.length, 1);
  assert.equal(maps[0].label, "MXP → FRA · ZZ100");
  assert.equal(maps[0].rows.length, 1);
  assert.equal(maps[0].rows[0].number, "1");
  assert.equal(maps[0].rows[0].exit, true);

  assert.deepEqual(priceExtras([{ id: "ase_1", quantity: 2 }, { id: "sea_c1", quantity: 1 }, { id: "sea_a1", quantity: 0 }], s, maps), {
    ok: true,
    services: [{ id: "ase_1", quantity: 2 }, { id: "sea_c1", quantity: 1 }],
    extras: 72,
    total: 522,
    lines: [
      { label: "2 × checked bag (23 kg) · Outbound", amount: 60 },
      { label: "Seat 1C · MXP → FRA · ZZ100", amount: 12 },
    ],
  });
  assert.equal(priceExtras([{ id: "ase_1", quantity: 3 }], s, maps).ok, false);
  assert.equal(priceExtras([{ id: "sea_a1", quantity: 1 }, { id: "sea_c1", quantity: 1 }], s, maps).ok, false, "one seat per traveller per flight");
  assert.equal(priceExtras([{ id: "sea_c1", quantity: 1 }, { id: "sea_c2", quantity: 1 }], s, maps).ok, false, "same seat twice");
  assert.equal(priceExtras([{ id: "nope", quantity: 1 }], s, maps).ok, false);
});
