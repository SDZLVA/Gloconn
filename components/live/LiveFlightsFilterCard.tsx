"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import type { LiveFlightsFacets, LiveFlightsFilters } from "@/features/liveFlights/types";
import { cn } from "@/lib/utils";

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
 * Milestone 28 — the one filter for the flights-only page (left side). It
 * drives the live list's own filters (stops, baggage, airlines, price).
 */
export function LiveFlightsFilterCard({ filters, onChange, facets, currency, className }: LiveFlightsFilterCardProps) {
  const [priceDraft, setPriceDraft] = useState(filters.maxPrice ? String(filters.maxPrice) : "");

  useEffect(() => {
    setPriceDraft(filters.maxPrice ? String(filters.maxPrice) : "");
  }, [filters.maxPrice]);

  // Commit the price after typing stops.
  useEffect(() => {
    const next = priceDraft ? Number(priceDraft) : null;
    if (next === (filters.maxPrice ?? null)) return;
    const timer = window.setTimeout(() => onChange({ ...filters, maxPrice: next }), 600);
    return () => window.clearTimeout(timer);
  }, [priceDraft, filters, onChange]);

  const activeCount =
    (filters.maxStops !== null ? 1 : 0) +
    (filters.baggageIncluded ? 1 : 0) +
    (filters.airlines.length > 0 ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);

  // The widget can list one airline twice (e.g. easyJet U2 and EC).
  const airlineNames = [...new Set(facets.airlines)];

  function toggleAirline(name: string) {
    const airlines = filters.airlines.includes(name)
      ? filters.airlines.filter((item) => item !== name)
      : [...filters.airlines, name];
    onChange({ ...filters, airlines });
  }

  return (
    <Card className={cn("space-y-6 p-5", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Filter flights</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, maxStops: null, baggageIncluded: false, airlines: [], maxPrice: null })}
            className="text-sm font-semibold text-brand-700 hover:text-brand-900"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="live-max-price" className="text-sm font-semibold text-slate-800">
          Max price
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-brand-700 focus-within:ring-2 focus-within:ring-brand-100">
          <span className="text-sm font-semibold text-slate-500">{currency}</span>
          <input
            id="live-max-price"
            type="text"
            inputMode="numeric"
            placeholder="Any price"
            value={priceDraft}
            onChange={(event) => setPriceDraft(event.target.value.replace(/[^\d]/g, ""))}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <p className="text-xs text-slate-500">Total for all travelers. Your budget is filled in.</p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-slate-800">Stops</legend>
        {STOP_OPTIONS.map((option) => (
          <label key={String(option.value)} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
            <input
              type="radio"
              name="live-stops"
              checked={filters.maxStops === option.value}
              onChange={() => onChange({ ...filters, maxStops: option.value })}
              className="h-4 w-4 accent-brand-700"
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-slate-800">Baggage</legend>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.baggageIncluded}
            onChange={(event) => onChange({ ...filters, baggageIncluded: event.target.checked })}
            className="h-4 w-4 rounded accent-brand-700"
          />
          Checked bag included
        </label>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-slate-800">Airlines</legend>
        {airlineNames.length === 0 ? (
          <p className="text-sm text-slate-500">{facets.searching === false ? "No airlines to filter." : "Loading airlines…"}</p>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {airlineNames.map((name) => (
              <label key={name} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={filters.airlines.includes(name)}
                  onChange={() => toggleAirline(name)}
                  className="h-4 w-4 rounded accent-brand-700"
                />
                {name}
              </label>
            ))}
          </div>
        )}
      </fieldset>
    </Card>
  );
}
