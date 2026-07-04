"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import { SearchButton } from "@/components/ui/SearchButton";
import { TravelStyleSelector } from "@/components/ui/TravelStyleSelector";
import { logSearchData } from "@/lib/logSearchData";
import {
  isSearchFormValid,
  validateSearchForm,
} from "@/lib/validateSearchForm";
import { cn } from "@/lib/utils";
import {
  INITIAL_SEARCH_FORM,
  type SearchFormErrors,
  type SearchFormState,
} from "@/types/search";

type SearchCardProps = {
  className?: string;
};

/**
 * SearchCard — the trip search panel on the home page hero.
 *
 * Stores form values in React state, validates on Search click,
 * and logs the result to the console when validation passes.
 */
export function SearchCard({ className }: SearchCardProps) {
  const [form, setForm] = useState<SearchFormState>(INITIAL_SEARCH_FORM);
  const [errors, setErrors] = useState<SearchFormErrors>({});

  /** Updates one field and clears its error message. */
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

  /**
   * handleSearch — runs when the Search button is clicked.
   * 1. Validate all fields
   * 2. If valid, print search data to the browser console
   */
  function handleSearch() {
    const nextErrors = validateSearchForm(form);
    setErrors(nextErrors);

    if (!isSearchFormValid(nextErrors)) {
      return;
    }

    logSearchData(form);
  }

  return (
    <Card hoverable className={cn("w-full max-w-3xl p-6 sm:p-8", className)}>
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          Plan your trip
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
          Start planning your next adventure
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
        <InputField
          id="search-destination"
          label="Destination"
          placeholder="Where do you want to go?"
          value={form.destination}
          onChange={(value) => updateField("destination", value)}
          error={errors.destination}
          required
          className="sm:col-span-2"
        />

        <InputField
          id="search-departure-date"
          label="Departure date"
          type="date"
          value={form.departureDate}
          onChange={(value) => updateField("departureDate", value)}
          error={errors.departureDate}
          required
        />

        <InputField
          id="search-return-date"
          label="Return date"
          type="date"
          value={form.returnDate}
          onChange={(value) => updateField("returnDate", value)}
          error={errors.returnDate}
          required
        />

        <InputField
          id="search-budget"
          label="Budget"
          type="number"
          placeholder="Optional — max spend in €"
          value={form.budget}
          onChange={(value) => updateField("budget", value)}
          min={0}
        />

        <InputField
          id="search-travelers"
          label="Number of travelers"
          type="number"
          placeholder="How many people?"
          value={form.travelers}
          onChange={(value) => updateField("travelers", value)}
          error={errors.travelers}
          required
          min={1}
        />

        <TravelStyleSelector
          value={form.travelStyle}
          onChange={(value) => updateField("travelStyle", value)}
          error={errors.travelStyle}
          required
          className="sm:col-span-2"
        />
      </div>

      <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
        <SearchButton onClick={handleSearch} />
      </div>
    </Card>
  );
}
