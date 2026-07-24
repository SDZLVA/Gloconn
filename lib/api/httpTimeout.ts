/**
 * Shared AbortSignal timeout helpers for outbound provider HTTP.
 *
 * Used by SerpAPI (and available for other adapters). Generic — no vendor secrets.
 */

import { createProviderError, type ApiError } from "@/lib/api/errors";

/**
 * Returns true when a fetch failure was caused by AbortSignal.timeout().
 * Does not treat generic AbortError from unrelated aborts as a timeout.
 */
export function isTimeoutError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const name = "name" in error ? String(error.name) : "";
  return name === "TimeoutError";
}

/**
 * Maps a network/fetch failure to a safe ProviderError.
 * Timeout errors get a clear message — never expose AbortError internals to callers.
 */
export function providerErrorFromFetchFailure(
  error: unknown,
  options: {
    timeoutMessage: string;
    networkMessage: string;
  },
): ApiError {
  if (isTimeoutError(error)) {
    return createProviderError(options.timeoutMessage, { cause: error });
  }

  return createProviderError(options.networkMessage, { cause: error });
}

/**
 * Builds a RequestInit signal that aborts after `timeoutMs`.
 * Combines with an existing signal when present (Node AbortSignal.any).
 */
export function signalWithTimeout(
  timeoutMs: number,
  existing?: AbortSignal | null,
): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  if (!existing) {
    return timeoutSignal;
  }

  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([existing, timeoutSignal]);
  }

  return timeoutSignal;
}
