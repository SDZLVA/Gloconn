/**
 * Package composition caps and scoring weights.
 * Isolated so Sprint 13.x can tune without touching composer control flow.
 */

/** Max flights considered before cartesian pairing. */
export const MAX_FLIGHT_CANDIDATES = 8;

/** Max hotels considered before cartesian pairing. */
export const MAX_HOTEL_CANDIDATES = 8;

/** Max packages returned after scoring and sorting. */
export const MAX_PACKAGES = 20;

/**
 * Package recommendation weights (must sum to 1.0).
 *
 * Budget Fit 35% · Flight Quality 25% · Hotel Quality 20% ·
 * Total Price 15% · Convenience 5%
 */
export const PACKAGE_SCORE_WEIGHTS = {
  budgetFit: 0.35,
  flightQuality: 0.25,
  hotelQuality: 0.2,
  totalPrice: 0.15,
  convenience: 0.05,
} as const;
