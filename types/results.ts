/**
 * Types for the search results feature.
 */

import type { CurrencyCode } from "@/lib/budget";

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

type BaseResult = {
  id: string;
  destinationId: string;
  price: number;
  currency: CurrencyCode;
  rating: number;
};

export type HotelResult = BaseResult & {
  type: "hotel";
  name: string;
  stars: number;
  amenities: string[];
  nights: number;
  location: string;
};

export type FlightResult = BaseResult & {
  type: "flight";
  airline: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  cabin: string;
};

export type BusResult = BaseResult & {
  type: "bus";
  operator: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  amenities: string[];
};

export type TrainResult = BaseResult & {
  type: "train";
  operator: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  trainClass: string;
};

export type SearchResult =
  | HotelResult
  | FlightResult
  | BusResult
  | TrainResult;
