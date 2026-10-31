"use client";

import { useState } from "react";
import { ModeSearchBar, type BarMode } from "@/components/search/ModeSearchBar";
import { formatShortDate } from "@/lib/calendar/dates";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchFormState } from "@/types/search-form";

type TripHeaderProps = {
  mode: BarMode;
  search: Partial<SearchRequest>;
  initialForm: SearchFormState;
  initialDirectOnly?: boolean;
  /** Extra buttons next to "Edit search" (e.g. Save trip). */
  actions?: React.ReactNode;
};

const city = (label?: string) => (label ?? "").split(",")[0]?.trim();

/**
 * Milestone 32 — results page header from the redesign:
 * "Milan → Berlin", "Nov 10 – Nov 13 · 1 traveler · €0 – €500", and an
 * "Edit search" button that opens the search bar in place.
 */
export function TripHeader({ mode, search, initialForm, initialDirectOnly, actions }: TripHeaderProps) {
  const [editing, setEditing] = useState(false);
  const from = city(search.origin);
  const to = city(search.destination) || "Your trip";
  const title = mode === "hotels" || !from ? `Stays in ${to}` : `${from} → ${to}`;
  const dates = [search.departureDate, search.tripType === "one-way" ? null : search.returnDate]
    .filter((value): value is string => Boolean(value))
    .map(formatShortDate)
    .join(" – ");
  const t = search.travelers;
  const people = (t?.adults ?? 1) + (t?.children ?? 0) + (t?.infants ?? 0);
  const parts = [
    dates,
    `${people} ${mode === "hotels" ? (people === 1 ? "guest" : "guests") : people === 1 ? "traveler" : "travelers"}`,
    mode !== "flights" && t?.rooms ? `${t.rooms} ${t.rooms === 1 ? "room" : "rooms"}` : null,
    search.budget?.amount ? `${search.budget.currency} 0 – ${search.budget.amount.toLocaleString("en-US")}` : null,
  ].filter(Boolean);

  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-600 sm:text-base">{parts.join(" · ")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          <button
            type="button"
            onClick={() => setEditing((open) => !open)}
            aria-expanded={editing}
            className={cn(
              "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50",
              focusRing,
            )}
          >
            {editing ? "Close" : "Edit search"}
          </button>
        </div>
      </div>
      {editing && (
        <div className="rounded-3xl bg-white p-4 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200/70 sm:p-5">
          <ModeSearchBar mode={mode} initialForm={initialForm} initialDirectOnly={initialDirectOnly} />
        </div>
      )}
    </header>
  );
}
