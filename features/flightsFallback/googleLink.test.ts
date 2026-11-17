import { test } from "node:test";
import assert from "node:assert/strict";
import { googleExactFlightUrl, splitFlightNumber } from "@/features/flightsFallback/googleLink";

const search = { departureDate: "2026-12-15", returnDate: "2026-12-18", adults: 1, children: 0, infants: 0, currency: "EUR" };

test("googleExactFlightUrl matches the link checked by hand (LHR→AMS BA438, round trip)", () => {
  const url = googleExactFlightUrl(search, [{ from: "LHR", date: "2026-12-15", to: "AMS", airline: "BA", number: "438" }]);
  assert.equal(
    url,
    "https://www.google.com/travel/flights?hl=en&gl=us&curr=EUR&tfs=CBwQAho_EgoyMDI2LTEyLTE1Ih8KA0xIUhIKMjAyNi0xMi0xNRoDQU1TKgJCQTIDNDM4agcIARIDTEhScgcIARIDQU1TGh4SCjIwMjYtMTItMThqBwgBEgNBTVNyBwgBEgNMSFJAAUgBcAGYAQE&tfu=EgIIAQ",
  );
});

test("googleExactFlightUrl: one-way, connections, bad input", () => {
  const oneWay = googleExactFlightUrl({ ...search, returnDate: null }, [
    { from: "MXP", date: "2026-12-15", to: "DOH", airline: "QR", number: "128" },
    { from: "DOH", date: "2026-12-16", to: "CMB", airline: "QR", number: "662" },
  ]);
  assert.ok(oneWay?.startsWith("https://www.google.com/travel/flights?"));
  assert.equal(googleExactFlightUrl(search, []), null);
  assert.equal(googleExactFlightUrl(search, [{ from: "LON", date: "2026-12-15", to: "AMSX", airline: "BA", number: "438" }]), null);
});

test("splitFlightNumber", () => {
  assert.deepEqual(splitFlightNumber("BA 438"), { airline: "BA", number: "438" });
  assert.deepEqual(splitFlightNumber("U2 08301"), { airline: "U2", number: "8301" });
  assert.equal(splitFlightNumber("Train 12"), null);
  assert.equal(splitFlightNumber(null), null);
});
