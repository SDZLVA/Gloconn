/**
 * Checked-in SerpAPI Google Flights fixtures for structural tests.
 *
 * Source: SerpAPI Google Flights Results API documentation examples
 * (https://serpapi.com/google-flights-results), simplified to fields Glooconn
 * will need. No API keys, tokens with secrets, or personal data.
 */

import type {
  SerpApiFlightOption,
  SerpApiGoogleFlightsResponse,
} from "@/lib/providers/flights/serpapi/types";

/** Nonstop one-way option (1 segment → 0 stops). */
export const nonstopOneWayOption: SerpApiFlightOption = {
  flights: [
    {
      departure_airport: {
        name: "Milan Malpensa Airport",
        id: "MXP",
        time: "2026-08-01 08:15",
      },
      arrival_airport: {
        name: "Paris Charles de Gaulle Airport",
        id: "CDG",
        time: "2026-08-01 09:40",
      },
      duration: 85,
      airline: "Air France",
      travel_class: "Economy",
      flight_number: "AF 1731",
    },
  ],
  total_duration: 85,
  price: 98,
  type: "One way",
};

/** One-stop option (2 segments + layover → 1 stop). */
export const oneStopOption: SerpApiFlightOption = {
  flights: [
    {
      departure_airport: {
        name: "Milan Malpensa Airport",
        id: "MXP",
        time: "2026-08-01 06:30",
      },
      arrival_airport: {
        name: "Amsterdam Airport Schiphol",
        id: "AMS",
        time: "2026-08-01 08:20",
      },
      duration: 110,
      airline: "KLM",
      travel_class: "Economy",
      flight_number: "KL 1630",
    },
    {
      departure_airport: {
        name: "Amsterdam Airport Schiphol",
        id: "AMS",
        time: "2026-08-01 10:05",
      },
      arrival_airport: {
        name: "Paris Charles de Gaulle Airport",
        id: "CDG",
        time: "2026-08-01 11:20",
      },
      duration: 75,
      airline: "KLM",
      travel_class: "Economy",
      flight_number: "KL 1401",
    },
  ],
  layovers: [
    {
      duration: 105,
      name: "Amsterdam Airport Schiphol",
      id: "AMS",
    },
  ],
  total_duration: 290,
  price: 142,
  type: "One way",
};

/**
 * Realistic successful search response shape based on SerpAPI docs.
 * Includes `best_flights`, `other_flights`, and `search_parameters.currency`.
 */
export const successfulGoogleFlightsResponse: SerpApiGoogleFlightsResponse = {
  search_metadata: {
    status: "Success",
    id: "fixture-serpapi-google-flights-001",
  },
  search_parameters: {
    engine: "google_flights",
    departure_id: "MXP",
    arrival_id: "CDG",
    outbound_date: "2026-08-01",
    currency: "EUR",
  },
  best_flights: [nonstopOneWayOption, oneStopOption],
  other_flights: [
    {
      flights: [
        {
          departure_airport: {
            name: "Milan Malpensa Airport",
            id: "MXP",
            time: "2026-08-01 18:45",
          },
          arrival_airport: {
            name: "Paris Charles de Gaulle Airport",
            id: "CDG",
            time: "2026-08-01 20:15",
          },
          duration: 90,
          airline: "easyJet",
          travel_class: "Economy",
          flight_number: "U2 2735",
          overnight: false,
        },
      ],
      total_duration: 90,
      price: 76,
      type: "One way",
    },
  ],
};

/** Empty successful response (no itineraries). */
export const emptyGoogleFlightsResponse: SerpApiGoogleFlightsResponse = {
  search_metadata: {
    status: "Success",
    id: "fixture-serpapi-google-flights-empty",
  },
  search_parameters: {
    engine: "google_flights",
    currency: "EUR",
  },
  best_flights: [],
  other_flights: [],
};

/** Round-trip priced option (outbound segments only for v1 mapping). */
export const roundTripOption: SerpApiFlightOption = {
  flights: [
    {
      departure_airport: {
        name: "Milan Malpensa Airport",
        id: "MXP",
        time: "2026-08-01 07:00",
      },
      arrival_airport: {
        name: "Paris Charles de Gaulle Airport",
        id: "CDG",
        time: "2026-08-01 08:25",
      },
      duration: 85,
      airline: "Air France",
      travel_class: "Business",
      flight_number: "AF 1733",
    },
  ],
  total_duration: 85,
  price: 410,
  type: "Round trip",
  departure_token: "fixture-departure-token-not-a-secret",
};

/** Response containing a round-trip sample in best_flights. */
export const roundTripGoogleFlightsResponse: SerpApiGoogleFlightsResponse = {
  search_metadata: {
    status: "Success",
    id: "fixture-serpapi-google-flights-roundtrip",
  },
  search_parameters: {
    engine: "google_flights",
    departure_id: "MXP",
    arrival_id: "CDG",
    outbound_date: "2026-08-01",
    return_date: "2026-08-10",
    currency: "EUR",
  },
  best_flights: [roundTripOption],
  other_flights: [],
};

/** Option missing schedule times — mapper should filter it. */
export const missingTimesOption: SerpApiFlightOption = {
  flights: [
    {
      departure_airport: { id: "MXP" },
      arrival_airport: { id: "CDG" },
      airline: "Air France",
      travel_class: "Economy",
      flight_number: "AF 0000",
    },
  ],
  total_duration: 90,
  price: 100,
  type: "One way",
};

/** Three-segment option → stops = 2. */
export const threeStopOption: SerpApiFlightOption = {
  flights: [
    {
      departure_airport: {
        id: "MXP",
        time: "2026-08-01 05:00",
      },
      arrival_airport: {
        id: "FRA",
        time: "2026-08-01 06:30",
      },
      duration: 90,
      airline: "Lufthansa",
      travel_class: "Economy",
      flight_number: "LH 101",
    },
    {
      departure_airport: {
        id: "FRA",
        time: "2026-08-01 08:00",
      },
      arrival_airport: {
        id: "AMS",
        time: "2026-08-01 09:15",
      },
      duration: 75,
      airline: "Lufthansa",
      travel_class: "Economy",
      flight_number: "LH 202",
    },
    {
      departure_airport: {
        id: "AMS",
        time: "2026-08-01 11:00",
      },
      arrival_airport: {
        id: "CDG",
        time: "2026-08-01 12:10",
      },
      duration: 70,
      airline: "KLM",
      travel_class: "Economy",
      flight_number: "KL 303",
    },
  ],
  total_duration: 430,
  price: 260,
  type: "One way",
};
