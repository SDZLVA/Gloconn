/**
 * Browser-safe client for trip search HTTP endpoints.
 * Calls Route Handlers only — never imports the service or provider layers.
 */

import { createUnexpectedError } from "@/lib/api/errors";
import {
  serviceResultFromApiResponse,
  type ApiResponse,
} from "@/lib/api/responses";
import { serviceFailure, type ServiceResult } from "@/lib/api/types";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchResult } from "@/types/results";

const SEARCH_API_PATH = "/api/search";

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (typeof value !== "object" || value === null || !("ok" in value)) {
    return false;
  }

  return typeof value.ok === "boolean";
}

/**
 * Runs a trip search via `POST /api/search`.
 * Accepts the same partial `SearchRequest` shape the Route Handler validates.
 */
export async function postSearchTrips(
  search: Partial<SearchRequest>,
): Promise<ServiceResult<SearchResult[]>> {
  try {
    const response = await fetch(SEARCH_API_PATH, {
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

    if (!isApiResponse<SearchResult[]>(body)) {
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
