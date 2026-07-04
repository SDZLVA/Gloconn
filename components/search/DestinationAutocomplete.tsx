"use client";

import { useMemo } from "react";
import {
  Autocomplete,
  type AutocompleteSection,
} from "@/components/ui/Autocomplete";
import { useRecentDestinationSearches } from "@/hooks/useRecentDestinationSearches";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { getApiErrorMessage } from "@/lib/api";
import { destinationToAutocompleteOption } from "@/lib/destinations";
import {
  getPopularDestinations,
  searchDestinations,
} from "@/lib/services/destinationService";

type DestinationAutocompleteProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
};

/**
 * DestinationAutocomplete — destination field with suggestions via the destination service.
 *
 * Empty field: recent searches + popular destinations.
 * While typing: ranked suggestions from the active provider (mock by default).
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

  const searchState = useServiceQuery(
    () => searchDestinations(query),
    [query],
    { enabled: isSearching },
  );

  const popularState = useServiceQuery(
    () => getPopularDestinations(),
    [],
    { enabled: !isSearching },
  );

  const sections = useMemo(() => {
    if (isSearching) {
      if (searchState.status === "loading") {
        return [];
      }

      if (searchState.status === "error" || !searchState.data) {
        return [];
      }

      if (searchState.data.length === 0) {
        return [];
      }

      return [
        {
          id: "matches",
          heading: "Suggestions",
          options: searchState.data.map(destinationToAutocompleteOption),
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
    const popular = (popularState.data ?? []).filter(
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
  }, [isSearching, recentDestinations, searchState, popularState.data]);

  const serviceError =
    isSearching && searchState.status === "error" && searchState.error
      ? getApiErrorMessage(searchState.error)
      : undefined;

  function handleSelect(option: { id: string; label: string }) {
    const destination =
      searchState.data?.find((item) => item.id === option.id) ??
      recentDestinations.find((item) => item.id === option.id) ??
      popularState.data?.find((item) => item.id === option.id);

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
      error={error ?? serviceError}
      required={required}
      noResultsMessage={
        searchState.status === "loading"
          ? "Loading suggestions…"
          : "No destinations match your search."
      }
      className={className}
    />
  );
}
