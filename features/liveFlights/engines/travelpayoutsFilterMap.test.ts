import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  airlineSelected,
  widgetAirlineName,
  widgetStopsToCheck,
} from "@/features/liveFlights/engines/travelpayoutsFilterMap";

describe("widgetStopsToCheck", () => {
  it("maps Glooconn's max stops to the widget's layover boxes", () => {
    assert.deepEqual(widgetStopsToCheck(null, [0, 1, 2]), []);
    assert.deepEqual(widgetStopsToCheck(0, [0, 1, 2]), [0]);
    assert.deepEqual(widgetStopsToCheck(1, [0, 1, 2]), [0, 1]);
    assert.deepEqual(widgetStopsToCheck(2, [0, 1, 2]), [], "all ticked = any");
    assert.deepEqual(widgetStopsToCheck(0, [1, 2]), [], "nothing direct on offer: leave all");
  });
});

describe("airline matching", () => {
  it("reads the name from a widget label", () => {
    assert.equal(widgetAirlineName("Air France€ ‪150‬"), "Air France");
    assert.equal(widgetAirlineName("easyJet€ 71"), "easyJet");
  });

  it("matches names regardless of case and punctuation", () => {
    assert.equal(airlineSelected("easyJet", ["EasyJet"]), true);
    assert.equal(airlineSelected("ITA Airways", ["Ryanair"]), false);
    assert.equal(airlineSelected("", ["Ryanair"]), false);
  });
});
