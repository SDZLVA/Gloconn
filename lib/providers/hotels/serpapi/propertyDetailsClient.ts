/**
 * SerpAPI Google Hotels property-details HTTP client (server-only).
 * Sprint 17.3 — called only after resolving a server-held property_token.
 */

import "server-only";

import { createProviderError } from "@/lib/api/errors";
import {
  isTimeoutError,
  providerErrorFromFetchFailure,
  signalWithTimeout,
} from "@/lib/api/httpTimeout";
import type { SerpApiConfig } from "@/lib/config/types";
import {
  DEFAULT_SERPAPI_HOTELS_FETCH_TIMEOUT_MS,
  SERPAPI_SEARCH_URL,
  type SerpApiHotelsClientConfig,
} from "@/lib/providers/hotels/serpapi/client";
import {
  logSerpApiEvent,
  startSerpApiTimer,
  type SerpApiLogErrorCode,
} from "@/lib/providers/flights/serpapi/log";
import type { SerpApiHotelPropertyDetailsResponse } from "@/lib/providers/hotels/serpapi/propertyDetailsTypes";

export type FetchPropertyDetailsOptions = {
  timeoutMs?: number;
  /** Required by SerpAPI even for property-details — original hotels `q`. */
  query: string;
  /** Optional stay dates for priced offers (YYYY-MM-DD). */
  checkInDate?: string;
  checkOutDate?: string;
  currency?: string;
  adults?: number;
};

function messageFromFailure(body: unknown, status: number): string {
  if (typeof body === "object" && body !== null) {
    const error = (body as SerpApiHotelPropertyDetailsResponse).error?.trim();
    if (error) {
      return `Hotel details failed: ${error}`;
    }
  }
  return `Hotel details failed (HTTP ${status}). Please try again.`;
}

/**
 * Builds query params for a property-details request (no api_key).
 * SerpAPI requires both `property_token` and `q` (original search query).
 */
export function buildPropertyDetailsParams(
  propertyToken: string,
  options: FetchPropertyDetailsOptions & { query: string },
): URLSearchParams {
  const token = propertyToken.trim();
  const query = options.query?.trim();
  if (!token) {
    throw createProviderError("Hotel details require a property reference.");
  }
  if (!query) {
    throw createProviderError("Hotel details require a search query.");
  }

  const params = new URLSearchParams();
  params.set("engine", "google_hotels");
  params.set("q", query);
  params.set("property_token", token);

  if (options.checkInDate?.trim()) {
    params.set("check_in_date", options.checkInDate.trim());
  }
  if (options.checkOutDate?.trim()) {
    params.set("check_out_date", options.checkOutDate.trim());
  }
  if (options.currency?.trim()) {
    params.set("currency", options.currency.trim());
  }
  if (
    typeof options.adults === "number" &&
    Number.isFinite(options.adults) &&
    options.adults >= 1
  ) {
    params.set("adults", String(Math.floor(options.adults)));
  }

  return params;
}

/**
 * Fetches SerpAPI Google Hotels property details for a property_token.
 * Does not map to Glooconn models — use mapPropertyDetailsResponse.
 */
export async function fetchGoogleHotelPropertyDetails(
  propertyToken: string,
  config: SerpApiHotelsClientConfig | Pick<SerpApiConfig, "apiKey">,
  options: FetchPropertyDetailsOptions,
): Promise<SerpApiHotelPropertyDetailsResponse> {
  const apiKey = config.apiKey?.trim();
  if (!apiKey) {
    throw createProviderError(
      "SerpAPI credentials are not configured. Set SERPAPI_API_KEY.",
    );
  }

  const requestParams = buildPropertyDetailsParams(propertyToken, options);
  requestParams.set("api_key", apiKey);

  const url = `${SERPAPI_SEARCH_URL}?${requestParams.toString()}`;
  const timeoutMs =
    options.timeoutMs ?? DEFAULT_SERPAPI_HOTELS_FETCH_TIMEOUT_MS;
  const elapsed = startSerpApiTimer();

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: signalWithTimeout(timeoutMs),
    });
  } catch (error) {
    logSerpApiEvent({
      operation: "googleHotelsPropertyDetails",
      durationMs: elapsed(),
      errorCode: isTimeoutError(error) ? "TIMEOUT" : "NETWORK_ERROR",
    });
    throw providerErrorFromFetchFailure(error, {
      timeoutMessage: "Hotel details timed out. Please try again.",
      networkMessage: "Could not reach the hotel details service.",
    });
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    logSerpApiEvent({
      operation: "googleHotelsPropertyDetails",
      httpStatus: response.status,
      durationMs: elapsed(),
      errorCode: "PROVIDER_ERROR",
    });
    throw createProviderError(
      "Hotel details returned an invalid response. Please try again.",
      { cause: error },
    );
  }

  if (!response.ok) {
    const errorCode: SerpApiLogErrorCode =
      response.status === 429
        ? "RATE_LIMITED"
        : response.status === 401 || response.status === 403
          ? "UNAUTHORIZED"
          : "PROVIDER_ERROR";

    logSerpApiEvent({
      operation: "googleHotelsPropertyDetails",
      httpStatus: response.status,
      durationMs: elapsed(),
      errorCode,
    });

    if (response.status === 429) {
      throw createProviderError(
        "Hotel details are temporarily busy. Please try again shortly.",
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw createProviderError(
        "SerpAPI authentication failed. Check SERPAPI_API_KEY.",
      );
    }

    throw createProviderError(messageFromFailure(body, response.status));
  }

  logSerpApiEvent({
    operation: "googleHotelsPropertyDetails",
    httpStatus: response.status,
    durationMs: elapsed(),
  });

  if (typeof body !== "object" || body === null) {
    throw createProviderError(
      "Hotel details returned an invalid response. Please try again.",
    );
  }

  return body as SerpApiHotelPropertyDetailsResponse;
}
