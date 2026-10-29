import { Card } from "@/components/ui/Card";
import { FlightLegTimeline } from "@/components/results/FlightLegTimeline";
import { airportChangeNotes, displayLegs } from "@/lib/results/flightLegs";
import { PartnerLinks } from "@/components/results/PartnerLinks";
import { SampleDataBadge } from "@/components/results/SampleDataBadge";
import { SAMPLE_FLIGHT_NOTE } from "@/lib/results/sampleData";
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
   * Partner buttons for this flight (Milestone 20: exact where possible,
   * otherwise a route search). Empty — no buttons — when none can be built.
   */
  partnerLinks?: readonly FlightPartnerLink[];
};

/**
 * Card displaying a flight search result.
 * Informational only — no fake booking CTA.
 * Task 4: shows route context when IATA codes are available.
 *
 * Partner buttons: since Milestone 20 they open this exact ticket on
 * Aviasales and a Kiwi.com search filtered to it; for flights without that
 * data they fall back to a route search. PartnerLinks words each case
 * honestly and discloses commission (see /terms, section 6). Round trips
 * with return details are shown by RoundTripFlightPicker instead.
 */
export function FlightResultCard({
  result,
  tripType = "round-trip",
  originIata,
  destinationIata,
  partnerLinks = [],
}: FlightResultCardProps) {
  const legs = displayLegs(result);
  const tripPriceLabel = formatFlightTripPriceLabel(tripType);
  // A whole-city search mixes airports (MXP/LIN/BGY → CDG/ORY/BVA), so the
  // flight's own airports win over the search-level route.
  const routeLabel = formatFlightRoute(
    result.originAirport ?? originIata,
    result.destinationAirport ?? destinationIata,
  );

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
                {result.isSample && <SampleDataBadge label="Example flight" />}
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

          {/* Milestone 21: each leg with airline logo, times, airports and stops. */}
          <div className="flex flex-col gap-2">
            <FlightLegTimeline leg={legs.outbound} label="Outbound" fallbackStops={result.stops} />
            {legs.back && (
              <FlightLegTimeline
                leg={legs.back}
                label="Return"
                fallbackStops={result.returnStops}
                notes={airportChangeNotes(legs)}
              />
            )}
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3">
            <p className="text-sm text-slate-500">{tripPriceLabel}</p>
            <ResultPrice
              price={result.price}
              currency={result.currency}
              suffix="per person"
            />
          </div>
          {result.isSample && (
            <p className="-mt-1 text-right text-xs text-amber-800">
              {SAMPLE_FLIGHT_NOTE}
            </p>
          )}
          {result.priceIsRecent && (
            <p className="-mt-1 text-right text-xs text-slate-500">
              Recent price found by other travellers — it may have changed.
            </p>
          )}

          <PartnerLinks links={partnerLinks} context="flight" />
        </div>
      </div>
    </Card>
  );
}
