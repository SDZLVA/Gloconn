/**
 * Types for the search results feature.
 * Result types extend shared models with a `type` discriminator for the UI.
 */

import type { Bus, Flight, Hotel, Train } from "@/types/models";

export type ResultType = "hotel" | "flight" | "bus" | "train";

/**
 * Client-side sort modes for the results list.
 * `recommended` and `value-desc` use pure ranking helpers in `lib/results/rank.ts`.
 */
export type SortOption =
  | "recommended"
  | "price-asc"
  | "duration-asc"
  | "rating-desc"
  | "value-desc";

/**
 * Sidebar filters. Empty arrays / null / 0 mean “no constraint”.
 * Type-specific filters only apply to matching result types.
 */
export type ResultsFilters = {
  /** Result types to include. */
  types: ResultType[];

  /** Inclusive minimum price. */
  minPrice: number;

  /** Inclusive maximum price. */
  maxPrice: number;

  /** Inclusive minimum guest rating (0 = any). */
  minRating: number;

  /**
   * Maximum flight stops (0 = non-stop only).
   * `null` = any. Applies only to flights; other types are unaffected.
   */
  maxStops: number | null;

  /** Flight cabin labels to include. Empty = any. Flights only. */
  cabins: string[];

  /** Flight airline names to include. Empty = any. Flights only. */
  airlines: string[];

  /** Bus/train operator names to include. Empty = any. Bus/train only. */
  operators: string[];

  /** Minimum hotel star rating (0 = any). Hotels only. */
  minStars: number;

  /**
   * Amenities that must all be present.
   * Applies to hotels and buses (shared `amenities` field). Empty = any.
   */
  amenities: string[];
};

export const DEFAULT_RESULTS_FILTERS: ResultsFilters = {
  types: ["hotel", "flight", "bus", "train"],
  minPrice: 0,
  maxPrice: 10_000,
  minRating: 0,
  maxStops: null,
  cabins: [],
  airlines: [],
  operators: [],
  minStars: 0,
  amenities: [],
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Cheapest" },
  { value: "duration-asc", label: "Fastest" },
  { value: "rating-desc", label: "Highest rated" },
  { value: "value-desc", label: "Best value" },
];

export const RESULT_TYPE_LABELS: Record<ResultType, string> = {
  hotel: "Hotels",
  flight: "Flights",
  bus: "Buses",
  train: "Trains",
};

/** Facet values derived from the current result set for filter controls. */
export type ResultsFilterFacets = {
  airlines: string[];
  cabins: string[];
  operators: string[];
  amenities: string[];
  maxStopsInResults: number;
};

/** Hotel result with UI discriminator — extends shared Hotel model. */
export type HotelResult = Hotel & { type: "hotel" };

/** Flight result with UI discriminator — extends shared Flight model. */
export type FlightResult = Flight & { type: "flight" };

/** Bus result with UI discriminator — extends shared Bus model. */
export type BusResult = Bus & { type: "bus" };

/** Train result with UI discriminator — extends shared Train model. */
export type TrainResult = Train & { type: "train" };

/** Union of all transport and stay results shown on the results page. */
export type SearchResult =
  | HotelResult
  | FlightResult
  | BusResult
  | TrainResult;

/** Re-export shared models for convenience in results feature code. */
export type { Bus, Flight, Hotel, Train } from "@/types/models";
