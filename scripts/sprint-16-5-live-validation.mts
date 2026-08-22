/**
 * Sprint 16.5 — Recommendation product validation (read-only evidence).
 * Combines diversity (naive vs diverse) + explainability for the visible top 5.
 *
 * Run:
 *   npx tsx --import ./test/register-server-only.mjs scripts/sprint-16-5-live-validation.mts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { resetAppConfig } from "@/lib/config";
import { composePackages, computeNightsBetween } from "@/lib/packages";
import { MAX_PACKAGES } from "@/lib/packages/constants";
import { measureDiversityMetrics } from "@/lib/packages/diversity";
import { assignPackageExplanations } from "@/lib/packages/explanations";
import { PACKAGES_INITIAL_VISIBLE } from "@/lib/results/packagesUi";
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

/** Realistic stay ~3–4 weeks out from 2026-08-22. */
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

function avgScore(packages: TravelPackage[], n: number): number {
  const slice = packages.slice(0, n);
  if (slice.length === 0) return 0;
  return slice.reduce((s, p) => s + p.score, 0) / slice.length;
}

function cardRow(
  p: TravelPackage,
  rank: number,
  explanation: { role: string; label: string; reason: string } | null,
) {
  return {
    rank,
    id: p.id,
    airline: p.flight.airline,
    hotelName: p.hotel.name,
    hotelStars: p.hotel.stars,
    hotelRating: p.hotel.rating,
    totalPrice: p.totalPrice,
    currency: p.currency,
    stops: p.flight.stops,
    durationMinutes: p.flight.durationMinutes,
    score: p.score,
    flightId: p.flightId,
    hotelId: p.hotelId,
    role: explanation?.role ?? null,
    label: explanation?.label ?? null,
    reason: explanation?.reason ?? null,
  };
}

function nearDuplicateNotes(cards: ReturnType<typeof cardRow>[]) {
  const notes: string[] = [];
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const a = cards[i]!;
      const b = cards[j]!;
      if (a.airline === b.airline) {
        const durDelta = Math.abs(a.durationMinutes - b.durationMinutes);
        const priceDelta = Math.abs(a.totalPrice - b.totalPrice);
        if (durDelta <= 45 && priceDelta <= 250) {
          notes.push(
            `Near-dupe flights: #${a.rank} & #${b.rank} both ${a.airline} (Δdur ${durDelta}m, Δprice ${priceDelta})`,
          );
        } else {
          notes.push(
            `Same airline variation: #${a.rank} & #${b.rank} ${a.airline} (Δdur ${durDelta}m, Δprice ${priceDelta})`,
          );
        }
      }
      if (a.hotelId === b.hotelId) {
        notes.push(`Exact hotel repeat: #${a.rank} & #${b.rank} ${a.hotelName}`);
      } else if (
        a.hotelName === b.hotelName ||
        (a.hotelStars === b.hotelStars &&
          Math.abs(a.hotelRating - b.hotelRating) < 0.2 &&
          a.hotelName.slice(0, 12) === b.hotelName.slice(0, 12))
      ) {
        notes.push(
          `Possible hotel near-dupe: #${a.rank} & #${b.rank} (${a.hotelName} / ${b.hotelName})`,
        );
      }
    }
  }
  return notes;
}

async function runRoute(route: (typeof ROUTES)[number]) {
  const request = buildRequest(route);
  const response = await orchestrateTripSearch(request);

  const diverse = composePackages(response.flights, response.hotels, request);
  const naive = composePackages(response.flights, response.hotels, request, {
    applyDiversity: false,
    maxPackages: MAX_PACKAGES,
  });

  const explanations = assignPackageExplanations(diverse, {
    budget: request.budget,
    limit: PACKAGES_INITIAL_VISIBLE,
  });

  const diverseTop5 = diverse.slice(0, PACKAGES_INITIAL_VISIBLE);
  const naiveTop5 = naive.slice(0, PACKAGES_INITIAL_VISIBLE);

  const cards = diverseTop5.map((p, i) => {
    const e = explanations.get(p.id);
    return cardRow(
      p,
      i + 1,
      e ? { role: e.role, label: e.label, reason: e.reason } : null,
    );
  });

  const naiveCards = naiveTop5.map((p, i) => cardRow(p, i + 1, null));

  const naiveMetrics = measureDiversityMetrics(naive, 5);
  const diverseMetrics = measureDiversityMetrics(diverse, 5);

  return {
    id: route.id,
    label: route.label,
    budget: request.budget,
    providerCounts: {
      flights: response.flights.length,
      hotels: response.hotels.length,
    },
    naiveTop5: {
      metrics: naiveMetrics,
      avgScore: Number(avgScore(naive, 5).toFixed(2)),
      minScore: naiveMetrics.scoreRange[0],
      maxScore: naiveMetrics.scoreRange[1],
      packages: naiveCards,
    },
    diverseTop5: {
      metrics: diverseMetrics,
      avgScore: Number(avgScore(diverse, 5).toFixed(2)),
      minScore: diverseMetrics.scoreRange[0],
      maxScore: diverseMetrics.scoreRange[1],
      packages: cards,
    },
    scoreTradeoff: {
      avgDelta: Number((avgScore(diverse, 5) - avgScore(naive, 5)).toFixed(2)),
      minDelta: Number(
        (diverseMetrics.scoreRange[0] - naiveMetrics.scoreRange[0]).toFixed(2),
      ),
      topScorePreserved:
        (diverse[0]?.score ?? null) === (naive[0]?.score ?? null),
    },
    nearDuplicateNotes: nearDuplicateNotes(cards),
    priceTrustSpotCheck: {
      packagePriceLabelExpected: "Flight (per person) + hotel (N nights, 1 room)",
      packageSuffixExpected: "est. total",
      flightSectionExpected: "Flight · per person",
      hotelSectionExpected: "Hotel · 1 room",
    },
  };
}

async function main(): Promise<void> {
  loadEnvLocal();
  assertSerpApiReady();

  console.log("Sprint 16.5 live product validation\n");

  const results = [];
  for (const route of ROUTES) {
    process.stdout.write(`Running ${route.id} ${route.label}… `);
    try {
      const result = await runRoute(route);
      results.push({ status: "pass" as const, ...result });
      console.log(
        `pass (avgΔ ${result.scoreTradeoff.avgDelta}, roles ${result.diverseTop5.packages.filter((p) => p.role).length})`,
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
    sprint: "16.5",
    generatedAt: new Date().toISOString(),
    stay: { departureDate: DEPARTURE, returnDate: RETURN },
    expectedNights: computeNightsBetween(DEPARTURE, RETURN),
    summary: {
      passed: results.filter((r) => r.status === "pass").length,
      errored: results.filter((r) => r.status === "error").length,
    },
    results,
  };

  const outPath = resolve(process.cwd(), "docs/SPRINT_16_5_LIVE_RESULTS.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`\nWrote ${outPath}`);
}

main().catch((error) => {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
