import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type ResultsLoadingSkeletonProps = {
  /** Number of placeholder result cards to show. */
  count?: number;
  className?: string;
};

/** Soft pulse block used inside skeleton cards. */
function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/80 motion-reduce:animate-none",
        className,
      )}
    />
  );
}

/** One placeholder card that mirrors a real result card layout. */
function ResultCardSkeleton() {
  return (
    <Card className="overflow-hidden" aria-hidden="true">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
        <SkeletonBlock className="h-36 w-full sm:h-auto sm:min-h-[8.5rem] sm:w-36" />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-5 w-16" />
              <SkeletonBlock className="h-6 w-48 max-w-full sm:w-64" />
              <SkeletonBlock className="h-4 w-36 max-w-full" />
            </div>
            <SkeletonBlock className="h-8 w-14" />
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
            <SkeletonBlock className="h-4 w-28" />
            <div className="space-y-2 text-right">
              <SkeletonBlock className="ml-auto h-7 w-20" />
              <SkeletonBlock className="ml-auto h-9 w-24" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Professional loading skeletons for the search results list.
 * Presentation only — does not fetch or transform data.
 */
export function ResultsLoadingSkeleton({
  count = 4,
  className,
}: ResultsLoadingSkeletonProps) {
  return (
    <div
      className={cn("space-y-4", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="sr-only">Loading search results…</p>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm shadow-slate-200/30">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-9 w-36" />
      </div>

      <ul className="flex flex-col gap-4" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>
            <ResultCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}
