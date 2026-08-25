import { memo } from "react";
import { Card } from "@/components/ui/Card";
import { ViewPackageDetailsAction } from "@/components/results/ViewPackageDetailsAction";
import { ResultPrice } from "@/components/results/ResultPrice";
import {
  formatFlightRoute,
  formatHotelStarsLabel,
  formatPackageNightsLabel,
  formatPackagePriceBreakdownLabel,
  formatPackageStopsLabel,
} from "@/lib/results/packagesUi";
import type { PackageExplanation } from "@/lib/packages/explanations";
import type { TravelPackage } from "@/types/models/travel-package";

type TravelPackageCardProps = {
  package: TravelPackage;
  /** Task 4 (Sprint 15.3): shown as "LHR → CDG" when available. */
  originIata?: string | null;
  destinationIata?: string | null;
  /** Sprint 16.4: deterministic role + reason (no raw score). */
  explanation?: PackageExplanation | null;
  tripType?: "round-trip" | "one-way" | null;
};

/**
 * Compact recommended package card (Sprint 17.2 / 17.4 / 17.7).
 *
 * Hierarchy: role → airline+route → hotel+stars/rating → location →
 * reason → est. price → View package details.
 */
function TravelPackageCardComponent({
  package: travelPackage,
  originIata,
  destinationIata,
  explanation = null,
  tripType = "round-trip",
}: TravelPackageCardProps) {
  const { flight, hotel, totalPrice, currency, nights, id } = travelPackage;
  const stopsLabel = formatPackageStopsLabel(flight.stops);
  const nightsLabel = formatPackageNightsLabel(nights);
  const priceBreakdownLabel = formatPackagePriceBreakdownLabel(nights);
  const starsLabel = formatHotelStarsLabel(hotel.stars);
  const routeLabel = formatFlightRoute(originIata, destinationIata);
  const headingId = `${id}-title`;
  const roleBadgeClass =
    explanation?.role === "recommended"
      ? "bg-brand-50 text-brand-800"
      : "bg-emerald-50 text-emerald-800";

  const hotelMeta =
    starsLabel === "Unrated"
      ? `${hotel.name} · Unrated · ${hotel.rating.toFixed(1)}`
      : `${hotel.name} · ${starsLabel} · ${hotel.rating.toFixed(1)}`;

  const supportingLine = explanation?.reason?.trim()
    ? explanation.reason.trim()
    : `${stopsLabel} · ${nightsLabel}`;

  return (
    <Card hoverable className="overflow-hidden">
      <article
        className="flex flex-col gap-3 p-4 sm:gap-4 sm:p-5"
        aria-labelledby={headingId}
      >
        <div className="flex flex-wrap items-center gap-2">
          {explanation ? (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${roleBadgeClass}`}
            >
              {explanation.label}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-slate-700">
              Package
            </span>
          )}
        </div>

        <div className="min-w-0 space-y-1">
          <h3
            id={headingId}
            className="truncate text-lg font-bold text-slate-900"
          >
            {flight.airline}
            {routeLabel ? (
              <span className="font-semibold text-brand-700">
                {" "}
                · {routeLabel}
              </span>
            ) : null}
          </h3>
          <p className="truncate text-sm font-semibold text-slate-800">
            {hotelMeta}
          </p>
          <p className="truncate text-sm text-slate-500">{hotel.location}</p>
          <p className="text-sm text-slate-600">{supportingLine}</p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="min-w-0 space-y-1">
            <p className="text-sm text-slate-500">{priceBreakdownLabel}</p>
            <ResultPrice
              price={totalPrice}
              currency={currency}
              suffix="est. total"
            />
          </div>
          <ViewPackageDetailsAction
            package={travelPackage}
            originIata={originIata}
            destinationIata={destinationIata}
            tripType={tripType}
          />
        </div>
      </article>
    </Card>
  );
}

export const TravelPackageCard = memo(TravelPackageCardComponent);
