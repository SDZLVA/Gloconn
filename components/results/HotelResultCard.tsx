import { Card } from "@/components/ui/Card";
import { ViewHotelAction } from "@/components/results/ViewHotelAction";
import { ResultPlaceholderImage } from "@/components/results/ResultPlaceholderImage";
import { ResultPrice } from "@/components/results/ResultPrice";
import { ResultRating } from "@/components/results/ResultRating";
import { ResultTypeBadge } from "@/components/results/ResultTypeBadge";
import {
  formatHotelAmenitiesSummary,
} from "@/lib/hotels/amenitiesUi";
import {
  formatHotelPriceLabel,
  formatHotelStarsLabel,
} from "@/lib/results/packagesUi";
import type { HotelResult } from "@/types/results";

type HotelResultCardProps = {
  result: HotelResult;
};

/**
 * Browse hotel card (Sprint 17.2 / 17.4).
 * Decision-layer only — same View hotel drawer as package cards.
 */
export function HotelResultCard({ result }: HotelResultCardProps) {
  const starsLabel = formatHotelStarsLabel(result.stars);
  const priceLabel = formatHotelPriceLabel(result.nights);
  const amenitiesSummary = formatHotelAmenitiesSummary(result.amenities);

  return (
    <Card hoverable className="overflow-hidden">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
        <ResultPlaceholderImage
          type="hotel"
          label={result.location}
          className="h-36 w-full sm:h-auto sm:w-36"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <ResultTypeBadge type="hotel" />
                {starsLabel === "Unrated" ? (
                  <span className="text-xs font-medium text-slate-500">
                    {starsLabel}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-600">
                    <span aria-hidden="true">{starsLabel}</span>
                    <span className="sr-only">{result.stars} stars</span>
                  </span>
                )}
              </div>
              <h3 className="truncate text-lg font-bold text-slate-900">
                {result.name}
              </h3>
              <p className="text-sm text-slate-600">{result.location}</p>
            </div>
            <ResultRating rating={result.rating} />
          </div>

          {amenitiesSummary && (
            <p className="text-xs text-slate-500">{amenitiesSummary}</p>
          )}

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3">
            <div className="min-w-0 space-y-1">
              <p className="text-sm text-slate-500">{priceLabel}</p>
              <ResultPrice
                price={result.price}
                currency={result.currency}
                suffix="total"
              />
            </div>
            <ViewHotelAction hotel={result} />
          </div>
        </div>
      </div>
    </Card>
  );
}
