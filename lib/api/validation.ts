/**
 * Server-side validation for API service requests.
 * Reuses the same rules as the search form where possible.
 */

import { createValidationError } from "@/lib/api/errors";
import { serviceFailure, serviceSuccess, type ServiceResult } from "@/lib/api/types";
import { validatePassengers } from "@/lib/search/passengers";
import type { SearchData } from "@/types/search";

function validationFailure(
  message: string,
  field?: string,
): ServiceResult<SearchData> {
  return serviceFailure(createValidationError(message, { field }));
}

/** Checks that a search request has the minimum fields needed for a results query. */
export function validateSearchRequest(
  search: Partial<SearchData>,
): ServiceResult<SearchData> {
  if (!search.destination?.trim()) {
    return validationFailure("Destination is required.", "destination");
  }

  if (!search.departureDate) {
    return validationFailure("Departure date is required.", "departureDate");
  }

  const tripType = search.tripType ?? "round-trip";

  if (tripType === "round-trip" && !search.returnDate) {
    return validationFailure(
      "Return date is required for round-trip searches.",
      "returnDate",
    );
  }

  if (
    tripType === "round-trip" &&
    search.departureDate &&
    search.returnDate &&
    search.returnDate < search.departureDate
  ) {
    return validationFailure(
      "Return date must be on or after departure.",
      "returnDate",
    );
  }

  if (!search.travelers) {
    return validationFailure("Traveler details are required.", "travelers");
  }

  const passengersError = validatePassengers(search.travelers);
  if (passengersError) {
    return validationFailure(passengersError, "travelers");
  }

  if (!search.travelStyle) {
    return validationFailure("Travel style is required.", "travelStyle");
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
