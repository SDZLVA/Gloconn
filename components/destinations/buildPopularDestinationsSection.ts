import type { AutocompleteSection } from "@/components/ui/autocomplete-types";
import { destinationToAutocompleteOption } from "@/lib/destinations";
import {
  getPopularDestinations,
  POPULAR_DESTINATIONS_HEADING,
} from "@/lib/destinations/popularDestinations";

/** Builds an autocomplete section for the empty input state. Returns null when none remain. */
export function buildPopularDestinationsSection(
  excludeIds?: ReadonlySet<string>,
): AutocompleteSection | null {
  const destinations = getPopularDestinations(excludeIds);

  if (destinations.length === 0) {
    return null;
  }

  return {
    id: "popular",
    heading: POPULAR_DESTINATIONS_HEADING,
    options: destinations.map(destinationToAutocompleteOption),
  };
}
