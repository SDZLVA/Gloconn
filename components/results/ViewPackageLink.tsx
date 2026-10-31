"use client";

import type { FlightLinksResolver } from "@/lib/affiliate/exactFlightLinks";
import { savePackageView } from "@/lib/packages/viewPayload";
import type { PackageExplanation } from "@/lib/packages/explanations";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { TravelPackage } from "@/types/models/travel-package";

type ViewPackageLinkProps = {
  package: TravelPackage;
  explanation?: PackageExplanation | null;
  getFlightLinks?: FlightLinksResolver;
  originIata?: string | null;
  destinationIata?: string | null;
  tripType?: "round-trip" | "one-way" | null;
  className?: string;
};

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
