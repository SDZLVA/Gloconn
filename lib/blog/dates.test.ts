import { test } from "node:test";
import assert from "node:assert/strict";
import { weekendIn, winterMonths } from "@/lib/blog/dates";

test("winterMonths", () => {
  assert.deepEqual(winterMonths("2026-11-18"), ["2026-12", "2027-01", "2027-02"]);
  assert.deepEqual(winterMonths("2027-01-10"), ["2027-01", "2027-02"]);
  assert.deepEqual(winterMonths("2027-02-27"), ["2027-02"]);
  assert.deepEqual(winterMonths("2027-06-01"), ["2027-12", "2028-01", "2028-02"]);
});

test("weekendIn picks the first Friday after today", () => {
  // 4 Dec 2026 is a Friday.
  assert.deepEqual(weekendIn("2026-12", "2026-11-18"), { departureDate: "2026-12-04", returnDate: "2026-12-06" });
  assert.deepEqual(weekendIn("2026-12", "2026-12-04"), { departureDate: "2026-12-11", returnDate: "2026-12-13" });
  assert.equal(weekendIn("2026-12", "2026-12-31"), null);
});
