/**
 * One-off H3 re-check after children_ages fix (Sprint 12.3).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { resetAppConfig } from "@/lib/config";
import { resetProviderRegistry } from "@/lib/providers/core/registry";
import { searchGoogleHotels } from "@/lib/providers/hotels/serpapi/client";
import { mapSerpApiHotelsResponse } from "@/lib/providers/hotels/serpapi/mapper";
import { buildSerpApiHotelsSearchParams } from "@/lib/providers/hotels/serpapi/query";

function loadEnvLocal(): void {
  const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
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
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvLocal();
process.env.USE_MOCK_PROVIDERS = "false";
process.env.HOTELS_PROVIDER = "serpapi";
process.env.FLIGHTS_PROVIDER = "serpapi";
resetAppConfig();
resetProviderRegistry();

const { getAppConfig } = await import("@/lib/config");

const request = {
  origin: "Milan, Italy",
  originId: "milan",
  originIata: "MXP",
  destination: "Rome hotels",
  destinationId: "rome",
  destinationIata: "FCO",
  tripType: "round-trip" as const,
  departureDate: "2026-10-10",
  returnDate: "2026-10-15",
  budget: { amount: 1200, currency: "EUR" as const },
  travelers: { adults: 2, children: 1, infants: 0, rooms: 1 },
  totalGuests: 3,
  travelStyle: "standard" as const,
  productTypes: ["hotels" as const],
};

const started = Date.now();
const params = buildSerpApiHotelsSearchParams(request);
const raw = await searchGoogleHotels(params, getAppConfig().serpapi);
const mapped = mapSerpApiHotelsResponse(raw, {
  destinationId: "rome",
  requestCurrency: "EUR",
  locationFallback: "Rome hotels",
  checkInDate: "2026-10-10",
  checkOutDate: "2026-10-15",
});

const result = {
  id: "H3",
  label: "Rome hotels — 5 nights, 2 adults + 1 child, EUR (post children_ages fix)",
  status: mapped.length > 0 ? "pass" : "fail",
  httpOk: true,
  rawPropertyCount: Array.isArray(raw.properties) ? raw.properties.length : 0,
  mappedCount: mapped.length,
  responseCurrency: raw.search_parameters?.currency,
  requestCurrency: "EUR",
  children: params.get("children"),
  childrenAges: params.get("children_ages"),
  sampleHotels: mapped.slice(0, 2).map((h) => ({
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
  })),
  durationMs: Date.now() - started,
};

const out = resolve(process.cwd(), "docs/SPRINT_12_3_H3_RERUN.json");
writeFileSync(out, JSON.stringify(result, null, 2), "utf8");
console.log(JSON.stringify(result, null, 2));
console.log(`Wrote ${out}`);
