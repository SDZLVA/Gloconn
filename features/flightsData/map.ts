/**
 * Milestone 45 — Travelpayouts "Flight Data" (RapidAPI) → Glooconn Flight[].
 * Endpoint /v1/prices/cheap answers per destination, keyed by number of
 * stops: { data: { ROM: { "0": { price, airline, flight_number,
 * departure_at, return_at, expires_at }, "1": {...} } } }.
 * Prices are cached (recent searches by other travellers), per person.
 */

import { buildAviasalesSearchUrl } from "@/lib/affiliate/aviasalesLink";
import { airlineDisplayName } from "@/lib/providers/flights/aviasales/airlines";
import type { Flight } from "@/types/models";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const asString = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
function asNumber(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

export type DataFlightsSearch = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string | null;
  adults: number;
  children: number;
  infants: number;
  currency: string;
};

/** "2026-12-10T06:35:00Z" → "2026-12-10 06:35" (Glooconn flight time format). */
function localTime(iso: string | null): string {
  if (!iso) return "";
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(iso);
  return m ? `${m[1]} ${m[2]}` : iso;
}

export function mapDataFlights(raw: unknown, search: DataFlightsSearch, destinationId = ""): Flight[] {
  const data = isObject(raw) && isObject(raw.data) ? raw.data : null;
  if (!data) return [];
  const flights: Flight[] = [];
  for (const [dest, byStops] of Object.entries(data)) {
    if (!isObject(byStops)) continue;
    for (const [stopsKey, offer] of Object.entries(byStops)) {
      if (!isObject(offer)) continue;
      const price = asNumber(offer.price);
      const airlineCode = asString(offer.airline)?.toUpperCase() ?? "";
      const departureAt = asString(offer.departure_at);
      if (!price || price <= 0 || !departureAt) continue;
      const returnAt = asString(offer.return_at);
      const stops = Math.max(0, Math.round(asNumber(stopsKey) ?? 0));
      const outDate = departureAt.slice(0, 10);
      const backDate = returnAt ? returnAt.slice(0, 10) : null;
      // Only offers for the exact trip asked for: a one-way search must not
      // show a round-trip price, and other dates would mislead.
      if (search.returnDate ? backDate !== search.returnDate : returnAt) continue;
      if (outDate !== search.departureDate) continue;
      const bookingUrl = buildAviasalesSearchUrl({
        origin: search.origin,
        destination: dest || search.destination,
        departureDate: outDate,
        returnDate: backDate,
        adults: search.adults,
        children: search.children,
        infants: search.infants,
      });
      const number = asNumber(offer.flight_number);
      flights.push({
        id: `tpd-${dest}-${stops}-${outDate}-${airlineCode}${number ?? ""}`.replace(/[^A-Za-z0-9_-]/g, ""),
        destinationId,
        price: Math.round(price * 100) / 100,
        currency: search.currency as Flight["currency"],
        rating: 0,
        airline: airlineDisplayName(airlineCode) ?? (airlineCode || "Airline"),
        ...(airlineCode ? { airlineCode } : {}),
        departureTime: localTime(departureAt),
        arrivalTime: "",
        durationMinutes: Math.max(0, Math.round(asNumber(offer.duration_to) ?? 0)),
        stops,
        cabin: "Economy",
        priceIsRecent: true,
        originAirport: search.origin,
        destinationAirport: dest || search.destination,
        ...(returnAt ? { returnDepartureTime: localTime(returnAt), returnStops: stops } : {}),
        ...(bookingUrl ? { bookingUrl } : {}),
      } as Flight);
    }
  }
  return flights.sort((a, b) => a.price - b.price);
}
