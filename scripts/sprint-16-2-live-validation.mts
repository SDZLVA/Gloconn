/**
 * Sprint 16.2 — live candidate-quality validation.
 * Runs five representative routes, records candidate pools and top packages.
 * Writes docs/SPRINT_16_2_LIVE_RESULTS.json (redacted). Never logs API key.
 *
 * Run:
 *   npx tsx --import ./test/register-server-only.mjs scripts/sprint-16-2-live-validation.mts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { isApiError } from "@/lib/api/errors";
import { resetAppConfig } from "@/lib/config";
import { composePackages, computeNightsBetween } from "@/lib/packages";
import {
  selectFlightCandidates,
  selectHotelCandidates,
} from "@/lib/packages/candidates";
import {
  MAX_FLIGHT_CANDIDATES,
  MAX_HOTEL_CANDIDATES,
} from "@/lib/packages/constants";
import { resetProviderRegistry } from "@/lib/providers/core/registry";
import { resetServiceProviders } from "@/lib/services/context";
import { orchestrateTripSearch } from "@/lib/services/searchOrchestrator";
import type { SearchRequest } from "@/types/models/search-request";
import type { TravelPackage } from "@/types/models/travel-package";

function loadEnvLocal(): void {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function assertSerpApiReady(): void {
  const key = process.env.SERPAPI_API_KEY?.trim();
  if (!key) {
    throw new Error("SERPAPI_API_KEY missing after loading .env.local");
  }
  process.env.USE_MOCK_PROVIDERS = "false";
  process.env.FLIGHTS_PROVIDER = "serpapi";
  process.env.HOTELS_PROVIDER = "serpapi";
  if (!process.env.SERPAPI_DEEP_SEARCH) {
    process.env.SERPAPI_DEEP_SEARCH = "false";
  }
  resetAppConfig();
  resetProviderRegistry();
  resetServiceProviders();
}

function redact(message: string): string {
  return message
    .replace(/api_key=[^&\s]+/gi, "api_key=REDACTED")
    .replace(/[a-f0-9]{40,}/gi, "[REDACTED_HEX]");
}

type RouteSpec = {
  id: string;
  label: string;
  origin: string;
  originId: string;
  originIata: string;
  destination: string;
  destinationId: string;
  destinationIata: string;
  currency: "EUR" | "USD";
  budgetAmount: number;
};

const ROUTES: RouteSpec[] = [
  {
    id: "P1",
    label: "Milan → Tokyo",
    origin: "Milan, Italy",
    originId: "milan",
    originIata: "MXP",
    destination: "Tokyo, Japan",
    destinationId: "tokyo",
    destinationIata: "NRT",
    currency: "EUR",
    budgetAmount: 3500,
  },
  {
    id: "P2",
    label: "Milan → New York",
    origin: "Milan, Italy",
    originId: "milan",
    originIata: "MXP",
    destination: "New York, United States",
    destinationId: "new-york",
    destinationIata: "JFK",
    currency: "USD",
    budgetAmount: 3000,
  },
  {
    id: "P3",
    label: "Paris → Bangkok",
    origin: "Paris, France",
    originId: "paris",
    originIata: "CDG",
    destination: "Bangkok, Thailand",
    destinationId: "bangkok",
    destinationIata: "BKK",
    currency: "EUR",
    budgetAmount: 2800,
  },
  {
    id: "P4",
    label: "Rome → Dubai",
    origin: "Rome, Italy",
    originId: "rome",
    originIata: "FCO",
    destination: "Dubai, United Arab Emirates",
    destinationId: "dubai",
    destinationIata: "DXB",
    currency: "EUR",
    budgetAmount: 2500,
  },
  {
    id: "P5",
    label: "London → Barcelona",
    origin: "London, United Kingdom",
    originId: "london",
    originIata: "LHR",
    destination: "Barcelona, Spain",
    destinationId: "barcelona",
    destinationIata: "BCN",
    currency: "EUR",
    budgetAmount: 1200,
  },
];

const DEPARTURE = "2026-09-15";
const RETURN = "2026-09-22";

function buildRequest(route: RouteSpec): SearchRequest {
  return {
    origin: route.origin,
    originId: route.originId,
    originIata: route.originIata,
    destination: route.destination,
    destinationId: route.destinationId,
    destinationIata: route.destinationIata,
    tripType: "round-trip",
    departureDate: DEPARTURE,
    returnDate: RETURN,
    budget: { amount: route.budgetAmount, currency: route.currency },
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard",
    productTypes: ["hotels", "flights"],
  };
}

type FlightCandidateSummary = {
  id: string;
  airline: string;
  price: number;
  stops: number;
  durationMinutes: number;
  rating: number;
};

type HotelCandidateSummary = {
  id: string;
  name: string;
  price: number;
  stars: number;
  rating: number;
};

type PackageSummary = {
  id: string;
  score: number;
  totalPrice: number;
  airline: string;
  hotelName: string;
  hotelStars: number;
  flightStops: number;
};

function summarizeCandidates(
  request: SearchRequest,
  flights: Awaited<ReturnType<typeof orchestrateTripSearch>>["flights"],
  hotels: Awaited<ReturnType<typeof orchestrateTripSearch>>["hotels"],
) {
  const flightCandidates = selectFlightCandidates(
    flights,
    MAX_FLIGHT_CANDIDATES,
    request,
    hotels,
  );
  const hotelCandidates = selectHotelCandidates(
    hotels,
    MAX_HOTEL_CANDIDATES,
    request,
    flights,
  );

  return {
    flightCandidates: flightCandidates.map(
      (f): FlightCandidateSummary => ({
        id: f.id,
        airline: f.airline,
        price: f.price,
        stops: f.stops,
        durationMinutes: f.durationMinutes,
        rating: f.rating,
      }),
    ),
    hotelCandidates: hotelCandidates.map(
      (h): HotelCandidateSummary => ({
        id: h.id,
        name: h.name,
        price: h.price,
        stars: h.stars,
        rating: h.rating,
      }),
    ),
    candidateFlightStarHistogram: null as null,
    candidateHotelStarHistogram: hotelCandidates.reduce<Record<string, number>>(
      (acc, h) => {
        acc[String(h.stars)] = (acc[String(h.stars)] ?? 0) + 1;
        return acc;
      },
      {},
    ),
  };
}

function summarizeTopPackages(packages: TravelPackage[], n: number) {
  const slice = packages.slice(0, n);
  const hotelNames = new Set(slice.map((p) => p.hotelId));
  const flightIds = new Set(slice.map((p) => p.flightId));
  const stars = slice.map((p) => p.hotel.stars);

  return {
    count: slice.length,
    uniqueHotels: hotelNames.size,
    uniqueFlights: flightIds.size,
    starRange: stars.length
      ? [Math.min(...stars), Math.max(...stars)]
      : [0, 0],
    starHistogram: slice.reduce<Record<string, number>>((acc, p) => {
      acc[String(p.hotel.stars)] = (acc[String(p.hotel.stars)] ?? 0) + 1;
      return acc;
    }, {}),
    packages: slice.map(
      (p): PackageSummary => ({
        id: p.id,
        score: p.score,
        totalPrice: p.totalPrice,
        airline: p.flight.airline,
        hotelName: p.hotel.name,
        hotelStars: p.hotel.stars,
        flightStops: p.flight.stops,
      }),
    ),
  };
}

type RouteResult = {
  id: string;
  label: string;
  status: "pass" | "error";
  durationMs: number;
  providerCounts: { flights: number; hotels: number; packages: number };
  candidates: ReturnType<typeof summarizeCandidates>;
  top5: ReturnType<typeof summarizeTopPackages>;
  top20Scores: number[];
  errorMessage?: string;
};

async function runRoute(route: RouteSpec): Promise<RouteResult> {
  const started = Date.now();
  const request = buildRequest(route);
  try {
    const response = await orchestrateTripSearch(request);
    const packages =
      response.packages.length > 0
        ? response.packages
        : composePackages(response.flights, response.hotels, request);

    return {
      id: route.id,
      label: route.label,
      status: "pass",
      durationMs: Date.now() - started,
      providerCounts: {
        flights: response.flights.length,
        hotels: response.hotels.length,
        packages: packages.length,
      },
      candidates: summarizeCandidates(
        request,
        response.flights,
        response.hotels,
      ),
      top5: summarizeTopPackages(packages, 5),
      top20Scores: packages.slice(0, 20).map((p) => p.score),
    };
  } catch (error) {
    const message = isApiError(error)
      ? error.message
      : error instanceof Error
        ? error.message
        : String(error);
    return {
      id: route.id,
      label: route.label,
      status: "error",
      durationMs: Date.now() - started,
      providerCounts: { flights: 0, hotels: 0, packages: 0 },
      candidates: {
        flightCandidates: [],
        hotelCandidates: [],
        candidateFlightStarHistogram: null,
        candidateHotelStarHistogram: {},
      },
      top5: summarizeTopPackages([], 5),
      top20Scores: [],
      errorMessage: redact(message),
    };
  }
}

async function main(): Promise<void> {
  loadEnvLocal();
  assertSerpApiReady();

  console.log("Sprint 16.2 live candidate-quality validation");
  console.log(`Routes: ${ROUTES.length} · stay ${DEPARTURE} → ${RETURN}`);
  console.log("Providers: FLIGHTS=serpapi HOTELS=serpapi (key redacted)\n");

  const results: RouteResult[] = [];
  for (const route of ROUTES) {
    process.stdout.write(`Running ${route.id} ${route.label}… `);
    const result = await runRoute(route);
    results.push(result);
    console.log(
      `${result.status} · f=${result.providerCounts.flights} h=${result.providerCounts.hotels} p=${result.providerCounts.packages} (${result.durationMs}ms)`,
    );
  }

  const passed = results.filter((r) => r.status === "pass").length;
  const errored = results.filter((r) => r.status === "error").length;

  const report = {
    sprint: "16.2",
    generatedAt: new Date().toISOString(),
    stay: { departureDate: DEPARTURE, returnDate: RETURN },
    expectedNights: computeNightsBetween(DEPARTURE, RETURN),
    config: {
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "serpapi",
      HOTELS_PROVIDER: "serpapi",
      SERPAPI_DEEP_SEARCH: process.env.SERPAPI_DEEP_SEARCH ?? "false",
      SERPAPI_API_KEY: "REDACTED",
      candidateCaps: {
        flights: MAX_FLIGHT_CANDIDATES,
        hotels: MAX_HOTEL_CANDIDATES,
      },
    },
    summary: { passed, errored, total: results.length },
    results,
  };

  const outPath = resolve(process.cwd(), "docs/SPRINT_16_2_LIVE_RESULTS.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`\nWrote ${outPath}`);
  console.log(`Summary: ${passed} pass · ${errored} error`);

  if (errored > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
