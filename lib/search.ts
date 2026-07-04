import type { SearchData, SearchFormErrors, SearchFormState } from "@/types";

/**
 * Search helpers — validation and console logging for the trip search form.
 * Grouped in one file because they all belong to the same feature.
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

export function hasSearchFormErrors(errors: SearchFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildSearchData(form: SearchFormState): SearchData {
  const budgetValue = form.budget.trim();

  return {
    destination: form.destination.trim(),
    departureDate: form.departureDate,
    returnDate: form.returnDate,
    budget: budgetValue ? Number(budgetValue) : null,
    travelers: Number(form.travelers),
    travelStyle: form.travelStyle,
  };
}

/** Prints search data to the browser console (F12 → Console). No API calls. */
export function logSearchData(form: SearchFormState): void {
  console.log("Glooconn search data:", buildSearchData(form));
}
