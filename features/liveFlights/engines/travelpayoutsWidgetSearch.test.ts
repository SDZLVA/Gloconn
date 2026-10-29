import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  urlWithWidgetSearch,
  widgetFlightSearch,
  widgetScriptUrl,
} from "@/features/liveFlights/engines/travelpayoutsWidgetSearch";

const SEARCH = {
  originCode: "MIL",
  destinationCode: "PAR",
  departureDate: "2026-11-23",
  returnDate: "2026-11-28",
  adults: 1,
  children: 0,
  infants: 0,
  currency: "EUR",
};

describe("Travelpayouts widget search", () => {
  it("uses the aviasales.com search code", () => {
    assert.equal(widgetFlightSearch(SEARCH), "MIL2311PAR28111");
    assert.equal(widgetFlightSearch({ ...SEARCH, returnDate: null, adults: 2, children: 1 }), "MIL2311PAR21");
  });

  it("refuses unusable searches", () => {
    assert.equal(widgetFlightSearch({ ...SEARCH, originCode: "" }), null);
    assert.equal(widgetFlightSearch({ ...SEARCH, returnDate: "2026-11-01" }), null);
  });

  it("adds the widget parameters and keeps Glooconn's", () => {
    const url = new URL(
      urlWithWidgetSearch("https://glooconn.com/search/results?origin=Milan&tripType=round-trip", SEARCH) ?? "",
    );
    assert.equal(url.searchParams.get("origin"), "Milan");
    assert.equal(url.searchParams.get("flightSearch"), "MIL2311PAR28111");
    assert.equal(url.searchParams.get("currency"), "EUR");
  });

  it("builds the script URL only for a numeric White Label ID", () => {
    assert.equal(widgetScriptUrl("24018"), "https://tpwgts.com/wl_web/main.js?wl_id=24018");
    assert.equal(widgetScriptUrl("24018&x=1"), null);
  });
});
