import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { DISABLED_AFFILIATE_CONFIG } from "@/lib/affiliate/config";
import { buildKiwiAffiliateUrl, buildKiwiSearchUrl } from "@/lib/affiliate/kiwi";
import type { AffiliateConfig } from "@/lib/affiliate/types";

/** The partner ID used in Travelpayouts' own documentation example. */
const DOC_CONFIG: AffiliateConfig = { enabled: true, travelpayoutsMarker: "78606" };

describe("Kiwi.com links match Travelpayouts' documentation exactly", () => {
  it("reproduces the documented worked example byte for byte", () => {
    // Verbatim from https://support.travelpayouts.com/hc/en-us/articles/360010109719
    const documentedSearch =
      "https://www.kiwi.com/deep?from=FCO&to=BOS&departure=2019-12-05&return=2019-12-13";
    const documentedLink =
      "https://c111.travelpayouts.com/click?shmarker=78606.kiwicom&promo_id=3791" +
      "&source_type=customlink&type=click&custom_url=" +
      "https%3A%2F%2Fwww.kiwi.com%2Fdeep%3Ffrom%3DFCO%26to%3DBOS%26departure%3D2019-12-05%26return%3D2019-12-13";

    const search = buildKiwiSearchUrl({
      origin: "FCO",
      destination: "BOS",
      departureDate: "2019-12-05",
      returnDate: "2019-12-13",
    });
    assert.equal(search, documentedSearch);

    const result = buildKiwiAffiliateUrl(documentedSearch, DOC_CONFIG, "kiwicom");
    assert.equal(result.tagged, true);
    assert.equal(result.url, documentedLink);
  });
});

describe("buildKiwiSearchUrl", () => {
  it("builds a one-way search without a return parameter", () => {
    assert.equal(
      buildKiwiSearchUrl({ origin: "MXP", destination: "CDG", departureDate: "2027-03-02" }),
      "https://www.kiwi.com/deep?from=MXP&to=CDG&departure=2027-03-02",
    );
  });

  it("upper-cases airport codes", () => {
    assert.equal(
      buildKiwiSearchUrl({ origin: "mxp", destination: "cdg", departureDate: "2027-03-02" }),
      "https://www.kiwi.com/deep?from=MXP&to=CDG&departure=2027-03-02",
    );
  });

  it("rejects anything that is not a three-letter code", () => {
    for (const bad of ["", "MX", "MXPX", "M1P", "MXP&to=XXX"]) {
      assert.equal(
        buildKiwiSearchUrl({ origin: bad, destination: "CDG", departureDate: "2027-03-02" }),
        null,
        `should reject origin ${JSON.stringify(bad)}`,
      );
    }
  });

  it("rejects the same origin and destination", () => {
    assert.equal(
      buildKiwiSearchUrl({ origin: "CDG", destination: "CDG", departureDate: "2027-03-02" }),
      null,
    );
  });

  it("rejects malformed and impossible dates", () => {
    for (const bad of ["2027-3-2", "02/03/2027", "2027-02-30", "2027-13-01", ""]) {
      assert.equal(
        buildKiwiSearchUrl({ origin: "MXP", destination: "CDG", departureDate: bad }),
        null,
        `should reject ${JSON.stringify(bad)}`,
      );
    }
  });

  it("rejects a return date before departure", () => {
    assert.equal(
      buildKiwiSearchUrl({
        origin: "MXP",
        destination: "CDG",
        departureDate: "2027-03-06",
        returnDate: "2027-03-02",
      }),
      null,
    );
  });
});

describe("buildKiwiAffiliateUrl", () => {
  const SEARCH = "https://www.kiwi.com/deep?from=MXP&to=CDG&departure=2027-03-02";

  it("falls back to the plain Kiwi link when affiliate config is off", () => {
    const result = buildKiwiAffiliateUrl(SEARCH, DISABLED_AFFILIATE_CONFIG);
    assert.equal(result.tagged, false);
    assert.equal(result.reason, "disabled");
    assert.equal(result.url, SEARCH);
  });

  it("omits the SubID suffix when none is given", () => {
    const result = buildKiwiAffiliateUrl(SEARCH, DOC_CONFIG);
    assert.ok(result.url.includes("shmarker=78606&"));
  });

  it("drops a SubID outside the documented alphabet instead of using it", () => {
    for (const bad of ["has space", "a.b", "a&b=c", "x".repeat(65)]) {
      const result = buildKiwiAffiliateUrl(SEARCH, DOC_CONFIG, bad);
      assert.equal(result.tagged, true);
      assert.ok(result.url.includes("shmarker=78606&"), `should drop ${JSON.stringify(bad)}`);
    }
  });

  it("refuses to wrap anything that is not a kiwi.com deep link", () => {
    for (const other of [
      "https://www.kiwi.com/",
      "https://www.kiwi.com/en/search",
      "https://evil.example/deep?from=MXP",
      "http://www.kiwi.com/deep?from=MXP&to=CDG&departure=2027-03-02",
      "not a url",
    ]) {
      const result = buildKiwiAffiliateUrl(other, DOC_CONFIG);
      assert.equal(result.tagged, false, `should refuse ${other}`);
    }
  });

  it("round-trips: the wrapped destination decodes back to the original search", () => {
    const result = buildKiwiAffiliateUrl(SEARCH, DOC_CONFIG, "flight_card");
    const wrapped = new URL(result.url);
    assert.equal(wrapped.hostname, "c111.travelpayouts.com");
    assert.equal(wrapped.searchParams.get("custom_url"), SEARCH);
    assert.equal(wrapped.searchParams.get("shmarker"), "78606.flight_card");
    assert.equal(wrapped.searchParams.get("promo_id"), "3791");
  });
});
