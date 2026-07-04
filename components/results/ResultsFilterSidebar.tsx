import { focusRing, formLabel } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ResultType, ResultsFilters } from "@/types/results";
import { DEFAULT_RESULTS_FILTERS, RESULT_TYPE_LABELS } from "@/types/results";

const ALL_TYPES: ResultType[] = ["hotel", "flight", "bus", "train"];

const RATING_OPTIONS = [
  { value: 0, label: "Any rating" },
  { value: 3, label: "3+ stars" },
  { value: 4, label: "4+ stars" },
  { value: 4.5, label: "4.5+ stars" },
];

type ResultsFilterSidebarProps = {
  filters: ResultsFilters;
  onFiltersChange: (filters: ResultsFilters) => void;
  priceRange: { min: number; max: number };
  className?: string;
};

/** Sidebar with transport type, price, and rating filters. */
export function ResultsFilterSidebar({
  filters,
  onFiltersChange,
  priceRange,
  className,
}: ResultsFilterSidebarProps) {
  function toggleType(type: ResultType) {
    const types = filters.types.includes(type)
      ? filters.types.filter((item) => item !== type)
      : [...filters.types, type];

    onFiltersChange({
      ...filters,
      types: types.length > 0 ? types : [type],
    });
  }

  function clearFilters() {
    onFiltersChange({
      ...DEFAULT_RESULTS_FILTERS,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    });
  }

  return (
    <Card className={cn("p-4 sm:p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">Filters</h2>
        <button
          type="button"
          onClick={clearFilters}
          className={cn(
            "text-xs font-semibold text-brand-700 underline-offset-2 hover:underline",
            focusRing,
          )}
        >
          Clear all
        </button>
      </div>

      <div className="mt-5 space-y-6">
        <fieldset>
          <legend className={formLabel}>Transport type</legend>
          <ul className="mt-3 space-y-2">
            {ALL_TYPES.map((type) => (
              <li key={type}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={filters.types.includes(type)}
                    onChange={() => toggleType(type)}
                    className={cn(
                      "h-4 w-4 rounded border-slate-300 text-brand-700",
                      focusRing,
                    )}
                  />
                  {RESULT_TYPE_LABELS[type]}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <div>
          <label htmlFor="min-price" className={formLabel}>
            Price range
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="min-price" className="sr-only">
                Minimum price
              </label>
              <input
                id="min-price"
                type="number"
                min={priceRange.min}
                max={filters.maxPrice}
                value={filters.minPrice}
                onChange={(event) =>
                  onFiltersChange({
                    ...filters,
                    minPrice: Number(event.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
              />
            </div>
            <div>
              <label htmlFor="max-price" className="sr-only">
                Maximum price
              </label>
              <input
                id="max-price"
                type="number"
                min={filters.minPrice}
                max={priceRange.max}
                value={filters.maxPrice}
                onChange={(event) =>
                  onFiltersChange({
                    ...filters,
                    maxPrice: Number(event.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="min-rating" className={formLabel}>
            Minimum rating
          </label>
          <select
            id="min-rating"
            value={filters.minRating}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                minRating: Number(event.target.value),
              })
            }
            className={cn(
              "mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800",
              focusRing,
            )}
          >
            {RATING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}

type MobileFilterToggleProps = {
  isOpen: boolean;
  onToggle: () => void;
  activeFilterCount: number;
};

/** Mobile button to show/hide the filter sidebar. */
export function MobileFilterToggle({
  isOpen,
  onToggle,
  activeFilterCount,
}: MobileFilterToggleProps) {
  return (
    <Button
      variant="secondary"
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="w-full lg:hidden"
    >
      {isOpen ? "Hide filters" : "Show filters"}
      {activeFilterCount > 0 && ` (${activeFilterCount})`}
    </Button>
  );
}
