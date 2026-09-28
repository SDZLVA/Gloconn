/**
 * Milestone 18.4b — explore date-options service for the API route.
 *
 * Validates flexDays (1–3), validates the SearchRequest, then runs scout
 * searchDateOptions with a short server-side TTL cache.
 */

import { getCached, setCached } from "@/lib/api/cache";
import { createValidationError } from "@/lib/api/errors";
import {
  serviceFailure,
  serviceSuccess,
  type ServiceResult,
} from "@/lib/api/types";
import { validateSearchRequest } from "@/lib/api/validation";
import {
  searchDateOptions,
  type SearchDateOptionsResult,
} from "@/lib/services/dateOptionsService";
import type { ServiceProviders } from "@/lib/services/types";
import type { SearchRequest } from "@/types/models/search-request";

/**
 * Server-side TTL for explore results.
 *
 * IMPORTANT: `lib/api/cache.ts` is in-process only — each Vercel/serverless
 * instance has its own Map. A cache hit avoids SerpAPI on that instance;
 * another instance may still miss and spend quota.
 */
export const DATE_OPTIONS_CACHE_TTL_MS = 15 * 60 * 1000;

const CACHE_KEY_PREFIX = "explore-dates:v1:";

/** True when flexDays is a valid explore window (1, 2, or 3) — not Exact (0). */
export function isExploreFlexDays(value: unknown): value is 1 | 2 | 3 {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 3
  );
}

/**
 * Stable cache key for one explore request.
 * Includes budget so fitsBudget chips stay correct across budgets.
 */
export function buildDateOptionsCacheKey(
  request: SearchRequest,
  flexDays: 1 | 2 | 3,
): string {
  const travelers = request.travelers;
  const budget = request.budget;
  return (
    CACHE_KEY_PREFIX +
    JSON.stringify({
      origin: request.origin,
      originId: request.originId ?? "",
      destination: request.destination,
      destinationId: request.destinationId ?? "",
      tripType: request.tripType,
      departureDate: request.departureDate,
      returnDate: request.returnDate,
      flexDays,
      adults: travelers.adults,
      children: travelers.children,
      infants: travelers.infants,
      rooms: travelers.rooms,
      budgetAmount: budget?.amount ?? null,
      budgetCurrency: budget?.currency ?? null,
    })
  );
}

export type ExploreDateOptionsDeps = {
  providers?: ServiceProviders;
  /** Injectable for tests — defaults to searchDateOptions. */
  search?: typeof searchDateOptions;
  /** When true, skip the TTL cache (tests). */
  bypassCache?: boolean;
};

/**
 * Runs a scout date-options explore for a validated SearchRequest body.
 * Callers must enforce kill switch + rate limit at the HTTP layer.
 */
export async function exploreDateOptions(
  body: Partial<SearchRequest>,
  deps: ExploreDateOptionsDeps = {},
): Promise<ServiceResult<SearchDateOptionsResult>> {
  if (!isExploreFlexDays(body.flexDays)) {
    return serviceFailure(
      createValidationError(
        "Flexible dates must be ±1, ±2, or ±3 days to explore cheaper options.",
        { field: "flexDays" },
      ),
    );
  }

  const flexDays = body.flexDays;
  const validated = validateSearchRequest({ ...body, flexDays });
  if (!validated.success) {
    return validated;
  }

  const request = validated.data;
  const cacheKey = buildDateOptionsCacheKey(request, flexDays);

  if (!deps.bypassCache) {
    const cached = getCached<SearchDateOptionsResult>(cacheKey);
    if (cached) {
      return serviceSuccess(cached);
    }
  }

  const search = deps.search ?? searchDateOptions;
  const result = await search({
    request,
    flexDays,
    providers: deps.providers,
  });

  if (!deps.bypassCache) {
    // Per-instance cache only — see DATE_OPTIONS_CACHE_TTL_MS comment above.
    setCached(cacheKey, result, DATE_OPTIONS_CACHE_TTL_MS);
  }

  return serviceSuccess(result);
}
