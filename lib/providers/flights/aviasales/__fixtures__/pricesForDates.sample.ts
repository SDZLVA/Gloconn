/**
 * Based on the example response in Travelpayouts' "Aviasales Data API"
 * documentation (article 203956163). Tokens shortened; no real data.
 */
import type { AviasalesPricesForDatesResponse } from "@/lib/providers/flights/aviasales/types";

export const ROUND_TRIP_SAMPLE: AviasalesPricesForDatesResponse = {
  success: true,
  data: [
    {
      origin: "MAD",
      destination: "BCN",
      origin_airport: "MAD",
      destination_airport: "BCN",
      price: 59,
      airline: "IB",
      flight_number: "3002",
      departure_at: "2027-07-28T07:00:00+02:00",
      return_at: "2027-08-26T14:30:00+02:00",
      transfers: 0,
      return_transfers: 0,
      duration: 165,
      duration_to: 80,
      duration_back: 85,
      link: "/search/MAD2807BCN26081?t=sample",
    },
    {
      origin: "MAD",
      destination: "BCN",
      origin_airport: "MAD",
      destination_airport: "BCN",
      price: 74,
      airline: "VY",
      flight_number: 1003,
      departure_at: "2027-07-28T19:10:00+02:00",
      return_at: "2027-08-26T09:05:00+02:00",
      transfers: 1,
      return_transfers: 0,
      duration: 290,
      duration_to: 205,
      duration_back: 85,
      link: "/search/MAD2807BCN26081?t=sample2",
    },
  ],
  error: null,
};
