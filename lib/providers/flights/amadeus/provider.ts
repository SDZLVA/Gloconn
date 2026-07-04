/**
 * Amadeus flight search adapter (stub).
 *
 * Swap implementation: replace the delegation below with client + mapper calls.
 * Registry already selects this class when FLIGHTS_PROVIDER=amadeus and keys are set.
 */

import type { FlightsProvider } from "@/lib/providers/core/types";
import { mockFlightsProvider } from "@/lib/providers/flights/mock";
import type { Flight } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";

export class AmadeusFlightsProvider implements FlightsProvider {
  readonly name = "amadeus";

  async search(request: SearchRequest): Promise<Flight[]> {
    // TODO: Implement Amadeus Flight Offers Search:
    //   const raw = await searchFlightOffers(request, getAmadeusCredentials());
    //   return raw.map(mapAmadeusOfferToFlight);
    //
    // Until then, delegate to mock so the app keeps working during development.
    return mockFlightsProvider.search(request);
  }
}

export const amadeusFlightsProvider = new AmadeusFlightsProvider();
