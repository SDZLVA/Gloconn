"use client";

import { useState } from "react";
import {
  hasSearchFormErrors,
  logSearchData,
  validateSearchForm,
} from "@/lib/search";
import { rememberDestinationByLabel } from "@/lib/destinations/recentSearches";
import {
  INITIAL_SEARCH_FORM,
  type SearchFormErrors,
  type SearchFormState,
  type PassengersState,
  type TripType,
} from "@/types/search";

/**
 * useSearchForm — manages search form state, validation, and submit logic.
 *
 * Keeps SearchCard focused on layout while all form behavior lives here.
 */
export function useSearchForm() {
  const [form, setForm] = useState<SearchFormState>(INITIAL_SEARCH_FORM);
  const [errors, setErrors] = useState<SearchFormErrors>({});

  function clearError(field: keyof SearchFormErrors) {
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  function updateField<K extends keyof SearchFormState>(
    field: K,
    value: SearchFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    clearError(field);
  }

  function updateTravelers(travelers: PassengersState) {
    setForm((current) => ({ ...current, travelers }));
    clearError("travelers");
  }

  /** Alias for updateTravelers — same passengers state shape. */
  const updatePassengers = updateTravelers;

  function updateTripType(tripType: TripType) {
    setForm((current) => ({
      ...current,
      tripType,
      returnDate: tripType === "one-way" ? "" : current.returnDate,
    }));
    clearError("returnDate");
  }

  function updateDates(departureDate: string, returnDate: string) {
    setForm((current) => ({ ...current, departureDate, returnDate }));
    clearError("departureDate");
    clearError("returnDate");
  }

  function handleSearch() {
    const nextErrors = validateSearchForm(form);
    setErrors(nextErrors);

    if (hasSearchFormErrors(nextErrors)) {
      return;
    }

    rememberDestinationByLabel(form.destination);
    logSearchData(form);
  }

  return {
    form,
    errors,
    updateField,
    updateTravelers,
    updatePassengers,
    updateTripType,
    updateDates,
    handleSearch,
  };
}
