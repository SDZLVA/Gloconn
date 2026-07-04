"use client";

import { useState } from "react";
import {
  hasSearchFormErrors,
  logSearchData,
  validateSearchForm,
} from "@/lib/search";
import {
  INITIAL_SEARCH_FORM,
  type SearchFormErrors,
  type SearchFormState,
} from "@/types/search";

/**
 * useSearchForm — manages search form state, validation, and submit logic.
 *
 * Keeps SearchCard focused on layout while all form behavior lives here.
 */
export function useSearchForm() {
  const [form, setForm] = useState<SearchFormState>(INITIAL_SEARCH_FORM);
  const [errors, setErrors] = useState<SearchFormErrors>({});

  function updateField<K extends keyof SearchFormState>(
    field: K,
    value: SearchFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));

    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  function handleSearch() {
    const nextErrors = validateSearchForm(form);
    setErrors(nextErrors);

    if (hasSearchFormErrors(nextErrors)) {
      return;
    }

    logSearchData(form);
  }

  return { form, errors, updateField, handleSearch };
}
