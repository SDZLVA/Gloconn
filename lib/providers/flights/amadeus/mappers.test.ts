import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import {
  emptyResponse,
  minimalOffer,
  missingTimesOffer,
  mixedResponse,
  oneStopOffer,
  responseWithCarriers,
  roundTripOffer,
  threeSegmentOffer,
  unsupportedCurrencyOffer,
  zeroSegmentOffer,
} from "@/lib/providers/flights/amadeus/__fixtures__/flightOffers.sample";
import {
  mapAmadeusFlightOffersResponse,
  mapAmadeusOfferToFlight,
} from "@/lib/providers/flights/amadeus/mappers";
import type { AmadeusFlightOffer } from "@/lib/providers/flights/amadeus/types";

const DESTINATION_ID = "paris";

describe("mapAmadeusOfferToFlight — happy path", () => {
  it("maps a minimal valid offer (1 segment / nonstop)", () => {
    const flight = mapAmadeusOfferToFlight(minimalOffer, {
      destinationId: DESTINATION_ID,
    });

    assert.ok(flight);
    assert.equal(flight.id, "amadeus-1");
    assert.equal(flight.destinationId, DESTINATION_ID);
    assert.equal(flight.airline, "AF");
    assert.equal(flight.durationMinutes, 130);
    assert.equal(flight.stops, 0);
    assert.equal(flight.cabin, "Economy");
    assert.equal(flight.rating, 0);
    assert.equal(flight.price, 145.5);
    assert.equal(flight.currency, "EUR");
    assert.equal(flight.departureTime, "08:15");
    assert.equal(flight.arrivalTime, "10:25");
  });

  it("maps a one-stop offer (2 segments)", () => {
    const flight = mapAmadeusOfferToFlight(oneStopOffer, {
      destinationId: DESTINATION_ID,
    });

    assert.ok(flight);
    assert.equal(flight.id, "amadeus-2");
    assert.equal(flight.destinationId, DESTINATION_ID);
    assert.equal(flight.airline, "LH");
    assert.equal(flight.durationMinutes, 320);
    assert.equal(flight.stops, 1);
    assert.equal(flight.cabin, "Economy");
    assert.equal(flight.rating, 0);
    assert.equal(flight.price, 220);
    assert.equal(flight.currency, "EUR");
    assert.equal(flight.departureTime, "06:00");
    assert.equal(flight.arrivalTime, "11:20");
  });

  it("maps a multi-stop offer (3 segments)", () => {
    const flight = mapAmadeusOfferToFlight(threeSegmentOffer, {
      destinationId: DESTINATION_ID,
    });

    assert.ok(flight);
    assert.equal(flight.id, "amadeus-3");
    assert.equal(flight.airline, "BA");
    assert.equal(flight.durationMinutes, 600);
    assert.equal(flight.stops, 2);
    assert.equal(flight.cabin, "Business");
    assert.equal(flight.rating, 0);
    assert.equal(flight.price, 310);
    assert.equal(flight.currency, "EUR");
    assert.equal(flight.departureTime, "05:00");
    assert.equal(flight.arrivalTime, "15:00");
  });

  it("maps a round-trip offer using outbound schedule and total price", () => {
    const flight = mapAmadeusOfferToFlight(roundTripOffer, {
      destinationId: DESTINATION_ID,
    });

    assert.ok(flight);
    assert.equal(flight.id, "amadeus-4");
    assert.equal(flight.destinationId, DESTINATION_ID);
    assert.equal(flight.airline, "AF");
    assert.equal(flight.durationMinutes, 130);
    assert.equal(flight.stops, 0);
    assert.equal(flight.cabin, "Economy");
    assert.equal(flight.rating, 0);
    assert.equal(flight.price, 289);
    assert.equal(flight.currency, "EUR");
    assert.equal(flight.departureTime, "08:15");
    assert.equal(flight.arrivalTime, "10:25");
  });

  it("resolves airline from the carriers dictionary when provided", () => {
    const flight = mapAmadeusOfferToFlight(minimalOffer, {
      destinationId: DESTINATION_ID,
      dictionaries: { carriers: { AF: "AIR FRANCE" } },
    });

    assert.ok(flight);
    assert.equal(flight.airline, "AIR FRANCE");
  });
});

