/**
 * Checked-in Amadeus Flight Offers fixtures for unit and integration tests.
 * Minimal shapes only — not full Amadeus schema copies.
 */

import type {
  AmadeusFlightOffer,
  AmadeusFlightOffersResponse,
  AmadeusFlightSegment,
} from "@/lib/providers/flights/amadeus/types";

function segment(options: {
  carrierCode: string;
  departureAt: string;
  arrivalAt: string;
}): AmadeusFlightSegment {
  return {
    carrierCode: options.carrierCode,
    departure: { at: options.departureAt },
    arrival: { at: options.arrivalAt },
  };
}

/** Nonstop outbound offer (1 segment) with EUR + ECONOMY. */
export const minimalOffer: AmadeusFlightOffer = {
  id: "1",
  type: "flight-offer",
  itineraries: [
    {
      duration: "PT2H10M",
      segments: [
        segment({
          carrierCode: "AF",
          departureAt: "2026-08-01T08:15:00",
          arrivalAt: "2026-08-01T10:25:00",
        }),
      ],
    },
  ],
  price: { total: "145.50", currency: "EUR" },
  travelerPricings: [
    {
      fareDetailsBySegment: [{ cabin: "ECONOMY" }],
    },
  ],
  validatingAirlineCodes: ["AF"],
};

/** One connection (2 segments) → stops = 1. */
export const oneStopOffer: AmadeusFlightOffer = {
  id: "2",
  itineraries: [
    {
      duration: "PT5H20M",
      segments: [
        segment({
          carrierCode: "LH",
          departureAt: "2026-08-01T06:00:00",
          arrivalAt: "2026-08-01T07:30:00",
        }),
        segment({
          carrierCode: "LH",
          departureAt: "2026-08-01T09:00:00",
          arrivalAt: "2026-08-01T11:20:00",
        }),
      ],
    },
  ],
  price: { total: "220.00", currency: "EUR" },
  travelerPricings: [
    {
      fareDetailsBySegment: [{ cabin: "ECONOMY" }, { cabin: "ECONOMY" }],
    },
  ],
};

/** Three segments → stops = 2. */
export const threeSegmentOffer: AmadeusFlightOffer = {
  id: "3",
  itineraries: [
    {
      duration: "PT10H",
      segments: [
        segment({
          carrierCode: "BA",
          departureAt: "2026-08-01T05:00:00",
          arrivalAt: "2026-08-01T07:00:00",
        }),
        segment({
          carrierCode: "BA",
          departureAt: "2026-08-01T08:30:00",
          arrivalAt: "2026-08-01T12:00:00",
        }),
        segment({
          carrierCode: "BA",
          departureAt: "2026-08-01T13:00:00",
          arrivalAt: "2026-08-01T15:00:00",
        }),
      ],
    },
  ],
  price: { total: "310.00", currency: "EUR" },
  travelerPricings: [
    {
      fareDetailsBySegment: [{ cabin: "BUSINESS" }],
    },
  ],
};

/** Round-trip: two itineraries; mapper uses first for schedule. */
export const roundTripOffer: AmadeusFlightOffer = {
  id: "4",
  itineraries: [
    {
      duration: "PT2H10M",
      segments: [
        segment({
          carrierCode: "AF",
          departureAt: "2026-08-01T08:15:00",
          arrivalAt: "2026-08-01T10:25:00",
        }),
      ],
    },
    {
      duration: "PT2H5M",
      segments: [
        segment({
          carrierCode: "AF",
          departureAt: "2026-08-08T18:00:00",
          arrivalAt: "2026-08-08T20:05:00",
        }),
      ],
    },
  ],
  price: { total: "289.00", currency: "EUR" },
  travelerPricings: [
    {
      fareDetailsBySegment: [{ cabin: "ECONOMY" }],
    },
  ],
};

/** Offer with no usable segments (0 segments). */
export const zeroSegmentOffer: AmadeusFlightOffer = {
  id: "5",
  itineraries: [
    {
      duration: "PT1H",
      segments: [],
    },
  ],
  price: { total: "99.00", currency: "EUR" },
};

/** Missing schedule times → mapper returns null. */
export const missingTimesOffer: AmadeusFlightOffer = {
  id: "6",
  itineraries: [
    {
      duration: "PT2H",
      segments: [{ carrierCode: "AF", departure: {}, arrival: {} }],
    },
  ],
  price: { total: "100.00", currency: "EUR" },
};

/** Supported price shape but unsupported currency (e.g. SEK). */
export const unsupportedCurrencyOffer: AmadeusFlightOffer = {
  ...minimalOffer,
  id: "7",
  price: { total: "1500.00", currency: "SEK" },
};

/** Empty successful response body. */
export const emptyResponse: AmadeusFlightOffersResponse = {
  data: [],
  meta: { count: 0 },
};

/** Response with carriers dictionary for airline name lookup. */
export const responseWithCarriers: AmadeusFlightOffersResponse = {
  data: [minimalOffer],
  dictionaries: {
    carriers: {
      AF: "AIR FRANCE",
    },
  },
};

/** Mixed list: one valid offer + one incomplete (for null filtering). */
export const mixedResponse: AmadeusFlightOffersResponse = {
  data: [minimalOffer, missingTimesOffer],
  dictionaries: {
    carriers: { AF: "AIR FRANCE" },
  },
};
