import type { Ref } from "react";
import { Button } from "@/components/ui/Button";
import { ExternalContinueLink } from "@/components/results/ExternalContinueLink";
import { ResultPrice } from "@/components/results/ResultPrice";
import { ResultRating } from "@/components/results/ResultRating";
import { buildGoogleMapsUrl } from "@/lib/hotels/googleMapsUrl";
import {
  formatFlightDurationLabel,
  formatFlightRoute,
  formatHotelStarsLabel,
  formatPackageHotelStayLabel,
  formatPackagePriceBreakdownLabel,
  formatPackageStopsLabel,
} from "@/lib/results/packagesUi";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { HotelPropertyDetails } from "@/types/models/hotel-property-details";
import type { TravelPackage } from "@/types/models/travel-package";

export type PackageDetailsPanelProps = {
  package: TravelPackage;
  onClose: () => void;
  titleId: string;
  closeButtonRef?: Ref<HTMLButtonElement>;
  originIata?: string | null;
  destinationIata?: string | null;
  /** Trip type for flight price footnote. */
  tripType?: "round-trip" | "one-way" | null;
  details?: HotelPropertyDetails | null;
  detailsStatus?: "idle" | "loading" | "success" | "error";
};

/**
 * Package investigation surface — flight + hotel sections (Sprint 17.7).
 * Compact facts only; not a duplicate of the search card.
 */
export function PackageDetailsPanel({
  package: travelPackage,
  onClose,
  titleId,
  closeButtonRef,
  originIata,
  destinationIata,
  tripType = "round-trip",
  details = null,
  detailsStatus = "idle",
}: PackageDetailsPanelProps) {
  const { flight, hotel, totalPrice, currency, nights } = travelPackage;
  const routeLabel = formatFlightRoute(originIata, destinationIata);
  const stopsLabel = formatPackageStopsLabel(flight.stops);
  const durationLabel = formatFlightDurationLabel(flight.durationMinutes);
  const starsLabel = formatHotelStarsLabel(hotel.stars);
  const stayLabel = formatPackageHotelStayLabel(nights);
  const priceBreakdownLabel = formatPackagePriceBreakdownLabel(nights);
  const flightPriceFootnote =
    tripType === "one-way" ? "One-way · per person" : "Round-trip · per person";

  const hotelName = details?.name?.trim() || hotel.name;
  const address = details?.address?.trim();
  const locationLine = address || hotel.location;
  const mapsUrl =
    details?.mapsUrl || buildGoogleMapsUrl(hotel.latitude, hotel.longitude);
  const websiteUrl = details?.websiteUrl;
  const offers = details?.offers ?? [];
  const disclosure = details?.thirdPartyDisclosure;
  const hasHotelLinks = Boolean(mapsUrl || websiteUrl || offers.length > 0);

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={cn(
        "relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden bg-white shadow-2xl shadow-slate-900/20",
        "rounded-t-2xl sm:h-full sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none",
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Package details
          </p>
          <h2
            id={titleId}
            className="truncate text-lg font-bold text-slate-900"
          >
            {flight.airline}
            {routeLabel ? ` · ${routeLabel}` : ""}
          </h2>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className={cn(
            "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 motion-safe:hover:bg-slate-100 motion-safe:hover:text-slate-800",
            focusRing,
          )}
          aria-label="Close"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-500">{priceBreakdownLabel}</p>
          <div className="mt-1">
            <ResultPrice
              price={totalPrice}
              currency={currency}
              suffix="est. total"
            />
          </div>
        </div>

        <section className="space-y-3" aria-labelledby={`${titleId}-flight`}>
          <h3
            id={`${titleId}-flight`}
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Flight
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Airline</dt>
              <dd className="font-medium text-slate-900">{flight.airline}</dd>
            </div>
            {routeLabel && (
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Route</dt>
                <dd className="font-medium text-slate-900">{routeLabel}</dd>
              </div>
            )}
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Departure</dt>
              <dd className="font-medium text-slate-900">
                {flight.departureTime}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Arrival</dt>
              <dd className="font-medium text-slate-900">
                {flight.arrivalTime}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Stops</dt>
              <dd className="font-medium text-slate-900">{stopsLabel}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Duration</dt>
              <dd className="font-medium text-slate-900">{durationLabel}</dd>
            </div>
          </dl>
          <div className="rounded-xl border border-slate-100 px-3 py-2">
            <p className="text-xs text-slate-500">{flightPriceFootnote}</p>
            <div className="mt-0.5">
              <ResultPrice
                price={flight.price}
                currency={flight.currency}
                suffix=""
              />
            </div>
          </div>
          {/* Flight model has no trusted booking URL today — do not invent one. */}
        </section>

        <section
          className="space-y-3 border-t border-slate-100 pt-5"
          aria-labelledby={`${titleId}-hotel`}
        >
          <h3
            id={`${titleId}-hotel`}
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Hotel
          </h3>
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-900">{hotelName}</p>
            <div className="flex flex-wrap items-center gap-2">
              {starsLabel === "Unrated" ? (
                <span className="text-sm font-medium text-slate-500">
                  {starsLabel}
                </span>
              ) : (
                <span className="text-sm font-medium text-amber-600">
                  <span aria-hidden="true">{starsLabel}</span>
                  <span className="sr-only">{hotel.stars} stars</span>
                </span>
              )}
              <ResultRating rating={hotel.rating} />
            </div>
            <p className="text-sm text-slate-600">{locationLine}</p>
            <p className="text-sm text-slate-500">{stayLabel}</p>
          </div>
          <div className="rounded-xl border border-slate-100 px-3 py-2">
            <p className="text-xs text-slate-500">Hotel stay</p>
            <div className="mt-0.5">
              <ResultPrice
                price={hotel.price}
                currency={hotel.currency}
                suffix="total"
              />
            </div>
          </div>

          {detailsStatus === "loading" && (
            <p className="text-sm text-slate-500" aria-live="polite">
              Loading hotel details…
            </p>
          )}

          {detailsStatus === "error" && (
            <p className="text-sm text-slate-500" aria-live="polite">
              Some hotel details are unavailable right now.
            </p>
          )}

          {details?.snapshotNotice?.trim() && detailsStatus === "success" && (
            <p
              className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
              role="note"
            >
              {details.snapshotNotice.trim()}
            </p>
          )}

          {hasHotelLinks && (
            <div className="flex flex-col gap-2">
              {mapsUrl && (
                <ExternalContinueLink href={mapsUrl} variant="brand">
                  View on Google Maps
                </ExternalContinueLink>
              )}
              {websiteUrl && (
                <ExternalContinueLink href={websiteUrl}>
                  Hotel website
                </ExternalContinueLink>
              )}
              {offers.map((offer) => (
                <ExternalContinueLink key={offer.url} href={offer.url}>
                  {offer.label}
                </ExternalContinueLink>
              ))}
              {disclosure && (
                <p className="text-xs leading-relaxed text-slate-500">
                  {disclosure}
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 w-full"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </aside>
  );
}
