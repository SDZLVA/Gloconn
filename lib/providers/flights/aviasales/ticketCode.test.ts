import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { formatWallClock, parseTicketCode } from "@/lib/providers/flights/aviasales/ticketCode";

// Real codes from glooconn.com, MIL⇄PAR 23–28 Nov 2026 (2026-10-29).
const RYANAIR = "FR17954487001795454400000095MXPBVA17958723001795877700000090BVABGY_0c37c2880763934e3fad8f814e99205a_3639";
const VIA_TIRANA = "FR17954472001795473600000440BGYTIABVA17958723001795877700000090BVABGY_2c280f0b2c60b6a6d172d4d9126aff6e_10673";

describe("parseTicketCode", () => {
  it("splits a round trip into two legs with local times and airports", () => {
    const legs = parseTicketCode(RYANAIR);
    assert.ok(legs);
    assert.equal(legs.length, 2);
    assert.equal(formatWallClock(legs[0].departUnix), "2026-11-23 15:45", "aviasales.com: MXP 3:45 pm");
    assert.equal(formatWallClock(legs[0].arriveUnix), "2026-11-23 17:20", "aviasales.com: BVA 5:20 pm");
    assert.equal(legs[0].minutes, 95);
    assert.deepEqual(legs[0].airports, ["MXP", "BVA"]);
    assert.deepEqual(legs[1].airports, ["BVA", "BGY"], "returns to Bergamo, not Malpensa");
    assert.equal(formatWallClock(legs[1].arriveUnix), "2026-11-28 14:55");
  });

  it("keeps stopover airports and the door-to-door time", () => {
    const legs = parseTicketCode(VIA_TIRANA);
    assert.ok(legs);
    assert.deepEqual(legs[0].airports, ["BGY", "TIA", "BVA"]);
    assert.equal(legs[0].minutes, 440);
  });

  it("allows a time-zone shift between the local clocks", () => {
    // MXP 18:25 → LGW 19:25 local, 120 minutes in the air.
    const dep = Date.UTC(2026, 10, 24, 18, 25) / 1000;
    const arr = Date.UTC(2026, 10, 24, 19, 25) / 1000;
    const legs = parseTicketCode(`U2${dep}${arr}000120MXPLGW_x_1`);
    assert.ok(legs);
    assert.equal(legs[0].minutes, 120);
  });

  it("rejects anything that does not fit", () => {
    for (const bad of [
      null,
      "",
      "sample",
      "FR1795448700179545440000009MXPBVA_x_1", // short duration field
      "FR17954487001795454400000097MXPBVA_x_1", // 2-minute mismatch, not a zone shift
      "FR17954487001795454400000095MXP_x_1", // one airport
    ]) {
      assert.equal(parseTicketCode(bad), null, String(bad));
    }
  });
});
