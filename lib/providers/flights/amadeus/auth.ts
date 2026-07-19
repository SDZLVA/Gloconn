/**
 * Amadeus OAuth2 client-credentials authentication (test environment).
 *
 * Public API: getAmadeusAccessToken()
 * Cache operations stay private to this module.
 */

import "server-only";

import { createProviderError } from "@/lib/api/errors";
import { deleteCached, getCached, setCached } from "@/lib/api/cache";
import { getAppConfig } from "@/lib/config";

/** Amadeus Self-Service test host — production uses api.amadeus.com later. */
const AMADEUS_TEST_TOKEN_URL =
  "https://test.api.amadeus.com/v1/security/oauth2/token";

/** Cache key for the current Amadeus access token (this process only). */
const ACCESS_TOKEN_CACHE_KEY = "amadeus:access_token";

/**
 * Refresh early so callers rarely hit an expired token mid-request.
 * Amadeus tokens typically last ~1799 seconds.
 */
const TOKEN_EXPIRY_BUFFER_MS = 60_000;

type AmadeusTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
  title?: string;
};

type AmadeusCredentials = {
  apiKey: string;
  apiSecret: string;
};

/** Reads Amadeus API credentials from centralized app config. */
function getAmadeusCredentials(): AmadeusCredentials {
  const { apiKeys } = getAppConfig();

  if (!apiKeys.amadeus.isConfigured) {
    throw createProviderError(
      "Amadeus API credentials are not configured. Set AMADEUS_API_KEY and AMADEUS_API_SECRET.",
    );
  }

  return {
    apiKey: apiKeys.amadeus.apiKey,
    apiSecret: apiKeys.amadeus.apiSecret,
  };
}

/**
 * Requests a new access token from the Amadeus test OAuth endpoint.
 * Not exported — callers use getAmadeusAccessToken().
 */
async function fetchAmadeusAccessToken(
  credentials: AmadeusCredentials,
): Promise<{ accessToken: string; expiresInSeconds: number }> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: credentials.apiKey,
    client_secret: credentials.apiSecret,
  });

  let response: Response;

  try {
    response = await fetch(AMADEUS_TEST_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
  } catch (error) {
    throw createProviderError("Could not reach the Amadeus authentication service.", {
      cause: error,
    });
  }

  let payload: AmadeusTokenResponse;

  try {
    payload = (await response.json()) as AmadeusTokenResponse;
  } catch (error) {
    throw createProviderError("Amadeus returned an invalid authentication response.", {
      cause: error,
    });
  }

  if (!response.ok || !payload.access_token) {
    const detail =
      payload.error_description ||
      payload.title ||
      payload.error ||
      `HTTP ${response.status}`;

    throw createProviderError(
      `Amadeus authentication failed: ${detail}`,
    );
  }

  const expiresInSeconds =
    typeof payload.expires_in === "number" && payload.expires_in > 0
      ? payload.expires_in
      : 1799;

  return {
    accessToken: payload.access_token,
    expiresInSeconds,
  };
}

/**
 * Returns a valid Amadeus access token for the test environment.
 *
 * Uses an in-memory TTL cache so repeated calls within the token lifetime
 * do not hit the Amadeus token endpoint again.
 */
export async function getAmadeusAccessToken(): Promise<string> {
  const cached = getCached<string>(ACCESS_TOKEN_CACHE_KEY);
  if (cached) {
    return cached;
  }

  const credentials = getAmadeusCredentials();
  const { accessToken, expiresInSeconds } =
    await fetchAmadeusAccessToken(credentials);

  const ttlMs = Math.max(expiresInSeconds * 1000 - TOKEN_EXPIRY_BUFFER_MS, 0);

  if (ttlMs > 0) {
    setCached(ACCESS_TOKEN_CACHE_KEY, accessToken, ttlMs);
  } else {
    deleteCached(ACCESS_TOKEN_CACHE_KEY);
  }

  return accessToken;
}
