/**
 * Milestone 40 — combine live flights and live hotels into packages.
 * Pure (no network), so it is tested on its own.
 *
 * Prices are exact for the whole group:
 *   flight total = price per person × travelers (adults + children)
 *   hotel total  = the hotel's price for all rooms and all nights
 *   package      = flight total + hotel total
 *
 * With a budget: only packages at or under it are shown, best trip first
 * (better hotel and flight, using the budget well). If none fits, the
 * cheapest few are shown and marked overBudget.
 * Without a budget: the most recommended packages (quality and price).
 */

import type { Flight, Hotel, TravelPackage } from "@/types/models";

export type CombineOptions = {
  /** Whole-trip budget, same currency as the prices; null = no budget. */
  budget: number | null;
  /** Adults + children (infants fly on a lap). */
  travelers: number;
  rooms: number;
  nights: number;
  maxPackages?: number;
};

const MAX_FLIGHTS = 8;
const MAX_HOTELS = 20;
const MAX_PER_HOTEL = 2;
const MAX_PER_FLIGHT = 4;
const OVER_BUDGET_SHOWN = 5;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** 0–1: guest score (0–10 or 0–5) and stars. */
export function hotelQuality(hotel: Hotel): number {
  const score10 = hotel.rating > 0 ? (hotel.rating > 5 ? hotel.rating : hotel.rating * 2) : 6;
  const stars = hotel.stars > 0 ? hotel.stars : 3;
  return clamp01(0.65 * (score10 / 10) + 0.35 * (stars / 5));
}

/** 0–1: fewer stops and shorter flights are better. */
export function flightQuality(flight: Flight, shortest: number): number {
  const stops = flight.stops + (flight.returnStops ?? 0);
  const stopScore = clamp01(1 - 0.3 * stops);
  const durationScore = shortest > 0 && flight.durationMinutes > 0 ? clamp01(shortest / flight.durationMinutes) : 0.7;
  return 0.6 * stopScore + 0.4 * durationScore;
}

function uniqueFlights(flights: Flight[]): Flight[] {
  const seen = new Set<string>();
  return flights.filter((flight) => {
    const key = `${flight.airline}|${flight.departureTime}|${flight.returnDepartureTime ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Cheapest few plus the best few, without duplicates. */
function pickCandidates<T>(items: T[], max: number, price: (t: T) => number, quality: (t: T) => number): T[] {
  const byPrice = [...items].sort((a, b) => price(a) - price(b));
  const byQuality = [...items].sort((a, b) => quality(b) - quality(a));
  const picked = new Set<T>();
  for (let i = 0; picked.size < max && i < items.length; i += 1) {
    if (byPrice[i]) picked.add(byPrice[i]);
    if (picked.size < max && byQuality[i]) picked.add(byQuality[i]);
  }
  return [...picked];
}

export function combinePackages(flights: Flight[], hotels: Hotel[], options: CombineOptions): TravelPackage[] {
  const travelers = Math.max(1, options.travelers);
  const rooms = Math.max(1, options.rooms);
  const maxPackages = options.maxPackages ?? 20;
  const priced = uniqueFlights(flights).filter((f) => f.price > 0);
  const stays = hotels.filter((h) => h.price > 0);
  if (priced.length === 0 || stays.length === 0) return [];

  const shortest = Math.min(...priced.map((f) => f.durationMinutes).filter((d) => d > 0), Infinity);
  const fq = new Map(priced.map((f) => [f, flightQuality(f, Number.isFinite(shortest) ? shortest : 0)]));
  const hq = new Map(stays.map((h) => [h, hotelQuality(h)]));
  const flightCandidates = pickCandidates(priced, MAX_FLIGHTS, (f) => f.price, (f) => fq.get(f)!);
  const hotelCandidates = pickCandidates(stays, MAX_HOTELS, (h) => h.price, (h) => hq.get(h)!);

  type Pair = { flight: Flight; hotel: Hotel; flightTotal: number; total: number };
  const pairs: Pair[] = [];
  for (const flight of flightCandidates) {
    for (const hotel of hotelCandidates) {
      if (flight.currency !== hotel.currency) continue;
      const flightTotal = Math.round(flight.price * travelers * 100) / 100;
      pairs.push({ flight, hotel, flightTotal, total: Math.round((flightTotal + hotel.price) * 100) / 100 });
    }
  }
  if (pairs.length === 0) return [];

  const budget = options.budget && options.budget > 0 ? options.budget : null;
  const fitting = budget ? pairs.filter((p) => p.total <= budget) : pairs;
  const overBudget = budget !== null && fitting.length === 0;

  let ranked: { pair: Pair; score: number }[];
  if (overBudget) {
    ranked = [...pairs].sort((a, b) => a.total - b.total).map((pair) => ({ pair, score: 0 }));
  } else {
    const totals = fitting.map((p) => p.total);
    const min = Math.min(...totals);
    const max = Math.max(...totals);
    ranked = fitting
      .map((pair) => {
        const cheapness = max > min ? 1 - (pair.total - min) / (max - min) : 1;
        const quality = 0.55 * hq.get(pair.hotel)! + 0.45 * fq.get(pair.flight)!;
        // With a budget, a trip that uses it well (more comfort) ranks higher;
        // without one, price matters more.
        const score = budget
          ? 0.6 * quality + 0.2 * clamp01(pair.total / budget) + 0.2 * cheapness
          : 0.6 * quality + 0.4 * cheapness;
        return { pair, score };
      })
      .sort((a, b) => b.score - a.score || a.pair.total - b.pair.total);
  }

  // Variety: not the same hotel or flight over and over.
  const perHotel = new Map<string, number>();
  const perFlight = new Map<string, number>();
  const limit = overBudget ? OVER_BUDGET_SHOWN : maxPackages;
  // Milestone 47: with only one or two flights, let each pair with more hotels
  // (a route with one saved fare still gets a full list of packages).
  const perFlightCap = Math.max(MAX_PER_FLIGHT, Math.ceil(limit / Math.max(1, flightCandidates.length)));
  const out: TravelPackage[] = [];
  for (const { pair, score } of ranked) {
    if (out.length >= limit) break;
    const h = perHotel.get(pair.hotel.id) ?? 0;
    const f = perFlight.get(pair.flight.id) ?? 0;
    if (h >= MAX_PER_HOTEL || f >= perFlightCap) continue;
    perHotel.set(pair.hotel.id, h + 1);
    perFlight.set(pair.flight.id, f + 1);
    out.push({
      id: `pkg-${pair.flight.id}-${pair.hotel.id}`.replace(/[^A-Za-z0-9_-]/g, ""),
      flight: pair.flight,
      hotel: pair.hotel,
      flightId: pair.flight.id,
      hotelId: pair.hotel.id,
      totalPrice: pair.total,
      currency: pair.flight.currency,
      nights: options.nights,
      score: Math.round(score * 1000) / 10,
      breakdown: {
        flightPerPerson: pair.flight.price,
        flightTotal: pair.flightTotal,
        hotelTotal: pair.hotel.price,
        travelers,
        rooms,
      },
      ...(overBudget ? { overBudget: true } : {}),
    });
  }
  return out;
}
