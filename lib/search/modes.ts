/**
 * Milestone 28: the four search modes shown as tabs at the top of the home
 * page. A mode is only a preset of product types, so URLs stay compatible:
 * flights → productTypes=flights, hotels → productTypes=hotels,
 * packages → both (the default, omitted from the URL).
 */

import type { SearchProductType } from "@/types/models/search-request";

export type SearchMode = "packages" | "flights" | "hotels" | "transport";

export const SEARCH_MODES: ReadonlyArray<{
  value: SearchMode;
  label: string;
  heading: string;
  description: string;
  available: boolean;
}> = [
  {
    value: "packages",
    label: "Packages",
    heading: "Travel more for less",
    description: "We combine flights and hotels into complete packages, so you can plan the perfect trip within your budget.",
    available: true,
  },
  {
    value: "flights",
    label: "Flights",
    heading: "Find cheap flights",
    description: "Live prices from airlines and travel agencies, filtered to your budget.",
    available: true,
  },
  {
    value: "hotels",
    label: "Hotels",
    heading: "Find your next stay",
    description: "Live prices on hotels, homes and apartments for your dates and budget.",
    available: true,
  },
  {
    value: "transport",
    label: "Mixed Transport",
    heading: "Bus, train, flight and taxi — together",
    description: "The cheapest way from A to B, combining every kind of transport.",
    available: false,
  },
];

export function productTypesForMode(mode: SearchMode): SearchProductType[] {
  switch (mode) {
    case "flights":
      return ["flights"];
    case "hotels":
      return ["hotels"];
    case "transport":
      return ["transport"];
    default:
      return ["hotels", "flights"];
  }
}

/** The mode a set of product types belongs to (URL → tab). */
export function modeFromProductTypes(types: SearchProductType[] | undefined): SearchMode {
  const set = new Set(types ?? []);
  if (set.size === 1 && set.has("flights")) return "flights";
  if (set.size === 1 && set.has("hotels")) return "hotels";
  if (set.size === 1 && set.has("transport")) return "transport";
  return "packages";
}

export function isSearchMode(value: string | null | undefined): value is SearchMode {
  return value === "packages" || value === "flights" || value === "hotels" || value === "transport";
}

/** Hotels-only searches don't need a departure place. */
export function needsOrigin(types: SearchProductType[] | undefined): boolean {
  return modeFromProductTypes(types) !== "hotels";
}
