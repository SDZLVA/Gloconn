import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import { clearCache } from "@/lib/api/cache";
import { getAppConfig, resetAppConfig } from "@/lib/config";
import { getAmadeusAccessToken } from "@/lib/providers/flights/amadeus/auth";
import { amadeusFetch } from "@/lib/providers/flights/amadeus/client";

const TOKEN_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";
const originalFetch = globalThis.fetch;
const savedEnv = {
  AMADEUS_API_KEY: process.env.AMADEUS_API_KEY,
  AMADEUS_API_SECRET: process.env.AMADEUS_API_SECRET,
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  process.env.AMADEUS_API_KEY = "test-key";
  process.env.AMADEUS_API_SECRET = "test-secret";
  resetAppConfig();
  clearCache();
  assert.equal(getAppConfig().apiKeys.amadeus.isConfigured, true);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  clearCache();

  if (savedEnv.AMADEUS_API_KEY === undefined) {
    delete process.env.AMADEUS_API_KEY;
  } else {
    process.env.AMADEUS_API_KEY = savedEnv.AMADEUS_API_KEY;
  }

  if (savedEnv.AMADEUS_API_SECRET === undefined) {
    delete process.env.AMADEUS_API_SECRET;
  } else {
    process.env.AMADEUS_API_SECRET = savedEnv.AMADEUS_API_SECRET;
  }

  resetAppConfig();
});

describe("Amadeus HTTP timeouts", () => {
  it("maps OAuth TimeoutError to a clear authentication timeout ProviderError", async () => {
    globalThis.fetch = (async () => {
      throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    }) as typeof fetch;

    await assert.rejects(
      () => getAmadeusAccessToken(),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        assert.equal(
          error.message,
          "Amadeus authentication timed out. Please try again.",
        );
        assert.equal(error.message.includes("TimeoutError"), false);
        return true;
      },
    );
  });

  it("maps amadeusFetch TimeoutError to a clear request timeout ProviderError", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url.startsWith(TOKEN_URL)) {
        return jsonResponse(200, {
          access_token: "test-access-token",
          expires_in: 1799,
        });
      }

      throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    }) as typeof fetch;

    await assert.rejects(
      () => amadeusFetch("/v2/shopping/flight-offers?adults=1"),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "PROVIDER_ERROR");
        assert.equal(
          error.message,
          "Amadeus request timed out. Please try again.",
        );
        assert.equal(error.message.includes("TimeoutError"), false);
        return true;
      },
    );
  });

  it("aborts amadeusFetch via AbortSignal.timeout when the request hangs", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url.startsWith(TOKEN_URL)) {
        return jsonResponse(200, {
          access_token: "test-access-token",
          expires_in: 1799,
        });
      }

      return await new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        if (!signal) {
          reject(new Error("Expected AbortSignal on Flight Offers fetch"));
          return;
        }

        const onAbort = () => {
          const reason = signal.reason;
          if (reason instanceof Error) {
            reject(reason);
            return;
          }
          reject(
            new DOMException(
              "The operation was aborted due to timeout",
              "TimeoutError",
            ),
          );
        };

        if (signal.aborted) {
          onAbort();
          return;
        }

        signal.addEventListener("abort", onAbort, { once: true });
      });
    }) as typeof fetch;

    await assert.rejects(
      () =>
        amadeusFetch("/v2/shopping/flight-offers?adults=1", {}, { timeoutMs: 20 }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(
          error.message,
          "Amadeus request timed out. Please try again.",
        );
        return true;
      },
    );
  });
});
