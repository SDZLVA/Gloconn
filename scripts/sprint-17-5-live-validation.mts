/**
 * Sprint 17.5 — live journey + in-process registry failure-mode evidence.
 *
 * Same-process: search → details → cache hit.
 * Simulated cross-isolate: clear registry+cache → details again (expected fail).
 *
 * Usage:
 *   npx tsx --env-file=.env.local --import ./test/register-server-only.mjs scripts/sprint-17-5-live-validation.mts
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { searchTrips } from "@/lib/services/searchService";
import { getHotelPropertyDetails } from "@/lib/services/hotelPropertyDetailsService";
import { clearHotelPropertyDetailsCache } from "@/lib/hotels/propertyDetailsCache";
import {
  clearHotelPropertyTokenRegistry,
  getHotelPropertyTokenRegistrySizeForTests,
} from "@/lib/hotels/propertyTokenRegistry";
import type { SearchRequest } from "@/types/models/search-request";

type CityCase = {
  id: string;
  destination: string;
  destinationId: string;
};

const CASES: CityCase[] = [
  { id: "paris", destination: "Paris, France", destinationId: "paris" },
  { id: "tokyo", destination: "Tokyo, Japan", destinationId: "tokyo" },
  {
    id: "new-york",
    destination: "New York, United States",
    destinationId: "new-york",
  },
];

function baseRequest(city: CityCase): Partial<SearchRequest> {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    destination: city.destination,
    destinationId: city.destinationId,
    tripType: "round-trip",
    departureDate: "2026-10-12",
    returnDate: "2026-10-15",
    budget: { amount: 2500, currency: "EUR" },
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard",
    productTypes: ["hotels", "flights"],
  };
}

async function runCity(city: CityCase) {
  clearHotelPropertyDetailsCache();

  const searchStarted = Date.now();
  const search = await searchTrips(baseRequest(city));
  const searchMs = Date.now() - searchStarted;

  if (!search.success) {
    return {
      city: city.id,
      ok: false,
      stage: "search",
      error: search.error.message,
      searchMs,
    };
  }

  const pkg = search.data.packages?.[0];
  const hotel = pkg?.hotel ?? search.data.hotels?.[0];
  if (!hotel) {
    return {
      city: city.id,
      ok: false,
      stage: "search",
      error: "No hotel/package",
      searchMs,
    };
  }

  const registryAfterSearch = getHotelPropertyTokenRegistrySizeForTests();

  const detailsStarted = Date.now();
  let first: Awaited<ReturnType<typeof getHotelPropertyDetails>> | null = null;
  let firstError: string | null = null;
  try {
    first = await getHotelPropertyDetails(hotel.id, {
      checkInDate: "2026-10-12",
      checkOutDate: "2026-10-15",
      currency: "EUR",
      adults: 2,
    });
  } catch (error) {
    firstError = error instanceof Error ? error.message : String(error);
  }
  const detailsMs = Date.now() - detailsStarted;

  const cachedStarted = Date.now();
  let secondCached: boolean | null = null;
  try {
    const second = await getHotelPropertyDetails(hotel.id);
    secondCached = second.cached;
  } catch {
    secondCached = null;
  }
  const cachedMs = Date.now() - cachedStarted;

  // Simulate another serverless isolate with empty memory.
  clearHotelPropertyTokenRegistry();
  clearHotelPropertyDetailsCache();
  const crossStarted = Date.now();
  let crossError: string | null = null;
  try {
    await getHotelPropertyDetails(hotel.id, {
      checkInDate: "2026-10-12",
      checkOutDate: "2026-10-15",
      currency: "EUR",
      adults: 2,
    });
  } catch (error) {
    crossError = error instanceof Error ? error.message : String(error);
  }
  const crossMs = Date.now() - crossStarted;

  const d = first?.details;
  const hasGps = hotel.latitude != null && hotel.longitude != null;

  return {
    city: city.id,
    ok: !firstError && Boolean(d?.hotelId),
    hotelId: hotel.id,
    hotelName: hotel.name,
    fromPackage: Boolean(pkg),
    packageAirline: pkg?.flight?.airline ?? null,
    searchLocation: hotel.location,
    hasGps,
    registryAfterSearch,
    detailsSuccess: !firstError,
    detailsError: firstError,
    addressAvailable: Boolean(d?.address),
    address: d?.address ?? null,
    mapsFromDetails: Boolean(d?.mapsUrl),
    mapsFromGpsFallback: !d?.mapsUrl && hasGps,
    mapsAvailable: Boolean(d?.mapsUrl) || hasGps,
    websiteAvailable: Boolean(d?.websiteUrl),
    offerCount: d?.offers?.length ?? 0,
    hasDisclosure: Boolean(d?.thirdPartyDisclosure),
    firstFetchCached: first?.cached ?? null,
    secondFetchCached: secondCached,
    searchMs,
    detailsMs,
    cachedMs,
    simulatedCrossIsolate: {
      failed: Boolean(crossError),
      error: crossError,
      ms: crossMs,
    },
  };
}

async function main() {
  const results = [];
  for (const city of CASES) {
    results.push(await runCity(city));
  }

  const report = {
    sprint: "17.5",
    generatedAt: new Date().toISOString(),
    environment:
      "local same-process (tsx) + simulated cross-isolate via registry/cache clear",
    deploymentObserved: {
      vercelProjectDir: false,
      githubDeployments: 0,
      localDevServer: "single Next.js process (npm run dev)",
    },
    results,
    summary: {
      detailsOk: results.filter((r) => "ok" in r && r.ok).length,
      detailsFail: results.filter((r) => "ok" in r && !r.ok).length,
      crossIsolateFails: results.filter(
        (r) =>
          "simulatedCrossIsolate" in r &&
          (r as { simulatedCrossIsolate?: { failed?: boolean } })
            .simulatedCrossIsolate?.failed,
      ).length,
    },
  };

  const outPath = join(process.cwd(), "docs", "SPRINT_17_5_LIVE_RESULTS.json");
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
