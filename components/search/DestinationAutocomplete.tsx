"use client";

import { useEffect, useMemo, useState } from "react";
import { rememberWorldPlace } from "@/lib/destinations/worldCache";
import {
  Autocomplete,
  type AutocompleteSection,
} from "@/components/ui/Autocomplete";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRecentDestinationSearches } from "@/hooks/useRecentDestinationSearches";
import { buildPopularDestinationsSection } from "@/components/destinations/buildPopularDestinationsSection";
import { findDestinationById } from "@/lib/destinations";
import { rankDestinationsCached } from "@/lib/destinations/filterCache";
import { destinationToSearchOption } from "@/lib/destinations/options";
import {
  shouldGroupAirportMatches,
  splitRankedByMatchGroup,
  type RankedDestination,
} from "@/lib/destinations/rank";
import type { RecentSearchScope } from "@/lib/destinations/recentSearches";
import type { PlaceSelection } from "@/types/search-form";

/** Debounce filter work so rapid typing does not re-rank on every key. */
const DESTINATION_FILTER_DEBOUNCE_MS = 160;

type DestinationAutocompleteProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  /** Called when the user picks a suggestion (label + canonical id). */
  onDestinationSelect?: (selection: PlaceSelection) => void;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
  /** Separate localStorage bucket for destination vs origin recents. */
  recentScope?: RecentSearchScope;
  /**
   * Milestone 34: also suggest places worldwide — "cities" (hotels,
   * packages) or "all" = cities + airports (flights). Off when omitted.
   */
  worldKind?: "cities" | "all";
};

type WorldSuggestion = {
  id: string;
  label: string;
  description: string;
  kind: "city" | "airport";
  name: string;
  country: string;
  iata: string;
  cityIata: string;
};

function toOptions(ranked: RankedDestination[]) {
  return ranked.map((entry) => destinationToSearchOption(entry.destination));
}

/**
 * DestinationAutocomplete — destination field with ranked mock suggestions.
 *
 * Empty field: recent searches + popular destinations.
 * While typing: deterministic client ranking (name / country / IATA / words),
 * with Recent, Cities, and Airports grouping when useful.
 *
 * Sprint 10.5: quality ranking + match highlight. Does not change search execution.
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
  worldKind,
}: DestinationAutocompleteProps) {
  const { recentDestinations, addRecent, reloadRecent } =
    useRecentDestinationSearches(recentScope);

  const query = value.trim();
  const debouncedQuery = useDebouncedValue(query, DESTINATION_FILTER_DEBOUNCE_MS);
  const isSearching = debouncedQuery.length > 0;

  // Milestone 34: worldwide suggestions from /api/places.
  const [world, setWorld] = useState<WorldSuggestion[]>([]);
  useEffect(() => {
    if (!worldKind || debouncedQuery.length < 2) {
      setWorld([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/places?q=${encodeURIComponent(debouncedQuery)}&kind=${worldKind}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : { places: [] }))
      .then((body: { places?: WorldSuggestion[] }) => setWorld(Array.isArray(body.places) ? body.places : []))
      .catch(() => {});
    return () => controller.abort();
  }, [debouncedQuery, worldKind]);

  const recentIds = useMemo(
    () => recentDestinations.map((destination) => destination.id),
    [recentDestinations],
  );

  const sections = useMemo(() => {
    const recentIdSet = new Set(recentIds);

    if (isSearching) {
      const ranked = rankDestinationsCached(debouncedQuery, {
        recentIds,
      });

      const searchSections: AutocompleteSection[] = [];

      // Recent matches first (already boosted in ranking; surface as a group).
      const recentMatches = ranked.filter((entry) =>
        recentIdSet.has(entry.destination.id),
      );
      const nonRecent = ranked.filter(
        (entry) => !recentIdSet.has(entry.destination.id),
      );

      if (recentMatches.length > 0) {
        searchSections.push({
          id: "recent",
          heading: "Recent searches",
          options: toOptions(recentMatches),
        });
      }

      if (shouldGroupAirportMatches(debouncedQuery, nonRecent)) {
        const { airports, cities } = splitRankedByMatchGroup(nonRecent);
        if (cities.length > 0) {
          searchSections.push({
            id: "cities",
            heading: "Cities",
            options: toOptions(cities),
          });
        }
        if (airports.length > 0) {
          searchSections.push({
            id: "airports",
            heading: "Airports",
            options: toOptions(airports),
          });
        }
      } else if (nonRecent.length > 0) {
        searchSections.push({
          id: "matches",
          heading: recentMatches.length > 0 ? "Suggestions" : "",
          options: toOptions(nonRecent),
        });
      }

      // Worldwide matches the catalog doesn't already show (same IATA code).
      const shownCodes = new Set(
        searchSections.flatMap((section) => section.options.map((option) => option.description?.split(" · ").pop())),
      );
      const worldCities = world.filter((p) => p.kind === "city" && !shownCodes.has(p.iata));
      const worldAirports = world.filter((p) => p.kind === "airport" && !shownCodes.has(p.iata));
      if (worldCities.length > 0) {
        searchSections.push({
          id: "world-cities",
          heading: "Cities",
          options: worldCities.map((p) => ({ id: p.id, label: p.label, description: p.description })),
        });
      }
      if (worldAirports.length > 0) {
        searchSections.push({
          id: "world-airports",
          heading: "Airports",
          options: worldAirports.map((p) => ({ id: p.id, label: p.label, description: p.description })),
        });
      }

      return searchSections;
    }

    // Empty / pre-debounce: show recents + popular immediately.
    const idleSections: AutocompleteSection[] = [];

    if (recentDestinations.length > 0) {
      idleSections.push({
        id: "recent",
        heading: "Recent searches",
        options: recentDestinations.map(destinationToSearchOption),
      });
    }

    const popularSection = buildPopularDestinationsSection(recentIdSet);
    if (popularSection) {
      // Enrich popular options with IATA in the description.
      idleSections.push({
        ...popularSection,
        options: popularSection.options.map((option) => {
          const destination = findDestinationById(option.id);
          return destination
            ? destinationToSearchOption(destination)
            : option;
        }),
      });
    }

    return idleSections;
  }, [isSearching, debouncedQuery, recentDestinations, recentIds, world]);

  function handleSelect(option: { id: string; label: string }) {
    const picked = world.find((p) => p.id === option.id);
    if (picked) {
      const destination = {
        id: picked.id,
        name: picked.name,
        country: picked.country,
        region: picked.kind === "city" ? "City" : "Airport",
        iataCode: picked.iata,
        cityIataCode: picked.cityIata,
      };
      rememberWorldPlace(destination);
      addRecent(destination);
      onDestinationSelect?.({ label: option.label, id: picked.id });
      return;
    }
    const destination = findDestinationById(option.id) ?? recentDestinations.find((d) => d.id === option.id) ?? null;
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
      highlightQuery={isSearching ? debouncedQuery : undefined}
    />
  );
}
