import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { buildAviasalesSearchUrl } from "@/lib/affiliate/aviasalesLink";

const BASE = { origin: "MIL", destination: "PAR", departureDate: "2026-11-23", adults: 1 };

describe("buildAviasalesSearchUrl — formats verified on aviasales.com 2026-10-29", () => {
  it("round trip, 1 adult", () => {
    assert.equal(
      buildAviasalesSearchUrl({ ...BASE, returnDate: "2026-11-28" }),
      "https://www.aviasales.com/search/MIL2311PAR28111",
    );
  });
  it("round trip, 2 adults + 1 child", () => {
    assert.equal(
      buildAviasalesSearchUrl({ ...BASE, returnDate: "2026-11-28", adults: 2, children: 1 }),
      "https://www.aviasales.com/search/MIL2311PAR281121",
    );
  });
  it("one-way, 1 adult", () => {
    assert.equal(buildAviasalesSearchUrl(BASE), "https://www.aviasales.com/search/MIL2311PAR1");
  });
  it("writes children as 0 when only infants travel", () => {
    assert.equal(
      buildAviasalesSearchUrl({ ...BASE, adults: 2, infants: 1 }),
      "https://www.aviasales.com/search/MIL2311PAR201",
    );
  });
});

describe("buildAviasalesSearchUrl — refuses unusable input", () => {
  it("rejects bad codes, dates and passenger counts", () => {
    assert.equal(buildAviasalesSearchUrl({ ...BASE, origin: "MILAN" }), null);
    assert.equal(buildAviasalesSearchUrl({ ...BASE, destination: "MIL" }), null);
    assert.equal(buildAviasalesSearchUrl({ ...BASE, departureDate: "2026-02-30" }), null);
    assert.equal(buildAviasalesSearchUrl({ ...BASE, returnDate: "2026-11-20" }), null);
    assert.equal(buildAviasalesSearchUrl({ ...BASE, adults: 0 }), null);
    assert.equal(buildAviasalesSearchUrl({ ...BASE, adults: 1, infants: 2 }), null);
    assert.equal(buildAviasalesSearchUrl({ ...BASE, adults: 8, children: 2 }), null);
  });
});
