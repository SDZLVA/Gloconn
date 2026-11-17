import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, monthLabel, parseMonthlyPrices, searchDatesFor } from "@/features/routePrices/parse";

test("parseMonthlyPrices keeps future months with a price, in order", () => {
  const raw = {
    success: true,
    data: {
      "2027-02": { price: 540.4, airline: "QR", transfers: 1, departure_at: "2027-02-03T10:00:00+01:00", return_at: "2027-02-17T08:00:00+05:30" },
      "2026-12": { price: 612, airline: "EK", transfers: 1, departure_at: "2026-12-10T14:00:00+01:00", return_at: "2026-12-30T09:00:00+05:30" },
      "2026-10": { price: 300, airline: "QR", transfers: 1 },
      "2027-01": { price: 0, airline: "QR" },
      junk: "x",
    },
  };
  const months = parseMonthlyPrices(raw, "2026-11");
  assert.deepEqual(months.map((m) => [m.month, m.price, m.airlineCode, m.transfers]), [
    ["2026-12", 612, "EK", 1],
    ["2027-02", 540, "QR", 1],
  ]);
  assert.equal(months[0].departureDate, "2026-12-10");
  assert.equal(months[0].returnDate, "2026-12-30");
  assert.deepEqual(parseMonthlyPrices(null, "2026-11"), []);
  assert.deepEqual(parseMonthlyPrices({ data: [] }, "2026-11"), []);
});

test("searchDatesFor uses the fare's dates when ahead, else the 15th for a week", () => {
  assert.deepEqual(searchDatesFor({ month: "2026-12", departureDate: "2026-12-10", returnDate: "2026-12-30" }, "2026-11-18"), {
    departureDate: "2026-12-10",
    returnDate: "2026-12-30",
  });
  assert.deepEqual(searchDatesFor({ month: "2026-12", departureDate: "2026-11-01", returnDate: "2026-11-08" }, "2026-11-18"), {
    departureDate: "2026-12-15",
    returnDate: "2026-12-22",
  });
  // This month, already past the 15th → tomorrow.
  assert.deepEqual(searchDatesFor({ month: "2026-11", departureDate: null, returnDate: null }, "2026-11-20"), {
    departureDate: "2026-11-21",
    returnDate: "2026-11-28",
  });
  assert.equal(addDays("2026-12-28", 7), "2027-01-04");
  assert.equal(monthLabel("2027-02"), "February 2027");
});
