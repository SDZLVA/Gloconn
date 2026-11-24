"use client";

import { ModeSearchBar } from "@/components/search/ModeSearchBar";

/** Milestone 75 — flight and hotel search bars on a destination page, destination prefilled. */
export function DestinationSearch(props: { destination: string; destinationId: string; flightsTitle?: string; hotelsTitle?: string }) {
  const { flightsTitle, hotelsTitle, ...search } = props;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-sky-300 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-3 text-lg font-extrabold text-brand-900">{flightsTitle ?? `Flights to ${search.destination.split(",")[0]}`}</h3>
        <ModeSearchBar mode="flights" layout="wrap" initialForm={{ ...search, origin: "", originId: "", tripType: "round-trip" }} />
      </div>
      <div className="rounded-2xl border border-sky-300 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-3 text-lg font-extrabold text-brand-900">{hotelsTitle ?? `Hotels in ${search.destination.split(",")[0]}`}</h3>
        <ModeSearchBar mode="hotels" layout="wrap" initialForm={{ ...search, tripType: "round-trip" }} />
      </div>
    </div>
  );
}
