import { focusRing } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { SortOption } from "@/types/results";
import { SORT_OPTIONS } from "@/types/results";

type ResultsSortBarProps = {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
  className?: string;
};

/** Sort dropdown and result count above the results list. */
export function ResultsSortBar({
  sortBy,
  onSortChange,
  resultCount,
  className,
}: ResultsSortBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm font-medium text-slate-600">
        <span className="font-bold text-slate-900">{resultCount}</span>{" "}
        {resultCount === 1 ? "result" : "results"} found
      </p>

      <div className="flex items-center gap-2">
        <label htmlFor="sort-results" className="text-sm font-medium text-slate-600">
          Sort by
        </label>
        <select
          id="sort-results"
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
          className={cn(
            "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800",
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
