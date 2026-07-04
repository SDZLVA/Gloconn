"use client";

import { DestinationAutocomplete } from "@/components/search/DestinationAutocomplete";
import { TravelDatesSelector } from "@/components/search/TravelDatesSelector";
import { TravelStyleSelector } from "@/components/search/TravelStyleSelector";
import { TravelersSelector } from "@/components/search/TravelersSelector";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useSearchForm } from "@/hooks/useSearchForm";
import { cn } from "@/lib/utils";

type SearchCardProps = {
  className?: string;
};

/**
 * SearchCard — the trip search panel on the home page hero.
 *
 * Fields: destination (autocomplete), dates, travelers & rooms, budget, travel style.
 * Form state and validation live in useSearchForm; this file handles layout only.
 */
export function SearchCard({ className }: SearchCardProps) {
  const {
    form,
    errors,
    updateField,
    updateTravelers,
    updateTripType,
    updateDates,
    handleSearch,
  } = useSearchForm();

  return (
    <Card hoverable className={cn("w-full max-w-3xl p-6 sm:p-8", className)}>
      <SectionHeading
        className="mb-6 space-y-1"
        title="Plan your trip"
        description="Start planning your next adventure"
      />

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
        <DestinationAutocomplete
          value={form.destination}
          onChange={(value) => updateField("destination", value)}
          error={errors.destination}
          required
          className="sm:col-span-2"
        />

        <TravelDatesSelector
          tripType={form.tripType}
          departureDate={form.departureDate}
          returnDate={form.returnDate}
          onTripTypeChange={updateTripType}
          onDatesChange={updateDates}
          departureError={errors.departureDate}
          returnError={errors.returnDate}
          required
          className="sm:col-span-2"
        />

        <TravelersSelector
          value={form.travelers}
          onChange={updateTravelers}
          error={errors.travelers}
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

        <TravelStyleSelector
          value={form.travelStyle}
          onChange={(value) => updateField("travelStyle", value)}
          error={errors.travelStyle}
          required
          className="sm:col-span-2"
        />
      </div>

      <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
        <Button
          type="button"
          className="w-full sm:w-auto sm:min-w-[140px]"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>
    </Card>
  );
}
