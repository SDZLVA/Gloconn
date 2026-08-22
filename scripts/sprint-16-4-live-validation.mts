/**
 * Sprint 16.4 — live package explainability validation.
 *
 * Run:
 *   npx tsx --import ./test/register-server-only.mjs scripts/sprint-16-4-live-validation.mts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { resetAppConfig } from "@/lib/config";
import { composePackages, computeNightsBetween } from "@/lib/packages";
import { assignPackageExplanations } from "@/lib/packages/explanations";
import { PACKAGES_INITIAL_VISIBLE } from "@/lib/results/packagesUi";
import { resetProviderRegistry } from "@/lib/providers/core/registry";
import { resetServiceProviders } from "@/lib/services/context";
import { orchestrateTripSearch } from "@/lib/services/searchOrchestrator";
import type { SearchRequest } from "@/types/models/search-request";

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

async function runRoute(route: (typeof ROUTES)[number]) {
  const request = buildRequest(route);
  const response = await orchestrateTripSearch(request);
  const packages = composePackages(response.flights, response.hotels, request);
  const top5 = packages.slice(0, PACKAGES_INITIAL_VISIBLE);
  const explanations = assignPackageExplanations(packages, {
    budget: request.budget,
    limit: PACKAGES_INITIAL_VISIBLE,
  });

  const cards = top5.map((p, i) => {
    const explanation = explanations.get(p.id) ?? null;
    return {
      rank: i + 1,
      id: p.id,
      score: p.score,
      totalPrice: p.totalPrice,
      airline: p.flight.airline,
      hotelName: p.hotel.name,
      hotelStars: p.hotel.stars,
      hotelRating: p.hotel.rating,
      flightStops: p.flight.stops,
      durationMinutes: p.flight.durationMinutes,
      role: explanation?.role ?? null,
      label: explanation?.label ?? null,
      reason: explanation?.reason ?? null,
      evidenceCheck: {
        hasRawScoreInReason: explanation
          ? /\bMatch\s+\d|\b\d{2,3}\.\d\b/.test(explanation.reason) &&
            explanation.role === "recommended"
            ? /Match/.test(explanation.reason)
            : false
          : false,
        fitsBudget:
          p.currency === request.budget!.currency &&
          p.totalPrice <= request.budget!.amount,
      },
    };
  });

  const roles = cards.map((c) => c.role).filter(Boolean);
  const recommendedCount = roles.filter((r) => r === "recommended").length;

  return {
    id: route.id,
    label: route.label,
    budget: request.budget,
    top5Count: top5.length,
    recommendedCount,
    uniqueRoles: new Set(roles).size,
    rolesAssigned: roles.length,
    cards,
  };
}

async function main(): Promise<void> {
  loadEnvLocal();
  assertSerpApiReady();

  console.log("Sprint 16.4 live explainability validation\n");

  const results = [];
  for (const route of ROUTES) {
    process.stdout.write(`Running ${route.id} ${route.label}… `);
    try {
      const result = await runRoute(route);
      results.push({ status: "pass" as const, ...result });
      console.log(
        `pass (${result.recommendedCount} recommended, ${result.rolesAssigned} roles)`,
      );
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
    sprint: "16.4",
    generatedAt: new Date().toISOString(),
    stay: { departureDate: DEPARTURE, returnDate: RETURN },
    expectedNights: computeNightsBetween(DEPARTURE, RETURN),
    summary: {
      passed: results.filter((r) => r.status === "pass").length,
      errored: results.filter((r) => r.status === "error").length,
      allHaveExactlyOneRecommended: results
        .filter((r) => r.status === "pass")
        .every((r) => "recommendedCount" in r && r.recommendedCount === 1),
    },
    results,
  };

  const outPath = resolve(process.cwd(), "docs/SPRINT_16_4_LIVE_RESULTS.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`\nWrote ${outPath}`);
}

main().catch((error) => {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
