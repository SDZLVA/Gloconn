/**
 * Amadeus Flight Offers Search — query construction and HTTP (GET).
 *
 * Returns raw Amadeus JSON. Does not map to Glooconn Flight models.
 */

import "server-only";

import { createProviderError } from "@/lib/api/errors";
import { amadeusFetch } from "@/lib/providers/flights/amadeus/client";
import {
  logAmadeusEvent,
  startAmadeusTimer,
  type AmadeusLogErrorCode,
} from "@/lib/providers/flights/amadeus/log";
import type {
  AmadeusApiErrorResponse,
  AmadeusFlightOffersResponse,
} from "@/lib/providers/flights/amadeus/types";
import type { SearchRequest, TravelStyle } from "@/types/models/search-request";

/** Caps how many offers Amadeus returns (MVP). */
const DEFAULT_MAX_FLIGHT_OFFERS = 20;

const FLIGHT_OFFERS_PATH = "/v2/shopping/flight-offers";

/**
 * Maps Glooconn travel style to an Amadeus cabin class.
 * Returns undefined when no preference should be sent.
 */
function travelStyleToTravelClass(
  travelStyle: TravelStyle,
): string | undefined {
  switch (travelStyle) {
    case "luxury":
      return "BUSINESS";
    case "budget":
    case "standard":
      return "ECONOMY";
    default:
      return undefined;
  }
}

/**
 * Builds a safe user-facing message from an Amadeus error payload.
 * Never includes tokens, credentials, or raw request details.
 */
function messageFromAmadeusErrorBody(body: unknown, status: number): string {
  if (typeof body !== "object" || body === null) {
    return `Flight search failed (HTTP ${status}). Please try again.`;
  }

  const errors = (body as AmadeusApiErrorResponse).errors;
  const first = Array.isArray(errors) ? errors[0] : undefined;
  const title = first?.title?.trim();
  const detail = first?.detail?.trim();

  if (title && detail) {
    return `Flight search failed: ${title}. ${detail}`;
  }

  if (title) {
    return `Flight search failed: ${title}`;
  }

  if (detail) {
    return `Flight search failed: ${detail}`;
  }

  return `Flight search failed (HTTP ${status}). Please try again.`;
}

/**
 * Builds URLSearchParams for Amadeus Flight Offers Search (GET).
 *
 * Expects an enriched SearchRequest with originIata and destinationIata.
 * Does not perform HTTP — used by searchFlightOffers().
 */
export function buildFlightOffersSearchParams(
  request: SearchRequest,
): URLSearchParams {
  const originLocationCode = request.originIata?.trim().toUpperCase();
  const destinationLocationCode = request.destinationIata?.trim().toUpperCase();
  const departureDate = request.departureDate?.trim();
  const adults = request.travelers.adults;

  if (!originLocationCode) {
    throw createProviderError(
      "Flight search requires an origin airport code (originIata).",
    );
  }

  if (!destinationLocationCode) {
    throw createProviderError(
      "Flight search requires a destination airport code (destinationIata).",
    );
  }

  if (!departureDate) {
    throw createProviderError("Flight search requires a departure date.");
  }

  if (!Number.isFinite(adults) || adults < 1) {
    throw createProviderError("Flight search requires at least one adult.");
  }

  const params = new URLSearchParams();

  params.set("originLocationCode", originLocationCode);
  params.set("destinationLocationCode", destinationLocationCode);
  params.set("departureDate", departureDate);
  params.set("adults", String(adults));
  params.set("max", String(DEFAULT_MAX_FLIGHT_OFFERS));

  if (request.tripType === "round-trip" && request.returnDate?.trim()) {
    params.set("returnDate", request.returnDate.trim());
  }

  if (request.travelers.children > 0) {
    params.set("children", String(request.travelers.children));
  }

  if (request.travelers.infants > 0) {
    params.set("infants", String(request.travelers.infants));
  }

  const travelClass = travelStyleToTravelClass(request.travelStyle);
  if (travelClass) {
    params.set("travelClass", travelClass);
  }

  const currencyCode = request.budget?.currency?.trim().toUpperCase();
  if (currencyCode) {
    params.set("currencyCode", currencyCode);
  }

  const maxPrice = request.budget?.amount;
  if (typeof maxPrice === "number" && Number.isFinite(maxPrice) && maxPrice > 0) {
    params.set("maxPrice", String(Math.floor(maxPrice)));
  }

  return params;
}

/**
 * Calls Amadeus Flight Offers Search and returns the raw JSON response.
 * Does not map offers to Glooconn Flight models.
 */
export async function searchFlightOffers(
  request: SearchRequest,
): Promise<AmadeusFlightOffersResponse> {
  const elapsed = startAmadeusTimer();
  const params = buildFlightOffersSearchParams(request);
  const path = `${FLIGHT_OFFERS_PATH}?${params.toString()}`;

  const response = await amadeusFetch(path, { method: "GET" }, {
    logOperation: "flightOffers",
  });

  let body: unknown;

  try {
    body = await response.json();
  } catch (error) {
    logAmadeusEvent({
      operation: "flightOffers",
      httpStatus: response.status,
      durationMs: elapsed(),
      errorCode: "PROVIDER_ERROR",
    });
    throw createProviderError(
      "Flight search returned an invalid response. Please try again.",
      { cause: error },
    );
  }

  if (!response.ok) {
    const errorCode: AmadeusLogErrorCode =
      response.status === 429
        ? "RATE_LIMITED"
        : response.status === 401
          ? "UNAUTHORIZED"
          : "PROVIDER_ERROR";

    logAmadeusEvent({
      operation: "flightOffers",
      httpStatus: response.status,
      durationMs: elapsed(),
      errorCode,
    });

    if (response.status === 429) {
      throw createProviderError(
        "Flight search is temporarily busy. Please try again shortly.",
      );
    }

    throw createProviderError(messageFromAmadeusErrorBody(body, response.status));
  }

  logAmadeusEvent({
    operation: "flightOffers",
    httpStatus: response.status,
    durationMs: elapsed(),
  });

  return body as AmadeusFlightOffersResponse;
}
