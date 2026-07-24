import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { SortOption } from "@/types/results";
import { SORT_OPTIONS } from "@/types/results";

type ResultsSortBarProps = {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
  /** When true, count text is muted (e.g. while loading). */
  isLoading?: boolean;
  className?: string;
};

/** Sort dropdown and result count above the results list. */
export function ResultsSortBar({
  sortBy,
  onSortChange,
  resultCount,
  isLoading = false,
  className,
}: ResultsSortBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm shadow-slate-200/30 sm:flex-row sm:items-center sm:justify-between sm:px-5",
        className,
      )}
    >
      <p
        className={cn(
          "text-sm font-medium text-slate-600",
          isLoading && "text-slate-400",
        )}
      >
        {isLoading ? (
          "Searching…"
        ) : (
          <>
            <span className="font-bold text-slate-900">{resultCount}</span>{" "}
            {resultCount === 1 ? "result" : "results"} found
          </>
        )}
      </p>

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
