"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
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

/** Milestone 30 — "Filter by" for live hotels (left side). Filters in the browser. */
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
    <Card className="divide-y divide-slate-100 p-0">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">Filter by</h2>
        {active > 0 && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, maxPerNight: null, stars: [], minRating: 0, refundableOnly: false })}
            className="text-sm font-semibold text-brand-700 hover:text-brand-900"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2 px-5 py-4">
        <label htmlFor="hotel-budget" className="text-sm font-bold text-slate-900">
          Your budget (per night)
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-brand-700 focus-within:ring-2 focus-within:ring-brand-100">
          <span className="text-sm font-semibold text-slate-500">{currency}</span>
          <input
            id="hotel-budget"
            inputMode="numeric"
            placeholder="Any price"
            value={budget}
            onChange={(event) => setBudget(event.target.value.replace(/[^\d]/g, ""))}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <fieldset className="space-y-2 px-5 py-4">
        <legend className="mb-2 text-sm font-bold text-slate-900">Star rating</legend>
        {[5, 4, 3, 2].map((stars) => (
          <label key={stars} className="flex cursor-pointer items-center justify-between gap-2 text-sm text-slate-700">
            <span className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={filters.stars.includes(stars)}
                onChange={() =>
                  onChange({
                    ...filters,
                    stars: filters.stars.includes(stars) ? filters.stars.filter((s) => s !== stars) : [...filters.stars, stars],
                  })
                }
                className="h-4 w-4 rounded accent-brand-700"
              />
              {stars} stars
            </span>
            <span className="text-slate-400">{starCounts[stars] ?? 0}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-2 px-5 py-4">
        <legend className="mb-2 text-sm font-bold text-slate-900">Review score</legend>
        {RATING_OPTIONS.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
            <input
              type="radio"
              name="hotel-rating"
              checked={filters.minRating === option.value}
              onChange={() => onChange({ ...filters, minRating: option.value })}
              className="h-4 w-4 accent-brand-700"
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <div className="px-5 py-4">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.refundableOnly}
            onChange={(event) => onChange({ ...filters, refundableOnly: event.target.checked })}
            className="h-4 w-4 rounded accent-brand-700"
          />
          Free cancellation
        </label>
      </div>
    </Card>
  );
}
