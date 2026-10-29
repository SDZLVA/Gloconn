import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildExactAviasalesLink,
  buildExactKiwiLink,
  buildFlightLinks,
} from "@/lib/affiliate/exactFlightLinks";
import type { FlightPartnerLink } from "@/lib/affiliate/flightPartnerLink";
import { DISABLED_AFFILIATE_CONFIG } from "@/lib/affiliate/config";
import type { Flight } from "@/types/models";

const TICKET = "https://www.aviasales.com/search/MIL2311PAR28111?t=U217955351001795540800000095MXPCDG_x_46";

const EASYJET: Flight = {
  id: "aviasales-MXP-CDG-U2-1",
  destinationId: "paris",
  price: 46,
  currency: "EUR",
  rating: 0,
  airline: "easyJet",
  airlineCode: "U2",
  departureTime: "2026-11-23 19:05",
  arrivalTime: "",
  durationMinutes: 95,
  stops: 0,
  cabin: "",
  originAirport: "MXP",
  destinationAirport: "CDG",
  returnDepartureTime: "2026-11-28 13:20",
  returnStops: 0,
  bookingUrl: TICKET,
};

const CONTEXT = {
  tripType: "round-trip" as const,
  originCode: "MIL",
  destinationCode: "PAR",
  adults: 1,
  config: DISABLED_AFFILIATE_CONFIG,
};

const ROUTE_SEARCH: FlightPartnerLink[] = [
  { href: "https://www.kiwi.com/deep?from=MIL&to=PAR", tagged: false, partnerName: "Kiwi.com" },
  { href: "https://www.aviasales.com/search/MIL2311PAR28111", tagged: false, partnerName: "Aviasales" },
];

function kiwiParams(link: FlightPartnerLink | null): URLSearchParams {
  assert.ok(link);
  return new URL(link.href).searchParams;
}

describe("buildExactKiwiLink — filters verified on kiwi.com 2026-10-29", () => {
  it("round trip: whole city, airline, stops and both departure hours", () => {
    const params = kiwiParams(buildExactKiwiLink(EASYJET, CONTEXT));
    assert.equal(params.get("from"), "MIL");
    assert.equal(params.get("to"), "PAR");
    assert.equal(params.get("departure"), "2026-11-23");
    assert.equal(params.get("return"), "2026-11-28");
    assert.equal(params.get("airlinesList"), "U2");
    assert.equal(params.get("selectedAirlinesExclude"), "false");
    assert.equal(params.get("stopNumber"), "0~true");
    assert.equal(params.get("times"), "19-20-0-24_13-14-0-24");
    assert.equal(params.get("adults"), "1");
  });

  it("one-way: the flight's own airports and one time window", () => {
    const params = kiwiParams(
      buildExactKiwiLink(EASYJET, { ...CONTEXT, tripType: "one-way", adults: 2, children: 1 }),
    );
    assert.equal(params.get("from"), "MXP");
    assert.equal(params.get("to"), "CDG");
    assert.equal(params.get("return"), null);
    assert.equal(params.get("times"), "19-20-0-24");
    assert.equal(params.get("adults"), "2");
    assert.equal(params.get("children"), "1");
  });

  it("allows as many stops as the longer leg has", () => {
    const params = kiwiParams(buildExactKiwiLink({ ...EASYJET, returnStops: 1 }, CONTEXT));
    assert.equal(params.get("stopNumber"), "1~true");
  });

  it("caps a late-evening window at 24", () => {
    const params = kiwiParams(
      buildExactKiwiLink({ ...EASYJET, departureTime: "2026-11-23 23:30" }, CONTEXT),
    );
    assert.equal(params.get("times"), "23-24-0-24_13-14-0-24");
  });

  it("gives no Kiwi button without an airline code or a return time", () => {
    assert.equal(buildExactKiwiLink({ ...EASYJET, airlineCode: undefined }, CONTEXT), null);
    assert.equal(buildExactKiwiLink({ ...EASYJET, returnDepartureTime: undefined }, CONTEXT), null);
  });

  it("is tagged through the Travelpayouts template when a marker is set", () => {
    const link = buildExactKiwiLink(EASYJET, {
      ...CONTEXT,
      config: { enabled: true, travelpayoutsMarker: "754110" },
    });
    assert.ok(link?.tagged);
    assert.match(link.href, /^https:\/\/c111\.travelpayouts\.com\/click\?shmarker=754110\.flight_exact&/);
    const inner = new URL(new URL(link.href).searchParams.get("custom_url") ?? "");
    assert.equal(inner.searchParams.get("times"), "19-20-0-24_13-14-0-24");
  });
});

