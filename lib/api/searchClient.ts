/**
 * Browser-safe client for trip search HTTP endpoints.
 * Calls Route Handlers only — never imports the service or provider layers.
 */

import { createUnexpectedError } from "@/lib/api/errors";
import {
  serviceResultFromApiResponse,
  type ApiResponse,
} from "@/lib/api/responses";
import {
  withSearchResultCache,
} from "@/lib/api/searchResultCache";
import { serviceFailure, type ServiceResult } from "@/lib/api/types";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchResponse } from "@/types/models/search-response";

const SEARCH_API_PATH = "/api/search";

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (typeof value !== "object" || value === null || !("ok" in value)) {
    return false;
  }

  return typeof value.ok === "boolean";
}

async function fetchSearchTrips(
  search: Partial<SearchRequest>,
  phase: "quick" | "full" = "full",
): Promise<ServiceResult<SearchResponse>> {
  try {
    const response = await fetch(phase === "quick" ? `${SEARCH_API_PATH}?phase=quick` : SEARCH_API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(search),
    });

    let body: unknown;

    try {
      body = await response.json();
    } catch {
      return serviceFailure(
        createUnexpectedError("Could not read the search response."),
      );
    }

    if (!isApiResponse<SearchResponse>(body)) {
      return serviceFailure(
        createUnexpectedError("The search response was invalid."),
      );
    }

    return serviceResultFromApiResponse(body);
  } catch {
    return serviceFailure(
      createUnexpectedError("Could not reach the search service."),
    );
  }
}

export type PostSearchTripsOptions = {
  /**
   * When true, skip the client TTL cache and in-flight dedupe
   * (used by "Try again" so the user always gets a fresh network call).
   */
  bypassCache?: boolean;
  /**
   * Milestone 57: "quick" = fast first answer (saved fares, Booking.com);
   * when it comes back with `partial: true`, ask again with "full".
   */
  phase?: "quick" | "full";
};

/**
 * Runs a trip search via `POST /api/search`.
 * Returns the canonical SearchResponse (results + optional warnings).
 *
 * Performance (Sprint 10.4): successful responses are reused for ~45s and
 * concurrent identical requests share one in-flight fetch. Does not change
 * the API contract or response shape.
 */
export async function postSearchTrips(
  search: Partial<SearchRequest>,
  options: PostSearchTripsOptions = {},
): Promise<ServiceResult<SearchResponse>> {
  const phase = options.phase ?? "full";
  return withSearchResultCache(
    search,
    () => fetchSearchTrips(search, phase),
    { bypassCache: options.bypassCache, keySuffix: phase === "quick" ? "|quick" : "" },
  );
}
