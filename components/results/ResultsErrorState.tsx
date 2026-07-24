import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";

type ResultsErrorStateProps = {
  /** Safe, user-facing error message (already mapped for display). */
  message: string;
  /** Increments a retry key so the page re-runs the existing search query. */
  onRetry?: () => void;
  /** Home search URL so the user can change criteria. */
  editSearchHref?: string;
  className?: string;
};

/**
 * Error state for failed search loads.
 * Presentation only — callers pass a safe message and optional retry action.
 */
export function ResultsErrorState({
  message,
  onRetry,
  editSearchHref,
  className,
}: ResultsErrorStateProps) {
  return (
    <div role="alert" className={className}>
      <Card
        className={cn(
          "border-red-200/80 bg-gradient-to-b from-white to-red-50/40 p-8 text-center sm:p-10",
        )}
      >
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600"
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
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5" />
            <path d="M12 16h.01" />
          </svg>
        </div>

        <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          Could not load results
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
          {message}
        </p>

        <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          {onRetry && (
            <Button type="button" variant="primary" onClick={onRetry}>
              Try again
            </Button>
          )}

          {editSearchHref && (
            <Link
              href={editSearchHref}
              className={cn(
                "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold tracking-wide text-slate-700 motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-slate-300 motion-safe:hover:bg-slate-50 motion-safe:hover:shadow-sm",
                focusRing,
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
