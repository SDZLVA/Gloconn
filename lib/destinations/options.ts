/**
 * Client-side autocomplete option builders for destinations.
 * Keeps provider helpers untouched — presentation-only enrichment.
 */

import type { AutocompleteOption } from "@/components/ui/autocomplete-types";
import type { Destination } from "@/types/destination";

function formatDestinationSearchLabel(destination: Destination): string {
  return `${destination.name}, ${destination.country}`;
}

/**
 * Autocomplete option with region + IATA in the description when available.
 * Example: "Europe · CDG"
 */
export function destinationToSearchOption(
  destination: Destination,
): AutocompleteOption {
  const parts = [destination.region];
  if (destination.iataCode) {
    parts.push(destination.iataCode);
  }

  return {
    id: destination.id,
    label: formatDestinationSearchLabel(destination),
    description: parts.filter(Boolean).join(" · "),
  };
}
