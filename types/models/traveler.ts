/**
 * Traveler model — guest counts for a trip search.
 */

/**
 * Number of guests and rooms for a trip.
 * Matches the passengers selector on the search form.
 */
export type Traveler = {
  /** Number of adult guests (minimum 1 for a valid search). */
  adults: number;

  /** Number of child guests (typically ages 2–17). */
  children: number;

  /** Number of infant guests (typically under 2; cannot exceed adult count). */
  infants: number;

  /** Number of hotel rooms required (minimum 1 for a valid search). */
  rooms: number;
};
