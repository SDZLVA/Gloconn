/**
 * Sprint 16.3 — live package diversity validation.
 * Compares naive score-first top 5 vs diversity-aware composePackages output.
 *
 * Run:
 *   npx tsx --import ./test/register-server-only.mjs scripts/sprint-16-3-live-validation.mts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { isApiError } from "@/lib/api/errors";
import { resetAppConfig } from "@/lib/config";
import { composePackages, computeNightsBetween } from "@/lib/packages";
import { MAX_PACKAGES } from "@/lib/packages/constants";
import { measureDiversityMetrics } from "@/lib/packages/diversity";
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

const ROUTES = [
  {
    id: "P1",
    label: "Milan → Tokyo",
    origin: "Milan, Italy",
    originId: "milan",
    originIata: "MXP",
    destination: "Tokyo, Japan",
    destinationId: "tokyo",
    destinationIata: "NRT",
    currency: "EUR" as const,
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
    currency: "USD" as const,
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
    currency: "EUR" as const,
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
    currency: "EUR" as const,
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
    currency: "EUR" as const,
    budgetAmount: 1200,
  },
];

const DEPARTURE = "2026-09-15";
const RETURN = "2026-09-22";

function buildRequest(route: (typeof ROUTES)[number]): SearchRequest {
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

type PackageRow = {
  rank: number;
  id: string;
  score: number;
  totalPrice: number;
  airline: string;
  hotelName: string;
  hotelStars: number;
  flightStops: number;
};

function summarizeTop(packages: TravelPackage[], n: number) {
  const metrics = measureDiversityMetrics(packages, n);
  return {
    metrics,
    packages: packages.slice(0, n).map(
      (p, i): PackageRow => ({
        rank: i + 1,
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

function scoreDelta(naive: TravelPackage[], diverse: TravelPackage[], n: number) {
  const naiveMin = Math.min(...naive.slice(0, n).map((p) => p.score));
  const diverseMin = Math.min(...diverse.slice(0, n).map((p) => p.score));
  return {
    naiveTopScore: naive[0]?.score ?? null,
    diverseTopScore: diverse[0]?.score ?? null,
    naiveMinTopN: naiveMin,
    diverseMinTopN: diverseMin,
    minScoreDelta: diverseMin - naiveMin,
  };
}

async function runRoute(route: (typeof ROUTES)[number]) {
  const request = buildRequest(route);
  const response = await orchestrateTripSearch(request);

  const diverse = composePackages(response.flights, response.hotels, request);
  const naive = composePackages(response.flights, response.hotels, request, {
    applyDiversity: false,
    maxPackages: MAX_PACKAGES,
  });

  return {
    id: route.id,
    label: route.label,
    providerCounts: {
      flights: response.flights.length,
      hotels: response.hotels.length,
    },
    poolUnique: {
      flights: new Set(naive.map((p) => p.flightId)).size,
      hotels: new Set(naive.map((p) => p.hotelId)).size,
    },
    naiveTop5: summarizeTop(naive, 5),
    diverseTop5: summarizeTop(diverse, 5),
    diverseTop20: summarizeTop(diverse, 20),
    scoreDeltaTop5: scoreDelta(naive, diverse, 5),
  };
}

async function main(): Promise<void> {
  loadEnvLocal();
  assertSerpApiReady();

  console.log("Sprint 16.3 live diversity validation\n");

  const results = [];
  for (const route of ROUTES) {
    process.stdout.write(`Running ${route.id} ${route.label}… `);
    try {
      const result = await runRoute(route);
      results.push({ status: "pass" as const, ...result });
      console.log("pass");
    } catch (error) {
      const message = redact(
        error instanceof Error ? error.message : String(error),
      );
      results.push({
        status: "error" as const,
        id: route.id,
        label: route.label,
        errorMessage: message,
      });
      console.log(`error ${message}`);
    }
  }

  const report = {
    sprint: "16.3",
    generatedAt: new Date().toISOString(),
    stay: { departureDate: DEPARTURE, returnDate: RETURN },
    expectedNights: computeNightsBetween(DEPARTURE, RETURN),
    summary: {
      passed: results.filter((r) => r.status === "pass").length,
      errored: results.filter((r) => r.status === "error").length,
    },
    results,
  };

  const outPath = resolve(process.cwd(), "docs/SPRINT_16_3_LIVE_RESULTS.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`\nWrote ${outPath}`);
}

main().catch((error) => {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
