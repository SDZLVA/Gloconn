/**
 * Aviasales Data API HTTP client — server only (Milestone 19).
 *
 * The token travels in the X-Access-Token header, never in the URL, so it
 * cannot end up in request logs, error messages or browser history.
 * Logs carry counts and status only: no token, no prices, no traveller data.
 */

import "server-only";

import { createProviderError } from "@/lib/api/errors";
import {
  isTimeoutError,
  providerErrorFromFetchFailure,
  signalWithTimeout,
} from "@/lib/api/httpTimeout";
import type { AviasalesPricesForDatesResponse } from "@/lib/providers/flights/aviasales/types";

export const AVIASALES_PRICES_FOR_DATES_URL =
  "https://api.travelpayouts.com/aviasales/v3/prices_for_dates";

export const DEFAULT_AVIASALES_TIMEOUT_MS = 8_000;

export type AviasalesLogEvent = {
  operation: "prices_for_dates";
  httpStatus?: number;
  durationMs: number;
  tickets?: number;
  errorCode?: "TIMEOUT" | "NETWORK_ERROR" | "UNAUTHORIZED" | "RATE_LIMITED" | "PROVIDER_ERROR";
};

export function logAviasalesEvent(event: AviasalesLogEvent): void {
  console.info(`[aviasales] ${JSON.stringify(event)}`);
}

type FetchPricesOptions = {
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

/** Calls prices_for_dates and returns the parsed body. Throws on any failure. */
export async function fetchAviasalesPricesForDates(
  params: URLSearchParams,
  apiToken: string,
  options: FetchPricesOptions = {},
): Promise<AviasalesPricesForDatesResponse> {
  const token = apiToken?.trim();
  if (!token) {
    throw createProviderError(
      "Aviasales is not configured. Set TRAVELPAYOUTS_API_TOKEN.",
    );
  }

  const doFetch = options.fetchImpl ?? fetch;
  const started = Date.now();
  const elapsed = () => Date.now() - started;

  let response: Response;
  try {
    response = await doFetch(`${AVIASALES_PRICES_FOR_DATES_URL}?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json", "X-Access-Token": token },
      signal: signalWithTimeout(options.timeoutMs ?? DEFAULT_AVIASALES_TIMEOUT_MS),
    });
  } catch (error) {
    logAviasalesEvent({
      operation: "prices_for_dates",
      durationMs: elapsed(),
      errorCode: isTimeoutError(error) ? "TIMEOUT" : "NETWORK_ERROR",
    });
    throw providerErrorFromFetchFailure(error, {
      timeoutMessage: "Flight prices took too long to load. Please try again.",
      networkMessage: "Could not reach the flight price service.",
    });
  }

  if (!response.ok) {
    const errorCode =
      response.status === 401 || response.status === 403
        ? "UNAUTHORIZED"
        : response.status === 429
          ? "RATE_LIMITED"
          : "PROVIDER_ERROR";
    logAviasalesEvent({
      operation: "prices_for_dates",
      httpStatus: response.status,
      durationMs: elapsed(),
      errorCode,
    });
    if (errorCode === "UNAUTHORIZED") {
      throw createProviderError(
        "Aviasales authentication failed. Check TRAVELPAYOUTS_API_TOKEN.",
      );
    }
    if (errorCode === "RATE_LIMITED") {
      throw createProviderError("Flight prices are busy right now. Please try again shortly.");
    }
    throw createProviderError(`Flight prices failed to load (HTTP ${response.status}).`);
  }

  let body: AviasalesPricesForDatesResponse;
  try {
    body = (await response.json()) as AviasalesPricesForDatesResponse;
  } catch (error) {
    logAviasalesEvent({
      operation: "prices_for_dates",
      httpStatus: response.status,
      durationMs: elapsed(),
      errorCode: "PROVIDER_ERROR",
    });
    throw createProviderError("Flight prices returned an invalid response.", { cause: error });
  }

  if (body?.success === false) {
    logAviasalesEvent({
      operation: "prices_for_dates",
      httpStatus: response.status,
      durationMs: elapsed(),
      errorCode: "PROVIDER_ERROR",
    });
    throw createProviderError("Flight prices could not be loaded for this search.");
  }

  logAviasalesEvent({
    operation: "prices_for_dates",
    httpStatus: response.status,
    durationMs: elapsed(),
    tickets: Array.isArray(body?.data) ? body.data.length : 0,
  });

  return body;
}
