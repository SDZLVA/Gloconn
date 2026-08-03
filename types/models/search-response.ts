/**
 * SearchResponse model — normalized output from a trip search.
 */

import type { Attraction } from "@/types/models/attraction";
import type { Bus } from "@/types/models/bus";
import type { Flight } from "@/types/models/flight";
import type { Hotel } from "@/types/models/hotel";
import type { Restaurant } from "@/types/models/restaurant";
import type { Train } from "@/types/models/train";
import type { TravelPackage } from "@/types/models/travel-package";

/** Domain that produced a warning during search orchestration. */
export type SearchResponseDomain =
  | "hotels"
  | "flights"
  | "transport"
  | "buses"
  | "trains"
  | "restaurants"
  | "attractions"
  | "destinations";

/**
 * Non-fatal issue during search (e.g. one provider failed while others succeeded).
 * Does not expose provider names to the UI.
 */
export type SearchResponseWarning = {
  /** Machine-readable warning code (e.g. "PROVIDER_UNAVAILABLE"). */
  code: string;

  /** Travel domain affected by the warning. */
  domain: SearchResponseDomain;

  /** Human-readable message safe to show in the UI. */
  message: string;
};

/**
 * Normalized response from `searchService` after orchestrating all providers.
 * UI components consume this shape — never raw provider payloads.
 */
export type SearchResponse = {
  /** Hotel and accommodation results. */
  hotels: Hotel[];

  /** Flight results. */
  flights: Flight[];

  /** Bus and coach results. */
  buses: Bus[];

  /** Train and rail results. */
  trains: Train[];

  /** Dining options — populated when restaurant search is enabled. */
  restaurants: Restaurant[];

  /** Points of interest — populated when attraction search is enabled. */
  attractions: Attraction[];

  /**
   * Recommended flight + hotel packages composed after domain search.
   * Empty when either domain is missing, failed, or returned no results.
   * Not counted in `totalCount` (packages are derived from flights/hotels).
   */
  packages: TravelPackage[];

  /**
   * Total count of provider domain results (hotels, flights, buses, trains,
   * restaurants, attractions). Does not include derived `packages`.
   */
  totalCount: number;

  /** ISO 8601 timestamp when the search completed. */
  searchedAt: string;

  /**
   * Optional warnings when some domains failed or returned partial data.
   * Empty or omitted when every domain succeeded.
   */
  warnings?: SearchResponseWarning[];
};
