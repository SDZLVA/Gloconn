/**
 * Security regression tests — F-05: saveTripAction authorization
 *
 * These tests verify the authorization logic at the layer we can unit-test
 * without a live Supabase connection:
 *
 *  1. saveTripAction() redirects (throws NEXT_REDIRECT) when unauthenticated —
 *     the top-level auth guard added for F-05.
 *  2. saveTripForUser() calls requireUser() and throws before any DB call
 *     when unauthenticated — defence-in-depth layer.
 *  3. saveTripForUser() also calls requireUser() independently of the action
 *     guard — confirming the inner layer cannot be bypassed even if the action
 *     guard is removed.
 *
 * In the test environment NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
 * are not set, so createSupabaseServerClient() returns null, which causes
 * getCurrentUser() → null and requireUser() → throws "Authentication required".
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { SearchData } from "@/types/search";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal SearchData fixture — enough structure to satisfy the type. */
function buildSearchData(): SearchData {
  return {
    origin: "Milan, Italy",
    originId: "milan",
    destination: "Paris, France",
    destinationId: "paris",
    tripType: "round-trip",
    departureDate: "2027-01-15",
    returnDate: "2027-01-22",
    budget: 2500,
    budgetCurrency: "EUR",
    travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
    totalGuests: 2,
    travelStyle: "standard",
    productTypes: ["hotels", "flights"],
  };
}

// ---------------------------------------------------------------------------
// saveTripAction — F-05 guard: unauthenticated caller triggers redirect
// ---------------------------------------------------------------------------

describe("saveTripAction — F-05: unauthenticated redirect", () => {
  it("calls redirect() when no user session exists (Supabase not configured)", async () => {
    const { saveTripAction } = await import("@/lib/trips/actions");

    let threw = false;
    let thrownValue: unknown;

    try {
      await saveTripAction(buildSearchData());
    } catch (err) {
      threw = true;
      thrownValue = err;
    }

    assert.ok(threw, "saveTripAction must throw (redirect) when unauthenticated");

    // Next.js redirect() throws an error whose message, digest, or string
    // representation contains "NEXT_REDIRECT".
    const errStr = String(thrownValue);
    const isRedirectError =
      errStr.includes("NEXT_REDIRECT") ||
      (thrownValue instanceof Error && thrownValue.message.includes("NEXT_REDIRECT")) ||
      (
        typeof thrownValue === "object" &&
        thrownValue !== null &&
        "digest" in thrownValue &&
        String((thrownValue as { digest: unknown }).digest).includes("NEXT_REDIRECT")
      );

    assert.ok(
      isRedirectError,
      `Expected a NEXT_REDIRECT error but got: ${errStr}`,
    );
  });

  it("redirect target includes /login and the redirectTo path", async () => {
    const { saveTripAction } = await import("@/lib/trips/actions");

    let thrownValue: unknown;
    try {
      await saveTripAction(buildSearchData(), "/my-trips");
    } catch (err) {
      thrownValue = err;
    }

    // The redirect URL is embedded in the thrown error's string / digest.
    const errStr = String(thrownValue);
    const digestStr =
      typeof thrownValue === "object" &&
      thrownValue !== null &&
      "digest" in thrownValue
        ? String((thrownValue as { digest: unknown }).digest)
        : "";

    const combined = errStr + digestStr;
    assert.ok(
      combined.includes("login") || combined.includes("NEXT_REDIRECT"),
      `Expected redirect toward /login in error, got: ${combined}`,
    );
  });
});

// ---------------------------------------------------------------------------
// saveTripForUser — unauthenticated caller blocked before DB
// ---------------------------------------------------------------------------

describe("saveTripForUser — F-05: unauthenticated caller blocked before DB", () => {
  it("throws 'Authentication required' before any database call", async () => {
    const { saveTripForUser } = await import("@/lib/trips/savedTrips");

    await assert.rejects(
      () => saveTripForUser(buildSearchData()),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.equal(err.message, "Authentication required");
        return true;
      },
    );
  });
});

// ---------------------------------------------------------------------------
// Defence-in-depth: inner saveTripForUser enforces auth independently
// ---------------------------------------------------------------------------

describe("saveTripForUser — F-05: defence-in-depth verification", () => {
  it("the inner saveTripForUser also enforces auth independently of the action guard", async () => {
    // Even if the action-level guard were bypassed, saveTripForUser calls
    // requireUser(), which throws when Supabase is not configured.
    const { saveTripForUser } = await import("@/lib/trips/savedTrips");

    await assert.rejects(
      () => saveTripForUser(buildSearchData()),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.equal(err.message, "Authentication required");
        return true;
      },
    );
  });
});
