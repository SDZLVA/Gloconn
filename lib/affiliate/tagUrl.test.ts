import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { DISABLED_AFFILIATE_CONFIG, loadAffiliateConfig } from "@/lib/affiliate/config";
import { PARTNER_RULES, tagOutboundUrl, type PartnerRule } from "@/lib/affiliate/tagUrl";
import type { AffiliateConfig } from "@/lib/affiliate/types";

const CONFIG: AffiliateConfig = {
  enabled: true,
  travelpayoutsMarker: "12345",
};

/** Stand-in rules so these tests do not depend on which partners are live. */
const RULES: Record<string, PartnerRule> = {
  "www.partner.example": { program: "travelpayouts", param: "marker" },
};

describe("tagOutboundUrl — when it must not tag", () => {
  it("leaves the link alone when affiliate config is disabled", () => {
    const url = "https://www.partner.example/hotel/42";
    const result = tagOutboundUrl(url, DISABLED_AFFILIATE_CONFIG, RULES);
    assert.equal(result.tagged, false);
    assert.equal(result.reason, "disabled");
    assert.equal(result.url, url);
  });

  it("leaves hosts we have no documented rule for untouched", () => {
    const url = "https://unknown-ota.example/offer?id=9";
    const result = tagOutboundUrl(url, CONFIG, RULES);
    assert.equal(result.tagged, false);
    assert.equal(result.reason, "unsupported_host");
    assert.equal(result.url, url);
  });

  it("refuses non-HTTPS links", () => {
    const result = tagOutboundUrl("http://www.partner.example/x", CONFIG, RULES);
    assert.equal(result.tagged, false);
    assert.equal(result.reason, "invalid_url");
  });

  it("refuses URLs carrying credentials", () => {
    const result = tagOutboundUrl("https://a:b@www.partner.example/x", CONFIG, RULES);
    assert.equal(result.tagged, false);
    assert.equal(result.reason, "invalid_url");
  });

  it("refuses unparseable input", () => {
    for (const bad of ["", "   ", "not a url", "javascript:alert(1)"]) {
      assert.equal(tagOutboundUrl(bad, CONFIG, RULES).tagged, false);
    }
  });

  it("does not double-tag a link that already carries the marker", () => {
    const url = "https://www.partner.example/hotel/42?marker=99999";
    const result = tagOutboundUrl(url, CONFIG, RULES);
    assert.equal(result.tagged, false);
    assert.equal(result.reason, "already_tagged");
    assert.equal(result.url, url);
  });
});

describe("tagOutboundUrl — when it tags", () => {
  it("adds the documented parameter", () => {
    const result = tagOutboundUrl("https://www.partner.example/hotel/42", CONFIG, RULES);
    assert.equal(result.tagged, true);
    assert.equal(new URL(result.url).searchParams.get("marker"), "12345");
  });

  it("preserves host, path and existing query parameters", () => {
    const result = tagOutboundUrl(
      "https://www.partner.example/hotel/42?checkin=2027-03-02&rooms=1",
      CONFIG,
      RULES,
    );
    const tagged = new URL(result.url);
    assert.equal(tagged.hostname, "www.partner.example");
    assert.equal(tagged.pathname, "/hotel/42");
    assert.equal(tagged.searchParams.get("checkin"), "2027-03-02");
    assert.equal(tagged.searchParams.get("rooms"), "1");
  });

  it("adds exactly one parameter and nothing about the traveller", () => {
    const before = new URL("https://www.partner.example/hotel/42?rooms=1");
    const after = new URL(tagOutboundUrl(before.toString(), CONFIG, RULES).url);

    const added = [...after.searchParams.keys()].filter(
      (key) => !before.searchParams.has(key),
    );
    assert.deepEqual(added, ["marker"]);
  });

  it("matches the host case-insensitively", () => {
    const result = tagOutboundUrl("https://WWW.Partner.Example/x", CONFIG, RULES);
    assert.equal(result.tagged, true);
  });
});

describe("PARTNER_RULES", () => {
  it("only contains entries with a usable parameter name", () => {
    for (const [host, rule] of Object.entries(PARTNER_RULES)) {
      assert.equal(host, host.toLowerCase(), `${host} must be lowercase`);
      assert.ok(rule.param.length > 0, `${host} needs a parameter name`);
      assert.equal(rule.program, "travelpayouts");
    }
  });
});

describe("loadAffiliateConfig", () => {
  const KEY = "AFFILIATE_TRAVELPAYOUTS_MARKER";

  function withEnv(value: string | undefined, run: () => void): void {
    const previous = process.env[KEY];
    if (value === undefined) {
      delete process.env[KEY];
    } else {
      process.env[KEY] = value;
    }
    try {
      run();
    } finally {
      if (previous === undefined) {
        delete process.env[KEY];
      } else {
        process.env[KEY] = previous;
      }
    }
  }

  it("is disabled when no marker is set", () => {
    withEnv(undefined, () => {
      assert.equal(loadAffiliateConfig().enabled, false);
    });
  });

  it("is disabled for a blank marker", () => {
    withEnv("   ", () => {
      assert.equal(loadAffiliateConfig().enabled, false);
    });
  });

  it("rejects a marker that is not a plain identifier", () => {
    for (const bad of ["https://evil.example", "abc def", "a\nb", "x".repeat(65)]) {
      withEnv(bad, () => {
        assert.equal(loadAffiliateConfig().enabled, false, `should reject: ${bad}`);
      });
    }
  });

  it("accepts a plain marker and trims it", () => {
    withEnv("  12345  ", () => {
      const config = loadAffiliateConfig();
      assert.equal(config.enabled, true);
      assert.equal(config.travelpayoutsMarker, "12345");
    });
  });
});
