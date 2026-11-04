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
import { resolveAviasalesCurrency } from "@/lib/providers/flights/aviasales/provider";
import { nightsBetween } from "@/features/liveHotels/filters";
import { liteApiKey } from "@/features/liveHotels/liteapi/client";
import { searchLiveHotels, toGlooconnHotel } from "@/features/packagesEngine/engines/travelpayoutsLiteapi";
import { buildStayPackages } from "@/features/packagesEngine/stays";
import type { PackagesEngine, PackagesEngineResult } from "@/features/packagesEngine/types";
import type { Hotel } from "@/types/models";
import type { SearchResponseWarning } from "@/types/models/search-response";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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
    const flightEstimate = Number.isFinite(cheapestFlight) ? Math.round(cheapestFlight * travelers * 100) / 100 : null;

    const budget = request.budget && request.budget.amount > 0 && request.budget.currency === currency ? request.budget.amount : null;
    const stayPackages = buildStayPackages(hotels, {
      budget,
      flightEstimate,
      travelers,
      rooms: Math.max(1, request.travelers.rooms),
      nights,
    });
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
