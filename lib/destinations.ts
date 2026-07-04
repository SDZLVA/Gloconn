/**
 * Mock destination data for autocomplete (no API yet).
 * Will be reused on the Destinations page in Week 2.
 */

export type Destination = {
  id: string;
  name: string;
  country: string;
  region: string;
  /** When true, shown in the Popular destinations section when the field is empty. */
  popular?: boolean;
};

/** Formatted label shown in the autocomplete dropdown. */
export function formatDestinationLabel(destination: Destination): string {
  return `${destination.name}, ${destination.country}`;
}

/** Mock destinations — expand this list as the app grows. */
export const MOCK_DESTINATIONS: Destination[] = [
  { id: "paris", name: "Paris", country: "France", region: "Europe", popular: true },
  { id: "rome", name: "Rome", country: "Italy", region: "Europe", popular: true },
  { id: "barcelona", name: "Barcelona", country: "Spain", region: "Europe", popular: true },
  { id: "london", name: "London", country: "United Kingdom", region: "Europe", popular: true },
  { id: "amsterdam", name: "Amsterdam", country: "Netherlands", region: "Europe" },
  { id: "lisbon", name: "Lisbon", country: "Portugal", region: "Europe" },
  { id: "prague", name: "Prague", country: "Czech Republic", region: "Europe" },
  { id: "vienna", name: "Vienna", country: "Austria", region: "Europe" },
  { id: "athens", name: "Athens", country: "Greece", region: "Europe" },
  { id: "dubai", name: "Dubai", country: "United Arab Emirates", region: "Middle East", popular: true },
  { id: "tokyo", name: "Tokyo", country: "Japan", region: "Asia", popular: true },
  { id: "bali", name: "Bali", country: "Indonesia", region: "Asia", popular: true },
  { id: "bangkok", name: "Bangkok", country: "Thailand", region: "Asia" },
  { id: "new-york", name: "New York", country: "United States", region: "North America", popular: true },
  { id: "miami", name: "Miami", country: "United States", region: "North America" },
  { id: "cancun", name: "Cancún", country: "Mexico", region: "North America" },
  { id: "sydney", name: "Sydney", country: "Australia", region: "Oceania" },
  { id: "cape-town", name: "Cape Town", country: "South Africa", region: "Africa" },
  { id: "marrakech", name: "Marrakech", country: "Morocco", region: "Africa" },
  { id: "reykjavik", name: "Reykjavik", country: "Iceland", region: "Europe" },
];

/** Converts a destination to an autocomplete option shape. */
export function destinationToAutocompleteOption(destination: Destination) {
  return {
    id: destination.id,
    label: formatDestinationLabel(destination),
    description: destination.region,
  };
}

/** Popular destinations for the empty-state dropdown (mock curated list). */
export function getPopularDestinations(): Destination[] {
  return MOCK_DESTINATIONS.filter((destination) => destination.popular);
}

function scoreDestination(destination: Destination, query: string): number {
  const name = destination.name.toLowerCase();
  const country = destination.country.toLowerCase();
  const region = destination.region.toLowerCase();

  if (name === query) {
    return 100;
  }
  if (name.startsWith(query)) {
    return 80;
  }
  if (country.startsWith(query)) {
    return 60;
  }
  if (name.includes(query)) {
    return 40;
  }
  if (country.includes(query)) {
    return 30;
  }
  if (region.includes(query)) {
    return 20;
  }
  return 0;
}

/**
 * Filters destinations by query (name, country, or region).
 * Case-insensitive; returns all destinations when query is empty.
 */
export function filterDestinations(query: string): Destination[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return MOCK_DESTINATIONS;
  }

  return MOCK_DESTINATIONS.map((destination) => ({
    destination,
    score: scoreDestination(destination, normalized),
  }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.destination.name.localeCompare(b.destination.name),
    )
    .map(({ destination }) => destination);
}
