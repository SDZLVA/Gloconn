import { memo } from "react";
import { TravelPackageCard } from "@/components/results/TravelPackageCard";
import { shouldShowRecommendedPackages } from "@/lib/results/packagesUi";
import type { TravelPackage } from "@/types/models/travel-package";

type RecommendedPackagesSectionProps = {
  packages: readonly TravelPackage[];
};

/**
 * Hero section for recommended travel packages.
 * Renders nothing when `packages` is empty (no empty state).
 */
function RecommendedPackagesSectionComponent({
  packages,
}: RecommendedPackagesSectionProps) {
  if (!shouldShowRecommendedPackages(packages)) {
    return null;
  }

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
        {packages.map((travelPackage) => (
          <li key={travelPackage.id}>
            <TravelPackageCard package={travelPackage} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export const RecommendedPackagesSection = memo(
  RecommendedPackagesSectionComponent,
);
