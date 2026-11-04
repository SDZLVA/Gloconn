"use client";

import { useState } from "react";
import { StayPackageCard } from "@/components/results/StayPackageCard";
import type { LiveFlightsSearch } from "@/features/liveFlights/types";
import type { StayPackage } from "@/types/models/stay-package";

const INITIAL = 6;

/** Milestone 40b — the Packages tab list for hotel-led packages. */
export function StayPackagesSection({
  stays,
  flights,
  destinationName,
}: {
  stays: readonly StayPackage[];
  flights: LiveFlightsSearch | null;
  destinationName?: string;
}) {
  const [showAll, setShowAll] = useState(false);
  if (stays.length === 0) return null;
  const shown = showAll ? stays : stays.slice(0, INITIAL);
  return (
    <section className="space-y-4" aria-label="Recommended Packages">
      {shown.map((stay) => (
        <StayPackageCard key={stay.id} stay={stay} flights={flights} destinationName={destinationName} />
      ))}
      {!showAll && stays.length > INITIAL && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300"
          >
            Show {stays.length - INITIAL} more packages
          </button>
        </div>
      )}
    </section>
  );
}