describe("mapAmadeusOfferToFlight — null-return cases", () => {
  it("returns null when offer id is missing", () => {
    const offer = { ...minimalOffer, id: "   " };
    assert.equal(
      mapAmadeusOfferToFlight(offer, { destinationId: DESTINATION_ID }),
      null,
    );
  });

  it("returns null when destinationId option is missing", () => {
    assert.equal(
      mapAmadeusOfferToFlight(minimalOffer, { destinationId: "" }),
      null,
    );
  });

  it("returns null when segments are missing (0 segments)", () => {
    assert.equal(
      mapAmadeusOfferToFlight(zeroSegmentOffer, {
        destinationId: DESTINATION_ID,
      }),
      null,
    );
  });

  it("returns null when itineraries are missing (invalid structure)", () => {
    const offer: AmadeusFlightOffer = {
      id: "x",
      price: { total: "10.00", currency: "EUR" },
    };
    assert.equal(
      mapAmadeusOfferToFlight(offer, { destinationId: DESTINATION_ID }),
      null,
    );
  });

  it("returns null when departure/arrival times are missing", () => {
    assert.equal(
      mapAmadeusOfferToFlight(missingTimesOffer, {
        destinationId: DESTINATION_ID,
      }),
      null,
    );
  });

  it("returns null when price is missing", () => {
    const offer: AmadeusFlightOffer = {
      ...minimalOffer,
      price: undefined,
    };
    assert.equal(
      mapAmadeusOfferToFlight(offer, { destinationId: DESTINATION_ID }),
      null,
    );
  });

  it("returns null when price total is invalid", () => {
    const offer: AmadeusFlightOffer = {
      ...minimalOffer,
      price: { total: "not-a-price", currency: "EUR" },
    };
    assert.equal(
      mapAmadeusOfferToFlight(offer, { destinationId: DESTINATION_ID }),
      null,
    );
  });
});

describe("mapAmadeusOfferToFlight — error propagation", () => {
  it("throws a ProviderError for unsupported currency", () => {
    assert.throws(
      () =>
        mapAmadeusOfferToFlight(unsupportedCurrencyOffer, {
          destinationId: DESTINATION_ID,
        }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        assert.match(error.message, /SEK/);
        return true;
      },
    );
  });
});

describe("mapAmadeusFlightOffersResponse", () => {
  it("returns an empty array for an empty response", () => {
    assert.deepEqual(
      mapAmadeusFlightOffersResponse(emptyResponse, {
        destinationId: DESTINATION_ID,
      }),
      [],
    );
  });

  it("returns an empty array when data is missing", () => {
    assert.deepEqual(
      mapAmadeusFlightOffersResponse({}, { destinationId: DESTINATION_ID }),
      [],
    );
  });

  it("filters null entries from mixed valid/invalid offers", () => {
    const flights = mapAmadeusFlightOffersResponse(mixedResponse, {
      destinationId: DESTINATION_ID,
    });

    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.id, "amadeus-1");
    assert.equal(flights[0]?.airline, "AIR FRANCE");
    assert.equal(flights[0]?.rating, 0);
  });

  it("uses carrier dictionary lookup from the response", () => {
    const flights = mapAmadeusFlightOffersResponse(responseWithCarriers, {
      destinationId: DESTINATION_ID,
    });

    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.airline, "AIR FRANCE");
    assert.equal(flights[0]?.destinationId, DESTINATION_ID);
    assert.equal(flights[0]?.rating, 0);
  });

  it("falls back to carrier code when the dictionary is missing", () => {
    const flights = mapAmadeusFlightOffersResponse(
      { data: [minimalOffer] },
      { destinationId: DESTINATION_ID },
    );

    assert.equal(flights.length, 1);
    assert.equal(flights[0]?.airline, "AF");
  });

  it("propagates ProviderError for unsupported currency in the response", () => {
    assert.throws(
      () =>
        mapAmadeusFlightOffersResponse(
          { data: [unsupportedCurrencyOffer] },
          { destinationId: DESTINATION_ID },
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        assert.match(error.message, /SEK/);
        return true;
      },
    );
  });

  it("maps segment-count fixtures to the expected stop counts", () => {
    const flights = mapAmadeusFlightOffersResponse(
      {
        data: [minimalOffer, oneStopOffer, threeSegmentOffer],
      },
      { destinationId: DESTINATION_ID },
    );

    assert.equal(flights.length, 3);
    assert.equal(flights[0]?.stops, 0);
    assert.equal(flights[1]?.stops, 1);
    assert.equal(flights[2]?.stops, 2);
  });
});
