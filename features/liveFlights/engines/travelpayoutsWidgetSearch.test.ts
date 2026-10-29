import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { renderWidgetFrame } from "@/features/liveFlights/engines/travelpayoutsFrame";
import {
  isValidFlightSearch,
  widgetFlightSearch,
  widgetFrameSrc,
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
    assert.equal(widgetFrameSrc({ ...SEARCH, originCode: "" }), null);
  });

  it("points the frame at Glooconn's own widget page", () => {
    assert.equal(widgetFrameSrc(SEARCH), "/live-flights/frame?flightSearch=MIL2311PAR28111&currency=EUR");
  });

  it("validates the search code and the White Label ID", () => {
    assert.equal(isValidFlightSearch("MIL2311PAR28111"), true);
    assert.equal(isValidFlightSearch("MIL2311PAR1"), true);
    assert.equal(isValidFlightSearch("<script>"), false);
    assert.equal(widgetScriptUrl("24018"), "https://tpwgts.com/wl_web/main.js?wl_id=24018");
    assert.equal(widgetScriptUrl("24018&x=1"), null);
  });
});

describe("renderWidgetFrame", () => {
  it("stamps the nonce and loads the widget", () => {
    const { status, html } = renderWidgetFrame(new URLSearchParams("flightSearch=MIL2311PAR28111"), "abc+/=", "24018");
    assert.equal(status, 200);
    assert.ok(html.includes('<script nonce="abc+/=">'));
    assert.match(html, /tpwgts\.com\/wl_web\/main\.js\?wl_id=24018/);
    assert.match(html, /id="tpwl-tickets"/);
  });

  it("refuses a bad search code or a missing nonce", () => {
    assert.equal(renderWidgetFrame(new URLSearchParams("flightSearch=x"), "n", "24018").status, 400);
    assert.equal(renderWidgetFrame(new URLSearchParams("flightSearch=MIL2311PAR28111"), null, "24018").status, 400);
  });
});
