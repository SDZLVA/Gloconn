import "server-only";

/**
 * Milestone 40b — packages engine "whitelabel-liteapi" (default):
 *   hotels  = LiteAPI live hotels,
 *   flights = the live Travelpayouts White Label results, shown on the
 *             package page filtered to the money left for flights.
 * The Travelpayouts cached prices API is used only to estimate how much to
 * set aside for flights; those prices are never shown as flight results.
 */

import { createProviderUnavailableWarning } from "@/lib/api/searchMappers";
import { aviasalesFlightsProvider } from "@/lib/providers/flights/aviasales";
import { buildAviasalesParams, resolveAviasalesCurrency } from "@/lib/providers/flights/aviasales/provider";
import { fetchAviasalesPricesForDates } from "@/lib/providers/flights/aviasales/client";
import { getAppConfig } from "@/lib/config";
import { nightsBetween } from "@/features/liveHotels/filters";
import { liteApiKey } from "@/features/liveHotels/liteapi/client";
import { searchLiveHotels, toGlooconnHotel } from "@/features/packagesEngine/engines/travelpayoutsLiteapi";
import { buildStayPackages } from "@/features/packagesEngine/stays";
import type { PackagesEngine, PackagesEngineResult } from "@/features/packagesEngine/types";
import type { Hotel } from "@/types/models";
import type { SearchResponseWarning } from "@/types/models/search-response";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

/**
 * Milestone 41: when no recent fare exists for the exact dates, the cheapest
 * recent fare in the same months for a similar trip length (±2 nights), per
 * person. An estimate for "from" prices only; null when nothing is known.
 */
async function nearbyFlightEstimate(request: Parameters<PackagesEngine["search"]>[0], nights: number): Promise<number | null> {
  const config = getAppConfig().aviasales;
  if (!config.apiToken?.trim() || !request.returnDate) return null;
  const params = buildAviasalesParams(request, config, { scout: true });
  params.set("departure_at", request.departureDate.slice(0, 7));
  params.set("return_at", request.returnDate.slice(0, 7));
  params.set("limit", "30");
  const response = await fetchAviasalesPricesForDates(params, config.apiToken);
  const prices = (response?.data ?? [])
    .filter((ticket) => {
      const out = Date.parse(ticket.departure_at ?? "");
      const back = Date.parse(ticket.return_at ?? "");
      if (!Number.isFinite(out) || !Number.isFinite(back)) return false;
      return Math.abs(Math.round((back - out) / DAY_MS) - nights) <= 2;
    })
    .map((ticket) => ticket.price ?? 0)
    .filter((price) => price > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
}

export const whitelabelLiteApiEngine: PackagesEngine = {
  id: "whitelabel-liteapi",
  async search(request, context = {}): Promise<PackagesEngineResult> {
    const warnings: SearchResponseWarning[] = [];
    const currency = resolveAviasalesCurrency(request);
    const nationality = /^[A-Z]{2}$/.test(context.guestNationality ?? "") ? context.guestNationality! : "US";
    const travelers = Math.max(1, request.travelers.adults + request.travelers.children);
    const hasStay =
      request.tripType === "round-trip" &&
      ISO_DATE.test(request.returnDate ?? "") &&
      (request.returnDate ?? "") > request.departureDate;
    if (!hasStay) {
      return { flights: [], hotels: [], packages: [], stayPackages: [], warnings };
    }

    const [hotelsSettled, flightsSettled] = await Promise.allSettled([
      liteApiKey() ? searchLiveHotels(request, currency, nationality) : Promise.reject(new Error("LiteAPI not configured")),
      // Estimate only (scout = few results); failures just mean "no estimate".
      aviasalesFlightsProvider.search(request, { scout: true }),
    ]);

    const nights = nightsBetween(request.departureDate, request.returnDate!);
    let hotels: Hotel[] = [];
    if (hotelsSettled.status === "fulfilled") {
      hotels = hotelsSettled.value.map((hotel) => toGlooconnHotel(hotel, request, nights, currency));
    } else {
      warnings.push(createProviderUnavailableWarning("hotels"));
    }
    const cheapestFlight =
      flightsSettled.status === "fulfilled" && flightsSettled.value.length > 0
        ? Math.min(...flightsSettled.value.filter((f) => f.currency === currency && f.price > 0).map((f) => f.price))
        : Infinity;
    let perPerson: number | null = Number.isFinite(cheapestFlight) ? cheapestFlight : null;
    let estimateFromNearbyDates = false;
    if (perPerson === null) {
      perPerson = await nearbyFlightEstimate(request, nights).catch(() => null);
      estimateFromNearbyDates = perPerson !== null;
    }
    const flightEstimate = perPerson !== null ? Math.round(perPerson * travelers * 100) / 100 : null;

    const budget = request.budget && request.budget.amount > 0 && request.budget.currency === currency ? request.budget.amount : null;
    const stayPackages = buildStayPackages(hotels, {
      budget,
      flightEstimate,
      travelers,
      rooms: Math.max(1, request.travelers.rooms),
      nights,
    }).map((stay) => (estimateFromNearbyDates ? { ...stay, flightEstimateNearby: true } : stay));
    if (stayPackages.some((pkg) => pkg.overBudget)) {
      warnings.push({
        code: "PACKAGES_OVER_BUDGET",
        domain: "hotels",
        message: "No hotel leaves enough of your budget for flights on these dates. These are the cheapest stays — try other dates or a higher budget.",
      });
    }
    // flights: [] — the Flights tab and package pages show the live White Label results.
    return { flights: [], hotels, packages: [], stayPackages, warnings };
  },
};
