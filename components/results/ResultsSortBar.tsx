import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { SortOption } from "@/types/results";
import { SORT_OPTIONS } from "@/types/results";

type ResultsSortBarProps = {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
  /** When provided, renders a breakdown such as "12 flights · 8 hotels". */
  flightCount?: number;
  hotelCount?: number;
  /** When true, count text is muted (e.g. while loading). */
  isLoading?: boolean;
  className?: string;
};

/**
 * Builds a compact type-breakdown string for display.
 * Only includes types that have at least one result.
 * Returns null when no breakdown is meaningful.
 */
export function formatResultCountBreakdown(
  flightCount: number | undefined,
  hotelCount: number | undefined,
): string | null {
  const parts: string[] = [];
  if (typeof flightCount === "number" && flightCount > 0) {
    parts.push(`${flightCount} ${flightCount === 1 ? "flight" : "flights"}`);
  }
  if (typeof hotelCount === "number" && hotelCount > 0) {
    parts.push(`${hotelCount} ${hotelCount === 1 ? "hotel" : "hotels"}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** Sort dropdown and result count above the results list. */
export function ResultsSortBar({
  sortBy,
  onSortChange,
  resultCount,
  flightCount,
  hotelCount,
  isLoading = false,
  className,
}: ResultsSortBarProps) {
  const breakdown = formatResultCountBreakdown(flightCount, hotelCount);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm shadow-slate-200/30 sm:flex-row sm:items-center sm:justify-between sm:px-5",
        className,
      )}
    >
      <div
        className={cn(
          "text-sm font-medium text-slate-600",
          isLoading && "text-slate-400",
        )}
      >
        {isLoading ? (
          <span>Searching…</span>
        ) : (
          <span>
            <span className="font-bold text-slate-900">{resultCount}</span>{" "}
            {resultCount === 1 ? "result" : "results"} found
            {breakdown && (
              <span className="ml-2 text-slate-400">({breakdown})</span>
            )}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="sort-results" className="text-sm font-medium text-slate-600">
          Sort by
        </label>
        <select
          id="sort-results"
          value={sortBy}
          disabled={isLoading}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
          className={cn(
            "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 disabled:cursor-not-allowed disabled:opacity-60",
            focusRing,
          )}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
