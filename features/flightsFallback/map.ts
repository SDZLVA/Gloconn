/**
 * Milestone 49 — live flight fallbacks → Glooconn Flight[] (pure, tested).
 *   Skyscanner Flights (RapidAPI, Crawlio)    → mapSkyItineraries
 *   SerpApi Google Flights                    → mapGoogleFlights
 * Prices are stored per person (Glooconn convention). `groupPrice` says
 * whether the provider's price is for all travellers together.
 */

import { buildAviasalesSearchUrl } from "@/lib/affiliate/aviasalesLink";
import { airlineDisplayName } from "@/lib/providers/flights/aviasales/airlines";
import type { DataFlightsSearch } from "@/features/flightsData/map";
import type { Flight } from "@/types/models";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const asString = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
function asNumber(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const iataCode = (v: unknown): string | null => {
  const s = asString(v)?.toUpperCase() ?? null;
  return s && /^[A-Z0-9]{2}$/.test(s) ? s : null;
};

/** "2026-11-23T06:40:00" or "2026-11-23 06:40" → "2026-11-23 06:40". */
export function localTime(value: string | null): string {
  if (!value) return "";
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(value);
  return m ? `${m[1]} ${m[2]}` : value;
}

export const flyersOf = (search: DataFlightsSearch) => Math.max(1, search.adults + search.children);

function perPerson(price: number, search: DataFlightsSearch, groupPrice: boolean): number {
  const each = groupPrice ? price / flyersOf(search) : price;
  return Math.round(each * 100) / 100;
}

function aviasales(search: DataFlightsSearch): string | undefined {
  return (
    buildAviasalesSearchUrl({
      origin: search.origin,
      destination: search.destination,
      departureDate: search.departureDate,
      returnDate: search.returnDate,
      adults: search.adults,
      children: search.children,
      infants: search.infants,
    }) ?? undefined
  );
}

/** yymmdd for Skyscanner links. */
const yymmdd = (date: string) => date.slice(2, 4) + date.slice(5, 7) + date.slice(8, 10);

export function skyscannerUrl(originSkyId: string, destinationSkyId: string, search: DataFlightsSearch, itineraryId?: string | null): string {
  const path = [originSkyId, destinationSkyId, yymmdd(search.departureDate), search.returnDate ? yymmdd(search.returnDate) : null]
    .filter(Boolean)
    .map((p) => encodeURIComponent(String(p).toLowerCase()))
    .join("/");
  const q = new URLSearchParams({ adultsv2: String(Math.max(1, search.adults)), cabinclass: "economy" });
  if (search.children > 0) q.set("childrenv2", Array.from({ length: search.children }, () => "8").join("|"));
  // Milestone 52: Skyscanner opens one exact itinerary at /config/{outLeg}|{backLeg}.
  const legs = itineraryId && /^[0-9A-Za-z|,-]{10,300}$/.test(itineraryId) ? `config/${encodeURIComponent(itineraryId)}/` : "";
  return `https://www.skyscanner.net/transport/flights/${path}/${legs}?${q.toString()}`;
}

/**
 * Skyscanner Flights (RapidAPI, Crawlio — skyscanner-flights4) →  Flight[]:
 * { results: [{ id, price_raw, carriers: ["Wizz Air Malta"], legs: [{ from, to,
 *   dep, arr, dur_min, stops, segments: [{ flight: "W46001" }] }, …],
 *   queryLegs: [{ resolvedOrigin: { iata: "ROME" }, resolvedDest: { iata: "LOND" } }] }] }
 */
export function mapSkyItineraries(
  raw: unknown,
  search: DataFlightsSearch,
  opts: { groupPrice: boolean; destinationId?: string },
): Flight[] {
  const rows = isObject(raw) ? list(raw.results).filter(isObject) : [];
  const flights: Flight[] = [];
  for (const item of rows) {
    const price = asNumber(item.price_raw);
    const legs = list(item.legs).filter(isObject);
    const out = legs[0];
    if (!price || price <= 0 || !out) continue;
    const back = search.returnDate ? legs[1] : undefined;
    if (search.returnDate && !back) continue;
    const departure = asString(out.dep);
    if (!departure || departure.slice(0, 10) !== search.departureDate) continue;
    if (back && asString(back.dep)?.slice(0, 10) !== search.returnDate) continue;
    const segment = list(out.segments).find(isObject);
    const flightNo = asString(segment?.flight) ?? "";
    const airlineCode = iataCode(flightNo.slice(0, 2)) ?? "";
    const airline = asString(list(item.carriers)[0]) ?? airlineDisplayName(airlineCode) ?? "Airline";
    const query = list(item.queryLegs).find(isObject);
    const fromSky = isObject(query?.resolvedOrigin) ? asString(query.resolvedOrigin.iata) : null;
    const toSky = isObject(query?.resolvedDest) ? asString(query.resolvedDest.iata) : null;
    const bookingUrl = aviasales(search);
    flights.push({
      id: `sky-${asString(item.id) ?? `${flightNo}-${departure}`}`.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 120),
      destinationId: opts.destinationId ?? "",
      price: perPerson(price, search, opts.groupPrice),
      currency: search.currency as Flight["currency"],
      rating: 0,
      airline,
      ...(airlineCode ? { airlineCode } : {}),
      departureTime: localTime(departure),
      arrivalTime: localTime(asString(out.arr)),
      durationMinutes: Math.max(0, Math.round(asNumber(out.dur_min) ?? 0)),
      stops: Math.max(0, Math.round(asNumber(out.stops) ?? 0)),
      cabin: "Economy",
      originAirport: asString(out.from) ?? search.origin,
      destinationAirport: asString(out.to) ?? search.destination,
      ...(back
        ? {
            returnDepartureTime: localTime(asString(back.dep)),
            returnStops: Math.max(0, Math.round(asNumber(back.stops) ?? 0)),
            returnDurationMinutes: Math.max(0, Math.round(asNumber(back.dur_min) ?? 0)),
          }
        : {}),
      ...(bookingUrl ? { bookingUrl } : {}),
      source: "skyscanner",
      sourceUrl: skyscannerUrl(fromSky ?? search.origin, toSky ?? search.destination, search, asString(item.id)),
    } as Flight);
  }
  return flights.sort((a, b) => a.price - b.price);
}

