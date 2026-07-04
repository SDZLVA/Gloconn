"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  buildResultsUrlFromRequest,
  validateAndBuildSearchRequest,
} from "@/lib/search";
import {
  rememberDestinationById,
  rememberDestinationByLabel,
  rememberOriginById,
  rememberOriginByLabel,
} from "@/lib/destinations/recentSearches";
import {
  INITIAL_SEARCH_FORM,
  type SearchFormActions,
  type SearchFormController,
  type SearchFormErrors,
  type SearchFormState,
  type UseSearchFormOptions,
} from "@/types/search-form";

/**
 * useSearchForm — search form state, validation, and submit logic.
 *
 * Returns a `SearchFormController` for the presentational `SearchForm` component.
 * No JSX — business logic only.
 */
export function useSearchForm(
  options: UseSearchFormOptions = {},
): SearchFormController {
  const router = useRouter();
  const [form, setForm] = useState<SearchFormState>(() => ({
    ...INITIAL_SEARCH_FORM,
    ...options.initialForm,
  }));
  const [errors, setErrors] = useState<SearchFormErrors>({});

  function clearError(field: keyof SearchFormErrors) {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function updateField<K extends keyof SearchFormState>(
    field: K,
    value: SearchFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    clearError(field);
  }

  function updateDestination(label: string) {
    setForm((current) => ({
      ...current,
      destination: label,
      destinationId: "",
    }));
    clearError("destination");
  }

  function selectDestination(selection: { label: string; id: string }) {
    setForm((current) => ({
      ...current,
      destination: selection.label,
      destinationId: selection.id,
    }));
    clearError("destination");
  }

  function updateOrigin(label: string) {
    setForm((current) => ({
      ...current,
      origin: label,
      originId: "",
    }));
    clearError("origin");
  }

  function selectOrigin(selection: { label: string; id: string }) {
    setForm((current) => ({
      ...current,
      origin: selection.label,
      originId: selection.id,
    }));
    clearError("origin");
  }

  function updateTravelers(travelers: SearchFormState["travelers"]) {
    setForm((current) => ({ ...current, travelers }));
    clearError("travelers");
  }

  function updateTripType(tripType: SearchFormState["tripType"]) {
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

  function updateProductTypes(productTypes: SearchFormState["productTypes"]) {
    setForm((current) => ({ ...current, productTypes }));
    clearError("productTypes");
  }

  function submit() {
    const result = validateAndBuildSearchRequest(form);

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    if (form.destinationId) {
      rememberDestinationById(form.destinationId);
    } else {
      rememberDestinationByLabel(form.destination);
    }

    if (form.originId) {
      rememberOriginById(form.originId);
    } else {
      rememberOriginByLabel(form.origin);
    }

    router.push(buildResultsUrlFromRequest(result.request));
  }

  const actions: SearchFormActions = {
    updateField,
    updateDestination,
    selectDestination,
    updateOrigin,
    selectOrigin,
    updateTravelers,
    updateTripType,
    updateDates,
    updateProductTypes,
    submit,
  };

  return { form, errors, actions };
}
