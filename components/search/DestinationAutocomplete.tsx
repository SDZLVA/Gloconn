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
  findDestinationById,
  getPopularDestinations,
} from "@/lib/destinations";
import type { PlaceSelection } from "@/types/search-form";

type DestinationAutocompleteProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  /** Called when the user picks a suggestion (label + canonical id). */
  onDestinationSelect?: (selection: PlaceSelection) => void;
  error?: string;
  required?: boolean;
  className?: string;
};

/**
 * DestinationAutocomplete — destination field with mock-data suggestions.
 *
 * Empty field: recent searches + popular destinations.
 * While typing: ranked matches from static mock data (no API calls).
 */
export function DestinationAutocomplete({
  id = "search-destination",
  label = "Destination",
  placeholder = "Where do you want to go?",
  value,
  onChange,
  onDestinationSelect,
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
    const destination = findDestinationById(option.id);
    if (!destination) {
      return;
    }

    addRecent(destination);
    onDestinationSelect?.({
      label: option.label,
      id: destination.id,
    });
  }

  return (
    <Autocomplete
      id={id}
      label={label}
      placeholder={placeholder}
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
