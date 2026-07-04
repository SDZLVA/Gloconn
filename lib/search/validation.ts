import { TRAVELERS_LIMITS } from "@/lib/search/travelers";
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

  const { adults, children, infants, rooms } = form.travelers;

  if (adults < TRAVELERS_LIMITS.adults.min) {
    errors.travelers = "At least 1 adult is required.";
  } else if (adults > TRAVELERS_LIMITS.adults.max) {
    errors.travelers = `Maximum ${TRAVELERS_LIMITS.adults.max} adults.`;
  } else if (children > TRAVELERS_LIMITS.children.max) {
    errors.travelers = `Maximum ${TRAVELERS_LIMITS.children.max} children.`;
  } else if (infants > TRAVELERS_LIMITS.infants.max) {
    errors.travelers = `Maximum ${TRAVELERS_LIMITS.infants.max} infants.`;
  } else if (rooms < TRAVELERS_LIMITS.rooms.min) {
    errors.travelers = "At least 1 room is required.";
  } else if (rooms > TRAVELERS_LIMITS.rooms.max) {
    errors.travelers = `Maximum ${TRAVELERS_LIMITS.rooms.max} rooms.`;
  } else if (infants > adults) {
    errors.travelers = "Each infant must be accompanied by an adult.";
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
