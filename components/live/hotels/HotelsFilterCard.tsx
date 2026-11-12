"use client";

import { useEffect, useState } from "react";
import { FilterCheck, FilterMoneyInput, FilterPanel, FilterRadios, FilterSection } from "@/components/filters/FilterPanel";
import type { LiveHotelsFilters } from "@/features/liveHotels/types";
import { PROPERTY_KINDS, type PropertyKind } from "@/features/liveHotels/propertyKind";

type HotelsFilterCardProps = {
  /** What the results currently show. */
  filters: LiveHotelsFilters;
  /** Called with the new filters when the traveller presses Confirm (or Clear all). */
  onChange: (filters: LiveHotelsFilters) => void;
  currency: string;
  /** How many hotels each star class has (for the counts). */
  starCounts: Record<number, number>;
  /** Milestone 58: how many stays of each kind (hotels, hostels…). */
  typeCounts?: Partial<Record<PropertyKind, number>>;
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
export function HotelsFilterCard({ filters, onChange, currency, starCounts, typeCounts = {} }: HotelsFilterCardProps) {
  const [draft, setDraft] = useState(filters);
  // Follow changes made elsewhere (e.g. the budget prefill once prices arrive).
  useEffect(() => setDraft(filters), [filters]);

  const dirty =
    draft.maxPerNight !== filters.maxPerNight ||
    draft.minRating !== filters.minRating ||
    draft.refundableOnly !== filters.refundableOnly ||
    draft.stars.join() !== filters.stars.join() ||
    draft.types.join() !== filters.types.join();
  const active =
    (draft.maxPerNight ? 1 : 0) + draft.stars.length + (draft.minRating ? 1 : 0) + (draft.refundableOnly ? 1 : 0) + draft.types.length;
  const kinds = PROPERTY_KINDS.filter((k) => (typeCounts[k.kind] ?? 0) > 0 || draft.types.includes(k.kind));

  return (
    <FilterPanel
      activeCount={active}
      dirty={dirty}
      onConfirm={() =>
        onChange({ ...filters, maxPerNight: draft.maxPerNight, stars: draft.stars, minRating: draft.minRating, refundableOnly: draft.refundableOnly, types: draft.types })
      }
      onClear={() => onChange({ ...filters, maxPerNight: null, stars: [], minRating: 0, refundableOnly: false, types: [] })}
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

      {kinds.length > 0 && (
        <FilterSection title="Property type">
          {kinds.map(({ kind, label }) => (
            <FilterCheck
              key={kind}
              label={label}
              count={typeCounts[kind] ?? 0}
              checked={draft.types.includes(kind)}
              onChange={(on) => setDraft({ ...draft, types: on ? [...draft.types, kind] : draft.types.filter((t) => t !== kind) })}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title="Star rating">
        {[5, 4, 3, 2, 1].map((stars) => (
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
