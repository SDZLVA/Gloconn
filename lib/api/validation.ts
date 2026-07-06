/**
 * Server-side validation for API service requests.
 * Reuses the same rules as the search form where possible.
 */

import { createValidationError } from "@/lib/api/errors";
import { serviceFailure, serviceSuccess, type ServiceResult } from "@/lib/api/types";
import { getPastTravelDateErrors } from "@/lib/search/dates";
import { validateBudget } from "@/lib/search/budget";
import { validatePassengers } from "@/lib/search/passengers";
import { buildSearchRequestFromData, normalizeSearchInput } from "@/lib/search/request";
import { normalizeProductTypes, resolveProductTypes } from "@/lib/search/productTypes";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchData } from "@/types/search";

function validationFailure(
  message: string,
  field?: string,
): ServiceResult<SearchRequest> {
  return serviceFailure(createValidationError(message, { field }));
}

/** Checks that a search request has the minimum fields needed for a results query. */
export function validateSearchRequest(
  search: Partial<SearchData> | Partial<SearchRequest>,
): ServiceResult<SearchRequest> {
  const normalized = normalizeSearchInput(search);

  if (!normalized.origin?.trim()) {
    return validationFailure(
      "Please enter where you are leaving from.",
      "origin",
    );
  }

  if (!normalized.destination?.trim()) {
    return validationFailure("Please enter a destination.", "destination");
  }

  if (!normalized.departureDate) {
    return validationFailure("Please choose a departure date.", "departureDate");
  }

  const pastDateErrors = getPastTravelDateErrors(
    normalized.departureDate,
    normalized.returnDate ?? "",
  );
  if (pastDateErrors.departureDate) {
    return validationFailure(pastDateErrors.departureDate, "departureDate");
  }
  if (pastDateErrors.returnDate) {
    return validationFailure(pastDateErrors.returnDate, "returnDate");
  }

  const tripType = normalized.tripType ?? "round-trip";

  if (tripType === "round-trip" && !normalized.returnDate) {
    return validationFailure("Please choose a return date.", "returnDate");
  }

  if (
    tripType === "round-trip" &&
    normalized.departureDate &&
    normalized.returnDate &&
    normalized.returnDate < normalized.departureDate
  ) {
    return validationFailure(
      "Return date must be on or after departure.",
      "returnDate",
    );
  }

  const budgetString =
    normalized.budget !== null && normalized.budget !== undefined
      ? String(normalized.budget)
      : "";
  const budgetCurrency = normalized.budgetCurrency ?? "EUR";
  const budgetError = validateBudget(budgetString, budgetCurrency);
  if (budgetError) {
    return validationFailure(budgetError, "budget");
  }

  if (!normalized.travelers) {
    return validationFailure(
      "Please set travelers and rooms.",
      "travelers",
    );
  }

  const passengersError = validatePassengers(normalized.travelers);
  if (passengersError) {
    return validationFailure(passengersError, "travelers");
  }

  if (!normalized.travelStyle) {
    return validationFailure("Please select a travel style.", "travelStyle");
  }

  if (resolveProductTypes(normalized.productTypes).length === 0) {
    return validationFailure("Select at least one result type.", "productTypes");
  }

  const adults = normalized.travelers.adults;
  const children = normalized.travelers.children;
  const infants = normalized.travelers.infants;

  return serviceSuccess(
    buildSearchRequestFromData({
      destination: normalized.destination.trim(),
      destinationId: normalized.destinationId,
      origin: normalized.origin.trim(),
      originId: normalized.originId,
      tripType,
      departureDate: normalized.departureDate,
      returnDate: tripType === "one-way" ? null : (normalized.returnDate ?? null),
      budget: normalized.budget ?? null,
      budgetCurrency: normalized.budgetCurrency ?? null,
      travelers: { ...normalized.travelers },
      totalGuests: normalized.totalGuests ?? adults + children + infants,
      travelStyle: normalized.travelStyle,
      productTypes: normalizeProductTypes(normalized.productTypes),
    }),
  );
}
