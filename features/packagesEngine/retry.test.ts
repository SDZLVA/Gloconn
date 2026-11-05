import { test } from "node:test";
import assert from "node:assert/strict";
import { retryOnce } from "@/features/packagesEngine/retry";

test("retryOnce returns the second try when the first fails", async () => {
  let calls = 0;
  const value = await retryOnce(async () => {
    calls += 1;
    if (calls === 1) throw new Error("cold start");
    return "ok";
  }, 1);
  assert.equal(value, "ok");
  assert.equal(calls, 2);
});

test("retryOnce gives up after two failures", async () => {
  let calls = 0;
  await assert.rejects(retryOnce(async () => { calls += 1; throw new Error("down"); }, 1));
  assert.equal(calls, 2);
});
