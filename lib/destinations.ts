/**
 * Mock destination data for autocomplete (no API yet).
 * Will be reused on the Destinations page in Week 2.
 */

export type Destination = {
  id: string;
  name: string;
  country: string;
  region: string;
};

/** Formatted label shown in the autocomplete dropdown. */
export function formatDestinationLabel(destination: Destination): string {
  return `${destination.name}, ${destination.country}`;
}

/** Mock destinations — expand this list as the app grows. */
export const MOCK_DESTINATIONS: Destination[] = [
  { id: "paris", name: "Paris", country: "France", region: "Europe" },
  { id: "rome", name: "Rome", country: "Italy", region: "Europe" },
  { id: "barcelona", name: "Barcelona", country: "Spain", region: "Europe" },
  { id: "london", name: "London", country: "United Kingdom", region: "Europe" },
  { id: "amsterdam", name: "Amsterdam", country: "Netherlands", region: "Europe" },
  { id: "lisbon", name: "Lisbon", country: "Portugal", region: "Europe" },
  { id: "prague", name: "Prague", country: "Czech Republic", region: "Europe" },
  { id: "vienna", name: "Vienna", country: "Austria", region: "Europe" },
  { id: "athens", name: "Athens", country: "Greece", region: "Europe" },
  { id: "dubai", name: "Dubai", country: "United Arab Emirates", region: "Middle East" },
  { id: "tokyo", name: "Tokyo", country: "Japan", region: "Asia" },
  { id: "bali", name: "Bali", country: "Indonesia", region: "Asia" },
  { id: "bangkok", name: "Bangkok", country: "Thailand", region: "Asia" },
  { id: "new-york", name: "New York", country: "United States", region: "North America" },
  { id: "miami", name: "Miami", country: "United States", region: "North America" },
  { id: "cancun", name: "Cancún", country: "Mexico", region: "North America" },
  { id: "sydney", name: "Sydney", country: "Australia", region: "Oceania" },
  { id: "cape-town", name: "Cape Town", country: "South Africa", region: "Africa" },
  { id: "marrakech", name: "Marrakech", country: "Morocco", region: "Africa" },
  { id: "reykjavik", name: "Reykjavik", country: "Iceland", region: "Europe" },
];

/**
 * Filters destinations by query (name, country, or region).
 * Case-insensitive; returns all destinations when query is empty.
 */
export function filterDestinations(query: string): Destination[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return MOCK_DESTINATIONS;
  }

  return MOCK_DESTINATIONS.filter(
    (destination) =>
      destination.name.toLowerCase().includes(normalized) ||
      destination.country.toLowerCase().includes(normalized) ||
      destination.region.toLowerCase().includes(normalized),
  );
}
