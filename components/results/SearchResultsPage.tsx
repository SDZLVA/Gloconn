"use client";

import { useEffect, useMemo, useState } from "react";
import { filterResults } from "@/lib/results/filter";
import { getResultsForSearch } from "@/lib/results";
import { sortResults } from "@/lib/results/sort";
import {
  MobileFilterToggle,
  ResultsFilterSidebar,
} from "@/components/results/ResultsFilterSidebar";
import { ResultsList } from "@/components/results/ResultsList";
import { ResultsSortBar } from "@/components/results/ResultsSortBar";
import { ResultsSummaryBar } from "@/components/results/ResultsSummaryBar";
import { SectionHeading } from "@/components/ui/SectionHeading";
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

  const allResults = useMemo(
    () =>
      getResultsForSearch(
        search.destination ?? "",
        search.travelStyle ?? "standard",
      ),
    [search.destination, search.travelStyle],
  );

  const priceRange = useMemo(() => {
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

  return (
    <div className="space-y-6">
      <SectionHeading
        as="h1"
        title={`Results for ${destination}`}
        description="Compare hotels, flights, buses, and trains — all mock data for now."
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
            resultCount={sorted.length}
          />
          <ResultsList results={sorted} />
        </div>
      </div>
    </div>
  );
}
