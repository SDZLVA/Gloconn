/**
 * Maps Amadeus API responses to the shared Flight model.
 *
 * Example:
 *   export function mapAmadeusOfferToFlight(offer: AmadeusFlightOffer): Flight { ... }
 */

import type { Flight } from "@/types/models";

export type MapAmadeusOfferToFlight = (offer: unknown) => Flight;

export {};
