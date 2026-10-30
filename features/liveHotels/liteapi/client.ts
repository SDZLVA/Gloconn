import "server-only";

/**
 * Milestone 30 — LiteAPI (Nuitee) live hotel search, server side only.
 * Uses only the free rates endpoint (no paid place search / price index).
 * Key: LITEAPI_API_KEY (Vercel Secret; sandbox keys start with "sand_").
 */

import { mapLiteApiRates } from "@/features/liveHotels/liteapi/map";
import type { LiteApiPlace } from "@/features/liveHotels/liteapi/location";
import type { LiveHotel, LiveHotelsSearch } from "@/features/liveHotels/types";

const RATES_URL = "https://api.liteapi.travel/v3.0/hotels/rates";
const TIMEOUT_MS = 20_000;
const RESULT_LIMIT = 60;

export function liteApiKey(): string | null {
  const key = process.env.LITEAPI_API_KEY?.trim();
  return key ? key : null;
}

export class LiteApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Splits guests over rooms the way travellers expect (adults first). */
export function buildOccupancies(adults: number, children: number, rooms: number) {
  const roomCount = Math.max(1, Math.min(rooms, adults));
  const occupancies: { adults: number; children: number[] }[] = [];
  for (let i = 0; i < roomCount; i += 1) {
    const roomAdults = Math.floor(adults / roomCount) + (i < adults % roomCount ? 1 : 0);
    const roomChildren = Math.floor(children / roomCount) + (i < children % roomCount ? 1 : 0);
    // Ages are not asked in the search form; 8 is a neutral child age.
    occupancies.push({ adults: roomAdults, children: Array.from({ length: roomChildren }, () => 8) });
  }
  return occupancies;
}

export async function searchLiteApiHotels(
  search: LiveHotelsSearch,
  place: LiteApiPlace,
  guestNationality: string,
): Promise<{ hotels: LiveHotel[]; raw: unknown }> {
  const key = liteApiKey();
  if (!key) throw new LiteApiError("LiteAPI is not configured", 503);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(RATES_URL, {
      method: "POST",
      headers: {
        "X-API-Key": key,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        checkin: search.checkin,
        checkout: search.checkout,
        currency: search.currency,
        guestNationality,
        occupancies: buildOccupancies(search.adults, search.children, search.rooms),
        cityName: place.cityName,
        countryCode: place.countryCode,
        maxRatesPerHotel: 1,
        includeHotelData: true,
        limit: RESULT_LIMIT,
        timeout: 12,
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (response.status === 204) return { hotels: [], raw: null };
    const raw: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new LiteApiError(`LiteAPI ${response.status}`, response.status);
    return { hotels: mapLiteApiRates(raw, search.currency), raw };
  } finally {
    clearTimeout(timer);
  }
}
