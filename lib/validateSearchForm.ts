import type { SearchFormErrors, SearchFormState } from "@/types/search";

/**
 * validateSearchForm — checks every required field in the search form.
 *
 * Returns an object of error messages. An empty object means validation passed.
 * Kept in its own file so the logic is easy to test and reuse later.
 */
export function validateSearchForm(form: SearchFormState): SearchFormErrors {
  const errors: SearchFormErrors = {};

  if (!form.destination.trim()) {
    errors.destination = "Please enter a destination.";
  }

  if (!form.departureDate) {
    errors.departureDate = "Please choose a departure date.";
  }

  if (!form.returnDate) {
    errors.returnDate = "Please choose a return date.";
  }

  if (
    form.departureDate &&
    form.returnDate &&
    form.returnDate < form.departureDate
  ) {
    errors.returnDate = "Return date must be on or after departure.";
  }

  const travelerCount = Number(form.travelers);
  if (!form.travelers || Number.isNaN(travelerCount) || travelerCount < 1) {
    errors.travelers = "Enter at least 1 traveler.";
  }

  if (!form.travelStyle) {
    errors.travelStyle = "Please select a travel style.";
  }

  return errors;
}

/** True when the errors object has no messages. */
export function isSearchFormValid(errors: SearchFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
