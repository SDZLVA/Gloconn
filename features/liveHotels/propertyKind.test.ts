import { test } from "node:test";
import assert from "node:assert/strict";
import { distanceKm, distanceLabel, propertyKindOf } from "@/features/liveHotels/propertyKind";

test("propertyKindOf maps Booking.com and Agoda names", () => {
  assert.equal(propertyKindOf("Hotels"), "hotel");
  assert.equal(propertyKindOf("Hotel"), "hotel");
  assert.equal(propertyKindOf("Resort"), "hotel");
  assert.equal(propertyKindOf("Hostels"), "hostel");
  assert.equal(propertyKindOf("Capsule hotel"), "hostel");
  assert.equal(propertyKindOf("Apartments"), "apartment");
  assert.equal(propertyKindOf("Entire apartment"), "apartment");
  assert.equal(propertyKindOf("Holiday homes"), "apartment");
  assert.equal(propertyKindOf("Aparthotels"), "apartment");
  assert.equal(propertyKindOf("Guesthouse / Bed and Breakfast"), "guesthouse");
  assert.equal(propertyKindOf("Bed and breakfasts"), "guesthouse");
  assert.equal(propertyKindOf("Inns"), "guesthouse");
  assert.equal(propertyKindOf("Inn"), "guesthouse");
  assert.equal(propertyKindOf("Campsites"), "other");
  assert.equal(propertyKindOf(null), "other");
});

test("distanceKm and distanceLabel", () => {
  // Paris centre → Eiffel Tower ≈ 4.1 km
  const d = distanceKm(48.856667, 2.350987, 48.8584, 2.2945);
  assert.ok(d > 3.9 && d < 4.4, String(d));
  assert.equal(distanceLabel(0.34), "350 m from centre");
  assert.equal(distanceLabel(0.01), "50 m from centre");
  assert.equal(distanceLabel(2.1), "2.1 km from centre");
  assert.equal(distanceLabel(14.4), "14 km from centre");
  assert.equal(distanceLabel(null), null);
  assert.equal(distanceLabel(900), null);
});
