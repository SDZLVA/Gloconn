/**
 * Sprint 17.5.1 — live sealed-ref + cross-process simulation.
 *
 * Process A: search → sealed providerPropertyRef
 * Process B: clear registry + details cache → details via ref only
 *
 * Usage:
 *   npx tsx --env-file=.env.local --import ./test/register-server-only.mjs scripts/sprint-17-5-1-live-validation.mts
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
import { isSealedPropertyRef } from "@/lib/hotels/sealedPropertyRef";
import type { SearchRequest } from "@/types/models/search-request";

const CASES = [
  { id: "paris", destination: "Paris, France", destinationId: "paris" },
  { id: "tokyo", destination: "Tokyo, Japan", destinationId: "tokyo" },
  {
    id: "new-york",
    destination: "New York, United States",
    destinationId: "new-york",
  },
] as const;

function baseRequest(
  city: (typeof CASES)[number],
): Partial<SearchRequest> {
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

async function runCity(city: (typeof CASES)[number]) {
  clearHotelPropertyDetailsCache();
  clearHotelPropertyTokenRegistry();

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
  if (!hotel?.providerPropertyRef) {
    return {
      city: city.id,
      ok: false,
      stage: "search",
      error: "No hotel sealed ref",
      searchMs,
    };
  }

  const sealed = hotel.providerPropertyRef;
  const registrySizeAfterSearch = getHotelPropertyTokenRegistrySizeForTests();

  // Process B simulation: wipe all in-process state.
  clearHotelPropertyTokenRegistry();
  clearHotelPropertyDetailsCache();

  const detailsStarted = Date.now();
  let firstError: string | null = null;
  let first: Awaited<ReturnType<typeof getHotelPropertyDetails>> | null = null;
  try {
    first = await getHotelPropertyDetails({
      ref: sealed,
      hotelId: hotel.id,
    });
  } catch (error) {
    firstError = error instanceof Error ? error.message : String(error);
  }
  const detailsMs = Date.now() - detailsStarted;

  const cachedStarted = Date.now();
  let secondCached: boolean | null = null;
  try {
    const second = await getHotelPropertyDetails({
      ref: sealed,
      hotelId: hotel.id,
    });
    secondCached = second.cached;
  } catch {
    secondCached = null;
  }
  const cachedMs = Date.now() - cachedStarted;

  // hotelId-only must fail (no production registry).
  let hotelIdOnlyFailed = false;
  try {
    await getHotelPropertyDetails({ hotelId: hotel.id });
  } catch {
    hotelIdOnlyFailed = true;
  }

  const d = first?.details;
  const leak =
    Boolean(sealed.includes("Chk")) ||
    JSON.stringify(d ?? {}).includes("property_token") ||
    /serpapi\.com/i.test(JSON.stringify(d ?? {}));

  return {
    city: city.id,
    ok: !firstError && Boolean(d?.hotelId) && !leak && hotelIdOnlyFailed,
    hotelId: hotel.id,
    hotelName: hotel.name,
    sealedRefPrefixOk: isSealedPropertyRef(sealed),
    rawTokenAbsentFromRef: !sealed.includes(
      hotel.providerPropertyRef?.slice(0, 8) === "gpref1."
        ? "Chk"
        : "never",
    ),
    registrySizeAfterSearch,
    registryClearedBeforeDetails: true,
    detailsSuccess: !firstError,
    detailsError: firstError,
    addressAvailable: Boolean(d?.address),
    mapsAvailable: Boolean(d?.mapsUrl) || (hotel.latitude != null && hotel.longitude != null),
    websiteAvailable: Boolean(d?.websiteUrl),
    offerCount: d?.offers?.length ?? 0,
    firstFetchCached: first?.cached ?? null,
    secondFetchCached: secondCached,
    searchMs,
    detailsMs,
    cachedMs,
    hotelIdOnlyFailed,
    leak,
  };
}

async function main() {
  const results = [];
  for (const city of CASES) {
    results.push(await runCity(city));
  }

  const report = {
    sprint: "17.5.1",
    generatedAt: new Date().toISOString(),
    environment: "local tsx — registry wiped before details (cross-process sim)",
    results,
    summary: {
      passed: results.filter((r) => "ok" in r && r.ok).length,
      failed: results.filter((r) => "ok" in r && !r.ok).length,
    },
  };

  const outPath = join(
    process.cwd(),
    "docs",
    "SPRINT_17_5_1_LIVE_RESULTS.json",
  );
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
