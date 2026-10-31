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
  filters: LiveFlightsFilters;
  onChange: (filters: LiveFlightsFilters) => void;
  facets: LiveFlightsFacets;
  currency: string;
  className?: string;
};

/**
 * Flights page filter (Milestone 28; Milestone 31: shared FilterPanel look).
 * Drives the live list's own filters (stops, baggage, airlines, price).
 */
export function LiveFlightsFilterCard({ filters, onChange, facets, currency, className }: LiveFlightsFilterCardProps) {
  const [priceDraft, setPriceDraft] = useState(filters.maxPrice ? String(filters.maxPrice) : "");
  useEffect(() => setPriceDraft(filters.maxPrice ? String(filters.maxPrice) : ""), [filters.maxPrice]);
  useEffect(() => {
    const next = priceDraft ? Number(priceDraft) : null;
    if (next === (filters.maxPrice ?? null)) return;
    const timer = window.setTimeout(() => onChange({ ...filters, maxPrice: next }), 600);
    return () => window.clearTimeout(timer);
  }, [priceDraft, filters, onChange]);

  const activeCount =
    (filters.maxStops !== null ? 1 : 0) + (filters.baggageIncluded ? 1 : 0) + (filters.airlines.length > 0 ? 1 : 0) + (filters.maxPrice ? 1 : 0);
  // The widget can list one airline twice (e.g. easyJet U2 and EC).
  const airlineNames = [...new Set(facets.airlines)];

  return (
    <FilterPanel
      className={className}
      activeCount={activeCount}
      onClear={() => onChange({ ...filters, maxStops: null, baggageIncluded: false, airlines: [], maxPrice: null })}
    >
      <FilterSection title="Your budget" hint="Max price, total for all travelers">
        <FilterMoneyInput id="live-max-price" label="Max price" currency={currency} value={priceDraft} onChange={setPriceDraft} placeholder="Any price" />
      </FilterSection>

      <FilterSection title="Stops">
        <FilterRadios name="live-stops" value={filters.maxStops} options={STOP_OPTIONS} onChange={(maxStops) => onChange({ ...filters, maxStops })} />
      </FilterSection>

      <FilterSection title="Baggage">
        <FilterCheck label="Checked bag included" checked={filters.baggageIncluded} onChange={(baggageIncluded) => onChange({ ...filters, baggageIncluded })} />
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
                checked={filters.airlines.includes(name)}
                onChange={(on) =>
                  onChange({ ...filters, airlines: on ? [...filters.airlines, name] : filters.airlines.filter((item) => item !== name) })
                }
              />
            ))}
          </FilterList>
        )}
      </FilterSection>
    </FilterPanel>
  );
}
