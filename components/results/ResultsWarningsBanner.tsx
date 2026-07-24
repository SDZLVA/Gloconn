import type { SearchResponseWarning } from "@/types/models/search-response";
import { PROVIDER_UNAVAILABLE_WARNING_MESSAGE } from "@/lib/api/searchMappers";
import { cn } from "@/lib/utils";

type ResultsWarningsBannerProps = {
  warnings: SearchResponseWarning[];
  className?: string;
};

/**
 * Shows a safe, provider-agnostic banner when some search domains failed.
 * Deduplicates identical messages so users see one clear notice.
 */
export function ResultsWarningsBanner({
  warnings,
  className,
}: ResultsWarningsBannerProps) {
  if (warnings.length === 0) {
    return null;
  }

  const messages = Array.from(
    new Set(
      warnings.map(
        (warning) => warning.message || PROVIDER_UNAVAILABLE_WARNING_MESSAGE,
      ),
    ),
  );

  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm shadow-amber-100/60 sm:px-5",
        className,
      )}
      role="status"
    >
      <div className="flex gap-3">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>
        <div className="min-w-0 space-y-1">
          <p className="font-semibold tracking-tight">Partial results</p>
          {messages.map((message) => (
            <p key={message} className="leading-relaxed text-amber-900/90">
              {message}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
