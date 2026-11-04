import "server-only";

/**
 * Milestone 40 — packages engine "travelpayouts-liteapi":
 *   flights = Travelpayouts (Aviasales) flight prices API,
 *   hotels  = LiteAPI live hotel rates,
 * combined into budget-aware packages by ../combine.ts. Uses no other
 * provider (no mock hotels, SerpAPI or Amadeus), whatever FLIGHTS_PROVIDER /
 * HOTELS_PROVIDER say.
 */

import { createNoRecentFlightPricesWarning, createProviderUnavailableWarning, isNoRecentPricesError } from "@/lib/api/searchMappers";
import { aviasalesFlightsProvider } from "@/lib/providers/flights/aviasales";
import { resolveAviasalesCurrency } from "@/lib/providers/flights/aviasales/provider";
import { nightsBetween } from "@/features/liveHotels/filters";
import { liteApiKey, searchLiteApiHotels } from "@/features/liveHotels/liteapi/client";
import { placeFromLabel } from "@/features/liveHotels/liteapi/location";
import type { LiveHotel } from "@/features/liveHotels/types";
import { combinePackages } from "@/features/packagesEngine/combine";
import type { PackagesEngine, PackagesEngineResult } from "@/features/packagesEngine/types";
import type { Flight, Hotel } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchResponseWarning } from "@/types/models/search-response";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HOTEL_CACHE_MS = 10 * 60_000;
const hotelCache = new Map<string, { at: number; hotels: LiveHotel[] }>();

function hotelPageUrl(hotel: LiveHotel, request: SearchRequest, currency: string): string {
  const params = new URLSearchParams({
    checkin: request.departureDate,
    checkout: request.returnDate ?? "",
    adults: String(Math.max(1, request.travelers.adults)),
    children: String(Math.max(0, request.travelers.children)),
    rooms: String(Math.max(1, request.travelers.rooms)),
    currency,
  });
  return `/hotels/${encodeURIComponent(hotel.id)}?${params.toString()}`;
}

/** LiteAPI hotel → Glooconn Hotel (so the existing cards and package pages work). */
export function toGlooconnHotel(hotel: LiveHotel, request: SearchRequest, nights: number, currency: string): Hotel {
  const amenities = [hotel.refundable ? "Free cancellation" : null, hotel.boardName].filter((v): v is string => Boolean(v));
  return {
    id: `lite-${hotel.id}`,
    destinationId: request.destinationId ?? "",
    price: hotel.totalPrice,
    currency: hotel.currency as Hotel["currency"],
    // Glooconn ratings are out of 5 (filters and cards); LiteAPI scores are out of 10.
    rating: hotel.rating ? Math.round((hotel.rating / 2) * 10) / 10 : 0,
    reviewCount: hotel.reviewCount,
    name: hotel.name,
    stars: hotel.stars,
    amenities,
    nights,
    location: hotel.address ?? (request.destination ?? "").split(",")[0]?.trim() ?? "",
    ...(hotel.latitude !== null ? { latitude: hotel.latitude } : {}),
    ...(hotel.longitude !== null ? { longitude: hotel.longitude } : {}),
    providerPropertyRef: hotel.id,
    photo: hotel.photo,
    detailsUrl: hotelPageUrl(hotel, request, currency),
  };
}

async function searchHotels(request: SearchRequest, currency: string, nationality: string): Promise<LiveHotel[]> {
  const place = placeFromLabel(request.destination ?? "");
  if (!place) throw new Error("unknown place");
  const search = {
    checkin: request.departureDate,
    checkout: request.returnDate ?? "",
    adults: Math.max(1, request.travelers.adults),
    children: Math.max(0, request.travelers.children),
    rooms: Math.max(1, request.travelers.rooms),
    currency,
  };
  const key = JSON.stringify({ ...search, place, nationality });
  const hit = hotelCache.get(key);
  if (hit && Date.now() - hit.at < HOTEL_CACHE_MS) return hit.hotels;
  const { hotels } = await searchLiteApiHotels(search, place, nationality);
  hotelCache.set(key, { at: Date.now(), hotels });
  if (hotelCache.size > 200) hotelCache.delete(hotelCache.keys().next().value!);
  return hotels;
}

export const travelpayoutsLiteApiEngine: PackagesEngine = {
  id: "travelpayouts-liteapi",
  async search(request, context = {}): Promise<PackagesEngineResult> {
    const warnings: SearchResponseWarning[] = [];
    const currency = resolveAviasalesCurrency(request);
    const nationality = /^[A-Z]{2}$/.test(context.guestNationality ?? "") ? context.guestNationality! : "US";
    const hasStay =
      request.tripType === "round-trip" &&
      ISO_DATE.test(request.returnDate ?? "") &&
      (request.returnDate ?? "") > request.departureDate;

    const flightsPromise: Promise<Flight[]> = aviasalesFlightsProvider.search(request);
    const hotelsPromise: Promise<LiveHotel[]> =
      hasStay && liteApiKey() ? searchHotels(request, currency, nationality) : Promise.resolve([]);
    const [flightsSettled, hotelsSettled] = await Promise.allSettled([flightsPromise, hotelsPromise]);

    let flights: Flight[] = [];
    if (flightsSettled.status === "fulfilled") flights = flightsSettled.value;
    else if (isNoRecentPricesError(flightsSettled.reason)) warnings.push(createNoRecentFlightPricesWarning());
    else warnings.push(createProviderUnavailableWarning("flights"));

    const nights = hasStay ? nightsBetween(request.departureDate, request.returnDate!) : 0;
    let hotels: Hotel[] = [];
    if (hotelsSettled.status === "fulfilled") {
      hotels = hotelsSettled.value.map((hotel) => toGlooconnHotel(hotel, request, nights, currency));
    } else {
      warnings.push(createProviderUnavailableWarning("hotels"));
    }

    const budget = request.budget && request.budget.amount > 0 && request.budget.currency === currency ? request.budget.amount : null;
    const packages = hasStay
      ? combinePackages(flights, hotels, {
          budget,
          travelers: Math.max(1, request.travelers.adults + request.travelers.children),
          rooms: Math.max(1, request.travelers.rooms),
          nights,
        })
      : [];
    if (packages.some((pkg) => pkg.overBudget)) {
      warnings.push({
        code: "PACKAGES_OVER_BUDGET",
        domain: "hotels",
        message: "No package fits your budget for these dates. These are the cheapest options — try other dates or a higher budget.",
      });
    }
    return { flights, hotels, packages, warnings };
  },
};
