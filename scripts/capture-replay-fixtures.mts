/**
 * Capture live SerpAPI search + hotel details into replay fixtures (Sprint 17.6).
 *
 * USAGE (costs SerpAPI quota — run sparingly):
 *   npx tsx --env-file=.env.local --import ./test/register-server-only.mjs \
 *     scripts/capture-replay-fixtures.mts
 *
 * Optional: CAPTURE_SCENARIOS=milan-paris,milan-tokyo (comma-separated ids)
 *
 * Writes under lib/test-fixtures/replay/<dir>/
 * Never writes API keys or raw SerpAPI property tokens.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { resetAppConfig, getAppConfig } from "@/lib/config";
import { clearHotelPropertyDetailsCache } from "@/lib/hotels/propertyDetailsCache";
import {
  stripHotelSealedRefs,
  type ReplayCatalog,
  type ReplayDetailsMap,
  type ReplaySearchFixture,
} from "@/lib/replay/types";
import { getReplayFixturesRoot } from "@/lib/replay/load";
import { searchTrips } from "@/lib/services/searchService";
import { getHotelPropertyDetails } from "@/lib/services/hotelPropertyDetailsService";
import type { Hotel } from "@/types/models/hotel";
import type { SearchRequest } from "@/types/models/search-request";
import type { SearchResponse } from "@/types/models/search-response";
import {
  HOTEL_REPLAY_SNAPSHOT_NOTICE,
  type HotelPropertyDetails,
} from "@/types/models/hotel-property-details";

type Scenario = {
  id: string;
  label: string;
  dir: string;
  origin: string;
  originId: string;
  destination: string;
  destinationId: string;
  departureDate: string;
  returnDate: string;
};

const ALL_SCENARIOS: Scenario[] = [
  {
    id: "milan-paris",
    label: "Milan → Paris",
    dir: "milan-paris",
    origin: "Milan, Italy",
    originId: "milan",
    destination: "Paris, France",
    destinationId: "paris",
    departureDate: "2026-10-12",
    returnDate: "2026-10-15",
  },
  {
    id: "milan-tokyo",
    label: "Milan → Tokyo",
    dir: "milan-tokyo",
    origin: "Milan, Italy",
    originId: "milan",
    destination: "Tokyo, Japan",
    destinationId: "tokyo",
    departureDate: "2026-10-12",
    returnDate: "2026-10-15",
  },
  {
    id: "milan-new-york",
    label: "Milan → New York",
    dir: "milan-new-york",
    origin: "Milan, Italy",
    originId: "milan",
    destination: "New York, United States",
    destinationId: "new-york",
    departureDate: "2026-10-12",
    returnDate: "2026-10-15",
  },
  {
    id: "rome-dubai",
    label: "Rome → Dubai",
    dir: "rome-dubai",
    origin: "Rome, Italy",
    originId: "rome",
    destination: "Dubai, United Arab Emirates",
    destinationId: "dubai",
    departureDate: "2026-10-12",
    returnDate: "2026-10-15",
  },
  {
    id: "london-barcelona",
    label: "London → Barcelona",
    dir: "london-barcelona",
    origin: "London, United Kingdom",
    originId: "london",
    destination: "Barcelona, Spain",
    destinationId: "barcelona",
    departureDate: "2026-10-12",
    returnDate: "2026-10-15",
  },
];

const MAX_DETAILS_PER_SCENARIO = 5;

function assertNoSecrets(value: unknown, path = ""): void {
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (
      lower.includes("api_key") ||
      lower.includes("apikey") ||
      lower.includes("authorization") ||
      /serpapi\.com\/search\?/.test(lower)
    ) {
      throw new Error(`Secret-like string at ${path}`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => assertNoSecrets(item, `${path}[${i}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      const keyLower = key.toLowerCase();
      if (
        keyLower.includes("api_key") ||
        keyLower.includes("apikey") ||
        keyLower === "authorization" ||
        keyLower === "property_token" ||
        keyLower === "propertytoken"
      ) {
        throw new Error(`Forbidden key ${key} at ${path}`);
      }
      assertNoSecrets(child, path ? `${path}.${key}` : key);
    }
  }
}

function sanitizeResponse(response: SearchResponse): SearchResponse {
  const hotels = response.hotels.map(stripHotelSealedRefs);
  const hotelById = new Map(hotels.map((h) => [h.id, h]));

  const packages = response.packages.map((pkg) => {
    const hotel = hotelById.get(pkg.hotel.id) ?? stripHotelSealedRefs(pkg.hotel);
    return { ...pkg, hotel };
  });

  return {
    ...response,
    hotels,
    packages,
    buses: [],
    trains: [],
    restaurants: [],
    attractions: [],
  };
}

function pickHotelsForDetails(response: SearchResponse): Hotel[] {
  const selected: Hotel[] = [];
  const seen = new Set<string>();

  for (const pkg of response.packages) {
    if (seen.has(pkg.hotel.id)) continue;
    seen.add(pkg.hotel.id);
    selected.push(pkg.hotel);
    if (selected.length >= MAX_DETAILS_PER_SCENARIO) return selected;
  }

  for (const hotel of response.hotels) {
    if (seen.has(hotel.id)) continue;
    if (!hotel.providerPropertyRef?.startsWith("gpref1.")) continue;
    seen.add(hotel.id);
    selected.push(hotel);
    if (selected.length >= MAX_DETAILS_PER_SCENARIO) break;
  }

  return selected;
}

function sanitizeDetails(
  hotelId: string,
  details: HotelPropertyDetails,
): HotelPropertyDetails {
  const clean: HotelPropertyDetails = {
    hotelId,
    snapshotNotice: HOTEL_REPLAY_SNAPSHOT_NOTICE,
  };
  if (details.name?.trim()) clean.name = details.name.trim();
  if (details.address?.trim()) clean.address = details.address.trim();
  if (details.mapsUrl?.trim()) clean.mapsUrl = details.mapsUrl.trim();
  if (details.websiteUrl?.trim()) clean.websiteUrl = details.websiteUrl.trim();
  if (details.offers?.length) {
    clean.offers = details.offers.map((o) => ({
      label: o.label,
      url: o.url,
      ...(o.source ? { source: o.source } : {}),
    }));
  }
  if (details.thirdPartyDisclosure?.trim()) {
    clean.thirdPartyDisclosure = details.thirdPartyDisclosure.trim();
  }
  assertNoSecrets(clean);
  return clean;
}

async function captureScenario(scenario: Scenario): Promise<boolean> {
  clearHotelPropertyDetailsCache();

  const request: Partial<SearchRequest> = {
    origin: scenario.origin,
    originId: scenario.originId,
    destination: scenario.destination,
    destinationId: scenario.destinationId,
    tripType: "round-trip",
    departureDate: scenario.departureDate,
    returnDate: scenario.returnDate,
    budget: { amount: 3000, currency: "EUR" },
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard",
    productTypes: ["hotels", "flights"],
  };

  console.log(`[capture] ${scenario.id} — searching…`);
  const search = await searchTrips(request);
  if (!search.success) {
    console.error(`[capture] ${scenario.id} search failed:`, search.error.message);
    return false;
  }

  const sanitized = sanitizeResponse(search.data);
  assertNoSecrets(sanitized);

  const hotelsForDetails = pickHotelsForDetails(search.data);
  const detailsMap: ReplayDetailsMap = {};

  for (const hotel of hotelsForDetails) {
    if (!hotel.providerPropertyRef?.startsWith("gpref1.")) {
      console.warn(`[capture] skip details (no gpref1): ${hotel.id}`);
      continue;
    }
    try {
      const result = await getHotelPropertyDetails(
        { ref: hotel.providerPropertyRef, hotelId: hotel.id },
        {
          bypassCache: true,
          checkInDate: scenario.departureDate,
          checkOutDate: scenario.returnDate,
          currency: hotel.currency,
          adults: 2,
        },
      );
      detailsMap[hotel.id] = sanitizeDetails(hotel.id, result.details);
      console.log(`[capture] details ok: ${hotel.id}`);
    } catch (error) {
      console.warn(
        `[capture] details failed for ${hotel.id}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  const fixture: ReplaySearchFixture = {
    meta: {
      id: scenario.id,
      label: scenario.label,
      capturedAt: new Date().toISOString(),
      match: {
        originId: scenario.originId,
        destinationId: scenario.destinationId,
        // Route-only matching for testers (any dates work).
      },
    },
    response: sanitized,
  };

  const root = getReplayFixturesRoot();
  const dir = join(root, scenario.dir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "search.json"), JSON.stringify(fixture, null, 2));
  writeFileSync(join(dir, "details.json"), JSON.stringify(detailsMap, null, 2));

  console.log(
    `[capture] wrote ${scenario.dir} (hotels=${sanitized.hotels.length}, flights=${sanitized.flights.length}, packages=${sanitized.packages.length}, details=${Object.keys(detailsMap).length})`,
  );
  return true;
}

function writeCatalog(scenarios: Scenario[]): void {
  const catalog: ReplayCatalog = {
    version: 1,
    scenarios: scenarios.map((s) => ({
      id: s.id,
      label: s.label,
      dir: s.dir,
      match: {
        originId: s.originId,
        destinationId: s.destinationId,
      },
    })),
  };
  const root = getReplayFixturesRoot();
  mkdirSync(root, { recursive: true });
  writeFileSync(join(root, "catalog.json"), JSON.stringify(catalog, null, 2));
  console.log(`[capture] catalog.json (${catalog.scenarios.length} scenarios)`);
}

async function main() {
  resetAppConfig();
  const config = getAppConfig();

  if (config.replay.enabled) {
    console.error(
      "Disable GLOOCONN_REPLAY_MODE before capturing (live providers required).",
    );
    process.exit(1);
  }

  if (!config.serpapi.isConfigured) {
    console.error("SERPAPI_API_KEY is required to capture fixtures.");
    process.exit(1);
  }

  if (!config.propertyRefSeal.isConfigured) {
    console.warn(
      "PROPERTY_REF_SEAL_SECRET missing — View hotel details may not capture.",
    );
  }

  const filter = (process.env.CAPTURE_SCENARIOS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const scenarios =
    filter.length > 0
      ? ALL_SCENARIOS.filter((s) => filter.includes(s.id))
      : ALL_SCENARIOS;

  const ok: Scenario[] = [];
  for (const scenario of scenarios) {
    const success = await captureScenario(scenario);
    if (success) ok.push(scenario);
  }

  const { existsSync } = await import("node:fs");
  const root = getReplayFixturesRoot();
  const onDisk = ALL_SCENARIOS.filter((s) =>
    existsSync(join(root, s.dir, "search.json")),
  );
  writeCatalog(onDisk.length > 0 ? onDisk : ok.length > 0 ? ok : scenarios);
  console.log(`[capture] done — ${ok.length}/${scenarios.length} succeeded`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
