"use client";

import { useEffect, useState } from "react";
import { FilterCheck, FilterMoneyInput, FilterPanel, FilterRadios, FilterSection } from "@/components/filters/FilterPanel";
import type { LiveHotelsFilters } from "@/features/liveHotels/types";

type HotelsFilterCardProps = {
  /** What the results currently show. */
  filters: LiveHotelsFilters;
  /** Called with the new filters when the traveller presses Confirm (or Clear all). */
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

/**
 * Hotels page filter (Milestone 30; M31 shared look). Milestone 35: choices
 * are a draft until the traveller presses Confirm.
 */
export function HotelsFilterCard({ filters, onChange, currency, starCounts }: HotelsFilterCardProps) {
  const [draft, setDraft] = useState(filters);
  // Follow changes made elsewhere (e.g. the budget prefill once prices arrive).
  useEffect(() => setDraft(filters), [filters]);

  const dirty =
    draft.maxPerNight !== filters.maxPerNight ||
    draft.minRating !== filters.minRating ||
    draft.refundableOnly !== filters.refundableOnly ||
    draft.stars.join() !== filters.stars.join();
  const active = (draft.maxPerNight ? 1 : 0) + draft.stars.length + (draft.minRating ? 1 : 0) + (draft.refundableOnly ? 1 : 0);

  return (
    <FilterPanel
      activeCount={active}
      dirty={dirty}
      onConfirm={() => onChange({ ...filters, maxPerNight: draft.maxPerNight, stars: draft.stars, minRating: draft.minRating, refundableOnly: draft.refundableOnly })}
      onClear={() => onChange({ ...filters, maxPerNight: null, stars: [], minRating: 0, refundableOnly: false })}
    >
      <FilterSection title="Your budget" hint="Max price per night">
        <FilterMoneyInput
          id="hotel-budget"
          label="Max price per night"
          currency={currency}
          value={draft.maxPerNight ? String(draft.maxPerNight) : ""}
          onChange={(value) => setDraft({ ...draft, maxPerNight: value ? Number(value) : null })}
          placeholder="Any price"
        />
      </FilterSection>

      <FilterSection title="Star rating">
        {[5, 4, 3, 2].map((stars) => (
          <FilterCheck
            key={stars}
            label={`${stars} stars`}
            count={starCounts[stars] ?? 0}
            checked={draft.stars.includes(stars)}
            onChange={(on) => setDraft({ ...draft, stars: on ? [...draft.stars, stars] : draft.stars.filter((s) => s !== stars) })}
          />
        ))}
      </FilterSection>

      <FilterSection title="Review score">
        <FilterRadios name="hotel-rating" value={draft.minRating} options={RATING_OPTIONS} onChange={(minRating) => setDraft({ ...draft, minRating })} />
      </FilterSection>

      <FilterSection title="Cancellation">
        <FilterCheck label="Free cancellation" checked={draft.refundableOnly} onChange={(refundableOnly) => setDraft({ ...draft, refundableOnly })} />
      </FilterSection>
    </FilterPanel>
  );
}
