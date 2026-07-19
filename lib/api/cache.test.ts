import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clearCache,
  deleteCached,
  getCached,
  setCached,
} from "@/lib/api/cache";

describe("TTL cache", () => {
  beforeEach(() => {
    clearCache();
  });

  it("returns undefined on a cache miss", () => {
    assert.equal(getCached("missing-key"), undefined);
  });

  it("returns the stored value on a cache hit", () => {
    setCached("token", { access: "abc" }, 60_000);
    assert.deepEqual(getCached("token"), { access: "abc" });
  });

  it("overwrites an existing key", () => {
    setCached("token", "first", 60_000);
    setCached("token", "second", 60_000);
    assert.equal(getCached("token"), "second");
  });

  it("deletes a single key", () => {
    setCached("a", 1, 60_000);
    setCached("b", 2, 60_000);
    deleteCached("a");
    assert.equal(getCached("a"), undefined);
    assert.equal(getCached("b"), 2);
  });

  it("clears the entire cache", () => {
    setCached("a", 1, 60_000);
    setCached("b", 2, 60_000);
    clearCache();
    assert.equal(getCached("a"), undefined);
    assert.equal(getCached("b"), undefined);
  });

  it("expires entries after the TTL elapses", async () => {
    setCached("short", "value", 20);
    assert.equal(getCached("short"), "value");

    await new Promise((resolve) => setTimeout(resolve, 35));

    assert.equal(getCached("short"), undefined);
  });

  it("treats TTL = 0 as a delete (no stored value)", () => {
    setCached("token", "keep-me", 60_000);
    setCached("token", "ignored", 0);
    assert.equal(getCached("token"), undefined);
  });

  it("treats negative TTL as a delete", () => {
    setCached("token", "keep-me", 60_000);
    setCached("token", "ignored", -5);
    assert.equal(getCached("token"), undefined);
  });

  it("removes expired keys on read (cleanup)", async () => {
    setCached("ephemeral", "gone-soon", 15);
    await new Promise((resolve) => setTimeout(resolve, 30));

    // First read triggers cleanup and returns undefined.
    assert.equal(getCached("ephemeral"), undefined);

    // Key must not linger as a stale hit after cleanup.
    assert.equal(getCached("ephemeral"), undefined);
  });
});
