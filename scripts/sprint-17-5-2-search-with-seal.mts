/**
 * Sprint 17.5.2 live check — search + details with a temporary in-process seal secret.
 * Does not write .env.local. Secret exists only for this process.
 *
 * Usage:
 *   npx tsx --env-file=.env.local --import ./test/register-server-only.mjs scripts/sprint-17-5-2-search-with-seal.mts
 */

import { getAppConfig, resetAppConfig } from "@/lib/config";
import { searchTrips } from "@/lib/services/searchService";
import { getHotelPropertyDetails } from "@/lib/services/hotelPropertyDetailsService";
import { clearHotelPropertyTokenRegistry } from "@/lib/hotels/propertyTokenRegistry";
import { clearHotelPropertyDetailsCache } from "@/lib/hotels/propertyDetailsCache";

const TEMP_SECRET = "sprint-17-5-2-temp-seal-secret-do-not-persist!!";

async function main() {
  process.env.PROPERTY_REF_SEAL_SECRET = TEMP_SECRET;
  resetAppConfig();
  const cfg = getAppConfig();

  const search = await searchTrips({
    origin: "Milan, Italy",
    originId: "milan",
    destination: "Paris, France",
    destinationId: "paris",
    tripType: "round-trip",
    departureDate: "2026-10-12",
    returnDate: "2026-10-15",
    budget: { amount: 2500, currency: "EUR" },
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard",
    productTypes: ["hotels", "flights"],
  });

  if (!search.success) {
    console.log(JSON.stringify({ ok: false, stage: "search", error: search.error.message }, null, 2));
    process.exitCode = 1;
    return;
  }

  const hotel =
    search.data.packages[0]?.hotel ?? search.data.hotels[0];
  if (!hotel?.providerPropertyRef?.startsWith("gpref1.")) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          stage: "seal",
          hotelCount: search.data.hotels.length,
          hasRef: Boolean(hotel?.providerPropertyRef),
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
    return;
  }

  clearHotelPropertyTokenRegistry();
  clearHotelPropertyDetailsCache();

  let detailsOk = false;
  let detailsError: string | null = null;
  try {
    const details = await getHotelPropertyDetails({
      ref: hotel.providerPropertyRef,
      hotelId: hotel.id,
    });
    detailsOk = Boolean(details.details.hotelId);
  } catch (error) {
    detailsError = error instanceof Error ? error.message : String(error);
  }

  const report = {
    ok:
      cfg.propertyRefSeal.isConfigured &&
      search.data.hotels.length > 0 &&
      search.data.flights.length > 0 &&
      detailsOk &&
      !detailsError,
    sealConfigured: cfg.propertyRefSeal.isConfigured,
    hotelCount: search.data.hotels.length,
    flightCount: search.data.flights.length,
    packageCount: search.data.packages.length,
    sealedRef: true,
    detailsOk,
    detailsError,
    hotelWarning: (search.data.warnings ?? []).some((w) => w.domain === "hotels"),
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
