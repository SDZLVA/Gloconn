import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

type ResultsHeaderProps = {
  destination?: string;
  origin?: string;
  className?: string;
};

/**
 * Page header for search results.
 * Provider-agnostic copy — no mention of mock or live data sources.
 */
export function ResultsHeader({
  destination,
  origin,
  className,
}: ResultsHeaderProps) {
  const place = destination?.trim() || "your trip";
  const from = origin?.trim();

  // Prefer "to" over "→" so the page title is clear to screen readers.
  const title = from
    ? `${from} to ${place}`
    : `Results for ${place}`;

  const description = from
    ? "Compare hotels, flights, and ground transport for your trip."
    : "Compare hotels, flights, buses, and trains side by side.";

  return (
    <header className={cn("space-y-1", className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
        Search results
      </p>
      <SectionHeading as="h1" title={title} description={description} />
    </header>
  );
}
