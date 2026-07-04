import type { SearchFormErrors, SearchFormState } from "@/types/search";

/**
 * Validates required search form fields.
 * Returns an object of error messages — empty when the form is valid.
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

/** Returns true when the validation result contains at least one error. */
export function hasSearchFormErrors(errors: SearchFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
