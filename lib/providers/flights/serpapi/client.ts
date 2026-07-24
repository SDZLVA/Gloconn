/**
 * SerpAPI HTTP client — server-only fetch of raw Google Flights JSON.
 *
 * Builds the request URL, attaches the API key, applies a timeout, and returns
 * the parsed JSON body without mapping to Glooconn Flight models.
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
  logSerpApiEvent,
  startSerpApiTimer,
  type SerpApiLogErrorCode,
} from "@/lib/providers/flights/serpapi/log";
import type { SerpApiGoogleFlightsResponse } from "@/lib/providers/flights/serpapi/types";

/** Official SerpAPI search endpoint (engine is supplied via query params). */
export const SERPAPI_SEARCH_URL = "https://serpapi.com/search";

/** Default request timeout when no override is provided. */
export const DEFAULT_SERPAPI_FETCH_TIMEOUT_MS = 15_000;

/** Config slice required to call SerpAPI. */
export type SerpApiClientConfig = Pick<SerpApiConfig, "apiKey">;

type SearchGoogleFlightsOptions = {
  timeoutMs?: number;
};

/**
 * Builds a safe user-facing message for non-OK SerpAPI responses.
 * Never includes the API key or raw request URL.
 */
function messageFromSerpApiFailure(body: unknown, status: number): string {
  if (typeof body === "object" && body !== null) {
    const error = (body as SerpApiGoogleFlightsResponse).error?.trim();
    if (error) {
      return `Flight search failed: ${error}`;
    }
  }

  return `Flight search failed (HTTP ${status}). Please try again.`;
}

/**
 * Calls SerpAPI Google Flights and returns the raw JSON response.
 * Does not map offers to Glooconn Flight models.
 */
export async function searchGoogleFlights(
  params: URLSearchParams,
  config: SerpApiClientConfig,
  options?: SearchGoogleFlightsOptions,
): Promise<SerpApiGoogleFlightsResponse> {
  const apiKey = config.apiKey?.trim();
  if (!apiKey) {
    throw createProviderError(
      "SerpAPI credentials are not configured. Set SERPAPI_API_KEY.",
    );
  }

  const requestParams = new URLSearchParams(params);
  requestParams.set("api_key", apiKey);

  const url = `${SERPAPI_SEARCH_URL}?${requestParams.toString()}`;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_SERPAPI_FETCH_TIMEOUT_MS;
  const elapsed = startSerpApiTimer();

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: signalWithTimeout(timeoutMs),
    });
  } catch (error) {
    logSerpApiEvent({
      operation: "googleFlights",
      durationMs: elapsed(),
      errorCode: isTimeoutError(error) ? "TIMEOUT" : "NETWORK_ERROR",
    });
    throw providerErrorFromFetchFailure(error, {
      timeoutMessage: "SerpAPI flight search timed out. Please try again.",
      networkMessage: "Could not reach the SerpAPI flight search service.",
    });
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch (error) {
    logSerpApiEvent({
      operation: "googleFlights",
      httpStatus: response.status,
      durationMs: elapsed(),
      errorCode: "PROVIDER_ERROR",
    });
    throw createProviderError(
      "Flight search returned an invalid response. Please try again.",
      { cause: error },
    );
  }

  if (!response.ok) {
    const errorCode: SerpApiLogErrorCode =
      response.status === 429
        ? "RATE_LIMITED"
        : response.status === 401
          ? "UNAUTHORIZED"
          : "PROVIDER_ERROR";

    logSerpApiEvent({
      operation: "googleFlights",
      httpStatus: response.status,
      durationMs: elapsed(),
      errorCode,
    });

    if (response.status === 429) {
      throw createProviderError(
        "Flight search is temporarily busy. Please try again shortly.",
      );
    }

    if (response.status === 401) {
      throw createProviderError(
        "SerpAPI authentication failed. Check SERPAPI_API_KEY.",
      );
    }

    throw createProviderError(messageFromSerpApiFailure(body, response.status));
  }

  logSerpApiEvent({
    operation: "googleFlights",
    httpStatus: response.status,
    durationMs: elapsed(),
  });

  return body as SerpApiGoogleFlightsResponse;
}
