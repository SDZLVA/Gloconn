/**
 * Lightweight structured logging for SerpAPI (server-only).
 *
 * Same closed event shape as Amadeus logging — never API keys,
 * full credentialed URLs, request bodies, or personal user data.
 */

import "server-only";

export type SerpApiLogOperation =
  | "googleFlights"
  | "googleHotels"
  | "googleHotelsPropertyDetails";

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
  /**
   * Sprint 19.0 — counts only (never prices, routes or user data) so the server
   * log explains WHY a round-trip search produced no publishable flights.
   */
  roundTrip?: SerpApiRoundTripCounts;
};

/** Counts describing one round-trip search; numbers only, safe to log. */
export type SerpApiRoundTripCounts = {
  /** Outbound offers returned by the first call. */
  outboundOffers: number;
  /** Outbound offers that carried a departure_token. */
  withTokens: number;
  /** Return lookups attempted (capped). */
  lookupsAttempted: number;
  /** Return lookups that returned a usable response. */
  lookupsOk: number;
  /** Return lookups that threw. */
  lookupsFailed: number;
  /** Lookups that succeeded but carried no return options. */
  lookupsEmpty: number;
  /** Flights finally published to the app. */
  published: number;
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

  if (event.roundTrip !== undefined) {
    payload.roundTrip = event.roundTrip;
  }

  if (event.errorCode) {
    console.warn("[serpapi]", payload);
  } else {
    console.info("[serpapi]", payload);
  }
}
