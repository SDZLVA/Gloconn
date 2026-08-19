/**
 * F-04 — Real Supabase RLS Integration Tests
 *
 * These tests run against a local Supabase stack (started by `supabase start`
 * in CI). They verify that the database-level RLS policies actually enforce
 * ownership — User A cannot read, modify, or delete User B's data.
 *
 * This file is executed by the GitHub Actions rls-ci.yml workflow.
 * It is NOT part of the `npm test` suite (which mocks Supabase).
 *
 * Usage (in CI after `supabase start`):
 *   node supabase/rls-integration.test.mjs
 *
 * Environment variables required:
 *   SUPABASE_URL        — e.g. http://127.0.0.1:54321
 *   SUPABASE_ANON_KEY   — local anon key (printed by `supabase status`)
 *   SUPABASE_SERVICE_KEY — local service-role key (printed by `supabase status`)
 */

import assert from "node:assert/strict";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!ANON_KEY || !SERVICE_KEY) {
  console.error("Error: SUPABASE_ANON_KEY and SUPABASE_SERVICE_KEY must be set.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Minimal Supabase REST / Auth helpers
// ---------------------------------------------------------------------------

/** Creates a new test user and returns { id, email, access_token }. */
async function createTestUser(email, password) {
  // Create user via admin API (service role).
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true, // skip email confirmation in CI
    }),
  });

  if (!createRes.ok) {
    const body = await createRes.text();
    throw new Error(`Failed to create user ${email}: ${createRes.status} ${body}`);
  }

  const { id } = await createRes.json();

  // Sign in to get an access token.
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!signInRes.ok) {
    const body = await signInRes.text();
    throw new Error(`Failed to sign in as ${email}: ${signInRes.status} ${body}`);
  }

  const { access_token } = await signInRes.json();
  return { id, email, access_token };
}

