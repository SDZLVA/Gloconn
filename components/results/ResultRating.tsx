import { cn } from "@/lib/utils";

type ResultRatingProps = {
  rating: number;
  className?: string;
};

/**
 * Star rating display for result cards.
 *
 * Renders nothing when there is no real rating. Live flight sources
 * (Google Flights via SerpAPI, Aviasales) have no airline ratings and
 * report 0; showing "★ 0.0" would read as a terrible review.
 */
export function ResultRating({ rating, className }: ResultRatingProps) {
  if (!Number.isFinite(rating) || rating <= 0) {
    return null;
  }

  return (
    <span
      aria-label={`Rating ${rating.toFixed(1)} out of 5`}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-0.5 text-sm font-semibold text-brand-800",
        className,
      )}
    >
      <span aria-hidden="true">★</span>
      <span aria-hidden="true">{rating.toFixed(1)}</span>
    </span>
  );
}
