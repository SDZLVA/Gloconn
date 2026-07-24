import { ResultCard } from "@/components/results/ResultCard";
import { ResultsEmptyState } from "@/components/results/ResultsEmptyState";
import type { SearchResult } from "@/types/results";

type ResultsListProps = {
  results: SearchResult[];
  /** Shown when filters hide every result. */
  destination?: string;
  editSearchHref?: string;
  onClearFilters?: () => void;
};

/** Renders a vertical list of result cards, or a filter-empty state. */
export function ResultsList({
  results,
  destination,
  editSearchHref,
  onClearFilters,
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

  return (
    <ul className="flex flex-col gap-4" aria-label="Search results">
      {results.map((result) => (
        <li key={result.id}>
          <ResultCard result={result} />
        </li>
      ))}
    </ul>
  );
}
