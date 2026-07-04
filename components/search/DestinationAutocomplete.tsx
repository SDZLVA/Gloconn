"use client";

import { useMemo } from "react";
import {
  Autocomplete,
  type AutocompleteSection,
} from "@/components/ui/Autocomplete";
import { useRecentDestinationSearches } from "@/hooks/useRecentDestinationSearches";
import {
  destinationToAutocompleteOption,
  filterDestinations,
  getPopularDestinations,
  MOCK_DESTINATIONS,
} from "@/lib/destinations";

type DestinationAutocompleteProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
};

/**
 * DestinationAutocomplete — destination field with mock-data suggestions.
 *
 * Empty field: recent searches + popular destinations.
 * While typing: ranked search results from mock data (no API).
 * Wraps the reusable Autocomplete with Glooconn destination data.
 */
export function DestinationAutocomplete({
  id = "search-destination",
  value,
  onChange,
  error,
  required = false,
  className,
}: DestinationAutocompleteProps) {
  const { recentDestinations, addRecent, reloadRecent } = useRecentDestinationSearches();

  const query = value.trim();
  const isSearching = query.length > 0;

  const sections = useMemo(() => {
    if (isSearching) {
      const matches = filterDestinations(query);
      if (matches.length === 0) {
        return [];
      }

      return [
        {
          id: "matches",
          heading: "Suggestions",
          options: matches.map(destinationToAutocompleteOption),
        },
      ] satisfies AutocompleteSection[];
    }

    const nextSections: AutocompleteSection[] = [];

    if (recentDestinations.length > 0) {
      nextSections.push({
        id: "recent",
        heading: "Recent searches",
        options: recentDestinations.map(destinationToAutocompleteOption),
      });
    }

    const recentIds = new Set(recentDestinations.map((destination) => destination.id));
    const popular = getPopularDestinations().filter(
      (destination) => !recentIds.has(destination.id),
    );

    if (popular.length > 0) {
      nextSections.push({
        id: "popular",
        heading: "Popular destinations",
        options: popular.map(destinationToAutocompleteOption),
      });
    }

    return nextSections;
  }, [isSearching, query, recentDestinations]);

  function handleSelect(option: { id: string; label: string }) {
    const destination = MOCK_DESTINATIONS.find((item) => item.id === option.id);
    if (destination) {
      addRecent(destination);
    }
  }

  return (
    <Autocomplete
      id={id}
      label="Destination"
      placeholder="Where do you want to go?"
      value={value}
      sections={sections}
      onChange={onChange}
      onSelect={handleSelect}
      onListOpen={reloadRecent}
      error={error}
      required={required}
      noResultsMessage="No destinations match your search."
      className={className}
    />
  );
}
