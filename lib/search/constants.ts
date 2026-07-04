import type { TravelStyle, TripType } from "@/types/search";

/** Labels for round-trip vs one-way in the dates selector. */
export const TRIP_TYPE_OPTIONS = [
  { value: "round-trip", label: "Round-trip" },
  { value: "one-way", label: "One-way" },
] as const satisfies ReadonlyArray<{ value: TripType; label: string }>;

/** Labels for each travel style option in the search form. */
export const TRAVEL_STYLE_OPTIONS = [
  { value: "budget", label: "Budget" },
  { value: "standard", label: "Standard" },
  { value: "luxury", label: "Luxury" },
] as const satisfies ReadonlyArray<{ value: TravelStyle; label: string }>;
