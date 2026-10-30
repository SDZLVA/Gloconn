import { test } from "node:test";
import assert from "node:assert/strict";
import { stay22MapUrl } from "@/features/liveHotels/stay22";

test("stay22MapUrl builds the map for the stay", () => {
  const url = new URL(
    stay22MapUrl(
      {
        destination: "London, United Kingdom",
        departureDate: "2026-12-03",
        returnDate: "2026-12-11",
        travelers: { adults: 2, children: 1, infants: 0, rooms: 1 },
        budget: { amount: 900, currency: "EUR" },
      },
      "glooconn",
    )!,
  );
  assert.equal(url.origin + url.pathname, "https://www.stay22.com/embed/gm");
  assert.equal(url.searchParams.get("aid"), "glooconn");
  assert.equal(url.searchParams.get("address"), "London, United Kingdom");
  assert.equal(url.searchParams.get("checkin"), "2026-12-03");
  assert.equal(url.searchParams.get("checkout"), "2026-12-11");
  assert.equal(url.searchParams.get("adults"), "2");
  assert.equal(url.searchParams.get("max"), "900");
  assert.equal(url.searchParams.get("priceper"), "total");
  assert.equal(url.searchParams.get("currency"), "EUR");
});

test("stay22MapUrl needs a destination and both dates", () => {
  assert.equal(stay22MapUrl({ destination: "Paris", departureDate: "2026-12-03" }, "glooconn"), null);
});
