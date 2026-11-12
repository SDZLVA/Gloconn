import "server-only";

/**
 * Milestone 45 — packages engine "travelpayouts-bookingcom" (default):
 *   flights = Travelpayouts "Flight Data" API via RapidAPI (cached prices),
 *   hotels  = Booking.com via RapidAPI (Api Dojo) + Agoda via RapidAPI (M56, capped),
 * combined into exact-total packages by ../combine.ts. When no cached flight
 * exists for the dates, falls back to hotel-led packages whose page shows
 * the live White Label flights (the only place White Label still appears).
 */

import { createNoRecentFlightPricesWarning, createProviderUnavailableWarning } from "@/lib/api/searchMappers";
import { resolveAviasalesCurrency } from "@/lib/providers/flights/aviasales/provider";
import { nightsBetween } from "@/features/liveHotels/filters";
import { rapidApiKey, searchBookingHotels } from "@/features/liveHotels/bookingcom/client";
import { agodaConfigured } from "@/features/liveHotels/agoda/client";
import { searchHotelsCombined } from "@/features/liveHotels/combined";
import type { LiveHotel } from "@/features/liveHotels/types";
import { dataFlightsConfigured } from "@/features/flightsData/client";
import { searchFlightsWithFallback } from "@/features/flightsFallback";
import { combinePackages } from "@/features/packagesEngine/combine";
import { buildStayPackages } from "@/features/packagesEngine/stays";
import { retryOnce } from "@/features/packagesEngine/retry";
import type { PackagesEngine, PackagesEngineResult } from "@/features/packagesEngine/types";
import type { Flight, Hotel } from "@/types/models";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchResponseWarning } from "@/types/models/search-response";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;


function bookingLink(hotel: LiveHotel, request: SearchRequest, currency: string): string | undefined {
  if (!hotel.externalUrl) return undefined;
  // Agoda links (M56) already carry the dates and guests.
  if (hotel.id.startsWith("ag-")) return hotel.externalUrl;
  try {
    const url = new URL(hotel.externalUrl);
    url.searchParams.set("checkin", request.departureDate);
    url.searchParams.set("checkout", request.returnDate ?? "");
    url.searchParams.set("group_adults", String(Math.max(1, request.travelers.adults)));
    url.searchParams.set("group_children", String(Math.max(0, request.travelers.children)));
    url.searchParams.set("no_rooms", String(Math.max(1, request.travelers.rooms)));
    url.searchParams.set("selected_currency", currency);
    return url.toString();
  } catch {
    return hotel.externalUrl;
  }
}

function toHotel(hotel: LiveHotel, request: SearchRequest, nights: number, currency: string): Hotel {
  return {
    id: hotel.id,
    destinationId: request.destinationId ?? "",
    price: hotel.totalPrice,
    currency: hotel.currency as Hotel["currency"],
    // Glooconn ratings are out of 5; Booking.com scores are out of 10.
    rating: hotel.rating ? Math.round((hotel.rating / 2) * 10) / 10 : 0,
    reviewCount: hotel.reviewCount,
    name: hotel.name,
    stars: hotel.stars,
    amenities: [hotel.refundable ? "Free cancellation" : null, hotel.boardName].filter((v): v is string => Boolean(v)),
    nights,
    location: hotel.address ?? (request.destination ?? "").split(",")[0]?.trim() ?? "",
    ...(hotel.latitude !== null ? { latitude: hotel.latitude } : {}),
    ...(hotel.longitude !== null ? { longitude: hotel.longitude } : {}),
    providerPropertyRef: hotel.id,
    photo: hotel.photo,
    detailsUrl: bookingLink(hotel, request, currency),
  };
}

export const dataBookingcomEngine: PackagesEngine = {
  id: "travelpayouts-bookingcom",
  async search(request, context): Promise<PackagesEngineResult> {
    const warnings: SearchResponseWarning[] = [];
    const currency = resolveAviasalesCurrency(request);
    const travelers = Math.max(1, request.travelers.adults + request.travelers.children);
    const hasStay =
      request.tripType === "round-trip" &&
      ISO_DATE.test(request.returnDate ?? "") &&
      (request.returnDate ?? "") > request.departureDate;
    const origin = (request.originCityIata ?? request.originIata ?? "").toUpperCase();
    const destination = (request.destinationCityIata ?? request.destinationIata ?? "").toUpperCase();

    // Milestone 57: quick = saved fares + Booking.com only; partial tells the page to ask again.
    const quick = Boolean(context?.quick);
    let flightsMore = false;
    const flightsPromise: Promise<Flight[]> =
      dataFlightsConfigured() && origin && destination
        ? retryOnce(() => searchFlightsWithFallback(
            {
              origin,
              destination,
              departureDate: request.departureDate,
              returnDate: hasStay ? request.returnDate : null,
              adults: Math.max(1, request.travelers.adults),
              children: request.travelers.children,
              infants: request.travelers.infants,
              currency,
            },
            { visitor: context?.visitor ?? "", destinationId: request.destinationId ?? "", quick },
          )).then((r) => {
            flightsMore = Boolean(r.more);
            return r.flights;
          })
        : Promise.reject(new Error("flight data not configured"));
    const hotelsPromise: Promise<LiveHotel[]> =
      hasStay && rapidApiKey()
        ? retryOnce(() => (quick ? searchBookingHotels : searchHotelsCombined)({
            destination: request.destination ?? "",
            checkin: request.departureDate,
            checkout: request.returnDate!,
            adults: Math.max(1, request.travelers.adults),
            children: Math.max(0, request.travelers.children),
            rooms: Math.max(1, request.travelers.rooms),
            currency,
          })).then((r) => r.hotels)
        : Promise.resolve([]);
    const [flightsSettled, hotelsSettled] = await Promise.allSettled([flightsPromise, hotelsPromise]);

    let flights: Flight[] = [];
    if (flightsSettled.status === "fulfilled") flights = flightsSettled.value;
    else warnings.push(createProviderUnavailableWarning("flights"));
    const partial = quick && (flightsMore || (hasStay && agodaConfigured()));
    if (flightsSettled.status === "fulfilled" && flights.length === 0 && !(quick && flightsMore)) warnings.push(createNoRecentFlightPricesWarning());

    const nights = hasStay ? nightsBetween(request.departureDate, request.returnDate!) : 0;
    let hotels: Hotel[] = [];
    if (hotelsSettled.status === "fulfilled") hotels = hotelsSettled.value.map((h) => toHotel(h, request, nights, currency));
    else warnings.push(createProviderUnavailableWarning("hotels"));

    const budget = request.budget && request.budget.amount > 0 && request.budget.currency === currency ? request.budget.amount : null;
    const rooms = Math.max(1, request.travelers.rooms);
    if (!hasStay) return { flights, hotels, packages: [], warnings, partial };

    if (flights.length > 0) {
      const packages = combinePackages(flights, hotels, { budget, travelers, rooms, nights });
      if (packages.some((p) => p.overBudget)) {
        warnings.push({
          code: "PACKAGES_OVER_BUDGET",
          domain: "hotels",
          message: "No package fits your budget for these dates. These are the cheapest options — try other dates or a higher budget.",
        });
      }
      return { flights, hotels, packages, warnings, partial };
    }
    // No cached flights for these dates: hotel-led packages with live flights on their page.
    const stayPackages = buildStayPackages(hotels, { budget, flightEstimate: null, travelers, rooms, nights });
    return { flights, hotels, packages: [], stayPackages, warnings, partial };
  },
};
