import type { TravelStyle } from "@/types/search";

/** Labels for each travel style option in the search form. */
export const TRAVEL_STYLE_OPTIONS = [
  { value: "budget", label: "Budget" },
  { value: "standard", label: "Standard" },
  { value: "luxury", label: "Luxury" },
] as const satisfies ReadonlyArray<{ value: TravelStyle; label: string }>;
