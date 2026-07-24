/**
 * Sprint 11.3 — production readiness validation (no product code changes).
 * Exercises the full SerpAPI provider (including round-trip departure_token),
 * measures deep_search on/off latency, and records redacted evidence.
 * Never logs the API key.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { isApiError } from "@/lib/api/errors";
import { resetAppConfig } from "@/lib/config";
import { resetProviderRegistry } from "@/lib/providers/core/registry";
import { createFlightsProvider } from "@/lib/providers/core/factories";
import { buildSerpApiSearchParams } from "@/lib/providers/flights/serpapi/googleFlights";
import type { Flight } from "@/types/models";
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

function resetProviders(): void {
  resetAppConfig();
  resetProviderRegistry();
}

function baseRequest(overrides: Partial<SearchRequest>): SearchRequest {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    originIata: "MXP",
    destination: "Paris, France",
    destinationId: "paris",
    destinationIata: "CDG",
    tripType: "one-way",
    departureDate: "2026-09-20",
    returnDate: null,
    budget: { amount: 500, currency: "EUR" },
    travelers: { adults: 1, children: 0, infants: 0, rooms: 1 },
    totalGuests: 1,
    travelStyle: "standard",
    productTypes: ["flights"],
    ...overrides,
  };
}

type ScenarioResult = {
  id: string;
  label: string;
  status: "pass" | "fail" | "empty" | "error";
  durationMs?: number;
  flightCount?: number;
  sample?: Partial<Flight>;
  stopsHistogram?: Record<string, number>;
  notes?: string[];
  errorMessage?: string;
};

function summarizeFlights(flights: Flight[]): Pick<
  ScenarioResult,
  "flightCount" | "sample" | "stopsHistogram" | "notes"
> {
  const stopsHistogram: Record<string, number> = {};
  for (const f of flights) {
    const key = String(f.stops ?? "?");
    stopsHistogram[key] = (stopsHistogram[key] ?? 0) + 1;
  }
  const sample = flights[0];
  const notes: string[] = [];
  if (sample) {
    const hasDate =
      typeof sample.departureTime === "string" &&
      /\d{4}-\d{2}-\d{2}/.test(sample.departureTime);
    notes.push(hasDate ? "datetime_preserves_date" : "datetime_time_only");
    if (sample.id?.startsWith("serpapi-rt-")) notes.push("round_trip_package_id");
    else if (sample.id?.startsWith("serpapi-")) notes.push("serpapi_id");
  }
  return {
    flightCount: flights.length,
    sample: sample
      ? {
          id: sample.id,
          airline: sample.airline,
          price: sample.price,
          currency: sample.currency,
          departureTime: sample.departureTime,
          arrivalTime: sample.arrivalTime,
          stops: sample.stops,
        }
      : undefined,
    stopsHistogram,
    notes,
  };
}

async function runProviderScenario(
  id: string,
  label: string,
  request: SearchRequest,
): Promise<ScenarioResult> {
  resetProviders();
  const provider = createFlightsProvider();
  const started = Date.now();
  try {
    const flights = await provider.search(request);
    const durationMs = Date.now() - started;
    if (flights.length === 0) {
      return { id, label, status: "empty", durationMs, flightCount: 0 };
    }
    return {
      id,
      label,
      status: "pass",
      durationMs,
      ...summarizeFlights(flights),
    };
  } catch (err) {
    const durationMs = Date.now() - started;
    return {
      id,
      label,
      status: "error",
      durationMs,
      errorMessage: isApiError(err) ? err.message : String(err),
    };
  }
}

async function measureDeepSearch(): Promise<{
  deepSearchFalseMs: number;
  deepSearchTrueMs: number;
  deepSearchFalseCount: number;
  deepSearchTrueCount: number;
}> {
  const request = baseRequest({});

  process.env.SERPAPI_DEEP_SEARCH = "false";
  resetProviders();
  let provider = createFlightsProvider();
  let t0 = Date.now();
  const falseFlights = await provider.search(request);
  const deepSearchFalseMs = Date.now() - t0;

  process.env.SERPAPI_DEEP_SEARCH = "true";
  resetProviders();
  provider = createFlightsProvider();
  t0 = Date.now();
  const trueFlights = await provider.search(request);
  const deepSearchTrueMs = Date.now() - t0;

  process.env.SERPAPI_DEEP_SEARCH = "false";
  resetProviders();

  return {
    deepSearchFalseMs,
    deepSearchTrueMs,
    deepSearchFalseCount: falseFlights.length,
    deepSearchTrueCount: trueFlights.length,
  };
}

async function errorInvalidKey(): Promise<ScenarioResult> {
  const realKey = process.env.SERPAPI_API_KEY;
  process.env.SERPAPI_API_KEY = "invalid-key-sprint-11-3";
  resetProviders();
  const provider = createFlightsProvider();
  const started = Date.now();
  try {
    const flights = await provider.search(baseRequest({}));
    process.env.SERPAPI_API_KEY = realKey;
    resetProviders();
    // Factory may fall back to mock if key "looks" configured — still call SerpAPI path.
    return {
      id: "E1",
      label: "Invalid API key",
      status: flights.some((f) => f.id.startsWith("serpapi")) ? "fail" : "pass",
      durationMs: Date.now() - started,
      flightCount: flights.length,
      notes: [
        flights.some((f) => f.id.startsWith("flight-"))
          ? "fell_back_or_mock_ids"
          : "no_serpapi_ids",
      ],
    };
  } catch (err) {
    process.env.SERPAPI_API_KEY = realKey;
    resetProviders();
    return {
      id: "E1",
      label: "Invalid API key",
      status: "pass",
      durationMs: Date.now() - started,
      errorMessage: isApiError(err) ? err.message : String(err),
      notes: ["threw_as_expected"],
    };
  }
}

async function errorEmptyRoute(): Promise<ScenarioResult> {
  return runProviderScenario(
    "E2",
    "Empty / unlikely route (ZZZ→YYY via invalid IATA)",
    baseRequest({
      originIata: "ZZZ",
      destinationIata: "YYY",
      origin: "Nowhere",
      destination: "Nowhere Else",
      originId: "nowhere",
      destinationId: "nowhere-else",
      departureDate: "2026-11-01",
    }),
  );
}

async function errorDirectClientTimeoutProbe(): Promise<ScenarioResult> {
  // Confirm query builder surfaces PROVIDER errors for bad params (empty origin).
  resetProviders();
  const started = Date.now();
  try {
    buildSerpApiSearchParams(
      baseRequest({ originIata: "", destinationIata: "CDG" }),
      { deepSearch: false },
    );
    return {
      id: "E3",
      label: "Malformed query (client)",
      status: "fail",
      durationMs: Date.now() - started,
      notes: ["expected_error_but_succeeded"],
    };
  } catch (err) {
    return {
      id: "E3",
      label: "Malformed query (client)",
      status: "pass",
      durationMs: Date.now() - started,
      errorMessage: isApiError(err) ? `${err.code}: ${err.message}` : String(err),
      notes: ["provider_error_surfaced"],
    };
  }
}

async function main(): Promise<void> {
  loadEnvLocal();
  const key = process.env.SERPAPI_API_KEY?.trim();
  if (!key) {
    throw new Error("SERPAPI_API_KEY missing after loading .env.local");
  }
  process.env.USE_MOCK_PROVIDERS = "false";
  process.env.FLIGHTS_PROVIDER = "serpapi";
  if (!process.env.SERPAPI_DEEP_SEARCH) {
    process.env.SERPAPI_DEEP_SEARCH = "false";
  }
  resetProviders();

  const scenarios: ScenarioResult[] = [];

  console.log("Running P1: One-way international MXP→CDG");
  scenarios.push(
    await runProviderScenario(
      "P1",
      "One-way international MXP→CDG",
      baseRequest({}),
    ),
  );

  console.log("Running P2: Round-trip MXP→CDG");
  scenarios.push(
    await runProviderScenario(
      "P2",
      "Round-trip MXP→CDG (departure_token)",
      baseRequest({
        tripType: "round-trip",
        returnDate: "2026-09-27",
        budget: { amount: 800, currency: "EUR" },
      }),
    ),
  );

  console.log("Running P3: Domestic JFK→LAX");
  scenarios.push(
    await runProviderScenario(
      "P3",
      "Domestic JFK→LAX",
      baseRequest({
        origin: "New York, USA",
        originId: "new-york",
        originIata: "JFK",
        destination: "Los Angeles, USA",
        destinationId: "los-angeles",
        destinationIata: "LAX",
        departureDate: "2026-10-05",
        budget: { amount: 400, currency: "USD" },
      }),
    ),
  );

  console.log("Running P4: International MXP→JFK");
  scenarios.push(
    await runProviderScenario(
      "P4",
      "International long-haul MXP→JFK",
      baseRequest({
        destination: "New York, USA",
        destinationId: "new-york",
        destinationIata: "JFK",
        departureDate: "2026-10-12",
        budget: { amount: 900, currency: "EUR" },
      }),
    ),
  );

  console.log("Running P5: Multi-stop prone route MXP→AMS");
  scenarios.push(
    await runProviderScenario(
      "P5",
      "Future-date MXP→AMS (direct + multi-stop)",
      baseRequest({
        destination: "Amsterdam, Netherlands",
        destinationId: "amsterdam",
        destinationIata: "AMS",
        departureDate: "2026-11-10",
        budget: { amount: 300, currency: "EUR" },
      }),
    ),
  );

  console.log("Running error probes");
  scenarios.push(await errorEmptyRoute());
  scenarios.push(await errorDirectClientTimeoutProbe());
  scenarios.push(await errorInvalidKey());

  console.log("Measuring deep_search false vs true");
  let deepSearch: Awaited<ReturnType<typeof measureDeepSearch>> | { error: string };
  try {
    deepSearch = await measureDeepSearch();
  } catch (err) {
    deepSearch = {
      error: isApiError(err) ? err.message : String(err),
    };
  }

  const report = {
    sprint: "11.3",
    generatedAt: new Date().toISOString(),
    provider: "serpapi",
    deepSearchDefault: process.env.SERPAPI_DEEP_SEARCH ?? "false",
    scenarios,
    deepSearch,
    notes: [
      "API key never recorded.",
      "Provider path includes round-trip departure_token lookups when tripType=round-trip.",
      "Invalid-key probe restores real key after run.",
    ],
  };

  const outPath = resolve(process.cwd(), "docs/SPRINT_11_3_LIVE_RESULTS.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(
    JSON.stringify(
      {
        scenarioStatuses: scenarios.map((s) => ({
          id: s.id,
          status: s.status,
          durationMs: s.durationMs,
          flightCount: s.flightCount,
        })),
        deepSearch,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
