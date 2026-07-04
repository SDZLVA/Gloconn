/**
 * Server-side validation for API service requests.
 * Reuses the same rules as the search form where possible.
 */

import { createValidationError } from "@/lib/api/errors";
import { serviceFailure, serviceSuccess, type ServiceResult } from "@/lib/api/types";
import { validateBudget } from "@/lib/search/budget";
import { validatePassengers } from "@/lib/search/passengers";
import { normalizeProductTypes } from "@/lib/search/productTypes";
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
  if (!search.origin?.trim()) {
    return validationFailure(
      "Please enter where you are leaving from.",
      "origin",
    );
  }

  if (!search.destination?.trim()) {
    return validationFailure("Please enter a destination.", "destination");
  }

  if (!search.departureDate) {
    return validationFailure("Please choose a departure date.", "departureDate");
  }

  const tripType = search.tripType ?? "round-trip";

  if (tripType === "round-trip" && !search.returnDate) {
    return validationFailure("Please choose a return date.", "returnDate");
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

  const budgetString =
    search.budget !== null && search.budget !== undefined
      ? String(search.budget)
      : "";
  const budgetCurrency = search.budgetCurrency ?? "EUR";
  const budgetError = validateBudget(budgetString, budgetCurrency);
  if (budgetError) {
    return validationFailure(budgetError, "budget");
  }

  if (!search.travelers) {
    return validationFailure(
      "Please set travelers and rooms.",
      "travelers",
    );
  }

  const passengersError = validatePassengers(search.travelers);
  if (passengersError) {
    return validationFailure(passengersError, "travelers");
  }

  if (!search.travelStyle) {
    return validationFailure("Please select a travel style.", "travelStyle");
  }

  const adults = search.travelers.adults;
  const children = search.travelers.children;
  const infants = search.travelers.infants;

  return serviceSuccess({
    destination: search.destination.trim(),
    destinationId: search.destinationId,
    origin: search.origin.trim(),
    originId: search.originId,
    tripType,
    departureDate: search.departureDate,
    returnDate: tripType === "one-way" ? null : (search.returnDate ?? null),
    budget: search.budget ?? null,
    budgetCurrency: search.budgetCurrency ?? null,
    travelers: { ...search.travelers },
    totalGuests: search.totalGuests ?? adults + children + infants,
    travelStyle: search.travelStyle,
    productTypes: normalizeProductTypes(search.productTypes),
  });
}
