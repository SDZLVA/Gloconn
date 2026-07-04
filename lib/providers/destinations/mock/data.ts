/**
 * Static mock destination data — used by the mock destination provider.
 * Will be replaced or supplemented when a real destinations API is connected.
 */

import type { Destination } from "@/types/destination";

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
