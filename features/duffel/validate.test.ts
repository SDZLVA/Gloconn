import { test } from "node:test";
import assert from "node:assert/strict";
import { EMAIL, PHONE, ageOn, passengerProblems } from "@/features/duffel/validate";

const ok = { id: "pas_1", title: "mr", gender: "m", givenName: "Shehan", familyName: "De Silva", bornOn: "1995-04-02" };

test("passengerProblems", () => {
  assert.deepEqual(passengerProblems(ok, "adult", "2026-11-19"), []);
  assert.equal(passengerProblems({ ...ok, givenName: "J0hn" }, "adult", "2026-11-19").length, 1);
  assert.equal(passengerProblems({ ...ok, bornOn: "2015-01-01" }, "adult", "2026-11-19")[0], "This traveller must be 18 or older.");
  assert.deepEqual(passengerProblems({ ...ok, bornOn: "2016-05-01" }, "child", "2026-11-19"), []);
  assert.equal(passengerProblems({ ...ok, bornOn: "2026-01-01" }, "child", "2026-11-19")[0], "A child must be between 2 and 17.");
  assert.deepEqual(passengerProblems({ ...ok, title: "miss", gender: "f", bornOn: "2026-01-01" }, "infant", "2026-11-19"), []);
  assert.equal(passengerProblems({ ...ok, title: "x" }, "adult", "2026-11-19")[0], "Choose a title.");
  assert.equal(ageOn("2008-11-20", "2026-11-19"), 17);
  assert.equal(ageOn("2008-11-19", "2026-11-19"), 18);
});

test("contact formats", () => {
  assert.ok(EMAIL.test("glooconn@gmail.com"));
  assert.ok(!EMAIL.test("nope"));
  assert.ok(PHONE.test("+393401234567"));
  assert.ok(!PHONE.test("3401234567"));
});
