/**
 * Sprint 17.7 — traveler default adults = 1.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  INITIAL_PASSENGERS,
  INITIAL_SEARCH_FORM,
  type SearchFormState,
} from "@/types/search-form";
import {
  parseSearchRequestFromParams,
  searchRequestToParams,
  validateAndBuildSearchRequest,
} from "@/lib/search";
import { parseSearchParamsToForm } from "@/lib/search/params";

describe("Sprint 17.7 — traveler default", () => {
  it("initial default adults is 1", () => {
    assert.equal(INITIAL_PASSENGERS.adults, 1);
    assert.equal(INITIAL_SEARCH_FORM.travelers.adults, 1);
  });

  it("URL parse defaults adults to 1 when param missing", () => {
    const parsed = parseSearchRequestFromParams(
      new URLSearchParams("destination=Paris&origin=Milan"),
    );
    assert.equal(parsed.travelers?.adults, 1);
  });

  it("user can set adults to 2+", () => {
    const form: SearchFormState = {
      ...INITIAL_SEARCH_FORM,
      origin: "Milan, Italy",
      originId: "milan",
      destination: "Paris, France",
      destinationId: "paris",
      departureDate: "2026-10-12",
      returnDate: "2026-10-15",
      travelers: { adults: 3, children: 0, infants: 0, rooms: 1 },
    };
    const built = validateAndBuildSearchRequest(form);
    assert.equal(built.ok, true);
    if (!built.ok) return;
    assert.equal(built.request.travelers.adults, 3);
    assert.equal(built.request.totalGuests, 3);
  });

  it("editing a search preserves selected traveler count", () => {
    const form: SearchFormState = {
      ...INITIAL_SEARCH_FORM,
      origin: "Milan, Italy",
      originId: "milan",
      destination: "Tokyo, Japan",
      destinationId: "tokyo",
      departureDate: "2026-10-12",
      returnDate: "2026-10-15",
      travelers: { adults: 2, children: 1, infants: 0, rooms: 1 },
    };
    const built = validateAndBuildSearchRequest(form);
    assert.equal(built.ok, true);
    if (!built.ok) return;

    const params = searchRequestToParams(built.request);
    assert.equal(params.get("adults"), "2");
    assert.equal(params.get("children"), "1");

    const editForm = parseSearchParamsToForm(params);
    assert.equal(editForm.travelers.adults, 2);
    assert.equal(editForm.travelers.children, 1);
  });
});
