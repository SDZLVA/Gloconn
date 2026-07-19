/**
 * Amadeus flight search adapter.
 *
 * Sprint 3: OAuth + `amadeusFetch` infrastructure is ready.
 * Sprint 4: replace mock delegation with Flight Offers + mappers.
 * Registry selects this class when FLIGHTS_PROVIDER=amadeus and keys are set.
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
