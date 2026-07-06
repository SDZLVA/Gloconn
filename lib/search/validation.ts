import { validateBudget } from "@/lib/search/budget";
import { getPastTravelDateErrors } from "@/lib/search/dates";
import { validatePassengers } from "@/lib/search/passengers";
import { resolveProductTypes } from "@/lib/search/productTypes";
import type { SearchFormErrors, SearchFormState } from "@/types/search-form";

/**
 * Validates required search form fields.
 * Returns an object of error messages — empty when the form is valid.
 */
export function validateSearchForm(form: SearchFormState): SearchFormErrors {
  const errors: SearchFormErrors = {};

  if (!form.origin.trim()) {
    errors.origin = "Please enter where you are leaving from.";
  }

  if (!form.destination.trim()) {
    errors.destination = "Please enter a destination.";
  }

  if (!form.departureDate) {
    errors.departureDate = "Please choose a departure date.";
  }

  const pastDateErrors = getPastTravelDateErrors(
    form.departureDate,
    form.returnDate,
  );
  if (pastDateErrors.departureDate) {
    errors.departureDate = pastDateErrors.departureDate;
  }
  if (pastDateErrors.returnDate) {
    errors.returnDate = pastDateErrors.returnDate;
  }

  if (form.tripType === "round-trip" && !form.returnDate) {
    errors.returnDate = "Please choose a return date.";
  }

  if (
    form.tripType === "round-trip" &&
    form.departureDate &&
    form.returnDate &&
    form.returnDate < form.departureDate
  ) {
    errors.returnDate = "Return date must be on or after departure.";
  }

  const budgetError = validateBudget(form.budget, form.budgetCurrency);
  if (budgetError) {
    errors.budget = budgetError;
  }

  const passengersError = validatePassengers(form.travelers);
  if (passengersError) {
    errors.travelers = passengersError;
  }

  if (!form.travelStyle) {
    errors.travelStyle = "Please select a travel style.";
  }

  if (resolveProductTypes(form.productTypes).length === 0) {
    errors.productTypes = "Select at least one result type.";
  }

  return errors;
}

/** Returns true when the validation result contains at least one error. */
export function hasSearchFormErrors(errors: SearchFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Counts how many fields failed validation. */
export function countSearchFormErrors(errors: SearchFormErrors): number {
  return Object.keys(errors).length;
}
