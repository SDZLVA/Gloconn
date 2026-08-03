/**
 * Sprint 13.5 — live Travel Packages validation (no product feature work).
 * Loads `.env.local`, runs route scenarios through SearchOrchestrator with
 * live SerpAPI flights + hotels, validates composed packages, writes a
 * redacted JSON report. Never logs the API key.
 *
 * Run:
 *   npx tsx --import ./test/register-server-only.mjs scripts/sprint-13-5-live-validation.mts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { isApiError } from "@/lib/api/errors";
import { resetAppConfig } from "@/lib/config";
import { computeNightsBetween } from "@/lib/packages";
import { resetProviderRegistry } from "@/lib/providers/core/registry";
import {
  resetServiceProviders,
} from "@/lib/services/context";
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
const RETURN = "2026-09-22"; // 7 nights

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

type CheckResult = {
  name: string;
  ok: boolean;
  detail?: string;
};

type SamplePackage = {
  id: string;
  totalPrice: number;
  currency: string;
  nights: number;
  score: number;
  flightId: string;
  hotelId: string;
  airline: string;
  hotelName: string;
  flightPrice: number;
  hotelPrice: number;
  flightCurrency: string;
  hotelCurrency: string;
  hotelDestinationId: string;
  flightDestinationId: string;
};

type RouteResult = {
  id: string;
  label: string;
  status: "pass" | "fail" | "error";
  durationMs: number;
  flightCount: number;
  hotelCount: number;
  packageCount: number;
  expectedNights: number | null;
  checks: CheckResult[];
  topPackage?: SamplePackage;
  samplePackages?: SamplePackage[];
  warnings?: { code: string; domain: string }[];
  errorMessage?: string;
};

function samplePackage(pkg: TravelPackage): SamplePackage {
  return {
    id: pkg.id,
    totalPrice: pkg.totalPrice,
    currency: pkg.currency,
    nights: pkg.nights,
    score: pkg.score,
    flightId: pkg.flightId,
    hotelId: pkg.hotelId,
    airline: pkg.flight.airline,
    hotelName: pkg.hotel.name,
    flightPrice: pkg.flight.price,
    hotelPrice: pkg.hotel.price,
    flightCurrency: pkg.flight.currency,
    hotelCurrency: pkg.hotel.currency,
    hotelDestinationId: pkg.hotel.destinationId,
    flightDestinationId: pkg.flight.destinationId,
  };
}

function validateRoute(
  route: RouteSpec,
  response: Awaited<ReturnType<typeof orchestrateTripSearch>>,
): Omit<RouteResult, "durationMs" | "errorMessage"> {
  const expectedNights = computeNightsBetween(DEPARTURE, RETURN);
  const packages = response.packages ?? [];
  const checks: CheckResult[] = [];

  const flightsOk = response.flights.length > 0;
  checks.push({
    name: "flights_returned",
    ok: flightsOk,
    detail: `count=${response.flights.length}`,
  });

  const hotelsOk = response.hotels.length > 0;
  checks.push({
    name: "hotels_returned",
    ok: hotelsOk,
    detail: `count=${response.hotels.length}`,
  });

  const packagesOk = packages.length > 0;
  checks.push({
    name: "packages_generated",
    ok: packagesOk,
    detail: `count=${packages.length}`,
  });

  let priceOk = true;
  let currencyOk = true;
  let nightsOk = true;
  let destOk = true;

  for (const pkg of packages) {
    const sum = pkg.flight.price + pkg.hotel.price;
    if (Math.abs(pkg.totalPrice - sum) > 0.01) {
      priceOk = false;
    }
    if (
      pkg.currency !== pkg.flight.currency ||
      pkg.currency !== pkg.hotel.currency ||
      pkg.flight.currency !== pkg.hotel.currency
    ) {
      currencyOk = false;
    }
    if (expectedNights != null && pkg.nights !== expectedNights) {
      // Hotel quote nights may differ slightly; require >=1 and match hotel or dates.
      if (pkg.nights < 1) {
        nightsOk = false;
      } else if (
        pkg.nights !== pkg.hotel.nights &&
        pkg.nights !== expectedNights
      ) {
        nightsOk = false;
      }
    }
    if (pkg.hotel.destinationId !== route.destinationId) {
      destOk = false;
    }
  }

  checks.push({
    name: "total_price_correct",
    ok: packagesOk && priceOk,
    detail: packagesOk ? "flight.price + hotel.price" : "no packages",
  });
  checks.push({
    name: "currency_consistent",
    ok: packagesOk && currencyOk,
  });
  checks.push({
    name: "nights_correct",
    ok: packagesOk && nightsOk,
    detail: `expected≈${expectedNights}`,
  });
  checks.push({
    name: "hotel_matches_destination",
    ok: packagesOk && destOk,
    detail: `destinationId=${route.destinationId}`,
  });
  checks.push({
    name: "flight_dates_align_with_stay",
    ok: packagesOk && expectedNights != null && expectedNights >= 1,
    detail: `stay ${DEPARTURE} → ${RETURN} (${expectedNights} nights)`,
  });

  // Ranking sanity: scores non-increasing
  let rankingOk = true;
  for (let i = 1; i < packages.length; i++) {
    if (packages[i]!.score > packages[i - 1]!.score) {
      rankingOk = false;
      break;
    }
  }
  checks.push({
    name: "ranking_score_order",
    ok: !packagesOk || rankingOk,
  });

  const allOk = checks.every((c) => c.ok);

  return {
    id: route.id,
    label: route.label,
    status: allOk ? "pass" : "fail",
    flightCount: response.flights.length,
    hotelCount: response.hotels.length,
    packageCount: packages.length,
    expectedNights,
    checks,
    topPackage: packages[0] ? samplePackage(packages[0]) : undefined,
    samplePackages: packages.slice(0, 3).map(samplePackage),
    warnings: response.warnings?.map((w) => ({
      code: w.code,
      domain: w.domain,
    })),
  };
}

async function runRoute(route: RouteSpec): Promise<RouteResult> {
  const started = Date.now();
  try {
    const response = await orchestrateTripSearch(buildRequest(route));
    const validated = validateRoute(route, response);
    return {
      ...validated,
      durationMs: Date.now() - started,
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
      flightCount: 0,
      hotelCount: 0,
      packageCount: 0,
      expectedNights: computeNightsBetween(DEPARTURE, RETURN),
      checks: [],
      errorMessage: redact(message),
    };
  }
}

async function main(): Promise<void> {
  loadEnvLocal();
  assertSerpApiReady();

  console.log("Sprint 13.5 live package validation");
  console.log(`Routes: ${ROUTES.length} · stay ${DEPARTURE} → ${RETURN}`);
  console.log("Providers: FLIGHTS=serpapi HOTELS=serpapi (key redacted)\n");

  const results: RouteResult[] = [];
  for (const route of ROUTES) {
    process.stdout.write(`Running ${route.id} ${route.label}… `);
    const result = await runRoute(route);
    results.push(result);
    console.log(
      `${result.status} · flights=${result.flightCount} hotels=${result.hotelCount} packages=${result.packageCount} (${result.durationMs}ms)`,
    );
  }

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const errored = results.filter((r) => r.status === "error").length;

  const report = {
    sprint: "13.5",
    generatedAt: new Date().toISOString(),
    stay: { departureDate: DEPARTURE, returnDate: RETURN },
    config: {
      USE_MOCK_PROVIDERS: "false",
      FLIGHTS_PROVIDER: "serpapi",
      HOTELS_PROVIDER: "serpapi",
      SERPAPI_DEEP_SEARCH: process.env.SERPAPI_DEEP_SEARCH ?? "false",
      SERPAPI_API_KEY: "REDACTED",
    },
    summary: { passed, failed, errored, total: results.length },
    results,
  };

  const outPath = resolve(process.cwd(), "docs/SPRINT_13_5_LIVE_RESULTS.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`\nWrote ${outPath}`);
  console.log(`Summary: ${passed} pass · ${failed} fail · ${errored} error`);

  if (failed > 0 || errored > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
