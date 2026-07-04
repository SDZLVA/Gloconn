"use client";

import { BudgetSelector } from "@/components/search/BudgetSelector";
import { DestinationAutocomplete } from "@/components/search/DestinationAutocomplete";
import { OriginAutocomplete } from "@/components/search/OriginAutocomplete";
import {
  SearchFormDivider,
  SearchFormSection,
} from "@/components/search/SearchFormSection";
import { SearchProductSelector } from "@/components/search/SearchProductSelector";
import { TravelDatesSelector } from "@/components/search/TravelDatesSelector";
import { TravelStyleSelector } from "@/components/search/TravelStyleSelector";
import { TravelersSelector } from "@/components/search/TravelersSelector";
import { Button } from "@/components/ui/Button";
import { countSearchFormErrors } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { SearchFormController } from "@/types/search-form";

type SearchFormProps = {
  /** Form state, errors, and actions from `useSearchForm`. */
  controller: SearchFormController;
  className?: string;
  submitLabel?: string;
};

/**
 * SearchForm — presentational trip search form (UI only).
 *
 * Receives a `SearchFormController` from `useSearchForm` — no routing or validation
 * logic here. Reuse on the home page, modals, or sidebars by wrapping with the hook.
 */
export function SearchForm({
  controller,
  className,
  submitLabel = "Search",
}: SearchFormProps) {
  const { form, errors, actions } = controller;
  const errorCount = countSearchFormErrors(errors);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    actions.submit();
  }

  return (
    <form
      className={cn("flex flex-col gap-7 sm:gap-8", className)}
      onSubmit={handleSubmit}
      aria-label="Trip search"
      noValidate
    >
      {errorCount > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {errorCount === 1
            ? "Please fix the highlighted field below."
            : `Please fix the ${errorCount} highlighted fields below.`}
        </div>
      )}

      <SearchFormSection id="search-section-where" title="Where">
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:items-start">
          <OriginAutocomplete
            value={form.origin}
            onChange={actions.updateOrigin}
            onOriginSelect={actions.selectOrigin}
            error={errors.origin}
            required
          />

          <DestinationAutocomplete
            value={form.destination}
            onChange={actions.updateDestination}
            onDestinationSelect={actions.selectDestination}
            error={errors.destination}
            required
          />
        </div>
      </SearchFormSection>

      <SearchFormDivider />

      <SearchFormSection id="search-section-when" title="When">
        <TravelDatesSelector
          tripType={form.tripType}
          departureDate={form.departureDate}
          returnDate={form.returnDate}
          onTripTypeChange={actions.updateTripType}
          onDatesChange={actions.updateDates}
          departureError={errors.departureDate}
          returnError={errors.returnDate}
          required
        />
      </SearchFormSection>

      <SearchFormDivider />

      <SearchFormSection id="search-section-details" title="Trip details">
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:items-start">
          <TravelersSelector
            value={form.travelers}
            onChange={actions.updateTravelers}
            error={errors.travelers}
            required
          />

          <BudgetSelector
            value={form.budget}
            currency={form.budgetCurrency}
            onChange={(value) => actions.updateField("budget", value)}
            onCurrencyChange={(value) =>
              actions.updateField("budgetCurrency", value)
            }
            error={errors.budget}
            required
          />
        </div>
      </SearchFormSection>

      <SearchFormDivider />

      <SearchFormSection id="search-section-preferences" title="Preferences">
        <div className="flex flex-col gap-5 sm:gap-6">
          <SearchProductSelector
            value={form.productTypes}
            onChange={actions.updateProductTypes}
            error={errors.productTypes}
            required
          />

          <TravelStyleSelector
            value={form.travelStyle}
            onChange={(value) => actions.updateField("travelStyle", value)}
            error={errors.travelStyle}
            required
          />
        </div>
      </SearchFormSection>

      <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-end sm:pt-7">
        <Button type="submit" className="w-full sm:w-auto sm:min-w-[160px]">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
