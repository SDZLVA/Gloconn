"use client";

import { useEffect, useState } from "react";
import { FilterCheck, FilterList, FilterMoneyInput, FilterPanel, FilterRadios, FilterSection } from "@/components/filters/FilterPanel";
import type { LiveFlightsFacets, LiveFlightsFilters } from "@/features/liveFlights/types";

const STOP_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "Any number of stops" },
  { value: 0, label: "Direct only" },
  { value: 1, label: "1 stop or fewer" },
  { value: 2, label: "2 stops or fewer" },
];

type LiveFlightsFilterCardProps = {
  /** What the live list currently shows. */
  filters: LiveFlightsFilters;
  /** Called with the new filters when the traveller presses Confirm (or Clear all). */
  onChange: (filters: LiveFlightsFilters) => void;
  facets: LiveFlightsFacets;
  currency: string;
  className?: string;
};

/**
 * Flights page filter (Milestone 28; M31 shared look). Milestone 35: choices
 * are a draft until the traveller presses Confirm.
 */
export function LiveFlightsFilterCard({ filters, onChange, facets, currency, className }: LiveFlightsFilterCardProps) {
  const [draft, setDraft] = useState(filters);
  useEffect(() => setDraft(filters), [filters]);

  const dirty =
    (draft.maxPrice ?? null) !== (filters.maxPrice ?? null) ||
    draft.maxStops !== filters.maxStops ||
    draft.baggageIncluded !== filters.baggageIncluded ||
    draft.airlines.join("|") !== filters.airlines.join("|");
  const activeCount =
    (draft.maxStops !== null ? 1 : 0) + (draft.baggageIncluded ? 1 : 0) + (draft.airlines.length > 0 ? 1 : 0) + (draft.maxPrice ? 1 : 0);
  // The widget can list one airline twice (e.g. easyJet U2 and EC).
  const airlineNames = [...new Set(facets.airlines)];

  return (
    <FilterPanel
      className={className}
      activeCount={activeCount}
      dirty={dirty}
      onConfirm={() =>
        onChange({ ...filters, maxPrice: draft.maxPrice ?? null, maxStops: draft.maxStops, baggageIncluded: draft.baggageIncluded, airlines: draft.airlines })
      }
      onClear={() => onChange({ ...filters, maxStops: null, baggageIncluded: false, airlines: [], maxPrice: null })}
    >
      <FilterSection title="Your budget" hint="Max price, total for all travelers">
        <FilterMoneyInput
          id="live-max-price"
          label="Max price"
          currency={currency}
          value={draft.maxPrice ? String(draft.maxPrice) : ""}
          onChange={(value) => setDraft({ ...draft, maxPrice: value ? Number(value) : null })}
          placeholder="Any price"
        />
      </FilterSection>

      <FilterSection title="Stops">
        <FilterRadios name="live-stops" value={draft.maxStops} options={STOP_OPTIONS} onChange={(maxStops) => setDraft({ ...draft, maxStops })} />
      </FilterSection>

      <FilterSection title="Baggage">
        <FilterCheck label="Checked bag included" checked={draft.baggageIncluded} onChange={(baggageIncluded) => setDraft({ ...draft, baggageIncluded })} />
      </FilterSection>

      <FilterSection title="Airlines">
        {airlineNames.length === 0 ? (
          <p className="text-sm text-slate-500">{facets.searching === false ? "No airlines to filter." : "Loading airlines…"}</p>
        ) : (
          <FilterList>
            {airlineNames.map((name) => (
              <FilterCheck
                key={name}
                label={name}
                checked={draft.airlines.includes(name)}
                onChange={(on) =>
                  setDraft({ ...draft, airlines: on ? [...draft.airlines, name] : draft.airlines.filter((item) => item !== name) })
                }
              />
            ))}
          </FilterList>
        )}
      </FilterSection>
    </FilterPanel>
  );
}
