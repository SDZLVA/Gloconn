/**
 * Pure helper tests for date-chip selection (Milestone 18.6).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyDatePairToSearch,
  buildResultsUrlWithDatePair,
  datePairsEqual,
  findSelectedChipId,
  isDateChipSelectable,
  shouldShowPricesUpdatedNote,
  shouldSkipDateChipSearch,
} from "@/lib/results/dateChipSelection";
import type { DatePriceStripChip } from "@/lib/results/datePriceStrip";

function chip(
  overrides: Partial<DatePriceStripChip> &
    Pick<DatePriceStripChip, "id" | "departureDate">,
): DatePriceStripChip {
  return {
    kind: "option",
    returnDate: "2026-10-25",
    dateLabel: "18–25 Oct",
    priceLabel: "from €640",
    statusLabel: null,
    fitsBudget: true,
    highlighted: false,
    isCurrent: false,
    selectable: true,
    scoutTotal: 640,
    ...overrides,
  };
}

describe("datePairsEqual", () => {
  it("treats empty return the same as null", () => {
    assert.equal(
      datePairsEqual(
        { departureDate: "2026-10-18", returnDate: null },
        { departureDate: "2026-10-18", returnDate: "" },
      ),
      true,
    );
  });

  it("detects different departures", () => {
    assert.equal(
      datePairsEqual(
        { departureDate: "2026-10-18", returnDate: "2026-10-25" },
        { departureDate: "2026-10-19", returnDate: "2026-10-25" },
      ),
      false,
    );
  });
});

describe("isDateChipSelectable", () => {
  it("allows Your dates always", () => {
    assert.equal(
      isDateChipSelectable(
        chip({
          id: "current",
          kind: "current",
          departureDate: "2026-10-19",
          isCurrent: true,
          selectable: true,
        }),
      ),
      true,
    );
  });

  it("blocks non-ok explore chips", () => {
    assert.equal(
      isDateChipSelectable(
        chip({
          id: "bad",
          departureDate: "2026-10-20",
          selectable: false,
          statusLabel: "Couldn't check",
          priceLabel: null,
          scoutTotal: null,
        }),
      ),
      false,
    );
  });
});

describe("shouldSkipDateChipSearch", () => {
  const active = {
    departureDate: "2026-10-18",
    returnDate: "2026-10-25",
  };

  it("skips when the chip is already selected", () => {
    assert.equal(
      shouldSkipDateChipSearch({
        chip: chip({ id: "a", departureDate: "2026-10-18" }),
        activeDates: active,
        isChipSearchLoading: false,
      }),
      true,
    );
  });

  it("skips while a chip search is loading", () => {
    assert.equal(
      shouldSkipDateChipSearch({
        chip: chip({ id: "b", departureDate: "2026-10-20" }),
        activeDates: active,
        isChipSearchLoading: true,
      }),
      true,
    );
  });

  it("skips non-selectable chips", () => {
    assert.equal(
      shouldSkipDateChipSearch({
        chip: chip({
          id: "c",
          departureDate: "2026-10-20",
          selectable: false,
        }),
        activeDates: active,
        isChipSearchLoading: false,
      }),
      true,
    );
  });

  it("allows a different selectable chip when idle", () => {
    assert.equal(
      shouldSkipDateChipSearch({
        chip: chip({ id: "d", departureDate: "2026-10-20" }),
        activeDates: active,
        isChipSearchLoading: false,
      }),
      false,
    );
  });
});

describe("findSelectedChipId", () => {
  it("returns the chip id matching active dates", () => {
    const chips = [
      chip({
        id: "current",
        kind: "current",
        departureDate: "2026-10-19",
        returnDate: "2026-10-26",
        isCurrent: true,
      }),
      chip({ id: "opt-1", departureDate: "2026-10-18" }),
    ];
    assert.equal(
      findSelectedChipId(chips, {
        departureDate: "2026-10-18",
        returnDate: "2026-10-25",
      }),
      "opt-1",
    );
  });
});

describe("applyDatePairToSearch / buildResultsUrlWithDatePair", () => {
  const base = {
    origin: "Amsterdam",
    destination: "Barcelona",
    tripType: "round-trip" as const,
    departureDate: "2026-10-19",
    returnDate: "2026-10-26",
    flexDays: 2 as const,
    budget: { amount: 500, currency: "EUR" as const },
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard" as const,
  };

  it("keeps flex and other settings while swapping dates", () => {
    const next = applyDatePairToSearch(base, "2026-10-18", "2026-10-25");
    assert.equal(next.departureDate, "2026-10-18");
    assert.equal(next.returnDate, "2026-10-25");
    assert.equal(next.flexDays, 2);
    assert.equal(next.budget?.amount, 500);
    assert.equal(next.origin, "Amsterdam");
  });

  it("builds a results URL with new dates and flex=N", () => {
    const url = buildResultsUrlWithDatePair(base, "2026-10-17", "2026-10-24");
    assert.match(url, /^\/search\/results\?/);
    assert.match(url, /departureDate=2026-10-17/);
    assert.match(url, /returnDate=2026-10-24/);
    assert.match(url, /flex=2/);
    assert.match(url, /budget=500/);
    assert.doesNotMatch(url, /departureDate=2026-10-19/);
  });
});

describe("shouldShowPricesUpdatedNote", () => {
  it("is true only when actual cheapest is higher than scout", () => {
    assert.equal(shouldShowPricesUpdatedNote(600, 700), true);
    assert.equal(shouldShowPricesUpdatedNote(600, 600), false);
    assert.equal(shouldShowPricesUpdatedNote(600, 500), false);
    assert.equal(shouldShowPricesUpdatedNote(null, 700), false);
  });
});
