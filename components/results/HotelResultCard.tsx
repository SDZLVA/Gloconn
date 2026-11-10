import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ViewHotelAction } from "@/components/results/ViewHotelAction";
import { ResultPlaceholderImage } from "@/components/results/ResultPlaceholderImage";
import { ResultPrice } from "@/components/results/ResultPrice";
import { ResultTypeBadge } from "@/components/results/ResultTypeBadge";
import { SampleDataBadge } from "@/components/results/SampleDataBadge";
import { SAMPLE_HOTEL_NOTE } from "@/lib/results/sampleData";
import {
  formatHotelAmenitiesSummary,
} from "@/lib/hotels/amenitiesUi";
import {
  formatHotelPriceLabel,
  formatHotelStarsLabel,
} from "@/lib/results/packagesUi";
import type { HotelResult } from "@/types/results";
import { hotelSiteName } from "@/features/liveHotels/agoda/map";

type HotelResultCardProps = {
  result: HotelResult;
};

/**
 * Browse hotel card (Sprint 17.2 / 17.4).
 * Hotel-only investigation via View hotel → HotelDetailsDrawer.
 */
export function HotelResultCard({ result }: HotelResultCardProps) {
  const starsLabel = formatHotelStarsLabel(result.stars);
  const priceLabel = formatHotelPriceLabel(result.nights);
  const amenitiesSummary = formatHotelAmenitiesSummary(result.amenities);

  return (
    <Card hoverable className="overflow-hidden">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
        {result.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={result.photo} alt="" loading="lazy" className="h-36 w-full rounded-xl object-cover sm:h-auto sm:w-36" />
        ) : (
          <ResultPlaceholderImage
            type="hotel"
            label={result.location}
            className="h-36 w-full sm:h-auto sm:w-36"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <ResultTypeBadge type="hotel" />
                {result.isSample && <SampleDataBadge label="Example hotel" />}
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
            {/* Milestone 52: guest score out of 10 with a word, like Booking.com and the package cards. */}
            {result.rating > 0 && (
              <p className="flex items-center gap-1.5 text-sm" aria-label={`Guest score ${(result.rating <= 5 ? result.rating * 2 : result.rating).toFixed(1)} out of 10`}>
                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700">
                  {(result.rating <= 5 ? result.rating * 2 : result.rating).toFixed(1)}
                </span>
                <span className="font-semibold text-emerald-700">{guestScoreWord(result.rating <= 5 ? result.rating * 2 : result.rating)}</span>
              </p>
            )}
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
              {result.isSample && (
                <p className="text-xs text-amber-800">{SAMPLE_HOTEL_NOTE}</p>
              )}
            </div>
            {result.detailsUrl ? (
              <Link
                href={result.detailsUrl}
                {...(/^https?:\/\//.test(result.detailsUrl) ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800"
              >
                {/^https?:\/\//.test(result.detailsUrl) ? `See on ${hotelSiteName(result.detailsUrl)} ↗` : "See availability"}
              </Link>
            ) : (
              <ViewHotelAction hotel={result} />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function guestScoreWord(score: number): string {
  if (score >= 9) return "Superb";
  if (score >= 8.5) return "Excellent";
  if (score >= 8) return "Very good";
  if (score >= 7) return "Good";
  return "Pleasant";
}
