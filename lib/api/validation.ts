/**
 * Server-side validation for API service requests.
 * Reuses the same rules as the search form where possible.
 */

import { ApiError } from "@/lib/api/errors";
import { serviceFailure, serviceSuccess, type ServiceResult } from "@/lib/api/types";
import { validatePassengers } from "@/lib/search/passengers";
import type { SearchData } from "@/types/search";

/** Checks that a search request has the minimum fields needed for a results query. */
export function validateSearchRequest(
  search: Partial<SearchData>,
): ServiceResult<SearchData> {
  if (!search.destination?.trim()) {
    return serviceFailure(
      new ApiError("Destination is required.", "VALIDATION_ERROR"),
    );
  }

  if (!search.departureDate) {
    return serviceFailure(
      new ApiError("Departure date is required.", "VALIDATION_ERROR"),
    );
  }

  const tripType = search.tripType ?? "round-trip";

  if (tripType === "round-trip" && !search.returnDate) {
    return serviceFailure(
      new ApiError("Return date is required for round-trip searches.", "VALIDATION_ERROR"),
    );
  }

  if (
    tripType === "round-trip" &&
    search.departureDate &&
    search.returnDate &&
    search.returnDate < search.departureDate
  ) {
    return serviceFailure(
      new ApiError("Return date must be on or after departure.", "VALIDATION_ERROR"),
    );
  }

  if (!search.travelers) {
    return serviceFailure(
      new ApiError("Traveler details are required.", "VALIDATION_ERROR"),
    );
  }

  const passengersError = validatePassengers(search.travelers);
  if (passengersError) {
    return serviceFailure(new ApiError(passengersError, "VALIDATION_ERROR"));
  }

  if (!search.travelStyle) {
    return serviceFailure(
      new ApiError("Travel style is required.", "VALIDATION_ERROR"),
    );
  }

  const adults = search.travelers.adults;
  const children = search.travelers.children;
  const infants = search.travelers.infants;

  return serviceSuccess({
    destination: search.destination.trim(),
    tripType,
    departureDate: search.departureDate,
    returnDate: tripType === "one-way" ? null : (search.returnDate ?? null),
    budget: search.budget ?? null,
    budgetCurrency: search.budgetCurrency ?? null,
    travelers: { ...search.travelers },
    totalGuests: search.totalGuests ?? adults + children + infants,
    travelStyle: search.travelStyle,
  });
}
