/**
 * Amadeus HTTP client — server-only infrastructure for future API calls.
 *
 * Owns authentication headers and the test-environment base URL.
 * Does not call Flight Offers or any domain-specific endpoints yet.
 */

import "server-only";

import { createProviderError } from "@/lib/api/errors";
import { getAmadeusAccessToken } from "@/lib/providers/flights/amadeus/auth";

/** Amadeus Self-Service test API host. */
export const AMADEUS_TEST_BASE_URL = "https://test.api.amadeus.com";

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

/**
 * Performs an authenticated HTTP request against the Amadeus test API.
 *
 * `path` is relative to the test base URL (e.g. "/v2/shopping/flight-offers").
 * No domain endpoints are called by this module itself — callers choose the path later.
 */
export async function amadeusFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${AMADEUS_TEST_BASE_URL}${normalizedPath}`;
  const authHeaders = await getAmadeusAuthHeaders();

  try {
    return await fetch(url, {
      ...init,
      headers: {
        ...authHeaders,
        ...init.headers,
      },
    });
  } catch (error) {
    throw createProviderError("Could not reach the Amadeus API.", {
      cause: error,
    });
  }
}

/** Re-export for callers that only need a token via the client entry point. */
export { getAmadeusAccessToken } from "@/lib/providers/flights/amadeus/auth";
