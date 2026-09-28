/**
 * Milestone 18.4b — explore date-options API + service tests (mock only).
 */

import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { clearCache } from "@/lib/api/cache";
import { _resetRateLimitCache } from "@/lib/api/rateLimit";
import { formatDateISO } from "@/lib/calendar/dates";
import { resetAppConfig } from "@/lib/config";
import { POST } from "@/app/api/search/date-options/route";
import { mockCurrencyProvider } from "@/lib/providers/currencies/mock";
import { mockDestinationProvider } from "@/lib/providers/destinations/mock";
import { mockFlightsProvider } from "@/lib/providers/flights/mock";
import { mockTransportProvider } from "@/lib/providers/ground/mock";
import { mockHotelsProvider } from "@/lib/providers/hotels/mock";
import {
  resetServiceProviders,
  setServiceProviders,
} from "@/lib/services/context";
import {
  buildDateOptionsCacheKey,
  exploreDateOptions,
  isExploreFlexDays,
} from "@/lib/services/dateOptionsExploreService";
import type { SearchDateOptionsResult } from "@/lib/services/dateOptionsService";
import type { ServiceProviders } from "@/lib/services/types";
import type { SearchRequest } from "@/types/models/search-request";

function futureDateISO(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return formatDateISO(d);
}

function baseBody(overrides: Partial<SearchRequest> = {}): Partial<SearchRequest> {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    destination: "Paris, France",
    destinationId: "paris",
    tripType: "round-trip",
    departureDate: futureDateISO(30),
    returnDate: futureDateISO(37),
    budget: { amount: 2500, currency: "EUR" },
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard",
    productTypes: ["hotels", "flights"],
    flexDays: 1,
    ...overrides,
  };
}

function mockProviders(): ServiceProviders {
  return {
    destinations: mockDestinationProvider,
    currencies: mockCurrencyProvider,
    hotels: mockHotelsProvider,
    flights: mockFlightsProvider,
    transport: mockTransportProvider,
  };
}

const savedEnv: Record<string, string | undefined> = {};

function setEnv(vars: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(vars)) {
    if (!(key in savedEnv)) {
      savedEnv[key] = process.env[key];
    }
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  resetAppConfig();
}

function restoreEnv() {
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  for (const key of Object.keys(savedEnv)) {
    delete savedEnv[key];
  }
  resetAppConfig();
}

beforeEach(() => {
  clearCache();
  _resetRateLimitCache();
  setServiceProviders(mockProviders());
  setEnv({ EXPLORE_DATES_ENABLED: "true", USE_MOCK_PROVIDERS: "true" });
});

afterEach(() => {
  resetServiceProviders();
  restoreEnv();
  clearCache();
  _resetRateLimitCache();
});

describe("isExploreFlexDays", () => {
  it("accepts only 1–3", () => {
    assert.equal(isExploreFlexDays(1), true);
    assert.equal(isExploreFlexDays(2), true);
    assert.equal(isExploreFlexDays(3), true);
    assert.equal(isExploreFlexDays(0), false);
    assert.equal(isExploreFlexDays(4), false);
    assert.equal(isExploreFlexDays(undefined), false);
  });
});

