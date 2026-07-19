import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiError } from "@/lib/api/errors";
import {
  isTimeoutError,
  providerErrorFromFetchFailure,
  signalWithTimeout,
} from "@/lib/providers/flights/amadeus/httpTimeout";

describe("isTimeoutError", () => {
  it("returns true for TimeoutError", () => {
    const error = new DOMException("Aborted due to timeout", "TimeoutError");
    assert.equal(isTimeoutError(error), true);
  });

  it("returns false for generic AbortError or other errors", () => {
    assert.equal(
      isTimeoutError(new DOMException("Aborted", "AbortError")),
      false,
    );
    assert.equal(isTimeoutError(new Error("network down")), false);
    assert.equal(isTimeoutError(undefined), false);
  });
});

describe("providerErrorFromFetchFailure", () => {
  it("maps TimeoutError to a clear timeout ProviderError", () => {
    const cause = new DOMException("Aborted due to timeout", "TimeoutError");
    const error = providerErrorFromFetchFailure(cause, {
      timeoutMessage: "Amadeus request timed out. Please try again.",
      networkMessage: "Could not reach the Amadeus API.",
    });

    assert.ok(isApiError(error));
    assert.equal(error.code, "PROVIDER_ERROR");
    assert.equal(error.message, "Amadeus request timed out. Please try again.");
    assert.equal(error.cause, cause);
    assert.equal(error.message.includes("TimeoutError"), false);
    assert.equal(error.message.includes("Abort"), false);
  });

  it("maps other failures to the network ProviderError", () => {
    const cause = new Error("ECONNREFUSED");
    const error = providerErrorFromFetchFailure(cause, {
      timeoutMessage: "Amadeus request timed out. Please try again.",
      networkMessage: "Could not reach the Amadeus API.",
    });

    assert.ok(isApiError(error));
    assert.equal(error.message, "Could not reach the Amadeus API.");
  });
});

describe("signalWithTimeout", () => {
  it("returns an AbortSignal that aborts after the timeout", async () => {
    const signal = signalWithTimeout(5);
    assert.equal(signal.aborted, false);

    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(signal.aborted, true);
    assert.equal(signal.reason?.name, "TimeoutError");
  });
});
