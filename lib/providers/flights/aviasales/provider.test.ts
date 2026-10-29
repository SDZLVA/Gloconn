import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { isApiError } from "@/lib/api/errors";
import { fetchAviasalesPricesForDates } from "@/lib/providers/flights/aviasales/client";
import {
  AVIASALES_RESULT_LIMIT,
  AVIASALES_SCOUT_LIMIT,
  AviasalesFlightsProvider,
  buildAviasalesParams,
  buildReturnLookupParams,
  indexReturnAirlines,
} from "@/lib/providers/flights/aviasales/provider";
import { ROUND_TRIP_SAMPLE } from "@/lib/providers/flights/aviasales/__fixtures__/pricesForDates.sample";
import type { AviasalesConfig } from "@/lib/config/types";
import type { SearchRequest } from "@/types/models/search-request";

const CONFIG: AviasalesConfig = { apiToken: "test-token", market: null, projectId: "", isConfigured: true };

function request(overrides: Partial<SearchRequest> = {}): SearchRequest {
  return {
    origin: "Madrid, Spain",
    destination: "Barcelona, Spain",
    destinationId: "barcelona",
    originIata: "MAD",
    destinationIata: "BCN",
    tripType: "round-trip",
    departureDate: "2027-07-28",
    returnDate: "2027-08-26",
    budget: { amount: 600, currency: "EUR" },
    travelers: { adults: 1, children: 0, infants: 0, rooms: 1 },
    totalGuests: 1,
    travelStyle: "standard",
    productTypes: ["flights"],
    ...overrides,
  } as SearchRequest;
}

describe("buildAviasalesParams", () => {
  it("asks for a round trip when there is a return date", () => {
    const p = buildAviasalesParams(request(), CONFIG);
    assert.equal(p.get("origin"), "MAD");
    assert.equal(p.get("destination"), "BCN");
    assert.equal(p.get("departure_at"), "2027-07-28");
    assert.equal(p.get("return_at"), "2027-08-26");
    assert.equal(p.get("one_way"), "false");
    assert.equal(p.get("currency"), "eur");
    assert.equal(p.get("limit"), String(AVIASALES_RESULT_LIMIT));
  });

  it("asks for one-way without a return date", () => {
    const p = buildAviasalesParams(request({ tripType: "one-way", returnDate: null }), CONFIG);
    assert.equal(p.get("one_way"), "true");
    assert.equal(p.has("return_at"), false);
  });

  it("never puts the token in the query string", () => {
    assert.equal(buildAviasalesParams(request(), CONFIG).has("token"), false);
  });

  it("uses fewer results for scout (price-hint) searches", () => {
    assert.equal(buildAviasalesParams(request(), CONFIG, { scout: true }).get("limit"), String(AVIASALES_SCOUT_LIMIT));
  });

  it("searches whole cities when city codes are known (budget airports)", () => {
    const p = buildAviasalesParams(
      request({ originCityIata: "MIL", destinationCityIata: "PAR", originIata: "MXP", destinationIata: "CDG" }),
      CONFIG,
    );
    assert.equal(p.get("origin"), "MIL");
    assert.equal(p.get("destination"), "PAR");
  });

  it("passes the market only when configured", () => {
    assert.equal(buildAviasalesParams(request(), CONFIG).has("market"), false);
    assert.equal(buildAviasalesParams(request(), { market: "it" }).get("market"), "it");
  });

  it("falls back to EUR for an unsupported budget currency", () => {
    const p = buildAviasalesParams(request({ budget: null }), CONFIG);
    assert.equal(p.get("currency"), "eur");
  });

  it("refuses to search without airport codes", () => {
    assert.throws(() => buildAviasalesParams(request({ originIata: undefined }), CONFIG), isApiError);
  });
});

