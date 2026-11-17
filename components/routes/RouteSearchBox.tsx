"use client";

import { ModeSearchBar } from "@/components/search/ModeSearchBar";

/** Milestone 62 — the flight search bar, prefilled with a route page's cities. */
export function RouteSearchBox(props: { origin: string; originId: string; destination: string; destinationId: string }) {
  return (
    <div className="rounded-2xl border border-sky-300 bg-white p-4 shadow-sm sm:p-5">
      <ModeSearchBar mode="flights" initialForm={{ ...props, tripType: "round-trip" }} />
    </div>
  );
}
