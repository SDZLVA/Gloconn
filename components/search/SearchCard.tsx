"use client";

import { BudgetSelector } from "@/components/search/BudgetSelector";
import { DestinationAutocomplete } from "@/components/search/DestinationAutocomplete";
import { OriginAutocomplete } from "@/components/search/OriginAutocomplete";
import { SearchProductSelector } from "@/components/search/SearchProductSelector";
import { TravelDatesSelector } from "@/components/search/TravelDatesSelector";
import { TravelStyleSelector } from "@/components/search/TravelStyleSelector";
import { TravelersSelector } from "@/components/search/TravelersSelector";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useSearchForm } from "@/hooks/useSearchForm";
import { cn } from "@/lib/utils";
import type { SearchFormState } from "@/types/search";

type SearchCardProps = {
  className?: string;
  /** Prefill fields when returning from the results page to edit a search. */
  initialForm?: Partial<SearchFormState>;
};

type SearchCardSectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * SearchCardSection — groups related fields with a visible label and accessible name.
 */
function SearchCardSection({
  id,
  title,
  children,
  className,
}: SearchCardSectionProps) {
  return (
    <section
      role="group"
      aria-labelledby={id}
      className={cn("flex flex-col gap-4 sm:gap-5", className)}
    >
      <h3
        id={id}
        className="text-xs font-semibold uppercase tracking-wider text-slate-500"
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * SearchCard — the trip search panel on the home page hero.
 *
 * Layout groups: Where → When → Trip details → Preferences → Search.
 * Form state and validation live in useSearchForm; this file handles layout only.
 */
export function SearchCard({ className, initialForm }: SearchCardProps) {
  const {
    form,
    errors,
    updateField,
    updateDestination,
    selectDestination,
    updateOrigin,
    selectOrigin,
    updateTravelers,
    updateTripType,
    updateDates,
    updateProductTypes,
    handleSearch,
  } = useSearchForm({ initialForm });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleSearch();
  }

  return (
    <Card
      hoverable
      className={cn("w-full max-w-4xl p-6 sm:p-8 lg:p-9", className)}
    >
      <SectionHeading
        className="mb-7 space-y-1 sm:mb-8"
        title="Plan your trip"
        description="Start planning your next adventure"
      />

      <form
        className="flex flex-col gap-7 sm:gap-8"
        onSubmit={handleSubmit}
        aria-label="Trip search"
        noValidate
      >
        <SearchCardSection id="search-section-where" title="Where">
          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:items-start">
            <OriginAutocomplete
              value={form.origin}
              onChange={updateOrigin}
              onOriginSelect={(selection) =>
                selectOrigin(selection.label, selection.originId)
              }
              error={errors.origin}
            />

            <DestinationAutocomplete
              value={form.destination}
              onChange={updateDestination}
              onDestinationSelect={(selection) =>
                selectDestination(selection.label, selection.destinationId)
              }
              error={errors.destination}
              required
            />
          </div>
        </SearchCardSection>

        <div
          className="h-px bg-slate-100"
          role="presentation"
          aria-hidden="true"
        />

        <SearchCardSection id="search-section-when" title="When">
          <TravelDatesSelector
            tripType={form.tripType}
            departureDate={form.departureDate}
            returnDate={form.returnDate}
            onTripTypeChange={updateTripType}
            onDatesChange={updateDates}
            departureError={errors.departureDate}
            returnError={errors.returnDate}
            required
          />
        </SearchCardSection>

        <div
          className="h-px bg-slate-100"
          role="presentation"
          aria-hidden="true"
        />

        <SearchCardSection id="search-section-details" title="Trip details">
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:items-start">
            <TravelersSelector
              value={form.travelers}
              onChange={updateTravelers}
              error={errors.travelers}
              required
            />

            <BudgetSelector
              value={form.budget}
              currency={form.budgetCurrency}
              onChange={(value) => updateField("budget", value)}
              onCurrencyChange={(value) => updateField("budgetCurrency", value)}
            />
          </div>
        </SearchCardSection>

        <div
          className="h-px bg-slate-100"
          role="presentation"
          aria-hidden="true"
        />

        <SearchCardSection id="search-section-preferences" title="Preferences">
          <div className="flex flex-col gap-5 sm:gap-6">
            <SearchProductSelector
              value={form.productTypes}
              onChange={updateProductTypes}
              error={errors.productTypes}
              required
            />

            <TravelStyleSelector
              value={form.travelStyle}
              onChange={(value) => updateField("travelStyle", value)}
              error={errors.travelStyle}
              required
            />
          </div>
        </SearchCardSection>

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-end sm:pt-7">
          <Button
            type="submit"
            className="w-full sm:w-auto sm:min-w-[160px]"
          >
            Search
          </Button>
        </div>
      </form>
    </Card>
  );
}
