/**
 * Amadeus flight search adapter.
 *
 * Wires Flight Offers HTTP + response→Flight mapping.
 * Registry selects this class when FLIGHTS_PROVIDER=amadeus and keys are set.
 */

import { createProviderError } from "@/lib/api/errors";
import type { FlightsProvider } from "@/lib/providers/core/types";
import { searchFlightOffers } from "@/lib/providers/flights/amadeus/flightOffers";
import { mapAmadeusFlightOffersResponse } from "@/lib/providers/flights/amadeus/mappers";
import type { Flight } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";

export class AmadeusFlightsProvider implements FlightsProvider {
  readonly name = "amadeus";

  async search(request: SearchRequest): Promise<Flight[]> {
    const destinationId = request.destinationId?.trim();
    if (!destinationId) {
      throw createProviderError(
        "Flight search requires a resolved destinationId before mapping Amadeus offers.",
      );
    }

    const raw = await searchFlightOffers(request);
    return mapAmadeusFlightOffersResponse(raw, { destinationId });
  }
}

export const amadeusFlightsProvider = new AmadeusFlightsProvider();
