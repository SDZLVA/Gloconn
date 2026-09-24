/**
 * Pure helpers for Milestone 18.6 date-chip selection (no React).
 * Cost guards, URL updates, and honesty copy for full package reloads.
 */

import {
  buildResultsUrlFromRequest,
  buildSearchRequestFromData,
  partialSearchRequestToSearchData,
} from "@/lib/search/request";
import type { DatePriceStripChip } from "@/lib/results/datePriceStrip";
import type { SearchRequest } from "@/types/models/search-request";

/** Calm note when full-search cheapest exceeds the chip scout estimate. */
export const PRICES_UPDATED_AFTER_FULL_SEARCH_MESSAGE =
  "Prices updated after a full search";

export type DatePair = {
  departureDate: string;
  returnDate: string | null;
};

/** True when both pairs use the same departure and return dates. */
export function datePairsEqual(a: DatePair, b: DatePair): boolean {
  const aReturn = a.returnDate?.trim() || null;
  const bReturn = b.returnDate?.trim() || null;
  return (
    a.departureDate === b.departureDate &&
    aReturn === bReturn
  );
}

/**
 * Whether a strip chip can be activated.
 * "Your dates" is always selectable; explore chips only when status was ok.
 */
export function isDateChipSelectable(
  chip: Pick<DatePriceStripChip, "kind" | "selectable">,
): boolean {
  if (chip.kind === "current") {
    return true;
  }
  return chip.selectable;
}

/**
 * Skip the network/search path when the chip is already selected,
 * not selectable, or a chip search is already in flight.
 */
export function shouldSkipDateChipSearch(input: {
  chip: Pick<
    DatePriceStripChip,
    "kind" | "selectable" | "departureDate" | "returnDate"
  >;
  activeDates: DatePair;
  isChipSearchLoading: boolean;
}): boolean {
  if (input.isChipSearchLoading) {
    return true;
  }
  if (!isDateChipSelectable(input.chip)) {
    return true;
  }
  return datePairsEqual(input.activeDates, {
    departureDate: input.chip.departureDate,
    returnDate: input.chip.returnDate,
  });
}

/** Copies search settings and swaps only the date pair (flex and budget unchanged). */
export function applyDatePairToSearch(
  search: Partial<SearchRequest>,
  departureDate: string,
  returnDate: string | null,
): Partial<SearchRequest> {
  return {
    ...search,
    departureDate,
    returnDate,
  };
}

/**
 * Results URL for the same search with a new date pair.
 * Keeps flex=N and all other params; used for refresh / share / Edit search.
 */
export function buildResultsUrlWithDatePair(
  search: Partial<SearchRequest>,
  departureDate: string,
  returnDate: string | null,
): string {
  const merged = applyDatePairToSearch(search, departureDate, returnDate);
  const request = buildSearchRequestFromData(
    // Defaults fill any missing fields so we always get a valid URL.
    {
      origin: "",
      destination: "",
      tripType: "round-trip",
      departureDate: "",
      returnDate: null,
      flexDays: 0,
      budget: null,
      budgetCurrency: null,
      travelers: { adults: 1, children: 0, infants: 0, rooms: 1 },
      totalGuests: 1,
      travelStyle: "standard",
      ...partialSearchRequestToSearchData(merged),
    },
  );
  return buildResultsUrlFromRequest(request);
}

/** Chip id whose dates match the active search, or null. */
export function findSelectedChipId(
  chips: readonly DatePriceStripChip[],
  activeDates: DatePair,
): string | null {
  const match = chips.find((chip) =>
    datePairsEqual(activeDates, {
      departureDate: chip.departureDate,
      returnDate: chip.returnDate,
    }),
  );
  return match?.id ?? null;
}

/**
 * Show honesty note when the real cheapest package total is higher than
 * the scout "from €X" estimate on the chip.
 */
export function shouldShowPricesUpdatedNote(
  scoutEstimate: number | null | undefined,
  actualCheapest: number | null | undefined,
): boolean {
  if (
    scoutEstimate == null ||
    actualCheapest == null ||
    !Number.isFinite(scoutEstimate) ||
    !Number.isFinite(actualCheapest)
  ) {
    return false;
  }
  return actualCheapest > scoutEstimate;
}
