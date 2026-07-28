/**
 * Sprint 12.3 — live SerpAPI Hotels validation (no product feature work).
 * Loads `.env.local`, runs scenarios through the hotels adapter (+ optional
 * combined flight/hotel path), writes a redacted JSON report.
 * Never logs the API key.
 *
 * Run:
 *   npx tsx --import ./test/register-server-only.mjs scripts/sprint-12-3-live-validation.mts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { isApiError } from "@/lib/api/errors";
import { resetAppConfig } from "@/lib/config";
import { resetProviderRegistry } from "@/lib/providers/core/registry";
import { searchGoogleHotels } from "@/lib/providers/hotels/serpapi/client";
import { mapSerpApiHotelsResponse } from "@/lib/providers/hotels/serpapi/mapper";
import { buildSerpApiHotelsSearchParams } from "@/lib/providers/hotels/serpapi/query";
import type { SerpApiGoogleHotelsResponse } from "@/lib/providers/hotels/serpapi/types";
import type { Hotel } from "@/types/models";
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
  process.env.HOTELS_PROVIDER = "serpapi";
  // Keep flights on SerpAPI when key is present (Milestone 11 posture).
  if (!process.env.FLIGHTS_PROVIDER || process.env.FLIGHTS_PROVIDER === "mock") {
    process.env.FLIGHTS_PROVIDER = "serpapi";
  }
  if (!process.env.SERPAPI_DEEP_SEARCH) {
    process.env.SERPAPI_DEEP_SEARCH = "false";
  }
  resetAppConfig();
  resetProviderRegistry();
}

function redact(message: string): string {
  return message
    .replace(/api_key=[^&\s]+/gi, "api_key=REDACTED")
    .replace(/[a-f0-9]{40,}/gi, "[REDACTED_HEX]");
}

function baseHotelRequest(
  overrides: Partial<SearchRequest> = {},
): SearchRequest {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    originIata: "MXP",
    destination: "Paris, France",
    destinationId: "paris",
    destinationIata: "CDG",
    tripType: "round-trip",
    departureDate: "2026-09-15",
    returnDate: "2026-09-18",
    budget: { amount: 800, currency: "EUR" },
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard",
    productTypes: ["hotels"],
    ...overrides,
  };
}

type SampleHotel = {
  id: string;
  name: string;
  price: number;
  currency: string;
  rating: number;
  stars: number;
  nights: number;
  location: string;
  destinationId: string;
  amenitiesCount: number;
  amenitiesSample: string[];
};

type HotelScenarioResult = {
  id: string;
  label: string;
  status: "pass" | "fail" | "empty" | "error" | "expected_error";
  httpOk?: boolean;
  rawPropertyCount?: number;
  rawAdsCount?: number;
  mappedCount?: number;
  droppedEstimate?: number;
  responseCurrency?: string;
  requestCurrency?: string;
  sampleHotels?: SampleHotel[];
  fieldCoverage?: Record<string, boolean>;
  mappingNotes?: string[];
  errorMessage?: string;
  durationMs?: number;
};

type CombinedScenarioResult = {
  id: string;
  label: string;
  status: "pass" | "fail" | "error";
  hotelCount?: number;
  flightCount?: number;
  hotelDestinationIds?: string[];
  flightDestinationIds?: string[];
  destinationMatch?: boolean;
  hotelsWarning?: string;
  flightsWarning?: string;
  sampleHotel?: SampleHotel;
  sampleFlight?: {
    id: string;
    airline: string;
    price: number;
    currency: string;
    destinationId: string;
  };
  errorMessage?: string;
  durationMs?: number;
};

function summarizePropertyShape(raw: SerpApiGoogleHotelsResponse): string[] {
  const notes: string[] = [];
  const properties = Array.isArray(raw.properties) ? raw.properties : [];
  const ads = Array.isArray(raw.ads) ? raw.ads : [];

  notes.push(`properties=${properties.length}, ads=${ads.length}`);

  if (!raw.search_parameters?.currency) {
    notes.push("search_parameters.currency missing on live response");
  } else {
    notes.push(`search_parameters.currency=${raw.search_parameters.currency}`);
  }

  if (raw.search_parameters?.check_in_date && raw.search_parameters?.check_out_date) {
    notes.push(
      `dates echoed: ${raw.search_parameters.check_in_date} → ${raw.search_parameters.check_out_date}`,
    );
  }

  const sample = properties[0];
  if (!sample) {
    notes.push("No properties in live response");
    return notes;
  }

  notes.push(`sample.type=${sample.type ?? "(missing)"}`);
  notes.push(
    `sample.price sources: total_rate=${sample.total_rate?.extracted_lowest ?? "n/a"}, extracted_price=${sample.extracted_price ?? "n/a"}, rate_per_night=${sample.rate_per_night?.extracted_lowest ?? "n/a"}`,
  );
  notes.push(
    `sample.stars sources: extracted_hotel_class=${sample.extracted_hotel_class ?? "n/a"}, hotel_class=${String(sample.hotel_class ?? "n/a")}`,
  );
  notes.push(`sample.overall_rating=${sample.overall_rating ?? "n/a"}`);
  notes.push(
    `sample.amenities=${Array.isArray(sample.amenities) ? sample.amenities.length : 0}`,
  );
  if (sample.gps_coordinates) {
    notes.push("sample includes gps_coordinates (not on Hotel model)");
  }
  if (sample.thumbnail || (sample as { images?: unknown }).images) {
    notes.push("sample includes images/thumbnail (not on Hotel model)");
  }
  if (sample.property_token) {
    notes.push("sample includes property_token (vendor-only)");
  }

  return notes;
}

function sampleHotels(hotels: Hotel[], n = 3): SampleHotel[] {
  return hotels.slice(0, n).map((h) => ({
    id: h.id,
    name: h.name,
    price: h.price,
    currency: h.currency,
    rating: h.rating,
    stars: h.stars,
    nights: h.nights,
    location: h.location,
    destinationId: h.destinationId,
    amenitiesCount: h.amenities.length,
    amenitiesSample: h.amenities.slice(0, 5),
  }));
}

function fieldCoverage(hotels: Hotel[]): Record<string, boolean> {
  if (hotels.length === 0) {
    return {};
  }
  const first = hotels[0]!;
  return {
    id: Boolean(first.id?.startsWith("serpapi-hotel-")),
    destinationId: Boolean(first.destinationId),
    price: Number.isFinite(first.price) && first.price >= 0,
    currency: Boolean(first.currency),
    rating: Number.isFinite(first.rating) && first.rating >= 0 && first.rating <= 5,
    name: Boolean(first.name?.trim()),
    stars: Number.isFinite(first.stars) && first.stars >= 0,
    amenities: Array.isArray(first.amenities),
    nights: Number.isFinite(first.nights) && first.nights >= 1,
    location: Boolean(first.location?.trim()),
  };
}

async function runHotelScenario(
  id: string,
  label: string,
  request: SearchRequest,
): Promise<HotelScenarioResult> {
  const started = Date.now();
  try {
    const { getAppConfig } = await import("@/lib/config");
    const config = getAppConfig().serpapi;
    const params = buildSerpApiHotelsSearchParams(request);
    if (params.has("api_key")) {
      throw new Error("Query builder unexpectedly included api_key");
    }

    const raw = await searchGoogleHotels(params, config);
    const properties = Array.isArray(raw.properties) ? raw.properties : [];
    const ads = Array.isArray(raw.ads) ? raw.ads : [];
    const destinationId = request.destinationId?.trim() || "unknown";
    const checkInDate = request.departureDate.trim();
    const checkOutDate = request.returnDate!.trim();

    const mapped = mapSerpApiHotelsResponse(raw, {
      destinationId,
      requestCurrency: request.budget?.currency,
      locationFallback: request.destination,
      checkInDate,
      checkOutDate,
    });

    const durationMs = Date.now() - started;
    const dropped = properties.length - mapped.length;

    if (mapped.length === 0 && properties.length === 0) {
      return {
        id,
        label,
        status: "empty",
        httpOk: true,
        rawPropertyCount: 0,
        rawAdsCount: ads.length,
        mappedCount: 0,
        droppedEstimate: 0,
        responseCurrency: raw.search_parameters?.currency,
        requestCurrency: request.budget?.currency,
        mappingNotes: summarizePropertyShape(raw),
        durationMs,
      };
    }

    if (mapped.length === 0 && properties.length > 0) {
      return {
        id,
        label,
        status: "fail",
        httpOk: true,
        rawPropertyCount: properties.length,
        rawAdsCount: ads.length,
        mappedCount: 0,
        droppedEstimate: dropped,
        responseCurrency: raw.search_parameters?.currency,
        requestCurrency: request.budget?.currency,
        mappingNotes: [
          ...summarizePropertyShape(raw),
          "All live properties dropped by mapper",
        ],
        durationMs,
      };
    }

    return {
      id,
      label,
      status: "pass",
      httpOk: true,
      rawPropertyCount: properties.length,
      rawAdsCount: ads.length,
      mappedCount: mapped.length,
      droppedEstimate: dropped,
      responseCurrency: raw.search_parameters?.currency,
      requestCurrency: request.budget?.currency,
      sampleHotels: sampleHotels(mapped),
      fieldCoverage: fieldCoverage(mapped),
      mappingNotes: summarizePropertyShape(raw),
      durationMs,
    };
  } catch (error) {
    const message = isApiError(error)
      ? error.message
      : error instanceof Error
        ? error.message
        : String(error);
    return {
      id,
      label,
      status: "error",
      errorMessage: redact(message),
      durationMs: Date.now() - started,
    };
  }
}

async function runExpectedLocalError(
  id: string,
  label: string,
  request: SearchRequest,
  expectedPattern: RegExp,
): Promise<HotelScenarioResult> {
  const started = Date.now();
  try {
    buildSerpApiHotelsSearchParams(request);
    return {
      id,
      label,
      status: "fail",
      errorMessage: "Expected ProviderError was not thrown",
      durationMs: Date.now() - started,
    };
  } catch (error) {
    const message = isApiError(error)
      ? error.message
      : error instanceof Error
        ? error.message
        : String(error);
    const ok = expectedPattern.test(message);
    return {
      id,
      label,
      status: ok ? "expected_error" : "fail",
      errorMessage: redact(message),
      durationMs: Date.now() - started,
    };
  }
}

async function runInvalidApiKeyScenario(): Promise<HotelScenarioResult> {
  const started = Date.now();
  const id = "E1";
  const label = "Invalid API key → ProviderError";
  try {
    const params = buildSerpApiHotelsSearchParams(
      baseHotelRequest({ destination: "Paris hotels" }),
    );
    await searchGoogleHotels(params, { apiKey: "invalid-serpapi-key-12-3" });
    return {
      id,
      label,
      status: "fail",
      errorMessage: "Expected auth failure was not thrown",
      durationMs: Date.now() - started,
    };
  } catch (error) {
    const message = isApiError(error)
      ? error.message
      : error instanceof Error
        ? error.message
        : String(error);
    const ok =
      /authentication failed|SERPAPI_API_KEY|unauthorized|invalid/i.test(
        message,
      );
    return {
      id,
      label,
      status: ok ? "expected_error" : "fail",
      errorMessage: redact(message),
      durationMs: Date.now() - started,
    };
  }
}

async function runCombinedScenario(
  id: string,
  label: string,
  request: SearchRequest,
): Promise<CombinedScenarioResult> {
  const started = Date.now();
  try {
    resetProviderRegistry();
    const { getProviderRegistry } = await import("@/lib/providers/core/registry");
    const providers = getProviderRegistry();

    const hotelStarted = Date.now();
    const hotels = await providers.hotels.search(request);
    const hotelMs = Date.now() - hotelStarted;

    const flightStarted = Date.now();
    const flights = await providers.flights.search({
      ...request,
      productTypes: ["flights", "hotels"],
    });
    const flightMs = Date.now() - flightStarted;

    const hotelDestinationIds = [
      ...new Set(hotels.map((h) => h.destinationId)),
    ];
    const flightDestinationIds = [
      ...new Set(flights.map((f) => f.destinationId)),
    ];
    const expectedId = request.destinationId?.trim() ?? "";
    const destinationMatch =
      hotelDestinationIds.every((d) => d === expectedId) &&
      flightDestinationIds.every((d) => d === expectedId) &&
      hotels.length > 0 &&
      flights.length > 0;

    const status: CombinedScenarioResult["status"] =
      hotels.length > 0 && flights.length > 0 && destinationMatch
        ? "pass"
        : hotels.length === 0 || flights.length === 0
          ? "fail"
          : "fail";

    return {
      id,
      label,
      status,
      hotelCount: hotels.length,
      flightCount: flights.length,
      hotelDestinationIds,
      flightDestinationIds,
      destinationMatch,
      sampleHotel: sampleHotels(hotels, 1)[0],
      sampleFlight: flights[0]
        ? {
            id: flights[0].id,
            airline: flights[0].airline,
            price: flights[0].price,
            currency: flights[0].currency,
            destinationId: flights[0].destinationId,
          }
        : undefined,
      durationMs: Date.now() - started,
      hotelsWarning: `hotelsProviderMs≈${hotelMs}`,
      flightsWarning: `flightsProviderMs≈${flightMs}`,
    };
  } catch (error) {
    const message = isApiError(error)
      ? error.message
      : error instanceof Error
        ? error.message
        : String(error);
    return {
      id,
      label,
      status: "error",
      errorMessage: redact(message),
      durationMs: Date.now() - started,
    };
  }
}

async function runProviderFactoryCheck(): Promise<{
  hotelsProviderName: string;
  flightsProviderName: string;
}> {
  resetProviderRegistry();
  const { getProviderRegistry } = await import("@/lib/providers/core/registry");
  const providers = getProviderRegistry();
  return {
    hotelsProviderName: providers.hotels.name,
    flightsProviderName: providers.flights.name,
  };
}

async function main(): Promise<void> {
  loadEnvLocal();
  assertSerpApiReady();

  const factory = await runProviderFactoryCheck();
  // eslint-disable-next-line no-console
  console.log(
    `Factory: hotels=${factory.hotelsProviderName}, flights=${factory.flightsProviderName}`,
  );

  const hotelScenarios: Array<{
    id: string;
    label: string;
    request: SearchRequest;
  }> = [
    {
      id: "H1",
      label: "Paris hotels — 3 nights, 2 adults, EUR",
      request: baseHotelRequest({
        destination: "Paris hotels",
        destinationId: "paris",
        departureDate: "2026-09-15",
        returnDate: "2026-09-18",
        budget: { amount: 900, currency: "EUR" },
        travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
      }),
    },
    {
      id: "H2",
      label: "Milan hotels — 2 nights, 1 adult, EUR",
      request: baseHotelRequest({
        destination: "Milan hotels",
        destinationId: "milan",
        destinationIata: "MXP",
        departureDate: "2026-10-01",
        returnDate: "2026-10-03",
        budget: { amount: 500, currency: "EUR" },
        travelers: { adults: 1, children: 0, infants: 0, rooms: 1 },
        totalGuests: 1,
      }),
    },
    {
      id: "H3",
      label: "Rome hotels — 5 nights, 2 adults + 1 child, EUR",
      request: baseHotelRequest({
        destination: "Rome hotels",
        destinationId: "rome",
        destinationIata: "FCO",
        departureDate: "2026-10-10",
        returnDate: "2026-10-15",
        budget: { amount: 1200, currency: "EUR" },
        travelers: { adults: 2, children: 1, infants: 0, rooms: 1 },
        totalGuests: 3,
      }),
    },
    {
      id: "H4",
      label: "Tokyo hotels — 4 nights, 2 adults, USD",
      request: baseHotelRequest({
        origin: "New York, USA",
        originId: "new-york",
        originIata: "JFK",
        destination: "Tokyo hotels",
        destinationId: "tokyo",
        destinationIata: "NRT",
        departureDate: "2026-11-05",
        returnDate: "2026-11-09",
        budget: { amount: 1500, currency: "USD" },
      }),
    },
    {
      id: "H5",
      label: "New York hotels — 1 night, 2 adults, USD",
      request: baseHotelRequest({
        origin: "Paris, France",
        originId: "paris",
        originIata: "CDG",
        destination: "New York hotels",
        destinationId: "new-york",
        destinationIata: "JFK",
        departureDate: "2026-12-01",
        returnDate: "2026-12-02",
        budget: { amount: 600, currency: "USD" },
      }),
    },
    {
      id: "H6",
      label: "Low-result probe — obscure query",
      request: baseHotelRequest({
        destination: "Zzqx Hotel Nowhereville 99999",
        destinationId: "nowhere",
        departureDate: "2026-09-20",
        returnDate: "2026-09-21",
      }),
    },
  ];

  const hotelResults: HotelScenarioResult[] = [];
  for (const scenario of hotelScenarios) {
    // eslint-disable-next-line no-console
    console.log(`Running ${scenario.id}: ${scenario.label}`);
    const result = await runHotelScenario(
      scenario.id,
      scenario.label,
      scenario.request,
    );
    hotelResults.push(result);
    // eslint-disable-next-line no-console
    console.log(
      `  → ${result.status}` +
        (result.mappedCount !== undefined
          ? ` mapped=${result.mappedCount} raw=${result.rawPropertyCount ?? 0}`
          : "") +
        (result.responseCurrency
          ? ` currency=${result.responseCurrency}`
          : "") +
        (result.errorMessage ? ` err=${result.errorMessage}` : "") +
        (result.durationMs !== undefined ? ` ${result.durationMs}ms` : ""),
    );
  }

  // Local expected errors (no live credit)
  // eslint-disable-next-line no-console
  console.log("Running E0: missing returnDate (local)");
  hotelResults.push(
    await runExpectedLocalError(
      "E0",
      "Missing returnDate → ProviderError (no invented checkout)",
      baseHotelRequest({ tripType: "one-way", returnDate: null }),
      /returnDate|check-out/i,
    ),
  );

  // eslint-disable-next-line no-console
  console.log("Running E1: invalid API key");
  hotelResults.push(await runInvalidApiKeyScenario());

  // Combined flight + hotel
  // eslint-disable-next-line no-console
  console.log("Running C1: combined flights + hotels Paris");
  const combinedResults: CombinedScenarioResult[] = [
    await runCombinedScenario(
      "C1",
      "Same search — flights + hotels to Paris",
      baseHotelRequest({
        destination: "Paris, France",
        destinationId: "paris",
        destinationIata: "CDG",
        departureDate: "2026-09-15",
        returnDate: "2026-09-18",
        budget: { amount: 900, currency: "EUR" },
        productTypes: ["hotels", "flights"],
      }),
    ),
  ];
  // eslint-disable-next-line no-console
  console.log(
    `  → ${combinedResults[0]!.status} hotels=${combinedResults[0]!.hotelCount} flights=${combinedResults[0]!.flightCount} match=${combinedResults[0]!.destinationMatch}`,
  );

  const report = {
    sprint: "12.3",
    generatedAt: new Date().toISOString(),
    deepSearch: process.env.SERPAPI_DEEP_SEARCH ?? "false",
    hotelsProvider: process.env.HOTELS_PROVIDER,
    flightsProvider: process.env.FLIGHTS_PROVIDER,
    useMockProviders: process.env.USE_MOCK_PROVIDERS,
    keyConfigured: true,
    factory,
    hotelResults,
    combinedResults,
  };

  const outPath = resolve(process.cwd(), "docs/SPRINT_12_3_LIVE_RESULTS.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(
    error instanceof Error
      ? redact(error.message)
      : error,
  );
  process.exit(1);
});
