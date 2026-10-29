import { Card } from "@/components/ui/Card";
import { ExternalContinueLink } from "@/components/results/ExternalContinueLink";
import { ResultDuration } from "@/components/results/ResultDuration";
import { ResultPlaceholderImage } from "@/components/results/ResultPlaceholderImage";
import { ResultPrice } from "@/components/results/ResultPrice";
import { ResultRating } from "@/components/results/ResultRating";
import { ResultTypeBadge } from "@/components/results/ResultTypeBadge";
import { formatFlightRoute, formatFlightTripPriceLabel } from "@/lib/results/packagesUi";
import type { FlightPartnerLink } from "@/lib/affiliate/flightPartnerLink";
import type { TripType } from "@/types/models/search-request";
import type { FlightResult } from "@/types/results";

type FlightResultCardProps = {
  result: FlightResult;
  /** Search trip type — drives "One-way" vs "Round-trip" footnote. */
  tripType?: TripType;
  /**
   * Task 4 (Sprint 15.3): IATA codes from the search request.
   * When present, renders "LHR → CDG" route context below the airline name.
   * Omitted when unavailable — no placeholder is shown.
   */
  originIata?: string | null;
  destinationIata?: string | null;
  /**
   * Milestone 19: partner search link for this route and dates. Omitted
   * when the route cannot be built — the card then shows no link.
   */
  partnerLink?: FlightPartnerLink | null;
};

/**
 * Card displaying a flight search result.
 * Informational only — no fake booking CTA.
 * Task 4: shows route context when IATA codes are available.
 *
 * Milestone 19: the partner link opens a search for the same route and dates
 * on the partner's site. It is NOT a link to this specific flight, and the
 * partner's price can differ, so the copy says "check this route" and never
 * "book this flight". When the link carries Glooconn's marker, the card says
 * so — commission must always be disclosed (see /terms, section 6).
 */
export function FlightResultCard({
  result,
  tripType = "round-trip",
  originIata,
  destinationIata,
  partnerLink,
}: FlightResultCardProps) {
  const stopsLabel =
    result.stops === 0 ? "Direct" : `${result.stops} stop${result.stops > 1 ? "s" : ""}`;
  const tripPriceLabel = formatFlightTripPriceLabel(tripType);
  const routeLabel = formatFlightRoute(originIata, destinationIata);

  return (
    <Card hoverable className="overflow-hidden">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
        <ResultPlaceholderImage
          type="flight"
          label={result.airline}
          className="h-28 w-full sm:h-auto sm:w-28"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <ResultTypeBadge type="flight" />
                <span className="text-xs font-medium text-slate-500">
                  {result.cabin}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {result.airline}
              </h3>
              {routeLabel && (
                <p className="text-sm font-semibold tracking-wide text-brand-700">
                  {routeLabel}
                </p>
              )}
            </div>
            <ResultRating rating={result.rating} />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">
                {result.departureTime}
              </p>
              <p className="text-xs text-slate-500">Depart</p>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1 px-2">
              <ResultDuration
                minutes={result.durationMinutes}
                className="text-xs font-medium text-slate-500"
              />
              <div className="h-px w-full max-w-[120px] bg-slate-200" />
              <span className="text-xs font-medium text-brand-700">
                {stopsLabel}
              </span>
            </div>
            {/* Some sources give departure + duration but no arrival time
                (no destination time zone). Hide it rather than guess. */}
            {result.arrivalTime ? (
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">
                  {result.arrivalTime}
                </p>
                <p className="text-xs text-slate-500">Arrive</p>
              </div>
            ) : null}
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3">
            <p className="text-sm text-slate-500">{tripPriceLabel}</p>
            <ResultPrice
              price={result.price}
              currency={result.currency}
              suffix="per person"
            />
          </div>
          {result.priceIsRecent && (
            <p className="-mt-1 text-right text-xs text-slate-500">
              Recent price found by other travellers — it may have changed.
            </p>
          )}

          {partnerLink && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Opens a search for this route on {partnerLink.partnerName}. Their
                prices and flights may differ.
                {partnerLink.tagged && " Glooconn may earn a commission."}
              </p>
              <ExternalContinueLink
                href={partnerLink.href}
                variant="brand"
                sponsored={partnerLink.tagged}
              >
                Check this route on {partnerLink.partnerName}
              </ExternalContinueLink>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