/** Makes a request to the PostgREST API as the given user (JWT token). */
async function restRequest(method, path, body, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${token}`,
      "Prefer": method === "POST" ? "return=representation" : "return=minimal",
    },
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* empty response */ }
  return { status: res.status, body: json, text };
}

/**
 * Makes a service-role request to PostgREST (bypasses RLS).
 * Both apikey and Authorization must carry the service-role key so PostgREST
 * selects the service_role role and skips RLS.
 */
async function serviceRequest(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Prefer": method === "POST" ? "return=representation" : "return=minimal",
    },
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* empty response */ }
  return { status: res.status, body: json, text };
}

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✔ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✖ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Setup: create two test users
// ---------------------------------------------------------------------------

console.log("\n▶ F-04: Supabase RLS Integration Tests\n");
console.log("Setting up test users...");

let userA, userB;
try {
  userA = await createTestUser("user-a@glooconn-test.example", "TestPassword-A-123!");
  userB = await createTestUser("user-b@glooconn-test.example", "TestPassword-B-456!");
  console.log(`  User A: ${userA.id}`);
  console.log(`  User B: ${userB.id}`);
} catch (err) {
  console.error("Fatal: could not create test users:", err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// INSERT — User A creates their own trip
// ---------------------------------------------------------------------------

console.log("\n▶ INSERT\n");

let userATripId;

await test("User A can INSERT a trip with their own user_id", async () => {
  const res = await restRequest(
    "POST",
    "/saved_trips",
    {
      user_id: userA.id,
      title: "User A's Trip",
      search_data: { origin: "Milan", destination: "Paris" },
    },
    userA.access_token,
  );
  assert.equal(res.status, 201, `Expected 201, got ${res.status}: ${res.text}`);
  assert.ok(Array.isArray(res.body) && res.body.length > 0, "INSERT should return the row");
  userATripId = res.body[0].id;
});

await test("User A cannot INSERT a trip claiming User B's user_id (RLS WITH CHECK)", async () => {
  const res = await restRequest(
    "POST",
    "/saved_trips",
    {
      user_id: userB.id, // attempting to claim B's ownership
      title: "Forged Trip",
      search_data: { origin: "Milan", destination: "Paris" },
    },
    userA.access_token,
  );
  // PostgREST returns 403 or 0 rows when RLS WITH CHECK rejects the insert.
  assert.ok(
    res.status === 403 || res.status === 0 ||
    (Array.isArray(res.body) && res.body.length === 0),
    `Expected RLS rejection (403 or 0 rows), got ${res.status}: ${res.text}`,
  );
});

// Add a trip for User B too.
let userBTripId;
await test("User B can INSERT a trip with their own user_id", async () => {
  const res = await restRequest(
    "POST",
    "/saved_trips",
    {
      user_id: userB.id,
      title: "User B's Trip",
      search_data: { origin: "Rome", destination: "Berlin" },
    },
    userB.access_token,
  );
  assert.equal(res.status, 201, `Expected 201, got ${res.status}: ${res.text}`);
  userBTripId = res.body[0].id;
});

// ---------------------------------------------------------------------------
// SELECT
// ---------------------------------------------------------------------------

console.log("\n▶ SELECT\n");

await test("User A can SELECT their own trips", async () => {
  const res = await restRequest("GET", `/saved_trips?user_id=eq.${userA.id}`, null, userA.access_token);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body) && res.body.length >= 1, "User A should see their own trips");
  assert.ok(res.body.every(row => row.user_id === userA.id), "All returned rows must belong to User A");
});

await test("User A CANNOT SELECT User B's trips (direct ID query)", async () => {
  assert.ok(userBTripId, "Skipped: User B's INSERT did not produce a trip ID");
  const res = await restRequest("GET", `/saved_trips?id=eq.${userBTripId}`, null, userA.access_token);
  assert.equal(res.status, 200, "RLS returns 200 with empty array (not 403)");
  assert.ok(Array.isArray(res.body) && res.body.length === 0, "User A must get 0 rows for User B's trip");
});

await test("User B CANNOT SELECT User A's trips (direct ID query)", async () => {
  assert.ok(userATripId, "Skipped: User A's INSERT did not produce a trip ID");
  const res = await restRequest("GET", `/saved_trips?id=eq.${userATripId}`, null, userB.access_token);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body) && res.body.length === 0, "User B must get 0 rows for User A's trip");
});

await test("SELECT * returns only owned rows for each user (no cross-user leakage)", async () => {
  const resA = await restRequest("GET", "/saved_trips", null, userA.access_token);
  const resB = await restRequest("GET", "/saved_trips", null, userB.access_token);
  assert.ok(resA.body.every(row => row.user_id === userA.id), "User A sees only their rows");
  assert.ok(resB.body.every(row => row.user_id === userB.id), "User B sees only their rows");
});

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

console.log("\n▶ DELETE\n");

await test("User B CANNOT DELETE User A's trip", async () => {
  assert.ok(userATripId, "Skipped: User A's INSERT did not produce a trip ID");
  await restRequest("DELETE", `/saved_trips?id=eq.${userATripId}`, null, userB.access_token);
  // RLS silently filters: PostgREST returns 204 with 0 rows affected rather
  // than 403. Confirm the row still exists using the service role (bypasses RLS).
  const verify = await serviceRequest("GET", `/saved_trips?id=eq.${userATripId}`);
  assert.ok(
    Array.isArray(verify.body) && verify.body.length === 1,
    "User A's trip must still exist after User B's DELETE attempt",
  );
});

await test("User A CAN DELETE their own trip", async () => {
  assert.ok(userATripId, "Skipped: User A's INSERT did not produce a trip ID");
  const res = await restRequest("DELETE", `/saved_trips?id=eq.${userATripId}`, null, userA.access_token);
  assert.equal(res.status, 204, `Expected 204, got ${res.status}`);
  // Verify the row is gone using the service role (bypasses RLS).
  const verify = await serviceRequest("GET", `/saved_trips?id=eq.${userATripId}`);
  assert.ok(
    Array.isArray(verify.body) && verify.body.length === 0,
    "User A's trip must be deleted",
  );
});

// ---------------------------------------------------------------------------
// UPDATE — no policy, always denied
// ---------------------------------------------------------------------------

console.log("\n▶ UPDATE (no policy — must be denied)\n");

await test("UPDATE is denied for User B's own trip (no UPDATE policy)", async () => {
  assert.ok(userBTripId, "Skipped: User B's INSERT did not produce a trip ID");
  await restRequest(
    "PATCH",
    `/saved_trips?id=eq.${userBTripId}`,
    { title: "Modified" },
    userB.access_token,
  );
  // Without an UPDATE policy, RLS silently rejects (204, 0 rows affected).
  // Verify the title is unchanged using the service role (bypasses RLS).
  const verify = await serviceRequest("GET", `/saved_trips?id=eq.${userBTripId}`);
  const unchanged = verify.body?.[0]?.title === "User B's Trip";
  assert.ok(unchanged, `UPDATE must be denied — title must remain "User B's Trip", got: ${verify.body?.[0]?.title}`);
});

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

console.log(`\n${passed + failed} tests: ${passed} pass, ${failed} fail\n`);

if (failed > 0) {
  process.exit(1);
}
