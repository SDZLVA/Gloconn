import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildAviasalesSearchUrl,
  buildAviasalesTicketUrl,
  isAviasalesTicketUrl,
} from "@/lib/affiliate/aviasalesLink";

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

describe("buildAviasalesTicketUrl — Milestone 20 exact tickets", () => {
  const LINK =
    "/search/MIL2311PAR28111?t=FR17955147001795520400000095MXPBVA_ab12cd34_45&search_date=29102026&expected_price=45&expected_price_currency=eur";

  it("keeps the ticket code and puts in the traveller's own passenger count", () => {
    const url = buildAviasalesTicketUrl(LINK, { adults: 2, children: 1 });
    assert.ok(url);
    const parsed = new URL(url);
    assert.equal(parsed.origin, "https://www.aviasales.com");
    assert.equal(parsed.pathname, "/search/MIL2311PAR281121");
    assert.equal(parsed.searchParams.get("t"), "FR17955147001795520400000095MXPBVA_ab12cd34_45");
    assert.equal(parsed.searchParams.get("expected_price"), "45");
  });

  it("works for one-way paths", () => {
    const url = buildAviasalesTicketUrl("/search/MIL2311PAR1?t=FR1795514700abcdef", { adults: 1 });
    assert.equal(url, "https://www.aviasales.com/search/MIL2311PAR1?t=FR1795514700abcdef");
  });

  it("rejects links that are not aviasales ticket paths", () => {
    for (const bad of [
      undefined,
      "",
      "/search/MIL2311PAR28111",
      "/search/MIL2311PAR28111?x=1",
      "https://evil.example/search/MIL2311PAR28111?t=FR1795514700",
      "//evil.example/search/MIL2311PAR28111?t=FR1795514700",
      "/search/MIL2311PAR28111?t=<script>",
      "/hotels/MIL2311PAR28111?t=FR1795514700",
    ]) {
      assert.equal(buildAviasalesTicketUrl(bad, { adults: 1 }), null, String(bad));
    }
  });

  it("isAviasalesTicketUrl accepts only www.aviasales.com ticket pages", () => {
    const good = buildAviasalesTicketUrl(LINK, { adults: 1 });
    assert.ok(good && isAviasalesTicketUrl(good));
    assert.equal(isAviasalesTicketUrl("https://www.aviasales.com/search/MIL2311PAR28111"), false);
    assert.equal(isAviasalesTicketUrl("https://evil.example/search/MIL2311PAR28111?t=FR1795514700"), false);
    assert.equal(isAviasalesTicketUrl("http://www.aviasales.com/search/MIL2311PAR28111?t=FR1795514700"), false);
    assert.equal(isAviasalesTicketUrl("https://user@www.aviasales.com/search/MIL2311PAR28111?t=FR1795514700"), false);
    assert.equal(isAviasalesTicketUrl("not a url"), false);
  });
});
