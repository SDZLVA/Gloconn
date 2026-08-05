"use client";

import { useCallback, useMemo, useState } from "react";
import {
  collectFilterFacets,
  countActiveFilters,
  filterResults,
} from "@/lib/results/filter";
import { filterMvpVisibleResults } from "@/lib/results/mvpUi";
import { sortResults } from "@/lib/results/sort";
import { getApiErrorMessage, postSearchTrips } from "@/lib/api";
import { clearCachedSearchResult } from "@/lib/api/searchResultCache";
import { searchResponseToResults } from "@/lib/api/searchMappers";
import { buildHomeSearchUrlFromRequest } from "@/lib/search/params";
import { buildSearchCacheKey } from "@/lib/search/cacheKey";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import {
  MobileFilterToggle,
  ResultsFilterSidebar,
} from "@/components/results/ResultsFilterSidebar";
import { RecommendedPackagesSection } from "@/components/results/RecommendedPackagesSection";
import { ResultsEmptyState } from "@/components/results/ResultsEmptyState";
import { ResultsErrorState } from "@/components/results/ResultsErrorState";
import { ResultsHeader } from "@/components/results/ResultsHeader";
import { ResultsList } from "@/components/results/ResultsList";
import { ResultsLoadingSkeleton } from "@/components/results/ResultsLoadingSkeleton";
import { ResultsSortBar } from "@/components/results/ResultsSortBar";
import { ResultsSummaryBar } from "@/components/results/ResultsSummaryBar";
import { ResultsWarningsBanner } from "@/components/results/ResultsWarningsBanner";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchResponseWarning } from "@/types/models/search-response";
import type { TravelPackage } from "@/types/models/travel-package";
import {
  DEFAULT_RESULTS_FILTERS,
  type ResultsFilters,
  type SearchResult,
  type SortOption,
} from "@/types/results";

type SearchResultsPageProps = {
  search: Partial<SearchRequest>;
};

/** Stable empty list so loading renders do not churn filter defaults. */
const EMPTY_RESULTS: SearchResult[] = [];
const EMPTY_WARNINGS: SearchResponseWarning[] = [];
const EMPTY_PACKAGES: TravelPackage[] = [];

function filtersBaselineKey(
  searchKey: string,
  defaults: ResultsFilters,
): string {
  return `${searchKey}|${defaults.minPrice}|${defaults.maxPrice}`;
}

