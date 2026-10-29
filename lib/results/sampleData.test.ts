import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { samplePackageNote } from "@/lib/results/sampleData";

describe("samplePackageNote", () => {
  it("is null for a fully real package", () => {
    assert.equal(samplePackageNote(false, false), null);
    assert.equal(samplePackageNote(undefined, undefined), null);
  });

  it("names the sample part", () => {
    assert.match(samplePackageNote(false, true) ?? "", /example hotel/i);
    assert.match(samplePackageNote(true, false) ?? "", /example flight/i);
    assert.match(samplePackageNote(true, true) ?? "", /flight and hotel/i);
  });
});
