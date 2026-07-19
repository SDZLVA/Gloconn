/**
 * Amadeus flights adapter — public package surface.
 *
 * Sprint 6 wiring should import mappers only from this barrel.
 * Helpers, single-offer mapper, and raw Amadeus types stay package-private
 * (import from their modules only inside `amadeus/`).
 */

export {
  AmadeusFlightsProvider,
  amadeusFlightsProvider,
} from "@/lib/providers/flights/amadeus/provider";

export { mapAmadeusFlightOffersResponse } from "@/lib/providers/flights/amadeus/mappers";