/** Client orchestrator for the search results page (presentation + existing query). */
export function SearchResultsPage({ search }: SearchResultsPageProps) {
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);
  /** Bumps the query deps so "Try again" re-runs the same search (bypass cache). */
  const [retryCount, setRetryCount] = useState(0);

  // Stable key — productTypes order / object key order must not cause refetches.
  const searchKey = useMemo(() => buildSearchCacheKey(search), [search]);
  const editSearchHref = useMemo(
    () => buildHomeSearchUrlFromRequest(search),
    [search],
  );
  const budgetAmount = search.budget?.amount ?? null;

  const resultsState = useServiceQuery(
    () => postSearchTrips(search),
    [searchKey, retryCount],
  );

  const allResults = useMemo(() => {
    if (!resultsState.data) {
      return EMPTY_RESULTS;
    }
    // Sprint 14.2 MVP: hide bus/train from the results surface (providers unchanged).
    return filterMvpVisibleResults(
      searchResponseToResults(resultsState.data),
    );
  }, [resultsState.data]);

  const packages = resultsState.data?.packages ?? EMPTY_PACKAGES;

  const warnings = resultsState.data?.warnings ?? EMPTY_WARNINGS;

  // Facets / filter / sort only recompute when their inputs change (already memoized).
  const facets = useMemo(
    () => collectFilterFacets(allResults),
    [allResults],
  );

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

  const nextBaselineKey = filtersBaselineKey(searchKey, defaultFilters);
  const [filters, setFilters] = useState<ResultsFilters>(defaultFilters);
  const [baselineKey, setBaselineKey] = useState(nextBaselineKey);

  // Reset filters when the search or result price bounds change.
  if (baselineKey !== nextBaselineKey) {
    setBaselineKey(nextBaselineKey);
    setFilters(defaultFilters);
  }

  const filtered = useMemo(
    () => filterResults(allResults, filters),
    [allResults, filters],
  );

  const sorted = useMemo(
    () => sortResults(filtered, sortBy, { budgetAmount }),
    [filtered, sortBy, budgetAmount],
  );

  const activeFilterCount = countActiveFilters(filters, defaultFilters);
  const destination = search.destination || "your destination";

  // Perceived performance: only show the full skeleton when we have no data yet.
  // Cache hits / keepPreviousData keep prior results visible during brief loading.
  const hasData = resultsState.data != null;
  const isLoading =
    resultsState.status === "loading" || resultsState.status === "idle";
  const showSkeleton = isLoading && !hasData;
  const hasError = resultsState.status === "error" && resultsState.error;
  const hasSuccess = resultsState.status === "success" || (isLoading && hasData);
  const hasNoResults =
    resultsState.status === "success" && allResults.length === 0;
  const showResultsChrome = showSkeleton || hasSuccess || hasData;

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  const handleRetry = useCallback(() => {
    // Drop the cached entry so "Try again" always hits the network.
    clearCachedSearchResult(search);
    setRetryCount((count) => count + 1);
  }, [search]);

  const handleToggleFilters = useCallback(() => {
    setFiltersOpen((open) => !open);
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <ResultsHeader destination={search.destination} origin={search.origin} />

      <ResultsSummaryBar search={search} />

      {hasError && (
        <ResultsErrorState
          message={getApiErrorMessage(resultsState.error!)}
          editSearchHref={editSearchHref}
          onRetry={handleRetry}
        />
      )}

      {resultsState.status === "success" && warnings.length > 0 && (
        <ResultsWarningsBanner warnings={warnings} />
      )}

      {showResultsChrome && (
        <>
          <MobileFilterToggle
            isOpen={filtersOpen}
            onToggle={handleToggleFilters}
            activeFilterCount={activeFilterCount}
            controlsId="results-filters-panel"
          />

          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside
              id="results-filters-panel"
              className={cn(
                "lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto",
                filtersOpen ? "block" : "hidden lg:block",
              )}
            >
              {hasData ? (
                <ResultsFilterSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  priceRange={priceRange}
                  facets={facets}
                />
              ) : (
                <Card className="space-y-4 p-4 sm:p-5" aria-hidden="true">
                  <div className="h-5 w-20 animate-pulse rounded-lg bg-slate-200/80 motion-reduce:animate-none" />
                  <div className="space-y-2">
                    <div className="h-4 w-28 animate-pulse rounded-lg bg-slate-200/80 motion-reduce:animate-none" />
                    <div className="h-4 w-24 animate-pulse rounded-lg bg-slate-200/80 motion-reduce:animate-none" />
                    <div className="h-4 w-20 animate-pulse rounded-lg bg-slate-200/80 motion-reduce:animate-none" />
                  </div>
                  <div className="h-16 w-full animate-pulse rounded-xl bg-slate-200/80 motion-reduce:animate-none" />
                </Card>
              )}
            </aside>

            <div className="min-w-0 space-y-4">
              {!showSkeleton && (
                <ResultsSortBar
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  resultCount={sorted.length}
                  isLoading={isLoading && hasData}
                />
              )}

              {showSkeleton && <ResultsLoadingSkeleton />}

              {hasNoResults && (
                <ResultsEmptyState
                  variant="no-results"
                  destination={destination}
                  editSearchHref={editSearchHref}
                />
              )}

              {hasData && !hasNoResults && (
                <>
                  <RecommendedPackagesSection packages={packages} />
                  <ResultsList
                    results={sorted}
                    destination={destination}
                    editSearchHref={editSearchHref}
                    onClearFilters={clearFilters}
                    tripType={search.tripType}
                  />
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
