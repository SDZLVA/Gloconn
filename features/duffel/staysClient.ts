import "server-only";

/**
 * Duffel Stays (server only) — hotel search, all rooms and rates, quote and
 * booking. Same token as flights (DUFFEL_ACCESS_TOKEN). In TEST mode Duffel's
 * test hotels exist only at one spot in the Pacific, so every city search
 * shows those test hotels (the pages say so).
 */

import { duffel, duffelMode, inCurrency } from "@/features/duffel/client";
import { STAYS_TEST_LOCATION, accommodationIds, mapQuote, mapStayRates, mapStaysResults, staysSearchBody, type StayDetails } from "@/features/duffel/stays";
import { readCache, writeCache } from "@/features/flightsFallback/store";
import type { LiveHotel, LiveHotelsSearch } from "@/features/liveHotels/types";
import { findCityCentreByLabel } from "@/lib/places/world";

const SEARCH_TTL_MS = 10 * 60_000;
const CITY_RADIUS_KM = 10;

/** Hotels for a search, prices in the search currency. Cached 10 minutes. */
export async function searchDuffelStays(search: LiveHotelsSearch): Promise<LiveHotel[]> {
  const test = duffelMode() === "test";
  const centre = await findCityCentreByLabel(search.destination);
  if (!centre && !test) return [];
  const where = test ? STAYS_TEST_LOCATION : { ...centre!, radiusKm: CITY_RADIUS_KM };
  const key = `duffel-stays:v1:${duffelMode()}:${where.latitude.toFixed(3)},${where.longitude.toFixed(3)}:${search.checkin}:${search.checkout}:${search.adults}-${search.children}-${search.rooms}:${search.currency}`;
  const hit = await readCache<{ hotels: LiveHotel[] }>(key);
  if (hit && Array.isArray(hit.hotels)) return hit.hotels;
  const stay = { checkin: search.checkin, checkout: search.checkout, adults: search.adults, children: search.children, rooms: search.rooms };
  // Second, smaller search: which hotels have a free-cancellation rate (for the filter).
  const [all, free] = await Promise.all([
    duffel("/stays/search", { method: "POST", body: staysSearchBody(stay, where, where.radiusKm), timeoutMs: 30_000 }),
    duffel("/stays/search", { method: "POST", body: staysSearchBody(stay, where, where.radiusKm, true), timeoutMs: 30_000 }).catch(() => null),
  ]);
  const mapped = mapStaysResults(all, test ? STAYS_TEST_LOCATION : centre, free ? accommodationIds(free) : new Set());
  const prices = await inCurrency(mapped.map((h) => ({ price: h.totalPrice, currency: h.currency })), search.currency);
  const hotels = mapped.map((h, i) => ({ ...h, totalPrice: prices[i].price, currency: prices[i].currency }));
  await writeCache(key, { hotels }, SEARCH_TTL_MS);
  return hotels;
}

/** Every room and rate of one hotel from a search. Null when the search has expired. */
export async function getStayRates(searchResultId: string): Promise<StayDetails | null> {
  if (!/^srr_[A-Za-z0-9]+$/.test(searchResultId)) return null;
  try {
    return mapStayRates(await duffel(`/stays/search_results/${searchResultId}/actions/fetch_all_rates`, { method: "POST", timeoutMs: 30_000 }));
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 0;
    if (status === 404 || status === 410 || status === 422) return null;
    throw error;
  }
}

/** Confirms the rate is still available and its price now. */
export async function quoteStayRate(rateId: string) {
  return mapQuote(await duffel("/stays/quotes", { method: "POST", body: { data: { rate_id: rateId } }, timeoutMs: 30_000 }));
}

/** Books the quote (test mode: paid from the test balance). */
export async function bookStay(
  quoteId: string,
  guests: { givenName: string; familyName: string }[],
  contact: { email: string; phone: string },
  requests: string,
): Promise<{ bookingId: string; reference: string }> {
  const raw = (await duffel("/stays/bookings", {
    method: "POST",
    body: {
      data: {
        quote_id: quoteId,
        guests: guests.map((g) => ({ given_name: g.givenName, family_name: g.familyName })),
        email: contact.email,
        phone_number: contact.phone,
        ...(requests ? { accommodation_special_requests: requests } : {}),
      },
    },
    timeoutMs: 60_000,
  })) as { data?: { id?: string; reference?: string } };
  if (!raw?.data?.id || !raw.data.reference) throw new Error("Duffel did not confirm the stay");
  return { bookingId: raw.data.id, reference: raw.data.reference };
}
