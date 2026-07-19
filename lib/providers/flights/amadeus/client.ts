/**
 * Amadeus HTTP client — server-only infrastructure for authenticated API calls.
 *
 * Owns authentication headers, the configured Amadeus base URL, request timeouts,
 * and a single 401 → refresh-token → retry.
 */

import "server-only";

import { getAppConfig } from "@/lib/config";
import { AMADEUS_HOSTS } from "@/lib/config/amadeusHosts";
import {
  clearAmadeusAccessTokenCache,
  getAmadeusAccessToken,
} from "@/lib/providers/flights/amadeus/auth";
import {
  isTimeoutError,
  providerErrorFromFetchFailure,
  signalWithTimeout,
} from "@/lib/providers/flights/amadeus/httpTimeout";
import {
  logAmadeusEvent,
  startAmadeusTimer,
  type AmadeusLogOperation,
} from "@/lib/providers/flights/amadeus/log";

/** Amadeus Self-Service test API host (known host for `AMADEUS_ENV=test`). */
export const AMADEUS_TEST_BASE_URL = AMADEUS_HOSTS.test;

/**
 * Returns Authorization headers for Amadeus HTTP requests.
 * Uses a cached access token from the auth module.
 */
export async function getAmadeusAuthHeaders(): Promise<HeadersInit> {
  const accessToken = await getAmadeusAccessToken();

  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  };
}

type AmadeusFetchOptions = {
  timeoutMs?: number;
  /** When true (default), one 401 triggers cache clear + single retry. */
  allowUnauthorizedRetry?: boolean;
  /**
   * Operation name used when logging timeouts from this fetch.
   * Defaults to `flightOffers` (current sole authenticated caller).
   */
  logOperation?: Exclude<AmadeusLogOperation, "unauthorizedRetry">;
};

/**
 * Performs an authenticated HTTP request against the configured Amadeus API host.
 *
 * `path` is relative to the env base URL (e.g. "/v2/shopping/flight-offers").
 * On HTTP 401: clears the token cache and retries the request exactly once.
 */
export async function amadeusFetch(
  path: string,
  init: RequestInit = {},
  options?: AmadeusFetchOptions,
): Promise<Response> {
  const allowUnauthorizedRetry = options?.allowUnauthorizedRetry !== false;
  return performAmadeusFetch(path, init, options, allowUnauthorizedRetry);
}

async function performAmadeusFetch(
  path: string,
  init: RequestInit,
  options: AmadeusFetchOptions | undefined,
  allowUnauthorizedRetry: boolean,
): Promise<Response> {
  const { amadeus } = getAppConfig();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${amadeus.baseUrl}${normalizedPath}`;
  const authHeaders = await getAmadeusAuthHeaders();
  const timeoutMs = options?.timeoutMs ?? amadeus.fetchTimeoutMs;
  const logOperation = options?.logOperation ?? "flightOffers";
  const elapsed = startAmadeusTimer();

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        ...authHeaders,
        ...init.headers,
      },
      signal: signalWithTimeout(timeoutMs, init.signal),
    });
  } catch (error) {
    logAmadeusEvent({
      operation: logOperation,
      durationMs: elapsed(),
      errorCode: isTimeoutError(error) ? "TIMEOUT" : "NETWORK_ERROR",
    });
    throw providerErrorFromFetchFailure(error, {
      timeoutMessage: "Amadeus request timed out. Please try again.",
      networkMessage: "Could not reach the Amadeus API.",
    });
  }

  if (response.status === 401 && allowUnauthorizedRetry) {
    logAmadeusEvent({
      operation: "unauthorizedRetry",
      httpStatus: 401,
      durationMs: elapsed(),
      errorCode: "UNAUTHORIZED",
    });
    clearAmadeusAccessTokenCache();
    return performAmadeusFetch(path, init, options, false);
  }

  return response;
}

/** Re-export for callers that only need a token via the client entry point. */
export {
  clearAmadeusAccessTokenCache,
  getAmadeusAccessToken,
} from "@/lib/providers/flights/amadeus/auth";
