import type { CurrencyCode } from "@/types/models/currency";
import type { Hotel } from "@/types/models/hotel";

/**
 * Milestone 40b — a package led by the hotel: a live hotel (LiteAPI) plus the
 * money left in the budget for flights. The flights themselves are the live
 * Travelpayouts White Label results, filtered to `flightBudget`; Glooconn may
 * not read their prices, so there is no single exact total.
 */
export type StayPackage = {
  id: string;
  /** Milestone 59: no flight price because a live-price limit was reached (not because none exist). */
  flightsLimited?: boolean;
  hotel: Hotel;
  /** Hotel price for all rooms and nights. */
  hotelTotal: number;
  currency: CurrencyCode;
  nights: number;
  travelers: number;
  rooms: number;
  /** The traveller's whole-trip budget; null = none given. */
  budget: number | null;
  /** Money left for flights (budget − hotel); null without a budget. */
  flightBudget: number | null;
  /** Cheapest recent round-trip flights for the group (estimate), if known. */
  flightEstimate: number | null;
  /** Milestone 41: the estimate comes from nearby dates (no fare for the exact dates). */
  flightEstimateNearby?: boolean;
  /** 0–100, higher is better. */
  score: number;
  /** Short badge: "Best match", "Cheapest", "Top rated". */
  label?: string;
  /** True when no hotel leaves room for flights within the budget. */
  overBudget?: boolean;
};
