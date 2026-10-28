import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { DISABLED_AFFILIATE_CONFIG } from "@/lib/affiliate/config";
import { buildFlightPartnerLink, FLIGHT_CARD_SUB_ID } from "@/lib/affiliate/flightPartnerLink";
import type { AffiliateConfig } from "@/lib/affiliate/types";

const LIVE: AffiliateConfig = { enabled: true, travelpayoutsMarker: "754110" };

const ROUND_TRIP = {
  originIata: "MXP",
  destinationIata: "CDG",
  departureDate: "2027-03-02",
  returnDate: "2027-03-06",
  tripType: "round-trip" as const,
};

describe("buildFlightPartnerLink", () => {
  it("builds a tagged Kiwi.com link for a round trip", () => {
    const link = buildFlightPartnerLink(ROUND_TRIP, LIVE);
    assert.ok(link);
    assert.equal(link.tagged, true);
    assert.equal(link.partnerName, "Kiwi.com");

    const wrapped = new URL(link.href);
    assert.equal(wrapped.searchParams.get("shmarker"), `754110.${FLIGHT_CARD_SUB_ID}`);
    assert.equal(
      wrapped.searchParams.get("custom_url"),
      "https://www.kiwi.com/deep?from=MXP&to=CDG&departure=2027-03-02&return=2027-03-06",
    );
  });

  it("drops the return date for one-way searches even if one is present", () => {
    const link = buildFlightPartnerLink({ ...ROUND_TRIP, tripType: "one-way" }, LIVE);
    assert.ok(link);
    const destination = new URL(link.href).searchParams.get("custom_url") ?? "";
    assert.ok(!destination.includes("return="), destination);
  });

  it("still gives travellers a working, untagged link when affiliate config is off", () => {
    const link = buildFlightPartnerLink(ROUND_TRIP, DISABLED_AFFILIATE_CONFIG);
    assert.ok(link);
    assert.equal(link.tagged, false);
    assert.equal(
      link.href,
      "https://www.kiwi.com/deep?from=MXP&to=CDG&departure=2027-03-02&return=2027-03-06",
    );
  });

  it("returns null instead of a broken link when the route is unknown", () => {
    assert.equal(buildFlightPartnerLink({ ...ROUND_TRIP, originIata: null }, LIVE), null);
    assert.equal(buildFlightPartnerLink({ ...ROUND_TRIP, destinationIata: "" }, LIVE), null);
    assert.equal(buildFlightPartnerLink({ ...ROUND_TRIP, departureDate: null }, LIVE), null);
  });
});
