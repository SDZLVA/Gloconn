import { ResultCard } from "@/components/results/ResultCard";
import { Card } from "@/components/ui/Card";
import type { SearchResult } from "@/types/results";

type ResultsListProps = {
  results: SearchResult[];
};

/** Renders a vertical list of result cards. */
export function ResultsList({ results }: ResultsListProps) {
  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg font-semibold text-slate-900">No results match your filters</p>
        <p className="mt-2 text-sm text-slate-600">
          Try adjusting the transport type, price range, or minimum rating.
        </p>
      </Card>
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
