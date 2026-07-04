/**
 * Types for the search results feature.
 * Result types extend shared models with a `type` discriminator for the UI.
 */

import type { Bus, Flight, Hotel, Train } from "@/types/models";

export type ResultType = "hotel" | "flight" | "bus" | "train";

export type SortOption =
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "duration-asc";

export type ResultsFilters = {
  types: ResultType[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
};

export const DEFAULT_RESULTS_FILTERS: ResultsFilters = {
  types: ["hotel", "flight", "bus", "train"],
  minPrice: 0,
  maxPrice: 10_000,
  minRating: 0,
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating-desc", label: "Highest rated" },
  { value: "duration-asc", label: "Shortest duration" },
];

export const RESULT_TYPE_LABELS: Record<ResultType, string> = {
  hotel: "Hotels",
  flight: "Flights",
  bus: "Buses",
  train: "Trains",
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
