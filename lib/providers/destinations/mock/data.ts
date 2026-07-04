/**
 * Static mock destination data — used by the mock destination provider.
 * Will be replaced or supplemented when a real destinations API is connected.
 */

import type { Destination } from "@/types/destination";

export const MOCK_DESTINATIONS: Destination[] = [
  { id: "paris", name: "Paris", country: "France", region: "Europe", popular: true, iataCode: "CDG" },
  { id: "rome", name: "Rome", country: "Italy", region: "Europe", popular: true, iataCode: "FCO" },
  { id: "barcelona", name: "Barcelona", country: "Spain", region: "Europe", popular: true, iataCode: "BCN" },
  { id: "london", name: "London", country: "United Kingdom", region: "Europe", popular: true, iataCode: "LHR" },
  { id: "amsterdam", name: "Amsterdam", country: "Netherlands", region: "Europe", iataCode: "AMS" },
  { id: "lisbon", name: "Lisbon", country: "Portugal", region: "Europe", iataCode: "LIS" },
  { id: "prague", name: "Prague", country: "Czech Republic", region: "Europe", iataCode: "PRG" },
  { id: "vienna", name: "Vienna", country: "Austria", region: "Europe", iataCode: "VIE" },
  { id: "athens", name: "Athens", country: "Greece", region: "Europe", iataCode: "ATH" },
  { id: "dubai", name: "Dubai", country: "United Arab Emirates", region: "Middle East", popular: true, iataCode: "DXB" },
  { id: "tokyo", name: "Tokyo", country: "Japan", region: "Asia", popular: true, iataCode: "NRT" },
  { id: "bali", name: "Bali", country: "Indonesia", region: "Asia", popular: true, iataCode: "DPS" },
  { id: "bangkok", name: "Bangkok", country: "Thailand", region: "Asia", iataCode: "BKK" },
  { id: "new-york", name: "New York", country: "United States", region: "North America", popular: true, iataCode: "JFK" },
  { id: "miami", name: "Miami", country: "United States", region: "North America", iataCode: "MIA" },
  { id: "cancun", name: "Cancún", country: "Mexico", region: "North America", iataCode: "CUN" },
  { id: "sydney", name: "Sydney", country: "Australia", region: "Oceania", iataCode: "SYD" },
  { id: "cape-town", name: "Cape Town", country: "South Africa", region: "Africa", iataCode: "CPT" },
  { id: "marrakech", name: "Marrakech", country: "Morocco", region: "Africa", iataCode: "RAK" },
  { id: "reykjavik", name: "Reykjavik", country: "Iceland", region: "Europe", iataCode: "KEF" },
  { id: "milan", name: "Milan", country: "Italy", region: "Europe", popular: true, iataCode: "MXP" },
];