describe("exploreDateOptions", () => {
  it("returns option summaries for flexDays 1", async () => {
    const result = await exploreDateOptions(baseBody({ flexDays: 1 }), {
      providers: mockProviders(),
    });
    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.data.options.length, 2);
    assert.ok(
      result.data.options.every(
        (o) =>
          typeof o.departureDate === "string" &&
          typeof o.offsetDays === "number" &&
          typeof o.status === "string",
      ),
    );
  });

  it("rejects flexDays 0 / missing with VALIDATION_ERROR", async () => {
    const missing = await exploreDateOptions(baseBody({ flexDays: undefined }));
    assert.equal(missing.success, false);
    if (missing.success) return;
    assert.equal(missing.error.code, "VALIDATION_ERROR");
    assert.equal(missing.error.field, "flexDays");

    const zero = await exploreDateOptions(baseBody({ flexDays: 0 }));
    assert.equal(zero.success, false);
    if (zero.success) return;
    assert.equal(zero.error.field, "flexDays");
  });

  it("cache hit does not call search again", async () => {
    let searchCalls = 0;
    const search = async (): Promise<SearchDateOptionsResult> => {
      searchCalls += 1;
      return {
        options: [
          {
            departureDate: "2026-08-01",
            returnDate: "2026-08-08",
            offsetDays: -1,
            cheapestTotal: 400,
            currency: "EUR",
            fitsBudget: true,
            status: "ok",
          },
        ],
      };
    };

    const body = baseBody({ flexDays: 2 });
    const first = await exploreDateOptions(body, { search });
    const second = await exploreDateOptions(body, { search });

    assert.equal(first.success, true);
    assert.equal(second.success, true);
    assert.equal(searchCalls, 1);
  });

  it("buildDateOptionsCacheKey is stable for the same criteria", () => {
    const request = baseBody({ flexDays: 2 }) as SearchRequest;
    const a = buildDateOptionsCacheKey(request, 2);
    const b = buildDateOptionsCacheKey({ ...request }, 2);
    assert.equal(a, b);
  });
});

describe("POST /api/search/date-options", () => {
  function makeRequest(
    body: unknown,
    headers: Record<string, string> = {},
  ): Request {
    const json = JSON.stringify(body);
    return new Request("http://localhost:3000/api/search/date-options", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(Buffer.byteLength(json)),
        "x-forwarded-for": "203.0.113.50",
        ...headers,
      },
      body: json,
    });
  }

  it("happy path returns ok + options array", async () => {
    const response = await POST(makeRequest(baseBody({ flexDays: 1 })));
    assert.equal(response.status, 200);
    const json = (await response.json()) as {
      ok: boolean;
      data?: SearchDateOptionsResult;
    };
    assert.equal(json.ok, true);
    assert.ok(Array.isArray(json.data?.options));
    assert.equal(json.data?.options.length, 2);
  });

  it("returns 400 when flexDays is missing or 0", async () => {
    const missing = await POST(makeRequest(baseBody({ flexDays: undefined })));
    assert.equal(missing.status, 400);
    const missingBody = (await missing.json()) as {
      ok: false;
      error: { code: string; field?: string };
    };
    assert.equal(missingBody.ok, false);
    assert.equal(missingBody.error.code, "VALIDATION_ERROR");
    assert.equal(missingBody.error.field, "flexDays");

    const zero = await POST(makeRequest(baseBody({ flexDays: 0 })));
    assert.equal(zero.status, 400);
  });

  it("returns 429 with Retry-After after 3 explores in a minute", async () => {
    const ip = "203.0.113.77";
    for (let i = 0; i < 3; i += 1) {
      const ok = await POST(
        makeRequest(baseBody({ flexDays: 1 }), { "x-forwarded-for": ip }),
      );
      assert.equal(ok.status, 200, `request ${i + 1} should succeed`);
    }

    const limited = await POST(
      makeRequest(baseBody({ flexDays: 1 }), { "x-forwarded-for": ip }),
    );
    assert.equal(limited.status, 429);
    assert.ok(limited.headers.get("Retry-After"));
    const body = (await limited.json()) as {
      ok: false;
      error: { code: string };
    };
    assert.equal(body.error.code, "RATE_LIMITED");
  });

  it("returns 503 EXPLORE_DISABLED when the kill switch is off", async () => {
    setEnv({ EXPLORE_DATES_ENABLED: "false" });
    const response = await POST(makeRequest(baseBody({ flexDays: 1 })));
    assert.equal(response.status, 503);
    const body = (await response.json()) as {
      ok: false;
      error: { code: string };
    };
    assert.equal(body.error.code, "EXPLORE_DISABLED");
  });
});
