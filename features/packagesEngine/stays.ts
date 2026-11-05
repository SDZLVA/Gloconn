/**
 * Milestone 40b — hotel-led packages. Glooconn may not read the live White
 * Label flight prices, so a package is: a live hotel + the money left in the
 * budget for flights. The package page then shows the live flights filtered
 * to that amount, so every flight shown fits the budget.
 *
 * To leave enough room for flights, the cheapest recent flight price for the
 * group (Travelpayouts cached prices, an estimate only) is set aside first;
 * without one, 40% of the budget is.
 */

import { hotelQuality } from "@/features/packagesEngine/combine";
import type { Hotel } from "@/types/models";
import type { StayPackage } from "@/types/models/stay-package";

export type StayOptions = {
  budget: number | null;
  /** Cheapest recent flights for the whole group, if known. */
  flightEstimate: number | null;
  travelers: number;
  rooms: number;
  nights: number;
  max?: number;
};

const FLIGHT_BUFFER = 1.15;
const FALLBACK_FLIGHT_SHARE = 0.4;
const OVER_BUDGET_SHOWN = 5;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function flightReserve(budget: number, flightEstimate: number | null): number {
  const reserve = flightEstimate && flightEstimate > 0 ? flightEstimate * FLIGHT_BUFFER : budget * FALLBACK_FLIGHT_SHARE;
  return Math.round(reserve * 100) / 100;
}

export function buildStayPackages(hotels: Hotel[], options: StayOptions): StayPackage[] {
  const stays = hotels.filter((h) => h.price > 0);
  if (stays.length === 0) return [];
  const max = options.max ?? 20;
  const budget = options.budget && options.budget > 0 ? options.budget : null;
  const hotelBudget = budget ? budget - flightReserve(budget, options.flightEstimate) : null;
  const fitting = hotelBudget !== null ? stays.filter((h) => h.price <= hotelBudget) : stays;
  const overBudget = budget !== null && fitting.length === 0;

  let ranked: { hotel: Hotel; score: number }[];
  if (overBudget) {
    ranked = [...stays].sort((a, b) => a.price - b.price).slice(0, OVER_BUDGET_SHOWN).map((hotel) => ({ hotel, score: 0 }));
  } else {
    const prices = fitting.map((h) => h.price);
    const min = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    ranked = fitting
      .map((hotel) => {
        const cheapness = maxPrice > min ? 1 - (hotel.price - min) / (maxPrice - min) : 1;
        const quality = hotelQuality(hotel);
        const score =
          hotelBudget !== null
            ? 0.6 * quality + 0.2 * clamp01(hotel.price / hotelBudget) + 0.2 * cheapness
            : 0.6 * quality + 0.4 * cheapness;
        return { hotel, score };
      })
      .sort((a, b) => b.score - a.score || a.hotel.price - b.hotel.price);
    // Always include the cheapest stay, so "Cheapest" is really the cheapest.
    const cheapest = ranked.reduce((best, item) => (item.hotel.price < best.hotel.price ? item : best), ranked[0]);
    ranked = ranked.slice(0, max);
    if (cheapest && !ranked.includes(cheapest)) ranked = [...ranked.slice(0, max - 1), cheapest];
  }

  const cheapestId = [...ranked].sort((a, b) => a.hotel.price - b.hotel.price)[0]?.hotel.id;
  const topRatedId = [...ranked].sort((a, b) => b.hotel.rating - a.hotel.rating)[0]?.hotel.id;
  return ranked.map(({ hotel, score }, index) => ({
    id: `stay-${hotel.id}`.replace(/[^A-Za-z0-9_-]/g, ""),
    hotel,
    hotelTotal: hotel.price,
    currency: hotel.currency,
    nights: options.nights,
    travelers: Math.max(1, options.travelers),
    rooms: Math.max(1, options.rooms),
    budget,
    flightBudget: budget !== null ? Math.max(0, Math.round((budget - hotel.price) * 100) / 100) : null,
    flightEstimate: options.flightEstimate,
    score: Math.round(score * 1000) / 10,
    label: overBudget
      ? undefined
      : index === 0
        ? "Best match"
        : hotel.id === cheapestId
          ? "Cheapest"
          : hotel.id === topRatedId
            ? "Top rated"
            : undefined,
    ...(overBudget ? { overBudget: true } : {}),
  }));
}
