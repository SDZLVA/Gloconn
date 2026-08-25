"use client";

import { memo, useMemo, useState } from "react";
import { TravelPackageCard } from "@/components/results/TravelPackageCard";
import { assignPackageExplanations } from "@/lib/packages/explanations";
import { shouldShowRecommendedPackages } from "@/lib/results/packagesUi";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { Budget } from "@/types/models/budget";
import type { TravelPackage } from "@/types/models/travel-package";

/** Number of packages shown initially before "Show more" is needed. */
export const PACKAGES_INITIAL_VISIBLE = 5;

type RecommendedPackagesSectionProps = {
  packages: readonly TravelPackage[];
  /** Task 4 (Sprint 15.3): route context threaded to package cards. */
  originIata?: string | null;
  destinationIata?: string | null;
  /** Sprint 16.4: optional budget for "Fits your budget" role. */
  budget?: Budget | null;
  tripType?: "round-trip" | "one-way" | null;
};

/**
 * Hero section for recommended travel packages.
 *
 * Task 1 (Sprint 15.3): Shows only the top PACKAGES_INITIAL_VISIBLE packages
 * by default. A "Show more" button reveals the remainder without losing the
 * full API response or changing the composer output.
 *
 * Sprint 16.4: roles/reasons are assigned only for the visible top five
 * (after diversity), derived at render time from package data + budget.
 *
 * Renders nothing when `packages` is empty (no empty state).
 */
function RecommendedPackagesSectionComponent({
  packages,
  originIata,
  destinationIata,
  budget = null,
  tripType = "round-trip",
}: RecommendedPackagesSectionProps) {
  const [showAll, setShowAll] = useState(false);

  const explanations = useMemo(
    () =>
      assignPackageExplanations(packages, {
        budget,
        limit: PACKAGES_INITIAL_VISIBLE,
      }),
    [packages, budget],
  );

  if (!shouldShowRecommendedPackages(packages)) {
    return null;
  }

  const visible = showAll ? packages : packages.slice(0, PACKAGES_INITIAL_VISIBLE);
  const hiddenCount = packages.length - PACKAGES_INITIAL_VISIBLE;
  const hasMore = !showAll && hiddenCount > 0;

  return (
    <section
      className="space-y-4"
      aria-labelledby="recommended-packages-heading"
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
          Recommendations
        </p>
        <h2
          id="recommended-packages-heading"
          className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
        >
          <span aria-hidden="true">⭐ </span>
          Recommended Packages
        </h2>
        <p className="text-sm text-slate-600">
          Flight and hotel combinations matched to your search.
        </p>
      </div>

      <ul
        className="flex flex-col gap-4"
        aria-label="Recommended travel packages"
      >
        {visible.map((travelPackage) => (
          <li key={travelPackage.id}>
            <TravelPackageCard
              package={travelPackage}
              originIata={originIata}
              destinationIata={destinationIata}
              explanation={explanations.get(travelPackage.id) ?? null}
              tripType={tripType}
            />
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-slate-300 motion-safe:hover:shadow-md",
              focusRing,
            )}
          >
            Show {hiddenCount} more package{hiddenCount === 1 ? "" : "s"}
          </button>
        </div>
      )}
    </section>
  );
}

export const RecommendedPackagesSection = memo(
  RecommendedPackagesSectionComponent,
);