describe("buildExactAviasalesLink", () => {
  it("goes through our redirect with the ticket page", () => {
    const link = buildExactAviasalesLink(EASYJET);
    assert.ok(link);
    assert.equal(link.partnerName, "Aviasales");
    assert.equal(link.exact, true);
    const url = new URL(link.href, "https://glooconn.com");
    assert.equal(url.pathname, "/api/out/aviasales");
    assert.equal(url.searchParams.get("u"), TICKET);
  });

  it("is absent when the flight has no ticket page", () => {
    assert.equal(buildExactAviasalesLink({ ...EASYJET, bookingUrl: undefined }), null);
  });
});

describe("buildFlightLinks", () => {
  it("exact Aviasales first, then exact Kiwi", () => {
    const links = buildFlightLinks(EASYJET, CONTEXT, ROUTE_SEARCH);
    assert.deepEqual(links.map((l) => [l.partnerName, l.exact]), [
      ["Aviasales", true],
      ["Kiwi.com", true],
    ]);
  });

  it("Aviasales only when Kiwi cannot be narrowed to this flight", () => {
    const links = buildFlightLinks({ ...EASYJET, airlineCode: undefined }, CONTEXT, ROUTE_SEARCH);
    assert.deepEqual(links.map((l) => l.partnerName), ["Aviasales"]);
  });

  it("keeps a general Aviasales search when only Kiwi is exact", () => {
    const links = buildFlightLinks({ ...EASYJET, bookingUrl: undefined }, CONTEXT, ROUTE_SEARCH);
    assert.deepEqual(links.map((l) => [l.partnerName, Boolean(l.exact)]), [
      ["Aviasales", false],
      ["Kiwi.com", true],
    ]);
  });

  it("falls back to the route search for sample flights and flights with nothing exact", () => {
    assert.equal(buildFlightLinks({ ...EASYJET, isSample: true }, CONTEXT, ROUTE_SEARCH), ROUTE_SEARCH);
    assert.equal(
      buildFlightLinks({ ...EASYJET, bookingUrl: undefined, airlineCode: undefined }, CONTEXT, ROUTE_SEARCH),
      ROUTE_SEARCH,
    );
  });
});

describe("Kiwi filter with two airlines (Milestone 21)", () => {
  const leg = { departureTime: "2026-11-28 12:30", durationMinutes: 445, airports: ["BVA", "CAG", "MXP"] };

  it("filters to both airlines when each leg's airline is known", () => {
    const params = kiwiParams(
      buildExactKiwiLink(
        { ...EASYJET, returnStops: 1, returnLeg: { ...leg, airlineCode: "FR", airline: "Ryanair" } },
        CONTEXT,
      ),
    );
    assert.equal(params.get("airlinesList"), "U2,FR");
  });

  it("drops the airline filter rather than hiding the flight when the return airline is unknown", () => {
    const params = kiwiParams(buildExactKiwiLink({ ...EASYJET, returnLeg: leg }, CONTEXT));
    assert.equal(params.get("airlinesList"), null);
    assert.equal(params.get("times"), "19-20-0-24_13-14-0-24");
  });
});
