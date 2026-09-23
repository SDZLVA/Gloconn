/**
 * Tests for Milestone 18 flexible-date pair builder.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildFlexibleDatePairs,
  isFlexDays,
  normalizeFlexDays,
} from "@/lib/search/flexibleDates";

const TODAY = "2026-03-01";

describe("normalizeFlexDays", () => {
  it("keeps valid integers 0–3", () => {
    assert.equal(normalizeFlexDays(0), 0);
    assert.equal(normalizeFlexDays(1), 1);
    assert.equal(normalizeFlexDays(2), 2);
    assert.equal(normalizeFlexDays(3), 3);
  });

  it("parses numeric strings and coerces everything else to 0", () => {
    assert.equal(normalizeFlexDays("2"), 2);
    assert.equal(normalizeFlexDays(" 3 "), 3);
    assert.equal(normalizeFlexDays("4"), 0);
    assert.equal(normalizeFlexDays("-1"), 0);
    assert.equal(normalizeFlexDays("abc"), 0);
    assert.equal(normalizeFlexDays(""), 0);
    assert.equal(normalizeFlexDays(null), 0);
    assert.equal(normalizeFlexDays(undefined), 0);
    assert.equal(normalizeFlexDays(1.5), 0);
  });
});

describe("isFlexDays", () => {
  it("accepts integers 0–3", () => {
    assert.equal(isFlexDays(0), true);
    assert.equal(isFlexDays(1), true);
    assert.equal(isFlexDays(2), true);
    assert.equal(isFlexDays(3), true);
  });

  it("rejects values outside 0–3 and non-integers", () => {
    assert.equal(isFlexDays(-1), false);
    assert.equal(isFlexDays(4), false);
    assert.equal(isFlexDays(1.5), false);
    assert.equal(isFlexDays(Number.NaN), false);
  });
});

describe("buildFlexibleDatePairs", () => {
  it("returns an empty list when flexDays is 0", () => {
    const pairs = buildFlexibleDatePairs({
      departureDate: "2026-03-10",
      returnDate: "2026-03-14",
      flexDays: 0,
      today: TODAY,
    });

    assert.deepEqual(pairs, []);
  });

  it("throws for flexDays outside 0–3", () => {
    assert.throws(
      () =>
        buildFlexibleDatePairs({
          departureDate: "2026-03-10",
          returnDate: "2026-03-14",
          flexDays: 4,
          today: TODAY,
        }),
      RangeError,
    );

    assert.throws(
      () =>
        buildFlexibleDatePairs({
          departureDate: "2026-03-10",
          returnDate: "2026-03-14",
          flexDays: -1,
          today: TODAY,
        }),
      RangeError,
    );

    assert.throws(
      () =>
        buildFlexibleDatePairs({
          departureDate: "2026-03-10",
          returnDate: "2026-03-14",
          flexDays: 1.5,
          today: TODAY,
        }),
      RangeError,
    );
  });

  it("orders closest first for ±1 (−1 then +1)", () => {
    const pairs = buildFlexibleDatePairs({
      departureDate: "2026-03-10",
      returnDate: "2026-03-14",
      flexDays: 1,
      today: TODAY,
    });

    assert.equal(pairs.length, 2);
    assert.deepEqual(
      pairs.map((p) => p.offsetDays),
      [-1, 1],
    );
    assert.deepEqual(pairs[0], {
      departureDate: "2026-03-09",
      returnDate: "2026-03-13",
      offsetDays: -1,
    });
    assert.deepEqual(pairs[1], {
      departureDate: "2026-03-11",
      returnDate: "2026-03-15",
      offsetDays: 1,
    });
  });

  it("orders closest first for ±2 (−1, +1, −2, +2)", () => {
    const pairs = buildFlexibleDatePairs({
      departureDate: "2026-03-10",
      returnDate: "2026-03-14",
      flexDays: 2,
      today: TODAY,
    });

    assert.deepEqual(
      pairs.map((p) => p.offsetDays),
      [-1, 1, -2, 2],
    );
  });

  it("orders closest first for ±3 (−1, +1, −2, +2, −3, +3)", () => {
    const pairs = buildFlexibleDatePairs({
      departureDate: "2026-03-10",
      returnDate: "2026-03-14",
      flexDays: 3,
      today: TODAY,
    });

    assert.equal(pairs.length, 6);
    assert.deepEqual(
      pairs.map((p) => p.offsetDays),
      [-1, 1, -2, 2, -3, 3],
    );
  });

  it("keeps the same number of nights on every round-trip pair", () => {
    // 10 → 14 Mar is 4 nights.
    const pairs = buildFlexibleDatePairs({
      departureDate: "2026-03-10",
      returnDate: "2026-03-14",
      flexDays: 3,
      today: TODAY,
    });

    for (const pair of pairs) {
      assert.ok(pair.returnDate, "round-trip pairs must have a return date");
      const dep = new Date(`${pair.departureDate}T00:00:00`);
      const ret = new Date(`${pair.returnDate}T00:00:00`);
      const nights = Math.round(
        (ret.getTime() - dep.getTime()) / (24 * 60 * 60 * 1000),
      );
      assert.equal(nights, 4, `expected 4 nights for offset ${pair.offsetDays}`);
    }
  });

  it("skips pairs whose departure is before today", () => {
    // Departure is today → offset −1 and −2 would start in the past → dropped.
    const pairs = buildFlexibleDatePairs({
      departureDate: "2026-03-01",
      returnDate: "2026-03-05",
      flexDays: 2,
      today: TODAY,
    });

    assert.deepEqual(
      pairs.map((p) => p.offsetDays),
      [1, 2],
    );
    assert.ok(pairs.every((p) => p.departureDate >= TODAY));
  });

  it("skips all negative offsets when the whole window would be past", () => {
    const pairs = buildFlexibleDatePairs({
      departureDate: "2026-03-02",
      returnDate: "2026-03-06",
      flexDays: 3,
      today: "2026-03-05",
    });

    // −1 → Mar 1, −2 → Feb 28, −3 → Feb 27 — all before Mar 5.
    // +1 → Mar 3, +2 → Mar 4, +3 → Mar 5 — Mar 3 and Mar 4 before today.
    // Only +3 (Mar 5) survives.
    assert.deepEqual(pairs, [
      {
        departureDate: "2026-03-05",
        returnDate: "2026-03-09",
        offsetDays: 3,
      },
    ]);
  });

  it("shifts departure only for one-way trips (null returnDate)", () => {
    const pairs = buildFlexibleDatePairs({
      departureDate: "2026-03-10",
      returnDate: null,
      flexDays: 1,
      today: TODAY,
    });

    assert.deepEqual(pairs, [
      { departureDate: "2026-03-09", returnDate: null, offsetDays: -1 },
      { departureDate: "2026-03-11", returnDate: null, offsetDays: 1 },
    ]);
  });

  it("treats empty returnDate string as one-way", () => {
    const pairs = buildFlexibleDatePairs({
      departureDate: "2026-03-10",
      returnDate: "   ",
      flexDays: 1,
      today: TODAY,
    });

    assert.equal(pairs.length, 2);
    assert.ok(pairs.every((p) => p.returnDate === null));
  });

  it("crosses month and year boundaries correctly", () => {
    const pairs = buildFlexibleDatePairs({
      departureDate: "2026-12-31",
      returnDate: "2027-01-04",
      flexDays: 1,
      today: "2026-12-01",
    });

    assert.deepEqual(pairs, [
      {
        departureDate: "2026-12-30",
        returnDate: "2027-01-03",
        offsetDays: -1,
      },
      {
        departureDate: "2027-01-01",
        returnDate: "2027-01-05",
        offsetDays: 1,
      },
    ]);
  });

  it("handles leap-year day after 28 Feb 2028", () => {
    // 2028 is a leap year — 28 Feb + 1 day = 29 Feb.
    const pairs = buildFlexibleDatePairs({
      departureDate: "2028-02-28",
      returnDate: "2028-03-03",
      flexDays: 1,
      today: "2028-02-01",
    });

    const plusOne = pairs.find((p) => p.offsetDays === 1);
    assert.ok(plusOne);
    assert.equal(plusOne.departureDate, "2028-02-29");
    assert.equal(plusOne.returnDate, "2028-03-04");
  });

  it("returns an empty list for invalid departure ISO", () => {
    const pairs = buildFlexibleDatePairs({
      departureDate: "not-a-date",
      returnDate: "2026-03-14",
      flexDays: 1,
      today: TODAY,
    });

    assert.deepEqual(pairs, []);
  });

  it("returns an empty list for invalid return ISO on round-trip", () => {
    const pairs = buildFlexibleDatePairs({
      departureDate: "2026-03-10",
      returnDate: "2026-99-99",
      flexDays: 1,
      today: TODAY,
    });

    assert.deepEqual(pairs, []);
  });

  it("returns an empty list when return is before departure", () => {
    const pairs = buildFlexibleDatePairs({
      departureDate: "2026-03-14",
      returnDate: "2026-03-10",
      flexDays: 1,
      today: TODAY,
    });

    assert.deepEqual(pairs, []);
  });
});
