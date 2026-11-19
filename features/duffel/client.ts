import "server-only";

/**
 * Duffel flights API (server only). Token: DUFFEL_ACCESS_TOKEN — a TEST
 * token ("duffel_test_…") for now: Duffel returns test airlines and no real
 * ticket or money is involved. Booking with a live token stays switched off
 * until card payments are built (see bookingEnabled).
 */

import type { DataFlightsSearch } from "@/features/flightsData/map";
import { convertAmount } from "@/features/fx/ecb";
import { eurRates } from "@/features/fx/rates";
import { readCache, writeCache } from "@/features/flightsFallback/store";
import { duffelErrorMessage, mapDuffelOffers, mapSeatMaps, offerRequestBody, summarizeOffer, type OfferSummary, type SeatMap } from "@/features/duffel/map";
import type { ServicePick } from "@/features/duffel/extras";
import type { Flight } from "@/types/models";

const BASE = "https://api.duffel.com";
const SEARCH_TTL_MS = 10 * 60_000;

function token(): string | null {
  const t = process.env.DUFFEL_ACCESS_TOKEN?.trim();
  return t ? t : null;
}

export function duffelConfigured(): boolean {
  return token() !== null;
}

export function duffelMode(): "test" | "live" | null {
  const t = token();
  if (!t) return null;
  return t.startsWith("duffel_test_") ? "test" : "live";
}

/** Only test bookings for now (no customer payment flow yet). */
export function bookingEnabled(): boolean {
  return duffelMode() === "test";
}

export class DuffelError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function duffel(path: string, init: { method?: string; body?: unknown; timeoutMs?: number } = {}): Promise<unknown> {
  const t = token();
  if (!t) throw new DuffelError("Duffel is not configured", 503);
  const response = await fetch(`${BASE}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Duffel-Version": "v2",
      Authorization: `Bearer ${t}`,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
    signal: AbortSignal.timeout(init.timeoutMs ?? 30_000),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new DuffelError(duffelErrorMessage(body) ?? `Duffel ${response.status}`, response.status);
  return body;
}

/** Flights for a search (live from airlines through Duffel), prices in the search currency. Cached 10 minutes. */
export async function searchDuffelFlights(search: DataFlightsSearch, destinationId = ""): Promise<Flight[]> {
  const key = `duffel:v2:${duffelMode()}:${search.origin}:${search.destination}:${search.departureDate}:${search.returnDate ?? "ow"}:${search.adults}-${search.children}-${search.infants}:${search.currency}`;
  const hit = await readCache<{ flights: Flight[] }>(key);
  if (hit && Array.isArray(hit.flights)) return hit.flights;
  const raw = await duffel("/air/offer_requests?return_offers=true&supplier_timeout=20000", { method: "POST", body: offerRequestBody(search), timeoutMs: 40_000 });
  const flights = await inCurrency(mapDuffelOffers(raw, search, destinationId), search.currency);
  await writeCache(key, { flights }, SEARCH_TTL_MS);
  return flights;
}

async function inCurrency(flights: Flight[], currency: string): Promise<Flight[]> {
  const target = currency.toUpperCase();
  if (flights.every((f) => f.currency.toUpperCase() === target)) return flights;
  const rates = await eurRates();
  if (!rates) return flights;
  return flights.map((f) => {
    const price = convertAmount(f.price, f.currency, target, rates);
    return price === null ? f : { ...f, price: Math.round(price * 100) / 100, currency: target as Flight["currency"] };
  });
}

/** The offer with today's price (offers expire after a few minutes). Null when it has expired. */
export async function getOffer(offerId: string): Promise<OfferSummary | null> {
  if (!/^off_[A-Za-z0-9]+$/.test(offerId)) return null;
  try {
    return summarizeOffer(await duffel(`/air/offers/${offerId}?return_available_services=true`));
  } catch (error) {
    if (error instanceof DuffelError && (error.status === 404 || error.status === 422)) return null;
    throw error;
  }
}

/** Seat maps for the offer's flights ([] when the airline doesn't sell seats through Duffel). */
export async function getSeatMaps(offer: OfferSummary): Promise<SeatMap[]> {
  try {
    return mapSeatMaps(await duffel(`/air/seat_maps?offer_id=${encodeURIComponent(offer.id)}`, { timeoutMs: 15_000 }), offer);
  } catch {
    return [];
  }
}

export type BookingPassenger = {
  id: string;
  title: "mr" | "ms" | "mrs" | "miss";
  gender: "m" | "f";
  givenName: string;
  familyName: string;
  bornOn: string;
};

/** Books the offer (test mode: paid from the test balance). Returns the airline booking reference. */
export async function createOrder(
  offer: OfferSummary,
  passengers: BookingPassenger[],
  contact: { email: string; phone: string },
  extras: { services: ServicePick[]; total: number } = { services: [], total: offer.total },
): Promise<{ orderId: string; bookingReference: string }> {
  const adults = offer.passengers.filter((p) => p.type === "adult").map((p) => p.id);
  const infants = offer.passengers.filter((p) => p.type === "infant").map((p) => p.id);
  const body = {
    data: {
      type: "instant",
      selected_offers: [offer.id],
      passengers: passengers.map((p) => ({
        id: p.id,
        title: p.title,
        gender: p.gender,
        given_name: p.givenName,
        family_name: p.familyName,
        born_on: p.bornOn,
        email: contact.email,
        phone_number: contact.phone,
        // Each infant travels on an adult's lap.
        ...(adults.indexOf(p.id) >= 0 && infants[adults.indexOf(p.id)] ? { infant_passenger_id: infants[adults.indexOf(p.id)] } : {}),
      })),
      ...(extras.services.length > 0 ? { services: extras.services } : {}),
      // The payment must equal the offer plus every extra.
      payments: [{ type: "balance", amount: extras.total.toFixed(2), currency: offer.currency }],
    },
  };
  const raw = (await duffel("/air/orders", { method: "POST", body, timeoutMs: 60_000 })) as { data?: { id?: string; booking_reference?: string } };
  const orderId = raw?.data?.id;
  const bookingReference = raw?.data?.booking_reference;
  if (!orderId || !bookingReference) throw new DuffelError("Duffel did not confirm the booking", 502);
  return { orderId, bookingReference };
}
