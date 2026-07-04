import { formatTravelDatesSummary } from "@/lib/search";
import type { SearchData } from "@/types/search";
import type { SavedTrip, SavedTripRow } from "@/types/trips";

/** Converts a database row into the app's SavedTrip type. */
export function mapSavedTripRow(row: SavedTripRow): SavedTrip {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    searchData: row.search_data,
    createdAt: row.created_at,
  };
}

/** Builds a short title from search criteria (e.g. "Paris, France · Mar 12–18"). */
export function buildTripTitle(search: Partial<SearchData>): string {
  const destination = search.destination?.trim() || "Untitled trip";
  const tripType = search.tripType ?? "round-trip";

  if (!search.departureDate) {
    return destination;
  }

  const dates = formatTravelDatesSummary(
    tripType,
    search.departureDate,
    search.returnDate ?? "",
  );

  return `${destination} · ${dates}`;
}

/** Formats a saved trip's created date for display. */
export function formatSavedTripDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}
