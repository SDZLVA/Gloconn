import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { resolveAviasalesRedirect } from "@/lib/affiliate/aviasalesRedirect";

const TICKET = "https://www.aviasales.com/search/MIL2311PAR28111?t=FR17955147001795520400000095MXPBVA_ab12cd34_45";

describe("resolveAviasalesRedirect", () => {
  it("sends the traveller to the partner link when one is made", async () => {
    let asked = "";
    let subId = "";
    const result = await resolveAviasalesRedirect(TICKET, async (url, _creds, sub) => {
      asked = url;
      subId = sub;
      return "https://aviasales.tp.st/xyz";
    });
    assert.deepEqual(result, { ok: true, location: "https://aviasales.tp.st/xyz", tagged: true });
    assert.equal(asked, TICKET);
    assert.equal(subId, "flight_exact");
  });

  it("still sends them to the exact ticket when attribution fails", async () => {
    const result = await resolveAviasalesRedirect(TICKET, async () => null);
    assert.deepEqual(result, { ok: true, location: TICKET, tagged: false });
  });

  it("refuses anything that is not an aviasales.com ticket (no open redirect)", async () => {
    let called = false;
    const convert = async () => {
      called = true;
      return "https://aviasales.tp.st/xyz";
    };
    for (const bad of [
      null,
      "",
      "https://evil.example/search/MIL2311PAR28111?t=FR17955147001795520400",
      "https://www.aviasales.com/search/MIL2311PAR28111",
      "javascript:alert(1)",
      "/search/MIL2311PAR28111?t=FR17955147001795520400",
    ]) {
      assert.deepEqual(await resolveAviasalesRedirect(bad, convert), { ok: false }, String(bad));
    }
    assert.equal(called, false);
  });
});
