/**
 * Amadeus OAuth2 client-credentials authentication.
 *
 * Host and timeouts come from centralized app config (`AMADEUS_ENV`, timeout envs).
 * Public API: getAmadeusAccessToken()
 * Cache operations stay private to this module.
 */

import "server-only";

import { createProviderError } from "@/lib/api/errors";
import { deleteCached, getCached, setCached } from "@/lib/api/cache";
import { getAppConfig } from "@/lib/config";
import {
  isTimeoutError,
  providerErrorFromFetchFailure,
  signalWithTimeout,
} from "@/lib/providers/flights/amadeus/httpTimeout";
import {
  logAmadeusEvent,
  startAmadeusTimer,
} from "@/lib/providers/flights/amadeus/log";

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
  tokenUrl: string;
  oauthTimeoutMs: number;
};

/** Reads Amadeus API credentials and OAuth settings from centralized app config. */
function getAmadeusAuthSettings(): AmadeusCredentials {
  const { amadeus } = getAppConfig();

  if (!amadeus.isConfigured) {
    throw createProviderError(
      "Amadeus API credentials are not configured. Set AMADEUS_API_KEY and AMADEUS_API_SECRET.",
    );
  }

  return {
    apiKey: amadeus.apiKey,
    apiSecret: amadeus.apiSecret,
    tokenUrl: `${amadeus.baseUrl}/v1/security/oauth2/token`,
    oauthTimeoutMs: amadeus.oauthTimeoutMs,
  };
}

/**
 * Requests a new access token from the Amadeus OAuth endpoint for the configured env.
 * Not exported — callers use getAmadeusAccessToken().
 */
async function fetchAmadeusAccessToken(
  credentials: AmadeusCredentials,
): Promise<{ accessToken: string; expiresInSeconds: number }> {
  const elapsed = startAmadeusTimer();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: credentials.apiKey,
    client_secret: credentials.apiSecret,
  });

  let response: Response;

  try {
    response = await fetch(credentials.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      signal: signalWithTimeout(credentials.oauthTimeoutMs),
    });
  } catch (error) {
    logAmadeusEvent({
      operation: "oauth",
      durationMs: elapsed(),
      errorCode: isTimeoutError(error) ? "TIMEOUT" : "NETWORK_ERROR",
    });
    throw providerErrorFromFetchFailure(error, {
      timeoutMessage: "Amadeus authentication timed out. Please try again.",
      networkMessage: "Could not reach the Amadeus authentication service.",
    });
  }

  let payload: AmadeusTokenResponse;

  try {
    payload = (await response.json()) as AmadeusTokenResponse;
  } catch (error) {
    logAmadeusEvent({
      operation: "oauth",
      httpStatus: response.status,
      durationMs: elapsed(),
      errorCode: "AUTH_FAILED",
    });
    throw createProviderError("Amadeus returned an invalid authentication response.", {
      cause: error,
    });
  }

  if (response.status === 429) {
    logAmadeusEvent({
      operation: "oauth",
      httpStatus: 429,
      durationMs: elapsed(),
      errorCode: "RATE_LIMITED",
    });
    throw createProviderError(
      "Amadeus authentication is temporarily busy. Please try again shortly.",
    );
  }

  if (!response.ok || !payload.access_token) {
    logAmadeusEvent({
      operation: "oauth",
      httpStatus: response.status,
      durationMs: elapsed(),
      errorCode: "AUTH_FAILED",
    });

    const detail =
      payload.error_description ||
      payload.title ||
      payload.error ||
      `HTTP ${response.status}`;

    throw createProviderError(
      `Amadeus authentication failed: ${detail}`,
    );
  }

  logAmadeusEvent({
    operation: "oauth",
    httpStatus: response.status,
    durationMs: elapsed(),
  });

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
 * Returns a valid Amadeus access token for the configured environment.
 *
 * Uses an in-memory TTL cache so repeated calls within the token lifetime
 * do not hit the Amadeus token endpoint again.
 */
export async function getAmadeusAccessToken(): Promise<string> {
  const cached = getCached<string>(ACCESS_TOKEN_CACHE_KEY);
  if (cached) {
    return cached;
  }

  const credentials = getAmadeusAuthSettings();
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

/** Clears the cached Amadeus access token (e.g. after HTTP 401). */
export function clearAmadeusAccessTokenCache(): void {
  deleteCached(ACCESS_TOKEN_CACHE_KEY);
}
