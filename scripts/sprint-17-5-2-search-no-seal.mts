/**
 * Sprint 17.5.2 live check — search with PROPERTY_REF_SEAL_SECRET unset.
 * Does not write secrets. Does not call details.
 *
 * Usage:
 *   npx tsx --env-file=.env.local --import ./test/register-server-only.mjs scripts/sprint-17-5-2-search-no-seal.mts
 */

import { getAppConfig, resetAppConfig } from "@/lib/config";
import { searchTrips } from "@/lib/services/searchService";

async function main() {
  delete process.env.PROPERTY_REF_SEAL_SECRET;
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
    console.log(
      JSON.stringify(
        { ok: false, error: search.error.message, sealConfigured: cfg.propertyRefSeal.isConfigured },
        null,
        2,
      ),
    );
    process.exitCode = 1;
    return;
  }

  const hotels = search.data.hotels;
  const hotelWarning = (search.data.warnings ?? []).some(
    (w) => w.domain === "hotels",
  );
  const sealedCount = hotels.filter((h) =>
    h.providerPropertyRef?.startsWith("gpref1."),
  ).length;

  const report = {
    ok:
      !cfg.propertyRefSeal.isConfigured &&
      hotels.length > 0 &&
      search.data.flights.length > 0 &&
      !hotelWarning &&
      sealedCount === 0,
    sealConfigured: cfg.propertyRefSeal.isConfigured,
    hotelCount: hotels.length,
    flightCount: search.data.flights.length,
    packageCount: search.data.packages.length,
    hotelWarning,
    sealedRefCount: sealedCount,
    rawTokenLeak: JSON.stringify(hotels).includes("property_token"),
    warnings: search.data.warnings,
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