describe("AviasalesFlightsProvider.search", () => {
  it("returns mapped flights", async () => {
    const provider = new AviasalesFlightsProvider({
      fetchPrices: async () => ROUND_TRIP_SAMPLE,
      getConfig: () => CONFIG,
    });
    const flights = await provider.search(request());
    assert.equal(flights.length, 2);
    assert.equal(flights[0]?.airline, "Iberia");
  });

  it("fails loudly instead of returning an empty list (19.0 lesson)", async () => {
    const provider = new AviasalesFlightsProvider({
      fetchPrices: async () => ({ success: true, data: [] }),
      getConfig: () => CONFIG,
    });
    await assert.rejects(provider.search(request()), (error: unknown) => {
      assert.ok(isApiError(error));
      assert.match(error.message, /No recent flight prices/);
      return true;
    });
  });

  it("drops one-way-looking tickets from a round-trip search, then fails loudly", async () => {
    const provider = new AviasalesFlightsProvider({
      fetchPrices: async () => ({
        success: true,
        data: ROUND_TRIP_SAMPLE.data!.map((t) => ({ ...t, return_at: undefined })),
      }),
      getConfig: () => CONFIG,
    });
    await assert.rejects(provider.search(request()));
  });
});

describe("fetchAviasalesPricesForDates", () => {
  const params = new URLSearchParams({ origin: "MAD", destination: "BCN" });

  it("sends the token in a header, never in the URL", async () => {
    let seenUrl = "";
    let seenToken: string | null = null;
    await fetchAviasalesPricesForDates(params, "secret-token", {
      fetchImpl: (async (url: string | URL | Request, init?: RequestInit) => {
        seenUrl = String(url);
        seenToken = new Headers(init?.headers).get("X-Access-Token");
        return new Response(JSON.stringify(ROUND_TRIP_SAMPLE), { status: 200 });
      }) as typeof fetch,
    });
    assert.equal(seenToken, "secret-token");
    assert.ok(!seenUrl.includes("secret-token"));
  });

  it("refuses to call without a token", async () => {
    await assert.rejects(fetchAviasalesPricesForDates(params, "  "), isApiError);
  });

  it("turns 401 into a clear configuration error", async () => {
    await assert.rejects(
      fetchAviasalesPricesForDates(params, "t", {
        fetchImpl: (async () => new Response("{}", { status: 401 })) as typeof fetch,
      }),
      /TRAVELPAYOUTS_API_TOKEN/,
    );
  });

  it("treats success:false as a failure", async () => {
    await assert.rejects(
      fetchAviasalesPricesForDates(params, "t", {
        fetchImpl: (async () => new Response(JSON.stringify({ success: false, error: "x" }), { status: 200 })) as typeof fetch,
      }),
      isApiError,
    );
  });

  it("does not leak the token into error messages", async () => {
    try {
      await fetchAviasalesPricesForDates(params, "secret-token", {
        fetchImpl: (async () => new Response("not json", { status: 200 })) as typeof fetch,
      });
      assert.fail("should throw");
    } catch (error) {
      assert.ok(!String((error as Error).message).includes("secret-token"));
    }
  });
});

describe("return-airline lookup (Milestone 21)", () => {
  it("searches one-way in the opposite direction on the return date", () => {
    const params = buildAviasalesParams(request(), CONFIG);
    const lookup = buildReturnLookupParams(params);
    assert.ok(lookup);
    assert.equal(lookup.get("origin"), params.get("destination"));
    assert.equal(lookup.get("destination"), params.get("origin"));
    assert.equal(lookup.get("departure_at"), params.get("return_at"));
    assert.equal(lookup.get("return_at"), null);
    assert.equal(lookup.get("one_way"), "true");
  });

  it("needs a return date", () => {
    assert.equal(buildReturnLookupParams(new URLSearchParams({ origin: "MAD", destination: "BCN" })), null);
  });

  it("indexes airlines by airports and local departure time", () => {
    const index = indexReturnAirlines({
      success: true,
      data: [
        { origin_airport: "BVA", destination_airport: "BGY", departure_at: "2026-11-28T13:25:00+01:00", airline: "FR" },
        { origin_airport: "ORY", destination_airport: "BCN", departure_at: "2026-11-28T07:05:00+01:00", airline: "VY" },
        { origin_airport: "CDG", destination_airport: "MXP", departure_at: "bad", airline: "AF" },
      ],
    });
    assert.equal(index.get("BVA|BGY|2026-11-28 13:25"), "FR");
    assert.equal(index.get("ORY|BCN|2026-11-28 07:05"), "VY");
    assert.equal(index.size, 2);
    assert.equal(indexReturnAirlines(null).size, 0);
  });
});
