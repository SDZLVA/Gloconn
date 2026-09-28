/**
 * Milestone 18 — scout date-options search (server-side, no HTTP route yet).
 *
 * For each flexible date pair, runs a scout search (flights scout + hotels)
 * and returns the cheapest package total. Scout flights still do one
 * departure_token return lookup so chip prices are honest RT totals.
 * Used later by POST /api/search/date-options.
 */

import { todayISO } from "@/lib/calendar";
import {
  buildFlexibleDatePairs,
  normalizeFlexDays,
  type FlexibleDatePair,
} from "@/lib/search/flexibleDates";
import { getServiceProviders } from "@/lib/services/context";
import { orchestrateTripSearch } from "@/lib/services/searchOrchestrator";
import type { ServiceProviders } from "@/lib/services/types";
import type { Budget } from "@/types/models/budget";
import type { TravelPackage } from "@/types/models/travel-package";
import type { SearchRequest } from "@/types/models/search-request";

/** Max date pairs searched at the same time. */
export const DATE_OPTIONS_CONCURRENCY = 3;

/** Default wall-clock budget for the whole explore job (ms). */
export const DATE_OPTIONS_TIME_BUDGET_MS = 25_000;

export type DateOptionStatus = "ok" | "no_results" | "error" | "timeout";

/** One chip-ready summary for an alternative date pair. */
export type DateOptionResult = {
  departureDate: string;
  returnDate: string | null;
  offsetDays: number;
  cheapestTotal: number | null;
  currency: string | null;
  fitsBudget: boolean;
  status: DateOptionStatus;
};

export type SearchDateOptionsResult = {
  options: DateOptionResult[];
};

export type SearchDateOptionsParams = {
  /** Validated base search (exact dates). flexDays may also live on the request. */
  request: SearchRequest;
  /**
   * Override flex window. When omitted, uses `request.flexDays`.
   * 0 → empty options list.
   */
  flexDays?: number;
  /** Injectable "today" for tests (YYYY-MM-DD). */
  today?: string;
  /** Overall job time limit in ms (default 25s). */
  timeBudgetMs?: number;
  /** Max parallel pair searches (default 3). */
  concurrency?: number;
  /** Injectable providers (tests). */
  providers?: ServiceProviders;
  /**
   * Injectable scout runner for one pair (tests).
   * Production uses orchestrateTripSearch with scout: true.
   */
  scoutPair?: (
    request: SearchRequest,
    providers: ServiceProviders,
  ) => Promise<{ packages: TravelPackage[] }>;
};

/**
 * True when a package total fits the user budget (same currency, no FX).
 */
export function packageTotalFitsBudget(
  total: number,
  currency: string,
  budget: Budget | null | undefined,
): boolean {
  if (!budget || !Number.isFinite(budget.amount) || budget.amount < 0) {
    return false;
  }
  if (!Number.isFinite(total) || currency !== budget.currency) {
    return false;
  }
  return total <= budget.amount;
}

/** Picks the lowest totalPrice package, or null when none are usable. */
export function findCheapestPackage(
  packages: readonly TravelPackage[],
): TravelPackage | null {
  let best: TravelPackage | null = null;
  for (const pkg of packages) {
    if (!Number.isFinite(pkg.totalPrice)) {
      continue;
    }
    if (!best || pkg.totalPrice < best.totalPrice) {
      best = pkg;
    }
  }
  return best;
}

function emptyPairResult(
  pair: FlexibleDatePair,
  status: DateOptionStatus,
): DateOptionResult {
  return {
    departureDate: pair.departureDate,
    returnDate: pair.returnDate,
    offsetDays: pair.offsetDays,
    cheapestTotal: null,
    currency: null,
    fitsBudget: false,
    status,
  };
}

function buildPairRequest(
  base: SearchRequest,
  pair: FlexibleDatePair,
): SearchRequest {
  return {
    ...base,
    departureDate: pair.departureDate,
    returnDate: pair.returnDate,
    // Scout summaries only need packages (flights + hotels).
    productTypes: ["hotels", "flights"],
  };
}

async function defaultScoutPair(
  request: SearchRequest,
  providers: ServiceProviders,
): Promise<{ packages: TravelPackage[] }> {
  const response = await orchestrateTripSearch(request, providers, {
    scout: true,
  });
  return { packages: response.packages };
}

/**
 * Runs `fn` over items with at most `limit` in flight at once.
 * Preserves input order in the returned array.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const safeLimit = Math.max(1, Math.floor(limit));
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) {
        return;
      }
      results[index] = await fn(items[index]!, index);
    }
  }

  const workers = Array.from(
    { length: Math.min(safeLimit, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

function raceWithTimeout<T>(
  promise: Promise<T>,
  ms: number,
  onTimeout: () => T,
): Promise<T> {
  if (ms <= 0) {
    return Promise.resolve(onTimeout());
  }

  return new Promise<T>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(onTimeout());
      }
    }, ms);

    promise.then(
      (value) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(value);
        }
      },
      () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(onTimeout());
        }
      },
    );
  });
}

/**
 * Scouts alternative date pairs and returns cheapest-package summaries.
 * Never throws for a single pair failure — that pair gets status "error".
 */
export async function searchDateOptions(
  params: SearchDateOptionsParams,
): Promise<SearchDateOptionsResult> {
  const providers = params.providers ?? getServiceProviders();
  const flexDays = normalizeFlexDays(
    params.flexDays !== undefined ? params.flexDays : params.request.flexDays,
  );
  const today = params.today ?? todayISO();
  const timeBudgetMs = params.timeBudgetMs ?? DATE_OPTIONS_TIME_BUDGET_MS;
  const concurrency = params.concurrency ?? DATE_OPTIONS_CONCURRENCY;
  const scoutPair = params.scoutPair ?? defaultScoutPair;
  const deadline = Date.now() + timeBudgetMs;

  const pairs = buildFlexibleDatePairs({
    departureDate: params.request.departureDate,
    returnDate: params.request.returnDate,
    flexDays,
    today,
  });

  if (pairs.length === 0) {
    return { options: [] };
  }

  const options = await mapWithConcurrency(
    pairs,
    concurrency,
    async (pair) => {
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) {
        return emptyPairResult(pair, "timeout");
      }

      const pairRequest = buildPairRequest(params.request, pair);

      return raceWithTimeout(
        (async (): Promise<DateOptionResult> => {
          try {
            const { packages } = await scoutPair(pairRequest, providers);
            const cheapest = findCheapestPackage(packages);
            if (!cheapest) {
              return emptyPairResult(pair, "no_results");
            }

            return {
              departureDate: pair.departureDate,
              returnDate: pair.returnDate,
              offsetDays: pair.offsetDays,
              cheapestTotal: cheapest.totalPrice,
              currency: cheapest.currency,
              fitsBudget: packageTotalFitsBudget(
                cheapest.totalPrice,
                cheapest.currency,
                params.request.budget,
              ),
              status: "ok",
            };
          } catch {
            return emptyPairResult(pair, "error");
          }
        })(),
        remainingMs,
        () => emptyPairResult(pair, "timeout"),
      );
    },
  );

  return { options };
}
