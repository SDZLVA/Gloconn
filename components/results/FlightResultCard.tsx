import { Card } from "@/components/ui/Card";
import { ResultDuration } from "@/components/results/ResultDuration";
import { ResultPlaceholderImage } from "@/components/results/ResultPlaceholderImage";
import { ResultPrice } from "@/components/results/ResultPrice";
import { ResultRating } from "@/components/results/ResultRating";
import { ResultTypeBadge } from "@/components/results/ResultTypeBadge";
import { formatFlightTripPriceLabel } from "@/lib/results/packagesUi";
import type { TripType } from "@/types/models/search-request";
import type { FlightResult } from "@/types/results";

type FlightResultCardProps = {
  result: FlightResult;
  /** Search trip type — drives "One-way" vs "Round-trip" footnote. */
  tripType?: TripType;
};

/**
 * Card displaying a flight search result.
 * Sprint 14.2 MVP: informational only — no fake booking CTA.
 * Sprint 14.3: trip-type wording matches the active search.
 */
export function FlightResultCard({
  result,
  tripType = "round-trip",
}: FlightResultCardProps) {
  const stopsLabel =
    result.stops === 0 ? "Direct" : `${result.stops} stop${result.stops > 1 ? "s" : ""}`;
  const tripPriceLabel = formatFlightTripPriceLabel(tripType);

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
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">
                {result.arrivalTime}
              </p>
              <p className="text-xs text-slate-500">Arrive</p>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3">
            <p className="text-sm text-slate-500">{tripPriceLabel}</p>
            <ResultPrice
              price={result.price}
              currency={result.currency}
              suffix="total"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
