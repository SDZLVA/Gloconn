/**
 * Sprint 17.3 — live SerpAPI hotel property-details validation.
 *
 * Runs search → registers tokens → fetches details for sample hotels
 * in Paris, Tokyo, and New York. Writes redacted JSON evidence.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/sprint-17-3-live-validation.mts
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { searchTrips } from "@/lib/services/searchService";
import { getHotelPropertyDetails } from "@/lib/services/hotelPropertyDetailsService";
import { clearHotelPropertyDetailsCache } from "@/lib/hotels/propertyDetailsCache";
import type { SearchRequest } from "@/types/models/search-request";

type CityCase = {
  id: string;
  destination: string;
  destinationId: string;
  origin: string;
  originId: string;
};

const CASES: CityCase[] = [
  {
    id: "paris",
    destination: "Paris, France",
    destinationId: "paris",
    origin: "Milan, Italy",
    originId: "milan",
  },
  {
    id: "tokyo",
    destination: "Tokyo, Japan",
    destinationId: "tokyo",
    origin: "Milan, Italy",
    originId: "milan",
  },
  {
    id: "new-york",
    destination: "New York, United States",
    destinationId: "new-york",
    origin: "Milan, Italy",
    originId: "milan",
  },
];

function baseRequest(city: CityCase): Partial<SearchRequest> {
  return {
    origin: city.origin,
    originId: city.originId,
    destination: city.destination,
    destinationId: city.destinationId,
    tripType: "round-trip",
    departureDate: "2026-10-12",
    returnDate: "2026-10-15",
    budget: { amount: 2500, currency: "EUR" },
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard",
    productTypes: ["hotels"],
  };
}

function containsLeak(value: unknown): boolean {
  const text = JSON.stringify(value);
  return (
    /property_token/i.test(text) ||
    /serpapi\.com/i.test(text) ||
    /api_key/i.test(text) ||
    /Chk[a-zA-Z0-9_-]{16,}/.test(text)
  );
}

async function runCity(city: CityCase) {
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

  const hotel = search.data.hotels[0];
  if (!hotel) {
    return {
      city: city.id,
      ok: false,
      stage: "search",
      error: "No hotels returned",
      searchMs,
    };
  }

  clearHotelPropertyDetailsCache();

  const detailsStarted = Date.now();
  let detailsResult;
  try {
    detailsResult = await getHotelPropertyDetails(hotel.id, {
      checkInDate: "2026-10-12",
      checkOutDate: "2026-10-15",
      currency: "EUR",
      adults: 2,
    });
  } catch (error) {
    return {
      city: city.id,
      ok: false,
      stage: "details",
      hotelId: hotel.id,
      hotelName: hotel.name,
      error: error instanceof Error ? error.message : "details failed",
      searchMs,
      detailsMs: Date.now() - detailsStarted,
    };
  }
  const detailsMs = Date.now() - detailsStarted;

  const cachedStarted = Date.now();
  const cachedResult = await getHotelPropertyDetails(hotel.id);
  const cachedMs = Date.now() - cachedStarted;

  const leak =
    containsLeak(detailsResult.details) || containsLeak(cachedResult.details);

  return {
    city: city.id,
    ok: !leak && Boolean(detailsResult.details.hotelId),
    hotelId: hotel.id,
    hotelName: hotel.name,
    searchLocation: hotel.location,
    hasGps: hotel.latitude != null && hotel.longitude != null,
    address: detailsResult.details.address ?? null,
    mapsUrl: detailsResult.details.mapsUrl ?? null,
    websiteUrl: detailsResult.details.websiteUrl ?? null,
    offerCount: detailsResult.details.offers?.length ?? 0,
    hasDisclosure: Boolean(detailsResult.details.thirdPartyDisclosure),
    firstFetchCached: detailsResult.cached,
    secondFetchCached: cachedResult.cached,
    searchMs,
    detailsMs,
    cachedMs,
    leak,
  };
}

async function main() {
  const results = [];
  for (const city of CASES) {
    // Sequential to avoid SerpAPI burst.
    results.push(await runCity(city));
  }

  const report = {
    sprint: "17.3",
    generatedAt: new Date().toISOString(),
    results,
    summary: {
      passed: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
    },
  };

  const outPath = join(process.cwd(), "docs", "SPRINT_17_3_LIVE_RESULTS.json");
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
