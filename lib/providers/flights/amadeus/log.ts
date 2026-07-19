/**
 * Lightweight structured logging for Amadeus (server-only).
 *
 * Logs only safe operational fields — never tokens, credentials,
 * Authorization headers, request bodies, or personal user data.
 */

import "server-only";

export type AmadeusLogOperation =
  | "oauth"
  | "flightOffers"
  | "unauthorizedRetry";

export type AmadeusLogErrorCode =
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "UNAUTHORIZED"
  | "AUTH_FAILED"
  | "NETWORK_ERROR"
  | "PROVIDER_ERROR";

/**
 * Safe Amadeus log event — keep this shape closed so secrets cannot slip in.
 */
export type AmadeusLogEvent = {
  provider: "amadeus";
  operation: AmadeusLogOperation;
  httpStatus?: number;
  durationMs: number;
  errorCode?: AmadeusLogErrorCode;
};

/** Starts a millisecond timer for Amadeus log `durationMs`. */
export function startAmadeusTimer(): () => number {
  const startedAt = Date.now();
  return () => Math.max(0, Date.now() - startedAt);
}

/**
 * Emits a structured Amadeus log line via console (no logging framework).
 * Failures use `console.warn`; successes use `console.info`.
 */
export function logAmadeusEvent(
  event: Omit<AmadeusLogEvent, "provider">,
): void {
  const payload: AmadeusLogEvent = {
    provider: "amadeus",
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
    console.warn("[amadeus]", payload);
  } else {
    console.info("[amadeus]", payload);
  }
}
