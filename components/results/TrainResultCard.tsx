import { Card } from "@/components/ui/Card";
import { ResultDuration } from "@/components/results/ResultDuration";
import { ResultPlaceholderImage } from "@/components/results/ResultPlaceholderImage";
import { ResultPrice } from "@/components/results/ResultPrice";
import { ResultRating } from "@/components/results/ResultRating";
import { ResultTypeBadge } from "@/components/results/ResultTypeBadge";
import type { TrainResult } from "@/types/results";

type TrainResultCardProps = {
  result: TrainResult;
};

/**
 * Card displaying a train search result.
 * Kept for architecture; Sprint 14.2 MVP hides train results from the list.
 * Informational only — no fake booking CTA.
 */
export function TrainResultCard({ result }: TrainResultCardProps) {
  return (
    <Card hoverable className="overflow-hidden">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
        <ResultPlaceholderImage
          type="train"
          label={result.operator}
          className="h-28 w-full sm:h-auto sm:w-28"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <ResultTypeBadge type="train" />
                <span className="text-xs font-medium text-slate-500">
                  {result.trainClass}
                </span>
              </div>
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

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3">
            <p className="text-sm text-slate-500">One-way · per person</p>
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
