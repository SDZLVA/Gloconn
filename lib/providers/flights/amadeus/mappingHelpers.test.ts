import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateStops,
  formatTime,
  mapAirline,
  mapCabin,
  parseDuration,
  parsePrice,
  validateCurrency,
} from "@/lib/providers/flights/amadeus/mappingHelpers";
import type { AmadeusFlightSegment } from "@/lib/providers/flights/amadeus/types";

function segments(count: number): AmadeusFlightSegment[] {
  return Array.from({ length: count }, (_, index) => ({
    carrierCode: "AF",
    departure: { at: `2026-08-01T0${index}:00:00` },
    arrival: { at: `2026-08-01T0${index}:30:00` },
  }));
}

describe("parseDuration", () => {
  it("parses hours and minutes (PT2H10M)", () => {
    assert.equal(parseDuration("PT2H10M"), 130);
  });

  it("parses days and hours (P1DT3H)", () => {
    assert.equal(parseDuration("P1DT3H"), 27 * 60);
  });

  it("parses minutes only (PT45M)", () => {
    assert.equal(parseDuration("PT45M"), 45);
  });

  it("returns null for undefined, empty, or non-P values", () => {
    assert.equal(parseDuration(undefined), null);
    assert.equal(parseDuration(""), null);
    assert.equal(parseDuration("2H10M"), null);
  });

  it("returns null for bare P or PT", () => {
    assert.equal(parseDuration("P"), null);
    assert.equal(parseDuration("PT"), null);
  });
});

describe("formatTime", () => {
  it("extracts HH:mm from an Amadeus at timestamp", () => {
    assert.equal(formatTime("2026-08-01T08:15:00"), "08:15");
  });

  it("extracts HH:mm when a timezone suffix is present", () => {
    assert.equal(formatTime("2026-08-01T14:40:00.000Z"), "14:40");
  });

  it("returns null for missing or unparseable values", () => {
    assert.equal(formatTime(undefined), null);
    assert.equal(formatTime(""), null);
    assert.equal(formatTime("not-a-time"), null);
  });
});

describe("calculateStops", () => {
  it("returns 0 for undefined or empty segments", () => {
    assert.equal(calculateStops(undefined), 0);
    assert.equal(calculateStops([]), 0);
  });

  it("returns 0 for one segment (nonstop)", () => {
    assert.equal(calculateStops(segments(1)), 0);
  });

  it("returns 1 for two segments", () => {
    assert.equal(calculateStops(segments(2)), 1);
  });

  it("returns 2 for three segments", () => {
    assert.equal(calculateStops(segments(3)), 2);
  });
});

describe("mapAirline", () => {
  it("prefers dictionary carrier name for the primary code", () => {
    assert.equal(
      mapAirline({
        carrierCode: "AF",
        dictionaries: { carriers: { AF: "AIR FRANCE" } },
      }),
      "AIR FRANCE",
    );
  });

  it("falls back to the raw carrier code when the dictionary has no name", () => {
    assert.equal(mapAirline({ carrierCode: "AF" }), "AF");
  });

  it("uses validating airline codes when carrierCode is missing", () => {
    assert.equal(
      mapAirline({
        validatingAirlineCodes: ["LH"],
        dictionaries: { carriers: { LH: "LUFTHANSA" } },
      }),
      "LUFTHANSA",
    );
  });

  it("returns Unknown airline when no codes are available", () => {
    assert.equal(mapAirline({}), "Unknown airline");
  });
});

describe("mapCabin", () => {
  it("maps known Amadeus cabin enums", () => {
    assert.equal(mapCabin("ECONOMY"), "Economy");
    assert.equal(mapCabin("PREMIUM_ECONOMY"), "Premium Economy");
    assert.equal(mapCabin("BUSINESS"), "Business");
    assert.equal(mapCabin("FIRST"), "First");
  });

  it("defaults missing cabin to Economy", () => {
    assert.equal(mapCabin(undefined), "Economy");
    assert.equal(mapCabin(""), "Economy");
  });

  it("title-cases unknown cabin tokens", () => {
    assert.equal(mapCabin("CUSTOM_CABIN"), "Custom Cabin");
  });
});

describe("parsePrice", () => {
  it("parses a decimal price string", () => {
    assert.equal(parsePrice("145.50"), 145.5);
  });

  it("returns null for missing, empty, or negative values", () => {
    assert.equal(parsePrice(undefined), null);
    assert.equal(parsePrice(""), null);
    assert.equal(parsePrice("not-a-number"), null);
    assert.equal(parsePrice("-10"), null);
  });
});

describe("validateCurrency", () => {
  it("accepts supported CurrencyCode values", () => {
    assert.deepEqual(validateCurrency("EUR"), { ok: true, currency: "EUR" });
    assert.deepEqual(validateCurrency(" usd "), { ok: true, currency: "USD" });
  });

  it("rejects unsupported or missing currencies without inventing a fallback", () => {
    assert.deepEqual(validateCurrency("SEK"), {
      ok: false,
      received: "SEK",
    });
    assert.deepEqual(validateCurrency(undefined), {
      ok: false,
      received: undefined,
    });
  });
});
