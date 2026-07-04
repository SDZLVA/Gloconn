/**
 * Backward-compatible re-exports for the passengers module.
 * New code should import from `@/lib/search/passengers` or `@/lib/search`.
 */

export {
  applyPassengerFieldUpdate as applyTravelerFieldUpdate,
  formatPassengersSummary as formatTravelersSummary,
  getTotalPassengers as getTotalGuests,
  getInfantMax,
  PASSENGERS_FIELD_CONFIG as TRAVELERS_FIELD_CONFIG,
  PASSENGERS_LIMITS as TRAVELERS_LIMITS,
  validatePassengers as validateTravelers,
} from "@/lib/search/passengers";
