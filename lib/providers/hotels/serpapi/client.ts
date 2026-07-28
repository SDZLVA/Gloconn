/**
 * SerpAPI HTTP client — server-only fetch of raw Google Hotels JSON.
 *
 * Builds the request URL, attaches the API key, applies a timeout, and returns
 * the parsed JSON body without mapping to Glooconn Hotel models.
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
  DEFAULT_SERPAPI_FETCH_TIMEOUT_MS,
  SERPAPI_SEARCH_URL,
} from "@/lib/providers/flights/serpapi/client";
import {
  logSerpApiEvent,
  startSerpApiTimer,
  type SerpApiLogErrorCode,
} from "@/lib/providers/flights/serpapi/log";
import type { SerpApiGoogleHotelsResponse } from "@/lib/providers/hotels/serpapi/types";

export { SERPAPI_SEARCH_URL };

/** Default request timeout when no override is provided. */
export const DEFAULT_SERPAPI_HOTELS_FETCH_TIMEOUT_MS =
  DEFAULT_SERPAPI_FETCH_TIMEOUT_MS;

/** Config slice required to call SerpAPI. */
export type SerpApiHotelsClientConfig = Pick<SerpApiConfig, "apiKey">;

type SearchGoogleHotelsOptions = {
  timeoutMs?: number;
};

/**
 * Builds a safe user-facing message for non-OK SerpAPI responses.
 * Never includes the API key or raw request URL.
 */
function messageFromSerpApiFailure(body: unknown, status: number): string {
  if (typeof body === "object" && body !== null) {
    const error = (body as SerpApiGoogleHotelsResponse).error?.trim();
    if (error) {
      return `Hotel search failed: ${error}`;
    }
  }

  return `Hotel search failed (HTTP ${status}). Please try again.`;
}

/**
 * Calls SerpAPI Google Hotels and returns the raw JSON response.
 * Does not map offers to Glooconn Hotel models.
 */
export async function searchGoogleHotels(
  params: URLSearchParams,
  config: SerpApiHotelsClientConfig,
  options?: SearchGoogleHotelsOptions,
): Promise<SerpApiGoogleHotelsResponse> {
  const apiKey = config.apiKey?.trim();
  if (!apiKey) {
    throw createProviderError(
      "SerpAPI credentials are not configured. Set SERPAPI_API_KEY.",
    );
  }

  const requestParams = new URLSearchParams(params);
  requestParams.set("api_key", apiKey);

  const url = `${SERPAPI_SEARCH_URL}?${requestParams.toString()}`;
  const timeoutMs =
    options?.timeoutMs ?? DEFAULT_SERPAPI_HOTELS_FETCH_TIMEOUT_MS;
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
      operation: "googleHotels",
      durationMs: elapsed(),
      errorCode: isTimeoutError(error) ? "TIMEOUT" : "NETWORK_ERROR",
    });
    throw providerErrorFromFetchFailure(error, {
      timeoutMessage: "SerpAPI hotel search timed out. Please try again.",
      networkMessage: "Could not reach the SerpAPI hotel search service.",
    });
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch (error) {
    logSerpApiEvent({
      operation: "googleHotels",
      httpStatus: response.status,
      durationMs: elapsed(),
      errorCode: "PROVIDER_ERROR",
    });
    throw createProviderError(
      "Hotel search returned an invalid response. Please try again.",
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
      operation: "googleHotels",
      httpStatus: response.status,
      durationMs: elapsed(),
      errorCode,
    });

    if (response.status === 429) {
      throw createProviderError(
        "Hotel search is temporarily busy. Please try again shortly.",
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
    operation: "googleHotels",
    httpStatus: response.status,
    durationMs: elapsed(),
  });

  return body as SerpApiGoogleHotelsResponse;
}
