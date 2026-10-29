import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { selectLiveFlightsEngine } from "@/features/liveFlights/config";
import type { LiveFlightsEngine } from "@/features/liveFlights/types";

const ENGINES: LiveFlightsEngine[] = [{ id: "travelpayouts-widget", partnerName: "Aviasales", Panel: () => null }];

describe("selectLiveFlightsEngine", () => {
  it("defaults to the Travelpayouts widget", () => {
    assert.equal(selectLiveFlightsEngine(undefined, ENGINES)?.id, "travelpayouts-widget");
    assert.equal(selectLiveFlightsEngine("", ENGINES)?.id, "travelpayouts-widget");
  });

  it("'off' or an unknown engine switches the section off", () => {
    assert.equal(selectLiveFlightsEngine("off", ENGINES), null);
    assert.equal(selectLiveFlightsEngine("something-else", ENGINES), null);
  });
});
