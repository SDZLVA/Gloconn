/**
 * Pure helpers for the Milestone 18 date price strip (no React).
 */

import { formatBudget, type CurrencyCode } from "@/lib/budget";
import { parseDateISO } from "@/lib/calendar";
import type {
  DateOptionResult,
  DateOptionStatus,
} from "@/lib/services/dateOptionsService";
import type { TravelPackage } from "@/types/models/travel-package";

/** One chip in the date price strip (current dates or an explore option). */
export type DatePriceStripChip = {
  /** Stable id for React keys / highlight. */
  id: string;
  kind: "current" | "option";
  departureDate: string;
  returnDate: string | null;
  /** Short range, e.g. "18–25 Oct". */
  dateLabel: string;
  /**
   * Scout/current estimate, e.g. "from €640".
   * Null when status text is shown instead.
   */
  priceLabel: string | null;
  /** Shown when there is no usable price (no_results / error / timeout). */
  statusLabel: string | null;
  fitsBudget: boolean;
  /** Cheapest explore option that fits the budget. */
  highlighted: boolean;
  isCurrent: boolean;
};

const MONTH_SHORT = new Intl.DateTimeFormat("en-GB", { month: "short" });

/**
 * Compact date-pair label for chips.
 * Same month: "18–25 Oct". Cross-month: "18 Oct – 2 Nov". One-way: "18 Oct".
 */
export function formatDatePairChipLabel(
  departureDate: string,
  returnDate: string | null,
): string {
  const dep = parseDateISO(departureDate);
  if (!dep) {
    return "";
  }

  if (!returnDate?.trim()) {
    return `${dep.getDate()} ${MONTH_SHORT.format(dep)}`;
  }

  const ret = parseDateISO(returnDate);
  if (!ret) {
    return `${dep.getDate()} ${MONTH_SHORT.format(dep)}`;
  }

  const sameMonth =
    dep.getFullYear() === ret.getFullYear() &&
    dep.getMonth() === ret.getMonth();

  if (sameMonth) {
    return `${dep.getDate()}–${ret.getDate()} ${MONTH_SHORT.format(dep)}`;
  }

  return `${dep.getDate()} ${MONTH_SHORT.format(dep)} – ${ret.getDate()} ${MONTH_SHORT.format(ret)}`;
}

/**
 * Scout price label — always prefixed with "from" (estimates, not a booking quote).
 * Package meaning: flight (per person) + hotel for the stay.
 */
export function formatScoutPriceLabel(
  amount: number,
  currency: string,
): string {
  if (!Number.isFinite(amount)) {
    return "";
  }
  return `from ${formatBudget(Math.round(amount), currency as CurrencyCode)}`;
}

/** User-facing status when an explore pair has no usable price. */
export function formatDateOptionStatusLabel(
  status: DateOptionStatus,
): string | null {
  if (status === "ok") {
    return null;
  }
  if (status === "no_results") {
    return "No trips found";
  }
  // error + timeout
  return "Couldn't check";
}

/** Earliest departure first (not closest-first API order). */
export function sortDateOptionsByDeparture(
  options: readonly DateOptionResult[],
): DateOptionResult[] {
  return [...options].sort((a, b) =>
    a.departureDate.localeCompare(b.departureDate),
  );
}

/** Cheapest package total from current Recommended Packages (same rule as composer). */
export function cheapestCurrentPackageTotal(
  packages: readonly TravelPackage[],
): { total: number; currency: string } | null {
  let best: TravelPackage | null = null;
  for (const pkg of packages) {
    if (!Number.isFinite(pkg.totalPrice)) {
      continue;
    }
    if (!best || pkg.totalPrice < best.totalPrice) {
      best = pkg;
    }
  }
  if (!best) {
    return null;
  }
  return { total: best.totalPrice, currency: best.currency };
}

/**
 * Id of the cheapest explore option that fits the budget, or null.
 * Only "ok" options with a finite total are considered.
 */
export function findHighlightedDateOptionId(
  options: readonly DateOptionResult[],
): string | null {
  let best: DateOptionResult | null = null;
  for (const option of options) {
    if (option.status !== "ok" || !option.fitsBudget) {
      continue;
    }
    if (
      option.cheapestTotal === null ||
      !Number.isFinite(option.cheapestTotal)
    ) {
      continue;
    }
    if (
      !best ||
      (best.cheapestTotal !== null &&
        option.cheapestTotal < best.cheapestTotal)
    ) {
      best = option;
    }
  }
  return best ? dateOptionChipId(best) : null;
}

export function dateOptionChipId(option: DateOptionResult): string {
  return `opt-${option.offsetDays}-${option.departureDate}`;
}

/** True when every usable explore price is over budget (or none fit). */
export function allExploreOptionsOverBudget(
  options: readonly DateOptionResult[],
): boolean {
  const priced = options.filter(
    (o) =>
      o.status === "ok" &&
      o.cheapestTotal !== null &&
      Number.isFinite(o.cheapestTotal),
  );
  if (priced.length === 0) {
    return false;
  }
  return priced.every((o) => !o.fitsBudget);
}

export type BuildDatePriceStripChipsInput = {
  currentDepartureDate: string;
  currentReturnDate: string | null;
  packages: readonly TravelPackage[];
  options: readonly DateOptionResult[];
};

/**
 * Builds the strip: "Your dates" first, then explore options sorted by date.
 */
export function buildDatePriceStripChips(
  input: BuildDatePriceStripChipsInput,
): DatePriceStripChip[] {
  const sorted = sortDateOptionsByDeparture(input.options);
  const highlightId = findHighlightedDateOptionId(sorted);
  const currentCheapest = cheapestCurrentPackageTotal(input.packages);

  const current: DatePriceStripChip = {
    id: "current",
    kind: "current",
    departureDate: input.currentDepartureDate,
    returnDate: input.currentReturnDate,
    dateLabel: formatDatePairChipLabel(
      input.currentDepartureDate,
      input.currentReturnDate,
    ),
    priceLabel: currentCheapest
      ? formatScoutPriceLabel(currentCheapest.total, currentCheapest.currency)
      : null,
    statusLabel: currentCheapest ? null : "No trips found",
    fitsBudget: false,
    highlighted: false,
    isCurrent: true,
  };

  const optionChips: DatePriceStripChip[] = sorted.map((option) => {
    const id = dateOptionChipId(option);
    const statusLabel = formatDateOptionStatusLabel(option.status);
    const hasPrice =
      option.status === "ok" &&
      option.cheapestTotal !== null &&
      option.currency !== null &&
      Number.isFinite(option.cheapestTotal);

    return {
      id,
      kind: "option",
      departureDate: option.departureDate,
      returnDate: option.returnDate,
      dateLabel: formatDatePairChipLabel(
        option.departureDate,
        option.returnDate,
      ),
      priceLabel: hasPrice
        ? formatScoutPriceLabel(option.cheapestTotal!, option.currency!)
        : null,
      statusLabel: hasPrice ? null : statusLabel,
      fitsBudget: hasPrice ? option.fitsBudget : false,
      highlighted: id === highlightId,
      isCurrent: false,
    };
  });

  return [current, ...optionChips];
}

export function formatNoCheaperDatesMessage(flexDays: number): string {
  const n = Number.isInteger(flexDays) && flexDays >= 1 ? flexDays : 1;
  return `No cheaper dates found within ±${n} days.`;
}
