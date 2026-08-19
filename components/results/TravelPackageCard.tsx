import { memo } from "react";
import { Card } from "@/components/ui/Card";
import { ResultDuration } from "@/components/results/ResultDuration";
import { ResultPlaceholderImage } from "@/components/results/ResultPlaceholderImage";
import { ResultPrice } from "@/components/results/ResultPrice";
import { ResultRating } from "@/components/results/ResultRating";
import {
  formatFlightRoute,
  formatHotelStarsLabel,
  formatPackageIncludesSummary,
  formatPackageNightsLabel,
  formatPackagePriceBreakdownLabel,
  formatPackageQualityBadge,
  formatPackageStopsLabel,
} from "@/lib/results/packagesUi";
import type { TravelPackage } from "@/types/models/travel-package";

type TravelPackageCardProps = {
  package: TravelPackage;
  /** Task 4 (Sprint 15.3): shown as "LHR → CDG" in the flight box when available. */
  originIata?: string | null;
  destinationIata?: string | null;
};

/**
 * Informational card for a recommended flight + hotel package.
 * No booking or edit actions.
 *
 * P0.1: Price breakdown label makes per-person flight + 1-room hotel explicit.
 * P0.2: Qualitative badge ("Top Pick" / "Good Match") replaces opaque score number.
 * P1.4: Hotel stars use formatHotelStarsLabel — renders "Unrated" for 0 stars.
 */
function TravelPackageCardComponent({
  package: travelPackage,
  originIata,
  destinationIata,
}: TravelPackageCardProps) {
  const { flight, hotel, totalPrice, currency, nights, score, id } =
    travelPackage;
  const stopsLabel = formatPackageStopsLabel(flight.stops);
  const qualityBadge = formatPackageQualityBadge(score);
  const nightsLabel = formatPackageNightsLabel(nights);
  const priceBreakdownLabel = formatPackagePriceBreakdownLabel(nights);
  const includesSummary = formatPackageIncludesSummary(nights, hotel.name);
  const starsLabel = formatHotelStarsLabel(hotel.stars);
  const routeLabel = formatFlightRoute(originIata, destinationIata);
  const headingId = `${id}-title`;

  return (
    <Card hoverable className="overflow-hidden">
      <article
        className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5"
        aria-labelledby={headingId}
      >
        <ResultPlaceholderImage
          type="hotel"
          label={hotel.location}
          className="h-36 w-full sm:h-auto sm:w-36"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-brand-800">
                  Package
                </span>
                {qualityBadge && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-emerald-800">
                    {qualityBadge}
                  </span>
                )}
              </div>
              <h3
                id={headingId}
                className="truncate text-lg font-bold text-slate-900"
              >
                {flight.airline} + {hotel.name}
              </h3>
              <p className="text-sm font-medium text-brand-700">
                {includesSummary}
              </p>
              <p className="text-sm text-slate-500">
                {hotel.location}
                <span className="text-slate-400"> · </span>
                {nightsLabel}
              </p>
            </div>
            <ResultRating rating={hotel.rating} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Flight · per person
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {flight.airline}
              </p>
              {routeLabel && (
                <p className="mt-0.5 text-xs font-semibold tracking-wide text-brand-700">
                  {routeLabel}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <div className="text-center">
                  <p className="font-bold text-slate-900">
                    {flight.departureTime}
                  </p>
                  <p className="text-xs text-slate-500">Departure</p>
                </div>
                <div className="flex min-w-[4rem] flex-1 flex-col items-center gap-1 px-1">
                  <ResultDuration
                    minutes={flight.durationMinutes}
                    className="text-xs font-medium text-slate-500"
                  />
                  <div className="h-px w-full max-w-[80px] bg-slate-200" />
                  <span className="text-xs font-medium text-brand-700">
                    {stopsLabel}
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900">
                    {flight.arrivalTime}
                  </p>
                  <p className="text-xs text-slate-500">Arrive</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Hotel · 1 room
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                {hotel.name}
              </p>
              <p className="mt-1 text-xs font-medium text-amber-600">
                {starsLabel === "Unrated" ? (
                  <span className="text-slate-500">{starsLabel}</span>
                ) : (
                  <>
                    <span aria-hidden="true">{starsLabel}</span>
                    <span className="sr-only">{hotel.stars} stars</span>
                  </>
                )}
                <span className="ml-2 text-slate-600">
                  {hotel.rating.toFixed(1)} rating
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">{hotel.location}</p>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3">
            <p className="text-sm text-slate-500">{priceBreakdownLabel}</p>
            <ResultPrice
              price={totalPrice}
              currency={currency}
              suffix="est. total"
            />
          </div>
        </div>
      </article>
    </Card>
  );
}

export const TravelPackageCard = memo(TravelPackageCardComponent);
