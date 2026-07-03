"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import {
  TravelStyleSelector,
  type TravelStyle,
} from "@/components/ui/TravelStyleSelector";
import { cn } from "@/lib/utils";

type SearchCardProps = {
  className?: string;
};

/** All fields the user can fill in on the search card. */
type SearchFormState = {
  destination: string;
  departureDate: string;
  returnDate: string;
  budget: string;
  travelers: string;
  travelStyle: TravelStyle;
};

/** Validation error messages keyed by field name. */
type FormErrors = Partial<Record<keyof SearchFormState, string>>;

/** Starting values when the page first loads. */
const INITIAL_FORM: SearchFormState = {
  destination: "",
  departureDate: "",
  returnDate: "",
  budget: "",
  travelers: "1",
  travelStyle: "standard",
};

/**
 * SearchCard — the trip search panel on the home page hero.
 *
 * Uses React state to store what the user types.
 * Validates required fields when Search is clicked (no API calls yet).
 */
export function SearchCard({ className }: SearchCardProps) {
  const [form, setForm] = useState<SearchFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  /** Updates one field in state when the user types or selects an option. */
  function updateField<K extends keyof SearchFormState>(
    field: K,
    value: SearchFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));

    // Clear the error for this field as soon as the user fixes it.
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }

    setSubmitMessage(null);
  }

  /** Checks required fields and returns error messages. */
  function validate(formData: SearchFormState): FormErrors {
    const nextErrors: FormErrors = {};

    if (!formData.destination.trim()) {
      nextErrors.destination = "Please enter a destination.";
    }

    if (!formData.departureDate) {
      nextErrors.departureDate = "Please choose a departure date.";
    }

    if (!formData.returnDate) {
      nextErrors.returnDate = "Please choose a return date.";
    }

    if (
      formData.departureDate &&
      formData.returnDate &&
      formData.returnDate < formData.departureDate
    ) {
      nextErrors.returnDate = "Return date must be on or after departure.";
    }

    const travelerCount = Number(formData.travelers);
    if (!formData.travelers || Number.isNaN(travelerCount) || travelerCount < 1) {
      nextErrors.travelers = "Enter at least 1 traveler.";
    }

    if (!formData.travelStyle) {
      nextErrors.travelStyle = "Please select a travel style.";
    }

    return nextErrors;
  }

  /** Runs when the user clicks Search — validates only, no API yet. */
  function handleSearch() {
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitMessage(null);
      return;
    }

    // Success message for now — real search will be added later.
    setSubmitMessage(
      `Ready to search for ${form.destination} (${form.travelStyle} style).`,
    );
  }

  return (
    <div
      className={cn(
        "w-full max-w-3xl rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-6",
        className,
      )}
    >
      <p className="mb-4 text-left text-sm font-medium text-slate-500">
        Start planning your next adventure
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
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

      {submitMessage && (
        <p
          className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800"
          role="status"
        >
          {submitMessage}
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <Button
          type="button"
          className="w-full sm:w-auto sm:min-w-[140px]"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>
    </div>
  );
}
