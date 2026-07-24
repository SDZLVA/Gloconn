import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

type ResultsEmptyStateProps = {
  /**
   * `no-results` — the search returned nothing.
   * `no-matches` — results exist but filters hide them all.
   */
  variant: "no-results" | "no-matches";
  destination?: string;
  /** Clears active filters (used for the no-matches variant). */
  onClearFilters?: () => void;
  /** Home search URL so the user can edit criteria. */
  editSearchHref?: string;
  className?: string;
};

/**
 * Empty state for the results list.
 * Keeps messaging calm and actionable — no provider or technical jargon.
 */
export function ResultsEmptyState({
  variant,
  destination,
  onClearFilters,
  editSearchHref,
  className,
}: ResultsEmptyStateProps) {
  const isFilterEmpty = variant === "no-matches";
  const place = destination?.trim() || "your destination";

  const title = isFilterEmpty
    ? "No results match your filters"
    : `No options found for ${place}`;

  const description = isFilterEmpty
    ? "Try widening the price range, lowering the minimum rating, or including more result types."
    : "Try different dates, a nearby city, or adjusting travelers and budget in your search.";

  return (
    <div role="status" className={className}>
      <Card
        className={cn(
          "border-dashed border-slate-300/80 bg-gradient-to-b from-white to-slate-50/80 p-8 text-center sm:p-10",
        )}
      >
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
        </div>

        <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
          {description}
        </p>

        <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          {isFilterEmpty && onClearFilters && (
            <Button type="button" variant="primary" onClick={onClearFilters}>
              Clear filters
            </Button>
          )}

          {editSearchHref && (
            <Link
              href={editSearchHref}
              className={cn(
                "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold tracking-wide motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:-translate-y-0.5",
                focusRing,
                isFilterEmpty
                  ? "border border-slate-200 bg-white text-slate-700 motion-safe:hover:border-slate-300 motion-safe:hover:bg-slate-50 motion-safe:hover:shadow-sm"
                  : "bg-brand-700 text-white shadow-md shadow-brand-700/20 motion-safe:hover:bg-brand-800 motion-safe:hover:shadow-lg",
              )}
            >
              Edit search
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
