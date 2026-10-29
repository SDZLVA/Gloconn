import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { formatFlightDateTime } from "@/lib/results/flightTime";

describe("formatFlightDateTime", () => {
  it("renders provider date-times readably", () => {
    assert.equal(formatFlightDateTime("2026-11-23 19:05"), "Mon 23 Nov · 19:05");
    assert.equal(formatFlightDateTime("2026-11-28 07:00"), "Sat 28 Nov · 07:00");
  });
  it("passes through anything it does not recognise", () => {
    assert.equal(formatFlightDateTime("14:40"), "14:40");
    assert.equal(formatFlightDateTime("2026-02-30 10:00"), "2026-02-30 10:00");
  });
});
