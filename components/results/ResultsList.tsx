import { ResultCard } from "@/components/results/ResultCard";
import { ResultsEmptyState } from "@/components/results/ResultsEmptyState";
import { RoundTripFlightPicker } from "@/components/results/RoundTripFlightPicker";
import { groupBrowseResults } from "@/lib/results/browseResults";
import { canPickDepartureAndReturn } from "@/lib/results/flightPairs";
import type { FlightLinksResolver } from "@/lib/affiliate/exactFlightLinks";
import type { TripType } from "@/types/models/search-request";
import type { FlightResult, SearchResult } from "@/types/results";

type ResultsListProps = {
  results: SearchResult[];
  /** Shown when filters hide every result. */
  destination?: string;
  editSearchHref?: string;
  onClearFilters?: () => void;
  /** Drives flight card one-way / round-trip wording. */
  tripType?: TripType;
  /** Task 4 (Sprint 15.3): route context for flight cards. */
  originIata?: string | null;
  destinationIata?: string | null;
  /** Milestone 19: partner link for flight cards. */
  getFlightLinks?: FlightLinksResolver;
};

type BrowseSectionProps = {
  title: string;
  headingId: string;
  results: SearchResult[];
  tripType?: TripType;
  listAriaLabel: string;
  originIata?: string | null;
  destinationIata?: string | null;
  getFlightLinks?: FlightLinksResolver;
};

function BrowseSection({
  title,
  headingId,
  results,
  tripType,
  listAriaLabel,
  originIata,
  destinationIata,
  getFlightLinks,
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
            <ResultCard
              result={result}
              tripType={tripType}
              originIata={originIata}
              destinationIata={destinationIata}
              getFlightLinks={getFlightLinks}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Renders browse sections for flights and hotels, or a filter-empty state.
 * Task 4 (Sprint 15.3): threads originIata/destinationIata to flight cards.
 */
export function ResultsList({
  results,
  destination,
  editSearchHref,
  onClearFilters,
  tripType,
  originIata,
  destinationIata,
  getFlightLinks,
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
  const flightResults = flights.filter(
    (result): result is FlightResult => result.type === "flight",
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Milestone 20: round trips are picked as departure → return. */}
      {canPickDepartureAndReturn(flightResults, tripType) ? (
        <RoundTripFlightPicker
          flights={flightResults}
          originIata={originIata}
          destinationIata={destinationIata}
          getFlightLinks={getFlightLinks}
        />
      ) : (
        <BrowseSection
          title="Browse Flights"
          headingId="browse-flights-heading"
          results={flights}
          tripType={tripType}
          listAriaLabel="Flight results"
          originIata={originIata}
          destinationIata={destinationIata}
          getFlightLinks={getFlightLinks}
        />
      )}
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
