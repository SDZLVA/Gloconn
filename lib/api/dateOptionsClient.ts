/**
 * Browser client for POST /api/search/date-options (Milestone 18.5).
 * Mirrors postSearchTrips: short TTL cache + in-flight dedupe.
 * Never imports the service or provider layers.
 */

import { createClientTtlCache } from "@/lib/api/clientTtlCache";
import { createUnexpectedError } from "@/lib/api/errors";
import type { SearchDateOptionsResult } from "@/lib/services/dateOptionsService";
import type { SearchRequest } from "@/types/models/search-request";

const DATE_OPTIONS_API_PATH = "/api/search/date-options";

/** ~45s — same window as trip search; covers double-click / remount. */
export const DATE_OPTIONS_CLIENT_CACHE_TTL_MS = 45_000;

export type PostDateOptionsSuccess = {
  kind: "ok";
  data: SearchDateOptionsResult;
};

export type PostDateOptionsFailure = {
  kind: "rate_limited" | "explore_disabled" | "error";
  message: string;
};

export type PostDateOptionsResult =
  | PostDateOptionsSuccess
  | PostDateOptionsFailure;

type CacheEntry = PostDateOptionsSuccess;

const dateOptionsCache = createClientTtlCache<CacheEntry>({
  ttlMs: DATE_OPTIONS_CLIENT_CACHE_TTL_MS,
  maxEntries: 16,
});

const inflight = new Map<string, Promise<PostDateOptionsResult>>();

/**
 * Cache key for explore requests.
 * Includes flexDays + route + dates + travelers + budget (fitsBudget depends on it).
 * Intentionally separate from buildSearchCacheKey (which omits flexDays).
 */
export function buildDateOptionsClientCacheKey(
  search: Partial<SearchRequest>,
): string {
  const travelers = search.travelers;
  const budget = search.budget;
  return JSON.stringify({
    origin: search.origin ?? "",
    originId: search.originId ?? "",
    destination: search.destination ?? "",
    destinationId: search.destinationId ?? "",
    tripType: search.tripType ?? "",
    departureDate: search.departureDate ?? "",
    returnDate: search.returnDate ?? null,
    flexDays: search.flexDays ?? 0,
    adults: travelers?.adults ?? 0,
    children: travelers?.children ?? 0,
    infants: travelers?.infants ?? 0,
    rooms: travelers?.rooms ?? 0,
    budgetAmount: budget?.amount ?? null,
    budgetCurrency: budget?.currency ?? null,
  });
}

function readErrorMessage(body: unknown, fallback: string): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as { error?: { message?: unknown } }).error?.message ===
      "string"
  ) {
    return (body as { error: { message: string } }).error.message;
  }
  return fallback;
}

function readErrorCode(body: unknown): string | undefined {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as { error?: { code?: unknown } }).error?.code === "string"
  ) {
    return (body as { error: { code: string } }).error.code;
  }
  return undefined;
}

async function fetchDateOptions(
  search: Partial<SearchRequest>,
): Promise<PostDateOptionsResult> {
  try {
    const response = await fetch(DATE_OPTIONS_API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(search),
    });

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return {
        kind: "error",
        message: createUnexpectedError("Could not read the explore response.")
          .message,
      };
    }

    if (response.status === 429 || readErrorCode(body) === "RATE_LIMITED") {
      return {
        kind: "rate_limited",
        message: "Too many searches, please wait a moment.",
      };
    }

    if (
      response.status === 503 ||
      readErrorCode(body) === "EXPLORE_DISABLED"
    ) {
      return {
        kind: "explore_disabled",
        message: readErrorMessage(
          body,
          "Flexible date explore is temporarily unavailable.",
        ),
      };
    }

    if (
      typeof body === "object" &&
      body !== null &&
      "ok" in body &&
      (body as { ok: boolean }).ok === true &&
      "data" in body
    ) {
      return {
        kind: "ok",
        data: (body as { data: SearchDateOptionsResult }).data,
      };
    }

    return {
      kind: "error",
      message: readErrorMessage(
        body,
        "Could not check nearby dates. Please try again.",
      ),
    };
  } catch {
    return {
      kind: "error",
      message: "Could not reach the explore service. Please try again.",
    };
  }
}

export type PostDateOptionsOptions = {
  /** Skip client TTL + in-flight dedupe (e.g. explicit Try again). */
  bypassCache?: boolean;
};

/**
 * Explores alternative dates via POST /api/search/date-options.
 * Successful responses are reused for ~45s; identical in-flight calls share one fetch.
 */
export async function postDateOptions(
  search: Partial<SearchRequest>,
  options: PostDateOptionsOptions = {},
): Promise<PostDateOptionsResult> {
  const key = buildDateOptionsClientCacheKey(search);

  if (!options.bypassCache) {
    const cached = dateOptionsCache.get(key);
    if (cached) {
      return cached;
    }
    const pending = inflight.get(key);
    if (pending) {
      return pending;
    }
  } else {
    dateOptionsCache.delete(key);
  }

  const promise = fetchDateOptions(search)
    .then((result) => {
      if (result.kind === "ok") {
        dateOptionsCache.set(key, result);
      }
      return result;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

/** Test helper — clears client explore cache + in-flight map. */
export function clearDateOptionsClientCache(): void {
  dateOptionsCache.clear();
  inflight.clear();
}