/** SerpApi google_flights (first call only: outbound + round-trip price) → Flight[]. */
export function mapGoogleFlights(
  raw: unknown,
  search: DataFlightsSearch,
  opts: { groupPrice: boolean; destinationId?: string },
): Flight[] {
  if (!isObject(raw)) return [];
  const meta = isObject(raw.search_metadata) ? raw.search_metadata : null;
  const sourceUrl = asString(meta?.google_flights_url) ?? undefined;
  const options = [...list(raw.best_flights), ...list(raw.other_flights)].filter(isObject);
  const flights: Flight[] = [];
  for (const option of options) {
    const price = asNumber(option.price);
    const segments = list(option.flights).filter(isObject);
    const first = segments[0];
    const last = segments[segments.length - 1];
    if (!price || price <= 0 || !first || !last) continue;
    const dep = isObject(first.departure_airport) ? first.departure_airport : null;
    const arr = isObject(last.arrival_airport) ? last.arrival_airport : null;
    const departure = asString(dep?.time);
    if (!departure || departure.slice(0, 10) !== search.departureDate) continue;
    const number = asString(first.flight_number);
    const airlineCode = iataCode(number?.split(" ")[0]) ?? "";
    const airline = asString(first.airline) ?? airlineDisplayName(airlineCode) ?? "Airline";
    const bookingUrl = aviasales(search);
    flights.push({
      id: `ggl-${airlineCode}${(number ?? "").replace(/\s+/g, "")}-${departure}`.replace(/[^A-Za-z0-9_-]/g, ""),
      destinationId: opts.destinationId ?? "",
      price: perPerson(price, search, opts.groupPrice),
      currency: search.currency as Flight["currency"],
      rating: 0,
      airline,
      ...(airlineCode ? { airlineCode } : {}),
      departureTime: localTime(departure),
      arrivalTime: localTime(asString(arr?.time)),
      durationMinutes: Math.max(0, Math.round(asNumber(option.total_duration) ?? 0)),
      stops: Math.max(0, segments.length - 1),
      cabin: "Economy",
      originAirport: asString(dep?.id) ?? search.origin,
      destinationAirport: asString(arr?.id) ?? search.destination,
      ...(bookingUrl ? { bookingUrl } : {}),
      source: "google",
      ...(sourceUrl ? { sourceUrl } : {}),
    } as Flight);
  }
  return flights.sort((a, b) => a.price - b.price);
}
