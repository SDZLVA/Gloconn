import { test } from "node:test";
import assert from "node:assert/strict";
import { accommodationIds, amenityLabel, mapQuote, mapStayRates, mapStaysResults, staysSearchBody } from "@/features/duffel/stays";
import { bagSize } from "@/features/duffel/map";

const accommodation = {
  id: "acc_1",
  name: "Duffel Test Hotel",
  type: "hotel",
  rating: 4,
  review_score: 8.6,
  review_count: 120,
  photos: [{ url: "https://example.com/a.jpg" }],
  amenities: [{ type: "wifi" }, { type: "pool" }],
  chain: { name: "Test Chain" },
  location: { geographic_coordinates: { latitude: 45.47, longitude: 9.2 }, address: { line_one: "Via Roma 1", city_name: "Milan", postal_code: "20100" } },
  check_in_information: { check_in_after_time: "15:00:00", check_out_before_time: "11:00:00" },
};

test("search body: guests by type, location radius, free cancellation flag", () => {
  const body = staysSearchBody({ checkin: "2027-01-10", checkout: "2027-01-12", adults: 2, children: 1, rooms: 1 }, { latitude: 1, longitude: 2 }, 5, true) as { data: Record<string, unknown> };
  assert.deepEqual(body.data.guests, [{ type: "adult" }, { type: "adult" }, { type: "child", age: 8 }]);
  assert.deepEqual(body.data.location, { radius: 5, geographic_coordinates: { latitude: 1, longitude: 2 } });
  assert.equal(body.data.free_cancellation_only, true);
});

test("search results → hotels", () => {
  const raw = { data: { results: [{ id: "srr_1", cheapest_rate_total_amount: "240.00", cheapest_rate_currency: "GBP", accommodation }, { id: "srr_x" }] } };
  const [h, ...rest] = mapStaysResults(raw, { latitude: 45.4642, longitude: 9.19 }, accommodationIds(raw));
  assert.equal(rest.length, 0);
  assert.equal(h.id, "dst-srr_1");
  assert.equal(h.externalUrl, "/book/stay/srr_1");
  assert.equal(h.totalPrice, 240);
  assert.equal(h.stars, 4);
  assert.equal(h.rating, 8.6);
  assert.equal(h.refundable, true);
  assert.deepEqual(h.amenities, ["wifi", "pool"]);
  assert.equal(h.propertyType, "hotel");
  assert.equal(h.address, "Via Roma 1, Milan");
  assert.ok(typeof h.distanceKm === "number" && h.distanceKm < 2);
  assert.equal(amenityLabel("wifi"), "Free Wi-Fi");
  assert.equal(amenityLabel("ski_storage"), "Ski storage");
});

test("all rates: boards, payment, free cancellation, cheapest room first", () => {
  const s = mapStayRates({
    data: {
      id: "srr_1",
      check_in_date: "2027-01-10",
      check_out_date: "2027-01-12",
      rooms: 1,
      guests: [{ type: "adult" }, { type: "adult" }],
      accommodation: {
        ...accommodation,
        rooms: [
          { name: "Suite", beds: [{ type: "king", count: 1 }], rates: [{ id: "rat_s", total_amount: "500", total_currency: "GBP", board_type: "breakfast", payment_type: "pay_now", cancellation_timeline: [] }] },
          {
            name: "Double room",
            beds: [{ type: "double", count: 2 }],
            rates: [
              { id: "rat_b", total_amount: "260", total_currency: "GBP", board_type: "breakfast", payment_type: "guarantee", cancellation_timeline: [{ before: "2027-01-08T12:00:00Z", refund_amount: "260", currency: "GBP" }] },
              { id: "rat_a", total_amount: "240", total_currency: "GBP", board_type: "room_only", payment_type: "pay_now", cancellation_timeline: [{ before: "2027-01-08T12:00:00Z", refund_amount: "100", currency: "GBP" }], conditions: [{ title: "Pets", description: "No pets." }] },
            ],
          },
          { name: "Empty", rates: [] },
        ],
      },
    },
  })!;
  assert.deepEqual(s.roomTypes.map((r) => r.name), ["Double room", "Suite"]);
  assert.equal(s.roomTypes[0].beds, "2 double beds");
  const [a, b] = s.roomTypes[0].rates;
  assert.deepEqual([a.id, a.refundable, a.boardLabel, a.paymentLabel], ["rat_a", "partial", "Room only", "Pay now"]);
  assert.deepEqual([b.id, b.refundable, b.freeCancellationUntil, b.boardLabel, b.paymentLabel], ["rat_b", "free", "2027-01-08T12:00:00Z", "Breakfast included", "Pay at the property"]);
  assert.equal(s.roomTypes[1].rates[0].refundable, "none");
  assert.equal(s.hotel.checkInAfter, "15:00:00");
  assert.equal(s.guests, 2);
  assert.equal(mapStayRates(null), null);
  assert.deepEqual(mapQuote({ data: { id: "quo_1", total_amount: "260.00", total_currency: "GBP" } }), { id: "quo_1", total: 260, currency: "GBP", dueAtProperty: null });
});

test("bag size from Duffel metadata", () => {
  assert.equal(bagSize({ maximum_length_cm: 90, maximum_height_cm: 75, maximum_depth_cm: 43 }), "90 × 75 × 43 cm");
  assert.equal(bagSize({}), null);
});
