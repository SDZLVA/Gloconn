import type { Ref } from "react";
import { Button } from "@/components/ui/Button";
import { ExternalContinueLink } from "@/components/results/ExternalContinueLink";
import { ResultPrice } from "@/components/results/ResultPrice";
import { ResultRating } from "@/components/results/ResultRating";
import {
  HOTEL_DRAWER_AMENITY_LIMIT,
  selectHotelAmenitiesForDisplay,
} from "@/lib/hotels/amenitiesUi";
import { buildGoogleMapsUrl } from "@/lib/hotels/googleMapsUrl";
import {
  formatHotelPriceLabel,
  formatHotelStarsLabel,
} from "@/lib/results/packagesUi";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { Hotel } from "@/types/models/hotel";
import type { HotelPropertyDetails } from "@/types/models/hotel-property-details";

export type HotelDetailsPanelProps = {
  hotel: Hotel;
  onClose: () => void;
  titleId: string;
  closeButtonRef?: Ref<HTMLButtonElement>;
  /** Enriched details from on-demand fetch (Sprint 17.3). */
  details?: HotelPropertyDetails | null;
  detailsStatus?: "idle" | "loading" | "success" | "error";
};

/**
 * Presentational hotel details body.
 * Search-card facts always visible; richer details layer on top when loaded.
 */
export function HotelDetailsPanel({
  hotel,
  onClose,
  titleId,
  closeButtonRef,
  details = null,
  detailsStatus = "idle",
}: HotelDetailsPanelProps) {
  const starsLabel = formatHotelStarsLabel(hotel.stars);
  const priceLabel = formatHotelPriceLabel(hotel.nights);
  const amenities = selectHotelAmenitiesForDisplay(
    hotel.amenities,
    HOTEL_DRAWER_AMENITY_LIMIT,
  );

  const displayName = details?.name?.trim() || hotel.name;
  const address = details?.address?.trim();
  const locationLine = address || hotel.location;
  const mapsUrl =
    details?.mapsUrl ||
    buildGoogleMapsUrl(hotel.latitude, hotel.longitude);
  const websiteUrl = details?.websiteUrl;
  const offers = details?.offers ?? [];
  const disclosure = details?.thirdPartyDisclosure;

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
            Hotel details
          </p>
          <h2
            id={titleId}
            className="truncate text-lg font-bold text-slate-900"
          >
            {displayName}
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

      <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
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

        <div className="space-y-1">
          <p className="text-sm text-slate-600">{locationLine}</p>
          {address && hotel.location && address !== hotel.location && (
            <p className="text-xs text-slate-500">{hotel.location}</p>
          )}
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-500">{priceLabel}</p>
          <div className="mt-1">
            <ResultPrice
              price={hotel.price}
              currency={hotel.currency}
              suffix="total"
            />
          </div>
        </div>

        {amenities.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Amenities
            </p>
            <ul className="flex flex-wrap gap-2">
              {amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  {amenity}
                </li>
              ))}
            </ul>
          </div>
        )}

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

        {(mapsUrl || websiteUrl || offers.length > 0) && (
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Continue
            </p>
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
            </div>
            {disclosure && (
              <p className="text-xs leading-relaxed text-slate-500">
                {disclosure}
              </p>
            )}
          </div>
        )}
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
