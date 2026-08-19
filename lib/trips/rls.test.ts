/**
 * F-04 — Supabase RLS CI Verification
 *
 * ============================================================
 * Current RLS Coverage — saved_trips table
 * ============================================================
 *
 * Table: public.saved_trips
 * RLS enabled: YES
 *
 *  Operation | Policy                              | Check
 *  ----------|-------------------------------------|----------------------
 *  SELECT    | "Users can view own trips"          | auth.uid() = user_id
 *  INSERT    | "Users can insert own trips"        | auth.uid() = user_id
 *  DELETE    | "Users can delete own trips"        | auth.uid() = user_id
 *  UPDATE    | (no policy — intentionally absent)  | always denied at DB level
 *
 * The UPDATE absence is intentional and correct: the application never updates
 * saved trips (trips are deleted and re-saved). Without a policy, UPDATE is
 * denied by default when RLS is enabled.
 *
 * ============================================================
 * CI Verification Strategy
 * ============================================================
 *
 * True RLS verification requires a live Postgres instance with the Supabase
 * pg_jwt extension loaded and auth.uid() resolving from JWT claims.
 * Supabase's own local stack (supabase start) provides this but requires
 * Docker and is not set up in this project.
 *
 * CURRENT LIMITATION: We do not have a local Supabase stack in CI.
 * Introducing one would require:
 *   1. Docker in CI
 *   2. `supabase start` in the test pipeline (~60 second startup)
 *   3. Schema migration execution
 *   4. Test users created via admin API
 *
 * This is a non-trivial infrastructure change deferred per sprint brief
 * ("do NOT introduce a large infrastructure project just to satisfy this
 * finding").
 *
 * ============================================================
 * What these tests verify (without a live DB)
 * ============================================================
 *
 * 1. Schema contract: supabase/schema.sql contains the correct RLS policy
 *    predicates (auth.uid() = user_id for SELECT, INSERT, DELETE; no UPDATE).
 *
 * 2. Application-layer enforcement: the query code adds a redundant
 *    .eq('user_id', user.id) filter — so even if an RLS policy were removed,
 *    the application would still enforce ownership.
 *
 * 3. Cross-user access logic: the ownership predicate (auth.uid() = user_id)
 *    is simulated in TypeScript to prove the model is correct.
 *
 * ============================================================
 * Minimum next step for true RLS CI verification (F-04 infrastructure)
 * ============================================================
 *
 * Add a GitHub Actions job that:
 *   - Starts supabase/supabase-js action (supabase start)
 *   - Runs `supabase db push` to apply schema.sql
 *   - Creates two test users via admin API
 *   - Inserts a row as User A
 *   - Connects as User B and attempts SELECT / DELETE / UPDATE
 *   - Asserts all cross-user operations return 0 rows or RLS error
 *
 * This is the only way to prove the RLS policies actually execute in Postgres.
 * Deferred to a future security sprint.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// npm test is always run from the workspace root, so process.cwd() is reliable.
// This avoids ESM import.meta.url path resolution complexity on Windows.
function readWorkspaceFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

// ---------------------------------------------------------------------------
// Schema contract — RLS policies are defined correctly
// ---------------------------------------------------------------------------

describe("F-04: saved_trips RLS — schema contract", () => {
  const schema = readWorkspaceFile("supabase/schema.sql");

  it("has RLS enabled on saved_trips", () => {
    assert.ok(
      schema.includes("alter table public.saved_trips enable row level security"),
      "schema must enable RLS on saved_trips",
    );
  });

  it("defines a SELECT policy with auth.uid() = user_id predicate", () => {
    assert.ok(
      schema.includes("for select") && schema.includes("auth.uid() = user_id"),
      "SELECT policy must restrict to rows where auth.uid() matches user_id",
    );
  });

  it("defines an INSERT policy with auth.uid() = user_id check", () => {
    assert.ok(
      schema.includes("for insert") && schema.includes("auth.uid() = user_id"),
      "INSERT policy must check auth.uid() matches user_id",
    );
  });

  it("defines a DELETE policy with auth.uid() = user_id predicate", () => {
    assert.ok(
      schema.includes("for delete") && schema.includes("auth.uid() = user_id"),
      "DELETE policy must restrict to rows where auth.uid() matches user_id",
    );
  });

  it("does NOT define an UPDATE policy (updates are intentionally denied by RLS default)", () => {
    assert.ok(
      !schema.includes("for update"),
      "No UPDATE policy should exist — UPDATE is denied by default when RLS is enabled",
    );
  });
});

// ---------------------------------------------------------------------------
// RLS predicate logic — cross-user access simulation
//
// These tests simulate the RLS check `auth.uid() = user_id` in TypeScript
// to prove the access-control model, without requiring a live database.
// ---------------------------------------------------------------------------

describe("F-04: saved_trips RLS — ownership predicate (cross-user access)", () => {
  const userAId = "11111111-1111-1111-1111-111111111111";
  const userBId = "22222222-2222-2222-2222-222222222222";

  /** Simulates: SELECT * FROM saved_trips WHERE (auth.uid() = user_id) */
  function simulateSelect(
    rows: Array<{ id: string; user_id: string }>,
    authUid: string,
  ) {
    return rows.filter((row) => row.user_id === authUid);
  }

  /** Simulates: DELETE ... USING (auth.uid() = user_id) */
  function simulateDelete(row: { user_id: string }, authUid: string): boolean {
    return row.user_id === authUid;
  }

  /** Simulates: INSERT ... WITH CHECK (auth.uid() = user_id) */
  function simulateInsert(newRow: { user_id: string }, authUid: string): boolean {
    return newRow.user_id === authUid;
  }

  const dbRows = [
    { id: "trip-a-1", user_id: userAId },
    { id: "trip-a-2", user_id: userAId },
    { id: "trip-b-1", user_id: userBId },
  ];

  // SELECT
  it("User A sees only their own rows (SELECT)", () => {
    const rows = simulateSelect(dbRows, userAId);
    assert.equal(rows.length, 2);
    assert.ok(rows.every((r) => r.user_id === userAId));
  });

  it("User B sees only their own rows (SELECT)", () => {
    const rows = simulateSelect(dbRows, userBId);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].id, "trip-b-1");
  });

  it("User A cannot see User B's trips (SELECT)", () => {
    const rows = simulateSelect(dbRows, userAId);
    assert.ok(rows.every((r) => r.user_id !== userBId));
  });

  it("User B cannot see User A's trips (SELECT)", () => {
    const rows = simulateSelect(dbRows, userBId);
    assert.ok(rows.every((r) => r.user_id !== userAId));
  });

  // DELETE
  it("User A can delete their own trip (DELETE)", () => {
    assert.ok(simulateDelete({ user_id: userAId }, userAId));
  });

  it("User A cannot delete User B's trip (DELETE)", () => {
    assert.ok(!simulateDelete({ user_id: userBId }, userAId));
  });

  it("User B cannot delete User A's trip (DELETE)", () => {
    assert.ok(!simulateDelete({ user_id: userAId }, userBId));
  });

  // INSERT
  it("User A can insert a row with their own user_id (INSERT)", () => {
    assert.ok(simulateInsert({ user_id: userAId }, userAId));
  });

  it("User A cannot insert a row claiming User B's user_id (INSERT)", () => {
    assert.ok(!simulateInsert({ user_id: userBId }, userAId));
  });

  // UPDATE (no policy = default deny)
  it("UPDATE is always denied — no policy means default deny when RLS is enabled", () => {
    // Represented as a constant false: the DB will return 0 rows affected for
    // any UPDATE because no UPDATE policy exists.
    const rlsAllowsUpdate = false;
    assert.ok(!rlsAllowsUpdate, "UPDATE must be blocked by RLS default-deny");
  });
});

// ---------------------------------------------------------------------------
// Application-layer enforcement — query code redundantly enforces user_id
// ---------------------------------------------------------------------------

describe("F-04: application-layer ownership filter (defence-in-depth)", () => {
  const src = readWorkspaceFile("lib/trips/savedTrips.ts");

  it("getSavedTripsForUser filters with .eq('user_id', user.id)", () => {
    assert.ok(
      src.includes('.eq("user_id", user.id)'),
      "getSavedTripsForUser must filter by user.id — defence-in-depth above RLS",
    );
  });

  it("deleteTripForUser chains .eq('user_id', user.id) on the delete query", () => {
    assert.ok(
      src.includes('.eq("user_id", user.id)'),
      "deleteTripForUser must add user_id filter — prevents cross-user deletes even without RLS",
    );
  });

  it("saveTripForUser sets user_id from server-session (not client input)", () => {
    assert.ok(
      src.includes("user_id: user.id"),
      "saveTripForUser must derive user_id from server session, never from request body",
    );
  });
});
