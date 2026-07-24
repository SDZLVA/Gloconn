/**
 * Sprint 11.1b — live SerpAPI validation (no product code changes).
 * Loads `.env.local`, runs scenarios through the existing SerpAPI adapter,
 * writes a redacted JSON report. Never logs the API key.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { isApiError } from "@/lib/api/errors";
import { resetAppConfig } from "@/lib/config";
import { resetProviderRegistry } from "@/lib/providers/core/registry";
import { buildSerpApiSearchParams } from "@/lib/providers/flights/serpapi/googleFlights";
import { mapSerpApiFlightsResponse } from "@/lib/providers/flights/serpapi/mappers";
import { searchGoogleFlights } from "@/lib/providers/flights/serpapi/client";
import type { SerpApiGoogleFlightsResponse } from "@/lib/providers/flights/serpapi/types";
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

function assertSerpApiReady(): void {
  const key = process.env.SERPAPI_API_KEY?.trim();
  if (!key) {
    throw new Error("SERPAPI_API_KEY missing after loading .env.local");
  }
  process.env.USE_MOCK_PROVIDERS = "false";
  process.env.FLIGHTS_PROVIDER = "serpapi";
  if (!process.env.SERPAPI_DEEP_SEARCH) {
    process.env.SERPAPI_DEEP_SEARCH = "false";
  }
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
    departureDate: "2026-09-15",
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
  httpOk?: boolean;
  rawBestCount?: number;
  rawOtherCount?: number;
  mappedCount?: number;
  droppedEstimate?: number;
  stopsHistogram?: Record<string, number>;
  sampleFlights?: Array<Partial<Flight>>;
  mappingNotes?: string[];
  errorMessage?: string;
  durationMs?: number;
};

function summarizeOptionShape(raw: SerpApiGoogleFlightsResponse): string[] {
  const notes: string[] = [];
  const options = [
    ...(Array.isArray(raw.best_flights) ? raw.best_flights : []),
    ...(Array.isArray(raw.other_flights) ? raw.other_flights : []),
  ];
  if (options.length === 0) {
    notes.push("No best_flights/other_flights in live response");
    return notes;
  }
  const sample = options[0];
  if (sample && "carbon_emissions" in sample) {
    notes.push("Live option includes carbon_emissions (not mapped to Flight)");
  }
  if (sample?.departure_token) {
    notes.push("Live option includes departure_token (unused by mapper)");
  }
  if (sample && "booking_token" in sample) {
    notes.push("Live option includes booking_token (not typed/mapped)");
  }
  if (!raw.search_parameters?.currency) {
    notes.push("search_parameters.currency missing on live response");
  }
  const time = sample?.flights?.[0]?.departure_airport?.time;
  if (time) {
    notes.push(`Sample departure time format: "${time}"`);
  }
  const priceType = typeof sample?.price;
  notes.push(`Sample price typeof: ${priceType}`);
  return notes;
}

function histogramStops(flights: Flight[]): Record<string, number> {
  const hist: Record<string, number> = {};
  for (const flight of flights) {
    const key = String(flight.stops);
    hist[key] = (hist[key] ?? 0) + 1;
  }
  return hist;
}

function sampleFlights(flights: Flight[], n = 3): Array<Partial<Flight>> {
  return flights.slice(0, n).map((f) => ({
    id: f.id,
    airline: f.airline,
    price: f.price,
    currency: f.currency,
    departureTime: f.departureTime,
    arrivalTime: f.arrivalTime,
    durationMinutes: f.durationMinutes,
    stops: f.stops,
    cabin: f.cabin,
    rating: f.rating,
    destinationId: f.destinationId,
  }));
}

async function runScenario(
  id: string,
  label: string,
  request: SearchRequest,
): Promise<ScenarioResult> {
  const started = Date.now();
  try {
    const { getAppConfig } = await import("@/lib/config");
    const config = getAppConfig().serpapi;
    const params = buildSerpApiSearchParams(request, config);
    // Ensure api_key never appears in logs — params must not include it yet
    if (params.has("api_key")) {
      throw new Error("Query builder unexpectedly included api_key");
    }

    const raw = await searchGoogleFlights(params, config);
    const best = Array.isArray(raw.best_flights) ? raw.best_flights.length : 0;
    const other = Array.isArray(raw.other_flights) ? raw.other_flights.length : 0;
    const destinationId = request.destinationId?.trim() || "unknown";
    const mapped = mapSerpApiFlightsResponse(raw, { destinationId });
    const dropped = best + other - mapped.length;
    const durationMs = Date.now() - started;

    if (mapped.length === 0 && best + other === 0) {
      return {
        id,
        label,
        status: "empty",
        httpOk: true,
        rawBestCount: best,
        rawOtherCount: other,
        mappedCount: 0,
        droppedEstimate: 0,
        mappingNotes: summarizeOptionShape(raw),
        durationMs,
      };
    }

    if (mapped.length === 0 && best + other > 0) {
      return {
        id,
        label,
        status: "fail",
        httpOk: true,
        rawBestCount: best,
        rawOtherCount: other,
        mappedCount: 0,
        droppedEstimate: dropped,
        mappingNotes: [
          ...summarizeOptionShape(raw),
          "All live options dropped by mapper",
        ],
        durationMs,
      };
    }

    return {
      id,
      label,
      status: "pass",
      httpOk: true,
      rawBestCount: best,
      rawOtherCount: other,
      mappedCount: mapped.length,
      droppedEstimate: dropped,
      stopsHistogram: histogramStops(mapped),
      sampleFlights: sampleFlights(mapped),
      mappingNotes: summarizeOptionShape(raw),
      durationMs,
    };
  } catch (error) {
    const message = isApiError(error)
      ? error.message
      : error instanceof Error
        ? error.message
        : String(error);
    // Never include accidental key material
    const safe = message.replace(/api_key=[^&\s]+/gi, "api_key=REDACTED");
    return {
      id,
      label,
      status: "error",
      errorMessage: safe,
      durationMs: Date.now() - started,
    };
  }
}

async function main(): Promise<void> {
  loadEnvLocal();
  assertSerpApiReady();

  const scenarios: Array<{ id: string; label: string; request: SearchRequest }> =
    [
      {
        id: "L1",
        label: "One-way international MXP→CDG",
        request: baseRequest({
          tripType: "one-way",
          departureDate: "2026-09-15",
          returnDate: null,
        }),
      },
      {
        id: "L2",
        label: "Round-trip international MXP→CDG",
        request: baseRequest({
          tripType: "round-trip",
          departureDate: "2026-09-15",
          returnDate: "2026-09-22",
        }),
      },
      {
        id: "L3",
        label: "Domestic US JFK→LAX one-way",
        request: baseRequest({
          origin: "New York, USA",
          originId: "new-york",
          originIata: "JFK",
          destination: "Los Angeles, USA",
          destinationId: "los-angeles",
          destinationIata: "LAX",
          tripType: "one-way",
          departureDate: "2026-10-05",
          returnDate: null,
          budget: { amount: 400, currency: "USD" },
        }),
      },
      {
        id: "L4",
        label: "Long-haul international MXP→JFK one-way",
        request: baseRequest({
          destination: "New York, USA",
          destinationId: "new-york",
          destinationIata: "JFK",
          tripType: "one-way",
          departureDate: "2026-10-12",
          returnDate: null,
        }),
      },
      {
        id: "L5",
        label: "Future-date one-way MXP→AMS (direct/multi-stop mix)",
        request: baseRequest({
          destination: "Amsterdam, Netherlands",
          destinationId: "amsterdam",
          destinationIata: "AMS",
          tripType: "one-way",
          departureDate: "2026-11-20",
          returnDate: null,
        }),
      },
      {
        id: "L6",
        label: "No-result probe obscure route XXX→ZZZ (expect error or empty)",
        request: baseRequest({
          originIata: "XXX",
          destinationIata: "ZZZ",
          destinationId: "nowhere",
          tripType: "one-way",
          departureDate: "2026-12-01",
          returnDate: null,
        }),
      },
    ];

  const results: ScenarioResult[] = [];
  for (const scenario of scenarios) {
    // eslint-disable-next-line no-console
    console.log(`Running ${scenario.id}: ${scenario.label}`);
    const result = await runScenario(scenario.id, scenario.label, scenario.request);
    results.push(result);
    // eslint-disable-next-line no-console
    console.log(
      `  → ${result.status}` +
        (result.mappedCount !== undefined
          ? ` mapped=${result.mappedCount} raw=${(result.rawBestCount ?? 0) + (result.rawOtherCount ?? 0)}`
          : "") +
        (result.errorMessage ? ` err=${result.errorMessage}` : ""),
    );
  }

  const report = {
    sprint: "11.1b",
    generatedAt: new Date().toISOString(),
    deepSearch: process.env.SERPAPI_DEEP_SEARCH ?? "false",
    flightsProvider: process.env.FLIGHTS_PROVIDER,
    useMockProviders: process.env.USE_MOCK_PROVIDERS,
    keyConfigured: true,
    results,
  };

  const outPath = resolve(
    process.cwd(),
    "docs/SPRINT_11_1B_LIVE_RESULTS.json",
  );
  writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(
    error instanceof Error ? error.message.replace(/api_key=[^&\s]+/gi, "api_key=REDACTED") : error,
  );
  process.exit(1);
});
