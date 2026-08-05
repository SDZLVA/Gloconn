import Link from "next/link";
import { formatTravelDatesSummary } from "@/lib/search";
import { buildHomeSearchUrlFromRequest } from "@/lib/search/params";
import { formatPassengersSummary } from "@/lib/search/passengers";
import { normalizeProductTypes } from "@/lib/search/productTypes";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { SaveTripButton } from "@/components/trips/SaveTripButton";
import { Card } from "@/components/ui/Card";
import type {
  SearchProductType,
  SearchRequest,
} from "@/types/models/search-request";

type ResultsSummaryBarProps = {
  search: Partial<SearchRequest>;
};

const productTypeLabels: Record<SearchProductType, string> = {
  hotels: "Stays",
  flights: "Flights",
  transport: "Transport",
};

/** Builds a short chip label for one search fact. */
function SummaryChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

/** Recap of the active search criteria above the results list. */
export function ResultsSummaryBar({ search }: ResultsSummaryBarProps) {
  const destination = search.destination?.trim() || "Your destination";
  const origin = search.origin?.trim();
  const tripType = search.tripType ?? "round-trip";
  const dates = formatTravelDatesSummary(
    tripType,
    search.departureDate ?? "",
    search.returnDate ?? "",
  );
  const travelers = search.travelers
    ? formatPassengersSummary(search.travelers, { includeRooms: false })
    : "2 Adults";
  const productTypes = normalizeProductTypes(search.productTypes).filter(
    (type) => type === "hotels" || type === "flights",
  );
  const lookingFor = productTypes
    .map((type) => productTypeLabels[type])
    .join(" · ");

  const budgetLabel =
    search.budget != null
      ? `Up to ${search.budget.currency} ${search.budget.amount.toLocaleString("en-US")}`
      : null;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-100 bg-gradient-to-r from-brand-50/80 via-white to-white px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Your search
              </p>
              <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {origin ? (
                  <>
                    <span className="text-slate-700">{origin}</span>
                    <span className="sr-only"> to </span>
                    <span className="mx-2 text-slate-400" aria-hidden="true">
                      →
                    </span>
                    <span>{destination}</span>
                  </>
                ) : (
                  destination
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <SummaryChip>{dates}</SummaryChip>
              <SummaryChip>{travelers}</SummaryChip>
              {lookingFor && <SummaryChip>{lookingFor}</SummaryChip>}
              {budgetLabel && <SummaryChip>{budgetLabel}</SummaryChip>}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-stretch xl:flex-row">
            <SaveTripButton search={search} />
            <Link
              href={buildHomeSearchUrlFromRequest(search)}
              className={cn(
                "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold tracking-wide text-slate-700 motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-slate-300 motion-safe:hover:bg-slate-50 motion-safe:hover:shadow-sm",
                focusRing,
              )}
            >
              Edit search
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
