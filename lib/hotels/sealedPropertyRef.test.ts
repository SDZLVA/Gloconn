/**
 * Sprint 17.5.1 — sealed property reference crypto + service integration.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  createCipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";
import { isApiError } from "@/lib/api/errors";
import { clearHotelPropertyDetailsCache } from "@/lib/hotels/propertyDetailsCache";
import { clearHotelPropertyTokenRegistry } from "@/lib/hotels/propertyTokenRegistry";
import {
  SEALED_PROPERTY_REF_PREFIX,
  SealedPropertyRefError,
  sealHotelPropertyRef,
  unsealHotelPropertyRef,
} from "@/lib/hotels/sealedPropertyRef";
import { getHotelPropertyDetails } from "@/lib/services/hotelPropertyDetailsService";
import type { HotelPropertyDetails } from "@/types/models/hotel-property-details";

const SECRET_A = "test-property-ref-seal-secret-aaaaaaaa";
const SECRET_B = "test-property-ref-seal-secret-bbbbbbbb";
const RAW_TOKEN = "ChkIv_live_token_for_seal_tests_only";

function sealFixture(overrides: Partial<Parameters<typeof sealHotelPropertyRef>[0]> = {}) {
  return sealHotelPropertyRef(
    {
      hotelId: "serpapi-hotel-live1",
      propertyToken: RAW_TOKEN,
      query: "Paris, France",
      checkInDate: "2026-10-12",
      checkOutDate: "2026-10-15",
      currency: "EUR",
      adults: 2,
      ...overrides,
    },
    SECRET_A,
  );
}

describe("sealedPropertyRef", () => {
  it("seals and unseals a valid reference", () => {
    const sealed = sealFixture();
    assert.match(sealed, new RegExp(`^${SEALED_PROPERTY_REF_PREFIX}`));
    assert.doesNotMatch(sealed, new RegExp(RAW_TOKEN));

    const open = unsealHotelPropertyRef(sealed, SECRET_A);
    assert.equal(open.hotelId, "serpapi-hotel-live1");
    assert.equal(open.lookup.propertyToken, RAW_TOKEN);
    assert.equal(open.lookup.query, "Paris, France");
    assert.equal(open.lookup.currency, "EUR");
    assert.equal(open.lookup.adults, 2);
  });

  it("rejects expired references", () => {
    const sealed = sealFixture({
      nowMs: 1_000,
      ttlMs: 10,
    });
    assert.throws(
      () => unsealHotelPropertyRef(sealed, SECRET_A, { nowMs: 2_000 }),
      (error: unknown) => {
        assert.ok(error instanceof SealedPropertyRefError);
        assert.equal(error.code, "EXPIRED");
        return true;
      },
    );
  });

  it("rejects tampered references", () => {
    const sealed = sealFixture();
    const tampered = `${sealed.slice(0, -4)}AAAA`;
    assert.throws(
      () => unsealHotelPropertyRef(tampered, SECRET_A),
      (error: unknown) => {
        assert.ok(error instanceof SealedPropertyRefError);
        assert.equal(error.code, "TAMPERED");
        return true;
      },
    );
  });

  it("rejects wrong seal secret", () => {
    const sealed = sealFixture();
    assert.throws(
      () => unsealHotelPropertyRef(sealed, SECRET_B),
      (error: unknown) => {
        assert.ok(error instanceof SealedPropertyRefError);
        assert.equal(error.code, "TAMPERED");
        return true;
      },
    );
  });

  it("rejects malformed references", () => {
    assert.throws(
      () => unsealHotelPropertyRef("gpref-not-sealed", SECRET_A),
      (error: unknown) => {
        assert.ok(error instanceof SealedPropertyRefError);
        assert.equal(error.code, "MALFORMED");
        return true;
      },
    );
    assert.throws(
      () => unsealHotelPropertyRef(`${SEALED_PROPERTY_REF_PREFIX}%%%`, SECRET_A),
      (error: unknown) => {
        assert.ok(error instanceof SealedPropertyRefError);
        return true;
      },
    );
  });

  it("rejects empty / short secrets", () => {
    assert.throws(
      () => sealHotelPropertyRef({
        hotelId: "h1",
        propertyToken: "t",
        query: "q",
      }, "short"),
      (error: unknown) => {
        assert.ok(error instanceof SealedPropertyRefError);
        assert.equal(error.code, "MISSING_SECRET");
        return true;
      },
    );
  });

  it("rejects wrong provider identifiers", () => {
    const key = scryptSync(SECRET_A, "glooconn-property-ref-v1", 32);
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const payload = JSON.stringify({
      v: 1,
      p: "booking",
      t: RAW_TOKEN,
      q: "Paris",
      exp: Date.now() + 60_000,
      hid: "serpapi-hotel-live1",
    });
    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(payload, "utf8")),
      cipher.final(),
    ]);
    const packed = Buffer.concat([iv, encrypted, cipher.getAuthTag()]);
    const sealed =
      SEALED_PROPERTY_REF_PREFIX +
      packed
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");

    assert.throws(
      () => unsealHotelPropertyRef(sealed, SECRET_A),
      (error: unknown) => {
        assert.ok(error instanceof SealedPropertyRefError);
        assert.equal(error.code, "WRONG_PROVIDER");
        return true;
      },
    );
  });

  it("rejects hotel id binding mismatches", () => {
    const sealed = sealFixture();
    assert.throws(
      () =>
        unsealHotelPropertyRef(sealed, SECRET_A, {
          expectedHotelId: "serpapi-hotel-other",
        }),
      (error: unknown) => {
        assert.ok(error instanceof SealedPropertyRefError);
        assert.equal(error.code, "TAMPERED");
        return true;
      },
    );
  });
});

describe("getHotelPropertyDetails — sealed ref", () => {
  beforeEach(() => {
    clearHotelPropertyTokenRegistry();
    clearHotelPropertyDetailsCache();
  });

  it("resolves details from a sealed ref without process registry memory", async () => {
    const sealed = sealFixture();
    clearHotelPropertyTokenRegistry();

    let fetchCount = 0;
    const cache = new Map<string, HotelPropertyDetails>();

    const first = await getHotelPropertyDetails(
      { ref: sealed, hotelId: "serpapi-hotel-live1" },
      {},
      {
        getSealSecret: () => SECRET_A,
        getSerpApiConfig: () => ({ apiKey: "test-key" }),
        fetchDetails: async (token, _config, options) => {
          fetchCount += 1;
          assert.equal(token, RAW_TOKEN);
          assert.equal(options.query, "Paris, France");
          return {
            name: "Paris Test Hotel",
            address: "10 Rue de Rivoli, Paris",
            directions: "https://www.google.com/maps?q=48.8,2.3",
            link: "https://www.paris-hotel.example/",
            featured_prices: [
              {
                source: "Expedia",
                link: "https://www.google.com/aclk?sa=l&ai=x",
              },
            ],
            property_token: RAW_TOKEN,
          };
        },
        getCached: (id) => cache.get(id),
        setCached: (id, details) => {
          cache.set(id, details);
        },
      },
    );

    assert.equal(first.cached, false);
    assert.equal(fetchCount, 1);
    assert.equal(first.details.address, "10 Rue de Rivoli, Paris");
    assert.equal(JSON.stringify(first.details).includes(RAW_TOKEN), false);

    // Simulate Process B: empty registry + empty details cache, same sealed ref.
    clearHotelPropertyTokenRegistry();
    cache.clear();

    const crossProcess = await getHotelPropertyDetails(
      { ref: sealed, hotelId: "serpapi-hotel-live1" },
      {},
      {
        getSealSecret: () => SECRET_A,
        getSerpApiConfig: () => ({ apiKey: "test-key" }),
        fetchDetails: async () => {
          fetchCount += 1;
          return {
            name: "Paris Test Hotel",
            address: "10 Rue de Rivoli, Paris",
            directions: "https://www.google.com/maps?q=48.8,2.3",
          };
        },
        getCached: () => undefined,
        setCached: () => {},
      },
    );

    assert.equal(crossProcess.cached, false);
    assert.equal(fetchCount, 2);
    assert.equal(crossProcess.details.address, "10 Rue de Rivoli, Paris");
  });

  it("fails safely for hotelId-only requests (no production registry)", async () => {
    await assert.rejects(
      () => getHotelPropertyDetails({ hotelId: "serpapi-hotel-unknown" }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "NOT_FOUND");
        assert.doesNotMatch(error.message, /Chk|token|serpapi\.com/i);
        return true;
      },
    );
  });

  it("fails safely for expired sealed refs without calling the provider", async () => {
    const sealed = sealFixture({ nowMs: 1_000, ttlMs: 5 });
    let fetchCount = 0;

    await assert.rejects(
      () =>
        getHotelPropertyDetails(
          { ref: sealed },
          {},
          {
            getSealSecret: () => SECRET_A,
            unsealRef: (ref, secret) =>
              unsealHotelPropertyRef(ref, secret, { nowMs: 50_000 }),
            fetchDetails: async () => {
              fetchCount += 1;
              return {};
            },
          },
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "NOT_FOUND");
        assert.match(error.message, /expired/i);
        return true;
      },
    );
    assert.equal(fetchCount, 0);
  });

  it("fails safely for tampered sealed refs without calling the provider", async () => {
    const sealed = `${sealFixture().slice(0, -6)}ZZZZZZ`;
    let fetchCount = 0;

    await assert.rejects(
      () =>
        getHotelPropertyDetails(
          { ref: sealed },
          {},
          {
            getSealSecret: () => SECRET_A,
            fetchDetails: async () => {
              fetchCount += 1;
              return {};
            },
          },
        ),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "NOT_FOUND");
        return true;
      },
    );
    assert.equal(fetchCount, 0);
  });

  it("rejects raw-looking provider tokens as hotel ids", async () => {
    await assert.rejects(
      () =>
        getHotelPropertyDetails({
          hotelId: "ChkIv_HyiNKHpf6yARoML2cvMXozdGJnZ3BzEAE",
          ref: sealFixture(),
        }),
      (error: unknown) => {
        assert.ok(isApiError(error));
        assert.equal(error.code, "VALIDATION_ERROR");
        return true;
      },
    );
  });
});
