/**
 * Sprint 17.3 — property details HTTP client.
 */

import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import {
  buildPropertyDetailsParams,
  fetchGoogleHotelPropertyDetails,
} from "@/lib/providers/hotels/serpapi/propertyDetailsClient";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("buildPropertyDetailsParams", () => {
  it("sets engine, q, and property_token without api_key", () => {
    const params = buildPropertyDetailsParams("ChkToken", {
      query: "Paris, France",
      checkInDate: "2026-09-15",
      checkOutDate: "2026-09-18",
      currency: "EUR",
      adults: 2,
    });
    assert.equal(params.get("engine"), "google_hotels");
    assert.equal(params.get("q"), "Paris, France");
    assert.equal(params.get("property_token"), "ChkToken");
    assert.equal(params.get("api_key"), null);
    assert.equal(params.get("check_in_date"), "2026-09-15");
    assert.equal(params.get("currency"), "EUR");
  });
});

describe("fetchGoogleHotelPropertyDetails", () => {
  it("returns JSON on success", async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          name: "Test Hotel",
          address: "1 Test St",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );

    const body = await fetchGoogleHotelPropertyDetails(
      "ChkToken",
      { apiKey: "test-key" },
      { query: "Bali" },
    );
    assert.equal(body.name, "Test Hotel");
  });

  it("maps 401/403 to provider auth errors", async () => {
    for (const status of [401, 403]) {
      globalThis.fetch = async () =>
        new Response(JSON.stringify({ error: "Denied" }), { status });
      await assert.rejects(
        () =>
          fetchGoogleHotelPropertyDetails(
            "ChkToken",
            { apiKey: "bad" },
            { query: "Bali" },
          ),
        (error: unknown) => {
          assert.ok(isApiError(error));
          assert.match(error.message, /authentication failed/i);
          return true;
        },
      );
    }
  });

  it("maps 429 to a busy message", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({}), { status: 429 });
    await assert.rejects(
      () =>
        fetchGoogleHotelPropertyDetails(
          "ChkToken",
          { apiKey: "k" },
          { query: "Bali" },
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /busy/i);
        return true;
      },
    );
  });

  it("rejects invalid JSON bodies", async () => {
    globalThis.fetch = async () =>
      new Response("not-json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    await assert.rejects(
      () =>
        fetchGoogleHotelPropertyDetails(
          "ChkToken",
          { apiKey: "k" },
          { query: "Bali" },
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /invalid response/i);
        return true;
      },
    );
  });

  it("fails when API key is missing", async () => {
    await assert.rejects(
      () =>
        fetchGoogleHotelPropertyDetails(
          "ChkToken",
          { apiKey: "" },
          { query: "Bali" },
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.match(error.message, /SERPAPI_API_KEY/i);
        return true;
      },
    );
  });
});
