/**
 * Attraction model — a point of interest at a destination.
 */

/**
 * A landmark, museum, activity, or other attraction.
 * Provider-independent — no Google Maps or TripAdvisor-specific fields.
 */
export type Attraction = {
  /** Unique attraction identifier within Glooconn. */
  id: string;

  /** Glooconn destination id where the attraction is located. */
  destinationId: string;

  /** Attraction name. */
  name: string;

  /** Category label (e.g. "Museum", "Landmark", "Park"). */
  category: string;

  /** Visitor rating from 0.0 to 5.0. */
  rating: number;

  /** Short description for cards and detail views. */
  description?: string;

  /** Neighborhood or address summary for display. */
  location?: string;
};
