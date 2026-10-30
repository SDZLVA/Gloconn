import { describe, it, test } from "node:test";
import assert from "node:assert/strict";

import {
  airlineSelected,
  findSliderFraction,
  parseWidgetPrice,
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

test("parseWidgetPrice reads the label amount", () => {
  assert.equal(parseWidgetPrice("TotalTo € ‪5,461‬"), 5461);
  assert.equal(parseWidgetPrice("TotalTo € NaN"), null);
  assert.equal(parseWidgetPrice(""), null);
});

test("findSliderFraction keeps the slider within budget", async () => {
  const priceAt = (f: number) => Math.round(40 + f * 1000); // 40 … 1040
  const f = await findSliderFraction(300, async (x) => priceAt(x));
  assert.ok(priceAt(f) <= 300);
  assert.ok(priceAt(f) > 290);
  assert.equal(await findSliderFraction(5000, async (x) => priceAt(x)), 1);
  assert.equal(await findSliderFraction(10, async (x) => priceAt(x)), 0);
});
