import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ResultDuration } from "@/components/results/ResultDuration";
import { ResultPlaceholderImage } from "@/components/results/ResultPlaceholderImage";
import { ResultPrice } from "@/components/results/ResultPrice";
import { ResultRating } from "@/components/results/ResultRating";
import { ResultTypeBadge } from "@/components/results/ResultTypeBadge";
import type { BusResult } from "@/types/results";

type BusResultCardProps = {
  result: BusResult;
};

/** Card displaying a bus search result. */
export function BusResultCard({ result }: BusResultCardProps) {
  return (
    <Card hoverable className="overflow-hidden">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
        <ResultPlaceholderImage
          type="bus"
          label={result.operator}
          className="h-28 w-full sm:h-auto sm:w-28"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <ResultTypeBadge type="bus" />
              <h3 className="text-lg font-bold text-slate-900">
                {result.operator}
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
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">
                {result.arrivalTime}
              </p>
              <p className="text-xs text-slate-500">Arrive</p>
            </div>
          </div>

          <ul className="flex flex-wrap gap-2">
            {result.amenities.map((amenity) => (
              <li
                key={amenity}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
              >
                {amenity}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3">
            <p className="text-sm text-slate-500">One-way · per person</p>
            <div className="flex items-center gap-3">
              <ResultPrice
                price={result.price}
                currency={result.currency}
                suffix="total"
              />
              <Button
                className="shrink-0 px-4 py-2"
                aria-label={`Book bus with ${result.operator}`}
              >
                Book bus
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
