/**
 * Lightweight structured logging for SerpAPI (server-only).
 *
 * Same closed event shape as Amadeus logging — never API keys,
 * full credentialed URLs, request bodies, or personal user data.
 */

import "server-only";

export type SerpApiLogOperation = "googleFlights";

export type SerpApiLogErrorCode =
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "UNAUTHORIZED"
  | "NETWORK_ERROR"
  | "PROVIDER_ERROR";

/**
 * Safe SerpAPI log event — keep this shape closed so secrets cannot slip in.
 */
export type SerpApiLogEvent = {
  provider: "serpapi";
  operation: SerpApiLogOperation;
  httpStatus?: number;
  durationMs: number;
  errorCode?: SerpApiLogErrorCode;
};

/** Starts a millisecond timer for SerpAPI log `durationMs`. */
export function startSerpApiTimer(): () => number {
  const startedAt = Date.now();
  return () => Math.max(0, Date.now() - startedAt);
}

/**
 * Emits a structured SerpAPI log line via console (no logging framework).
 * Failures use `console.warn`; successes use `console.info`.
 */
export function logSerpApiEvent(
  event: Omit<SerpApiLogEvent, "provider">,
): void {
  const payload: SerpApiLogEvent = {
    provider: "serpapi",
    operation: event.operation,
    durationMs: event.durationMs,
  };

  if (event.httpStatus !== undefined) {
    payload.httpStatus = event.httpStatus;
  }

  if (event.errorCode !== undefined) {
    payload.errorCode = event.errorCode;
  }

  if (event.errorCode) {
    console.warn("[serpapi]", payload);
  } else {
    console.info("[serpapi]", payload);
  }
}
