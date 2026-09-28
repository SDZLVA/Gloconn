import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildSearchRequest,
  parseSearchRequestFromParams,
  partialSearchRequestToSearchData,
  searchRequestToParams,
  validateAndBuildSearchRequest,
} from "@/lib/search/request";
import { parseSearchParamsToForm } from "@/lib/search/params";
import { validateSearchForm } from "@/lib/search/validation";
import { validateSearchRequest } from "@/lib/api/validation";
import type { SearchProductType } from "@/types/models/search-request";
import { INITIAL_SEARCH_FORM } from "@/types/search-form";

function futureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

const validForm = {
  ...INITIAL_SEARCH_FORM,
  origin: "Milan, Italy",
  originId: "milan",
  destination: "Paris, France",
  destinationId: "paris",
  departureDate: futureDate(14),
  returnDate: futureDate(21),
  budget: "2500",
  budgetCurrency: "EUR" as const,
  travelers: { adults: 2, children: 0, infants: 0, rooms: 1 },
  travelStyle: "standard" as const,
  productTypes: ["hotels", "flights", "transport"] as SearchProductType[],
};

describe("buildSearchRequest", () => {
  it("collects all form fields into SearchRequest", () => {
    const request = buildSearchRequest(validForm);

    assert.equal(request.origin, "Milan, Italy");
    assert.equal(request.destination, "Paris, France");
    assert.equal(request.budget?.amount, 2500);
    assert.equal(request.budget?.currency, "EUR");
    assert.equal(request.totalGuests, 2);
    assert.equal(request.flexDays, 0);
    assert.deepEqual(request.productTypes, ["hotels", "flights", "transport"]);
  });

  it("sets budget to null when budget input is empty", () => {
    const request = buildSearchRequest({ ...validForm, budget: "" });
    assert.equal(request.budget, null);
  });

  it("includes flexDays from the form", () => {
    const request = buildSearchRequest({ ...validForm, flexDays: 2 });
    assert.equal(request.flexDays, 2);
  });
});

describe("validateAndBuildSearchRequest", () => {
  it("returns request when form is valid", () => {
    const result = validateAndBuildSearchRequest(validForm);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.request.destination, "Paris, France");
    }
  });

  it("returns errors when origin is missing", () => {
    const result = validateAndBuildSearchRequest({ ...validForm, origin: "" });
    assert.equal(result.ok, false);
  });

  it("accepts an empty optional budget", () => {
    const result = validateAndBuildSearchRequest({ ...validForm, budget: "" });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.request.budget, null);
    }
  });
});

describe("searchRequest URL round-trip", () => {
  it("serializes and parses back to equivalent SearchData fields", () => {
    const built = validateAndBuildSearchRequest(validForm);
    assert.equal(built.ok, true);
    if (!built.ok) {
      return;
    }

    const params = searchRequestToParams(built.request);
    const parsed = parseSearchRequestFromParams(params);
    const data = partialSearchRequestToSearchData(parsed);

    assert.equal(data.origin, "Milan, Italy");
    assert.equal(data.destination, "Paris, France");
    assert.equal(data.budget, 2500);
    assert.equal(data.budgetCurrency, "EUR");
    assert.equal(data.travelers?.adults, 2);
  });

  it("omits flex from the URL when flexDays is 0", () => {
    const request = buildSearchRequest({ ...validForm, flexDays: 0 });
    const params = searchRequestToParams(request);
    assert.equal(params.has("flex"), false);
  });

  it("round-trips flex=1..3 through URL and edit-search form", () => {
    for (const flexDays of [1, 2, 3] as const) {
      const request = buildSearchRequest({ ...validForm, flexDays });
      const params = searchRequestToParams(request);
      assert.equal(params.get("flex"), String(flexDays));

      const parsed = parseSearchRequestFromParams(params);
      assert.equal(parsed.flexDays, flexDays);

      const form = parseSearchParamsToForm(params);
      assert.equal(form.flexDays, flexDays);
    }
  });

  it("treats missing or invalid flex URL values as Exact (0)", () => {
    const base = searchRequestToParams(buildSearchRequest(validForm));

    const missing = parseSearchRequestFromParams(new URLSearchParams(base));
    assert.equal(missing.flexDays, 0);

    const bad = new URLSearchParams(base);
    bad.set("flex", "99");
    assert.equal(parseSearchRequestFromParams(bad).flexDays, 0);
    assert.equal(parseSearchParamsToForm(bad).flexDays, 0);

    const junk = new URLSearchParams(base);
    junk.set("flex", "nope");
    assert.equal(parseSearchRequestFromParams(junk).flexDays, 0);
  });
});

describe("validateSearchRequest", () => {
  it("accepts SearchRequest-shaped input", () => {
    const built = validateAndBuildSearchRequest(validForm);
    assert.equal(built.ok, true);
    if (!built.ok) {
      return;
    }

    const result = validateSearchRequest(built.request);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.destination, "Paris, France");
    }
  });

  it("rejects missing product types", () => {
    const built = validateAndBuildSearchRequest(validForm);
    assert.equal(built.ok, true);
    if (!built.ok) {
      return;
    }

    const result = validateSearchRequest({
      ...built.request,
      productTypes: [],
    });
    assert.equal(result.success, false);
  });

  it("accepts flexDays 0–3 and coerces invalid values to 0", () => {
    const built = validateAndBuildSearchRequest({
      ...validForm,
      flexDays: 3,
    });
    assert.equal(built.ok, true);
    if (!built.ok) {
      return;
    }

    const ok = validateSearchRequest(built.request);
    assert.equal(ok.success, true);
    if (ok.success) {
      assert.equal(ok.data.flexDays, 3);
    }

    const coerced = validateSearchRequest({
      ...built.request,
      flexDays: 9 as never,
    });
    assert.equal(coerced.success, true);
    if (coerced.success) {
      assert.equal(coerced.data.flexDays, 0);
    }
  });
});

describe("validateSearchForm", () => {
  it("requires at least one product type", () => {
    const errors = validateSearchForm({ ...validForm, productTypes: [] });
    assert.equal(errors.productTypes, "Select at least one result type.");
  });
});
