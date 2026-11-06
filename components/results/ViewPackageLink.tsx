"use client";

import type { FlightLinksResolver } from "@/lib/affiliate/exactFlightLinks";
import { savePackageView } from "@/lib/packages/viewPayload";
import type { PackageExplanation } from "@/lib/packages/explanations";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { TravelPackage } from "@/types/models/travel-package";
import type { Flight } from "@/types/models";

type ViewPackageLinkProps = {
  package: TravelPackage;
  explanation?: PackageExplanation | null;
  getFlightLinks?: FlightLinksResolver;
  originIata?: string | null;
  destinationIata?: string | null;
  tripType?: "round-trip" | "one-way" | null;
  /** Milestone 47: every flight for these dates, so the package page can offer them. */
  flightOptions?: readonly Flight[];
  className?: string;
};

const MAX_FLIGHT_OPTIONS = 10;

/** The package's flight plus the other flights in the same currency, cheapest first, no duplicates. */
export function packageFlightChoices(travelPackage: TravelPackage, flights: readonly Flight[] = []): Flight[] {
  const seen = new Set<string>();
  const out: Flight[] = [];
  for (const flight of [travelPackage.flight, ...[...flights].sort((a, b) => a.price - b.price)]) {
    if (!flight || seen.has(flight.id) || flight.price <= 0 || flight.currency !== travelPackage.currency) continue;
    seen.add(flight.id);
    out.push(flight);
  }
  const [own, ...rest] = out;
  return [own, ...rest.slice(0, MAX_FLIGHT_OPTIONS - 1)].filter(Boolean).sort((a, b) => a.price - b.price);
}

/**
 * Milestone 33 — "View package" opens the package's own page. A plain link
 * (works without JavaScript too); on click it hands the package over first.
 */
export function ViewPackageLink({
  package: travelPackage,
  explanation = null,
  getFlightLinks,
  originIata = null,
  destinationIata = null,
  tripType = "round-trip",
  flightOptions = [],
  className,
}: ViewPackageLinkProps) {
  return (
    <a
      href={`/packages/${encodeURIComponent(travelPackage.id)}`}
      onClick={() =>
        savePackageView({
          package: travelPackage,
          explanation,
          flightLinks: [...(getFlightLinks?.(travelPackage.flight) ?? [])],
          flightOptions: packageFlightChoices(travelPackage, flightOptions).map((flight) => ({
            flight,
            links: [...(getFlightLinks?.(flight) ?? [])],
          })),
          resultsUrl: window.location.pathname + window.location.search,
          originIata,
          destinationIata,
          tripType: tripType === "one-way" ? "one-way" : "round-trip",
          savedAt: Date.now(),
        })
      }
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-700/20 hover:bg-brand-800",
        focusRing,
        className,
      )}
    >
      View package
    </a>
  );
}
