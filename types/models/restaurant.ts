/**
 * Restaurant model — a dining option at a destination.
 */

/**
 * A restaurant or dining venue for future discovery features.
 * Provider-independent — no Google Places or Yelp-specific fields.
 */
export type Restaurant = {
  /** Unique restaurant identifier within Glooconn. */
  id: string;

  /** Glooconn destination id where the restaurant is located. */
  destinationId: string;

  /** Restaurant name. */
  name: string;

  /** Cuisine types (e.g. "Italian", "Seafood"). */
  cuisine: string[];

  /**
   * Price level from 1 (budget) to 4 (fine dining).
   * Provider-agnostic alternative to dollar-sign ratings.
   */
  priceLevel: 1 | 2 | 3 | 4;

  /** Guest rating from 0.0 to 5.0. */
  rating: number;

  /** Neighborhood or address summary for display. */
  location: string;

  /** Short description for cards and detail views. */
  description?: string;
};
