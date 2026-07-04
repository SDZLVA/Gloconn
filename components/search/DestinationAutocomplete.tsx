"use client";

import { useMemo } from "react";
import {
  Autocomplete,
  type AutocompleteSection,
} from "@/components/ui/Autocomplete";
import { useRecentDestinationSearches } from "@/hooks/useRecentDestinationSearches";
import { buildPopularDestinationsSection } from "@/components/destinations/buildPopularDestinationsSection";
import {
  destinationToAutocompleteOption,
  filterDestinations,
  findDestinationById,
} from "@/lib/destinations";
import type { RecentSearchScope } from "@/lib/destinations/recentSearches";
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
  /** Separate localStorage bucket for destination vs origin recents. */
  recentScope?: RecentSearchScope;
};

/**
 * DestinationAutocomplete — destination field with mock-data suggestions.
 *
 * Empty field: recent searches (last 5, localStorage) + popular destinations.
 * While typing: ranked matches; matching recents shown first.
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
  recentScope = "destination",
}: DestinationAutocompleteProps) {
  const { recentDestinations, addRecent, reloadRecent } =
    useRecentDestinationSearches(recentScope);

  const query = value.trim();
  const isSearching = query.length > 0;

  const sections = useMemo(() => {
    const recentIds = new Set(recentDestinations.map((destination) => destination.id));

    if (isSearching) {
      const matches = filterDestinations(query);
      const recentMatches = matches.filter((destination) => recentIds.has(destination.id));
      const otherMatches = matches.filter((destination) => !recentIds.has(destination.id));

      const nextSections: AutocompleteSection[] = [];

      if (recentMatches.length > 0) {
        nextSections.push({
          id: "recent",
          heading: "Recent searches",
          options: recentMatches.map(destinationToAutocompleteOption),
        });
      }

      nextSections.push({
        id: "matches",
        heading: otherMatches.length > 0 ? "Suggestions" : "",
        options: otherMatches.map(destinationToAutocompleteOption),
      });

      return nextSections;
    }

    const nextSections: AutocompleteSection[] = [];

    if (recentDestinations.length > 0) {
      nextSections.push({
        id: "recent",
        heading: "Recent searches",
        options: recentDestinations.map(destinationToAutocompleteOption),
      });
    }

    const popularSection = buildPopularDestinationsSection(recentIds);
    if (popularSection) {
      nextSections.push(popularSection);
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
      noResultsMessage="No destinations found"
      className={className}
    />
  );
}
