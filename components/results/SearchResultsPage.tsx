"use client";

import { useEffect, useMemo, useState } from "react";
import { filterResults } from "@/lib/results/filter";
import { sortResults } from "@/lib/results/sort";
import { getApiErrorMessage } from "@/lib/api";
import { searchTrips } from "@/lib/services/searchService";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import {
  MobileFilterToggle,
  ResultsFilterSidebar,
} from "@/components/results/ResultsFilterSidebar";
import { ResultsList } from "@/components/results/ResultsList";
import { ResultsSortBar } from "@/components/results/ResultsSortBar";
import { ResultsSummaryBar } from "@/components/results/ResultsSummaryBar";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { SearchData } from "@/types/search";
import {
  DEFAULT_RESULTS_FILTERS,
  type ResultsFilters,
  type SortOption,
} from "@/types/results";

type SearchResultsPageProps = {
  search: Partial<SearchData>;
};

function countActiveFilters(
  filters: ResultsFilters,
  defaults: ResultsFilters,
): number {
  let count = 0;
  if (filters.types.length < defaults.types.length) count += 1;
  if (filters.minPrice > defaults.minPrice) count += 1;
  if (filters.maxPrice < defaults.maxPrice) count += 1;
  if (filters.minRating > defaults.minRating) count += 1;
  return count;
}

/** Client orchestrator for the search results page. */
export function SearchResultsPage({ search }: SearchResultsPageProps) {
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const resultsState = useServiceQuery(
    () => searchTrips(search),
    [search],
  );

  const allResults = resultsState.data ?? [];

  const priceRange = useMemo(() => {
    if (allResults.length === 0) {
      return { min: 0, max: 10_000 };
    }

    const prices = allResults.map((result) => result.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [allResults]);

  const defaultFilters = useMemo(
    (): ResultsFilters => ({
      ...DEFAULT_RESULTS_FILTERS,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    }),
    [priceRange],
  );

  const [filters, setFilters] = useState<ResultsFilters>(defaultFilters);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  const filtered = useMemo(
    () => filterResults(allResults, filters),
    [allResults, filters],
  );

  const sorted = useMemo(
    () => sortResults(filtered, sortBy),
    [filtered, sortBy],
  );

  const activeFilterCount = countActiveFilters(filters, defaultFilters);
  const destination = search.destination || "your destination";
  const isLoading = resultsState.status === "loading";
  const hasError = resultsState.status === "error" && resultsState.error;

  return (
    <div className="space-y-6">
      <SectionHeading
        as="h1"
        title={`Results for ${destination}`}
        description="Compare hotels, flights, buses, and trains — powered by the mock provider."
      />

      <ResultsSummaryBar search={search} />

      <MobileFilterToggle
        isOpen={filtersOpen}
        onToggle={() => setFiltersOpen((open) => !open)}
        activeFilterCount={activeFilterCount}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside
          className={cn(
            "lg:sticky lg:top-24",
            filtersOpen ? "block" : "hidden lg:block",
          )}
        >
          <ResultsFilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            priceRange={priceRange}
          />
        </aside>

        <div className="min-w-0 space-y-4">
          <ResultsSortBar
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultCount={isLoading ? 0 : sorted.length}
          />

          {isLoading && (
            <Card className="p-8 text-center">
              <p className="text-lg font-semibold text-slate-900">Loading results…</p>
              <p className="mt-2 text-sm text-slate-600">
                Searching for the best options at your destination.
              </p>
            </Card>
          )}

          {hasError && (
            <Card className="p-8 text-center">
              <p className="text-lg font-semibold text-slate-900">
                Could not load results
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {getApiErrorMessage(resultsState.error!)}
              </p>
            </Card>
          )}

          {!isLoading && !hasError && <ResultsList results={sorted} />}
        </div>
      </div>
    </div>
  );
}
