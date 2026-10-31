"use client";

import { useEffect, useState } from "react";
import { FilterCheck, FilterMoneyInput, FilterPanel, FilterRadios, FilterSection } from "@/components/filters/FilterPanel";
import type { LiveHotelsFilters } from "@/features/liveHotels/types";

type HotelsFilterCardProps = {
  filters: LiveHotelsFilters;
  onChange: (filters: LiveHotelsFilters) => void;
  currency: string;
  /** How many hotels each star class has (for the counts). */
  starCounts: Record<number, number>;
};

const RATING_OPTIONS = [
  { value: 0, label: "Any score" },
  { value: 7, label: "Good: 7+" },
  { value: 8, label: "Very good: 8+" },
  { value: 9, label: "Superb: 9+" },
];

/** Hotels page filter (Milestone 30; Milestone 31: shared FilterPanel look). Filters in the browser. */
export function HotelsFilterCard({ filters, onChange, currency, starCounts }: HotelsFilterCardProps) {
  const [budget, setBudget] = useState(filters.maxPerNight ? String(filters.maxPerNight) : "");
  useEffect(() => setBudget(filters.maxPerNight ? String(filters.maxPerNight) : ""), [filters.maxPerNight]);
  useEffect(() => {
    const next = budget ? Number(budget) : null;
    if (next === filters.maxPerNight) return;
    const timer = window.setTimeout(() => onChange({ ...filters, maxPerNight: next }), 400);
    return () => window.clearTimeout(timer);
  }, [budget, filters, onChange]);

  const active = (filters.maxPerNight ? 1 : 0) + filters.stars.length + (filters.minRating ? 1 : 0) + (filters.refundableOnly ? 1 : 0);

  return (
    <FilterPanel activeCount={active} onClear={() => onChange({ ...filters, maxPerNight: null, stars: [], minRating: 0, refundableOnly: false })}>
      <FilterSection title="Your budget" hint="Max price per night">
        <FilterMoneyInput id="hotel-budget" label="Max price per night" currency={currency} value={budget} onChange={setBudget} placeholder="Any price" />
      </FilterSection>

      <FilterSection title="Star rating">
        {[5, 4, 3, 2].map((stars) => (
          <FilterCheck
            key={stars}
            label={`${stars} stars`}
            count={starCounts[stars] ?? 0}
            checked={filters.stars.includes(stars)}
            onChange={(on) => onChange({ ...filters, stars: on ? [...filters.stars, stars] : filters.stars.filter((s) => s !== stars) })}
          />
        ))}
      </FilterSection>

      <FilterSection title="Review score">
        <FilterRadios name="hotel-rating" value={filters.minRating} options={RATING_OPTIONS} onChange={(minRating) => onChange({ ...filters, minRating })} />
      </FilterSection>

      <FilterSection title="Cancellation">
        <FilterCheck label="Free cancellation" checked={filters.refundableOnly} onChange={(refundableOnly) => onChange({ ...filters, refundableOnly })} />
      </FilterSection>
    </FilterPanel>
  );
}
