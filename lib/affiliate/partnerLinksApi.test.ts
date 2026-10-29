import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";

import { _resetPartnerLinkCache, createPartnerLink } from "@/lib/affiliate/partnerLinksApi";

const CREDS = { apiToken: "secret-token", projectId: "585088", marker: "754110" };
const BRAND = "https://www.aviasales.com/search/MIL2311PAR28111";

function okResponse(partnerUrl: string): Response {
  return new Response(
    JSON.stringify({ result: { links: [{ url: BRAND, code: "success", partner_url: partnerUrl }] }, code: "success", status: 200 }),
    { status: 200 },
  );
}

afterEach(() => _resetPartnerLinkCache());

describe("createPartnerLink", () => {
  it("sends trs, marker and the link, with the token only in a header", async () => {
    let body: Record<string, unknown> = {};
    let token: string | null = null;
    const href = await createPartnerLink(BRAND, CREDS, "aviasales_search", (async (_u: unknown, init?: RequestInit) => {
      body = JSON.parse(String(init?.body));
      token = new Headers(init?.headers).get("X-Access-Token");
      return okResponse("https://aviasales.tp.st/abc");
    }) as typeof fetch);

    assert.equal(href, "https://aviasales.tp.st/abc");
    assert.equal(token, "secret-token");
    assert.equal(body.trs, 585088);
    assert.equal(body.marker, 754110);
    assert.deepEqual(body.links, [{ url: BRAND }]);
    assert.equal(body.sub_id, "aviasales_search");
    assert.ok(!JSON.stringify(body).includes("secret-token"));
  });

  it("caches results so repeat searches cost no API calls", async () => {
    let calls = 0;
    const fake = (async () => {
      calls += 1;
      return okResponse("https://aviasales.tp.st/abc");
    }) as typeof fetch;
    await createPartnerLink(BRAND, CREDS, "s", fake);
    await createPartnerLink(BRAND, CREDS, "s", fake);
    assert.equal(calls, 1);
  });

  it("returns null without credentials, without calling the API", async () => {
    let calls = 0;
    const fake = (async () => {
      calls += 1;
      return okResponse("https://x");
    }) as typeof fetch;
    assert.equal(await createPartnerLink(BRAND, { ...CREDS, apiToken: "" }, "s", fake), null);
    assert.equal(await createPartnerLink(BRAND, { ...CREDS, projectId: "" }, "s", fake), null);
    assert.equal(await createPartnerLink(BRAND, { ...CREDS, marker: "" }, "s", fake), null);
    assert.equal(calls, 0);
  });

  it("returns null when the API reports a failure or errors", async () => {
    const failed = (async () =>
      new Response(JSON.stringify({ result: { links: [{ code: "failed", message: "trs is not subscribed for brand" }] } }), { status: 200 })) as typeof fetch;
    assert.equal(await createPartnerLink(BRAND, CREDS, "s", failed), null);

    const http500 = (async () => new Response("oops", { status: 500 })) as typeof fetch;
    assert.equal(await createPartnerLink(BRAND, CREDS, "s", http500), null);

    const network = (async () => {
      throw new Error("down");
    }) as typeof fetch;
    assert.equal(await createPartnerLink(BRAND, CREDS, "s", network), null);
  });
});
