import Link from "next/link";
import { formatTravelDatesSummary } from "@/lib/search";
import { formatPassengersSummary } from "@/lib/search/passengers";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import type { SearchData } from "@/types/search";

type ResultsSummaryBarProps = {
  search: Partial<SearchData>;
};

const styleLabels = {
  budget: "Budget",
  standard: "Standard",
  luxury: "Luxury",
} as const;

/** Recap of the active search criteria above the results list. */
export function ResultsSummaryBar({ search }: ResultsSummaryBarProps) {
  const destination = search.destination || "Paris, France";
  const tripType = search.tripType ?? "round-trip";
  const dates = formatTravelDatesSummary(
    tripType,
    search.departureDate ?? "",
    search.returnDate ?? "",
  );
  const travelers = search.travelers
    ? formatPassengersSummary(search.travelers)
    : "2 adults · 1 room";
  const style = search.travelStyle
    ? styleLabels[search.travelStyle]
    : "Standard";

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Your search
          </p>
          <p className="text-lg font-bold text-slate-900">{destination}</p>
          <p className="text-sm text-slate-600">
            {dates} · {travelers} · {style}
          </p>
        </div>
        <Link
          href="/"
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold tracking-wide text-slate-700 motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-slate-300 motion-safe:hover:bg-slate-50 motion-safe:hover:shadow-sm",
            focusRing,
          )}
        >
          Edit search
        </Link>
      </div>
    </Card>
  );
}
