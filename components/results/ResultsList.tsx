import { ResultCard } from "@/components/results/ResultCard";
import { ResultsEmptyState } from "@/components/results/ResultsEmptyState";
import { groupBrowseResults } from "@/lib/results/browseResults";
import type { TripType } from "@/types/models/search-request";
import type { SearchResult } from "@/types/results";

type ResultsListProps = {
  results: SearchResult[];
  /** Shown when filters hide every result. */
  destination?: string;
  editSearchHref?: string;
  onClearFilters?: () => void;
  /** Drives flight card one-way / round-trip wording. */
  tripType?: TripType;
};

type BrowseSectionProps = {
  title: string;
  headingId: string;
  results: SearchResult[];
  tripType?: TripType;
  listAriaLabel: string;
};

function BrowseSection({
  title,
  headingId,
  results,
  tripType,
  listAriaLabel,
}: BrowseSectionProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3" aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
      >
        {title}
      </h2>
      <ul className="flex flex-col gap-4" aria-label={listAriaLabel}>
        {results.map((result) => (
          <li key={result.id}>
            <ResultCard result={result} tripType={tripType} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Renders browse sections for flights and hotels, or a filter-empty state.
 * Sprint 14.3: "Browse Flights" / "Browse Hotels" hierarchy under packages.
 */
export function ResultsList({
  results,
  destination,
  editSearchHref,
  onClearFilters,
  tripType,
}: ResultsListProps) {
  if (results.length === 0) {
    return (
      <ResultsEmptyState
        variant="no-matches"
        destination={destination}
        editSearchHref={editSearchHref}
        onClearFilters={onClearFilters}
      />
    );
  }

  const { flights, hotels } = groupBrowseResults(results);

  return (
    <div className="flex flex-col gap-8">
      <BrowseSection
        title="Browse Flights"
        headingId="browse-flights-heading"
        results={flights}
        tripType={tripType}
        listAriaLabel="Flight results"
      />
      <BrowseSection
        title="Browse Hotels"
        headingId="browse-hotels-heading"
        results={hotels}
        tripType={tripType}
        listAriaLabel="Hotel results"
      />
    </div>
  );
}
