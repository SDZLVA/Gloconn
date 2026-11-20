"use client";

import { ModeSearchBar } from "@/components/search/ModeSearchBar";

/** Milestone 75 — flight and hotel search bars on a destination page, destination prefilled. */
export function DestinationSearch(props: { destination: string; destinationId: string }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-sky-300 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-3 text-lg font-extrabold text-brand-900">Flights to {props.destination.split(",")[0]}</h3>
        <ModeSearchBar mode="flights" initialForm={{ ...props, origin: "", originId: "", tripType: "round-trip" }} />
      </div>
      <div className="rounded-2xl border border-sky-300 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-3 text-lg font-extrabold text-brand-900">Hotels in {props.destination.split(",")[0]}</h3>
        <ModeSearchBar mode="hotels" initialForm={{ ...props, tripType: "round-trip" }} />
      </div>
    </div>
  );
}
