/**
 * Pure helper tests for the date price strip (Milestone 18.5).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  allExploreOptionsOverBudget,
  buildDatePriceStripChips,
  cheapestCurrentPackageTotal,
  findHighlightedDateOptionId,
  formatDateOptionStatusLabel,
  formatDatePairChipLabel,
  formatNoCheaperDatesMessage,
  formatScoutPriceLabel,
  sortDateOptionsByDeparture,
} from "@/lib/results/datePriceStrip";
import type { DateOptionResult } from "@/lib/services/dateOptionsService";
import type { TravelPackage } from "@/types/models/travel-package";

function option(
  overrides: Partial<DateOptionResult> &
    Pick<DateOptionResult, "departureDate" | "offsetDays">,
): DateOptionResult {
  return {
    returnDate: "2026-10-25",
    cheapestTotal: 640,
    currency: "EUR",
    fitsBudget: false,
    status: "ok",
    ...overrides,
  };
}

describe("formatDatePairChipLabel", () => {
  it("formats same-month ranges as day–day Month", () => {
    assert.equal(
      formatDatePairChipLabel("2026-10-18", "2026-10-25"),
      "18–25 Oct",
    );
  });

  it("formats one-way as day Month", () => {
    assert.equal(formatDatePairChipLabel("2026-10-18", null), "18 Oct");
  });
});

describe("formatScoutPriceLabel", () => {
  it("prefixes with from", () => {
    assert.match(formatScoutPriceLabel(640, "EUR"), /^from /);
    assert.match(formatScoutPriceLabel(640, "EUR"), /640/);
  });
});

describe("formatDateOptionStatusLabel", () => {
  it("maps statuses to copy", () => {
    assert.equal(formatDateOptionStatusLabel("ok"), null);
    assert.equal(formatDateOptionStatusLabel("no_results"), "No trips found");
    assert.equal(formatDateOptionStatusLabel("error"), "Couldn't check");
    assert.equal(formatDateOptionStatusLabel("timeout"), "Couldn't check");
  });
});

describe("sortDateOptionsByDeparture", () => {
  it("sorts earliest first (not closest-first)", () => {
    const sorted = sortDateOptionsByDeparture([
      option({ departureDate: "2026-10-20", offsetDays: 1 }),
      option({ departureDate: "2026-10-17", offsetDays: -2 }),
      option({ departureDate: "2026-10-18", offsetDays: -1 }),
    ]);
    assert.deepEqual(
      sorted.map((o) => o.departureDate),
      ["2026-10-17", "2026-10-18", "2026-10-20"],
    );
  });
});

describe("findHighlightedDateOptionId", () => {
  it("picks the cheapest option that fits the budget", () => {
    const options = [
      option({
        departureDate: "2026-10-17",
        offsetDays: -1,
        cheapestTotal: 500,
        fitsBudget: true,
      }),
      option({
        departureDate: "2026-10-20",
        offsetDays: 1,
        cheapestTotal: 450,
        fitsBudget: true,
      }),
      option({
        departureDate: "2026-10-21",
        offsetDays: 2,
        cheapestTotal: 400,
        fitsBudget: false,
      }),
    ];
    const id = findHighlightedDateOptionId(options);
    assert.ok(id?.includes("2026-10-20"));
  });

  it("returns null when nothing fits", () => {
    assert.equal(
      findHighlightedDateOptionId([
        option({
          departureDate: "2026-10-18",
          offsetDays: -1,
          fitsBudget: false,
        }),
      ]),
      null,
    );
  });
});

describe("allExploreOptionsOverBudget", () => {
  it("is true when every priced option is over budget", () => {
    assert.equal(
      allExploreOptionsOverBudget([
        option({
          departureDate: "2026-10-18",
          offsetDays: -1,
          fitsBudget: false,
        }),
        option({
          departureDate: "2026-10-20",
          offsetDays: 1,
          fitsBudget: false,
        }),
      ]),
      true,
    );
  });

  it("is false when at least one fits", () => {
    assert.equal(
      allExploreOptionsOverBudget([
        option({
          departureDate: "2026-10-18",
          offsetDays: -1,
          fitsBudget: false,
        }),
        option({
          departureDate: "2026-10-20",
          offsetDays: 1,
          fitsBudget: true,
        }),
      ]),
      false,
    );
  });
});

describe("buildDatePriceStripChips", () => {
  it("puts Your dates first and marks the best-fit explore chip", () => {
    const packages = [
      { totalPrice: 900, currency: "EUR" },
      { totalPrice: 800, currency: "EUR" },
    ] as TravelPackage[];

    const chips = buildDatePriceStripChips({
      currentDepartureDate: "2026-10-19",
      currentReturnDate: "2026-10-26",
      packages,
      options: [
        option({
          departureDate: "2026-10-20",
          offsetDays: 1,
          cheapestTotal: 700,
          fitsBudget: true,
        }),
        option({
          departureDate: "2026-10-18",
          offsetDays: -1,
          cheapestTotal: 600,
          fitsBudget: true,
        }),
        option({
          departureDate: "2026-10-21",
          offsetDays: 2,
          status: "error",
          cheapestTotal: null,
          currency: null,
        }),
      ],
    });

    assert.equal(chips[0]?.isCurrent, true);
    assert.equal(chips[0]?.id, "current");
    assert.match(chips[0]?.priceLabel ?? "", /^from /);
    assert.equal(chips[0]?.dateLabel, "19–26 Oct");

    // Explore chips: earliest first after current.
    assert.equal(chips[1]?.dateLabel, "18–25 Oct");
    assert.equal(chips[1]?.highlighted, true);
    assert.equal(chips[2]?.highlighted, false);
    assert.equal(chips[3]?.statusLabel, "Couldn't check");
    assert.equal(chips[3]?.priceLabel, null);
  });
});

describe("cheapestCurrentPackageTotal", () => {
  it("returns the lowest package total", () => {
    const result = cheapestCurrentPackageTotal([
      { totalPrice: 900, currency: "EUR" },
      { totalPrice: 500, currency: "EUR" },
    ] as TravelPackage[]);
    assert.deepEqual(result, { total: 500, currency: "EUR" });
  });
});

describe("formatNoCheaperDatesMessage", () => {
  it("mentions the ±N window", () => {
    assert.equal(
      formatNoCheaperDatesMessage(2),
      "No cheaper dates found within ±2 days.",
    );
  });
});
