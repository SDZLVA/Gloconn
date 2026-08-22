/**
 * Browser client for hotel property details (Sprint 17.3 / 17.5.1).
 * Calls Route Handler only — never SerpAPI.
 */

import { createUnexpectedError } from "@/lib/api/errors";
import {
  serviceResultFromApiResponse,
  type ApiResponse,
} from "@/lib/api/responses";
import { serviceFailure, type ServiceResult } from "@/lib/api/types";
import type { HotelPropertyDetails } from "@/types/models/hotel-property-details";

const DETAILS_API_PATH = "/api/hotels/details";

export type HotelPropertyDetailsClientPayload = {
  details: HotelPropertyDetails;
  cached: boolean;
};

export type FetchHotelPropertyDetailsInput = {
  /** Sealed server reference (`Hotel.providerPropertyRef`). */
  ref?: string | null;
  /** Glooconn hotel id (optional binding + cache identity). */
  hotelId?: string | null;
};

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (typeof value !== "object" || value === null || !("ok" in value)) {
    return false;
  }
  return typeof value.ok === "boolean";
}

/**
 * Fetches enriched hotel details using a sealed property reference.
 */
export async function fetchHotelPropertyDetails(
  input: FetchHotelPropertyDetailsInput | string,
): Promise<ServiceResult<HotelPropertyDetailsClientPayload>> {
  const normalized: FetchHotelPropertyDetailsInput =
    typeof input === "string" ? { hotelId: input } : input;

  const ref = normalized.ref?.trim() ?? "";
  const hotelId = normalized.hotelId?.trim() ?? "";

  if (!ref && !hotelId) {
    return serviceFailure(
      createUnexpectedError("A valid hotel reference is required."),
    );
  }

  try {
    const params = new URLSearchParams();
    if (ref) {
      params.set("ref", ref);
    }
    if (hotelId) {
      params.set("hotelId", hotelId);
    }
    const url = `${DETAILS_API_PATH}?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return serviceFailure(
        createUnexpectedError("Could not read hotel details."),
      );
    }

    if (!isApiResponse<HotelPropertyDetailsClientPayload>(body)) {
      return serviceFailure(
        createUnexpectedError("Hotel details response was invalid."),
      );
    }

    return serviceResultFromApiResponse(body);
  } catch {
    return serviceFailure(
      createUnexpectedError("Could not load hotel details."),
    );
  }
}
