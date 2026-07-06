import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildSearchRequest,
  parseSearchRequestFromParams,
  partialSearchRequestToSearchData,
  searchRequestToParams,
  validateAndBuildSearchRequest,
} from "@/lib/search/request";
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
    assert.deepEqual(request.productTypes, ["hotels", "flights", "transport"]);
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
});

describe("validateSearchForm", () => {
  it("requires at least one product type", () => {
    const errors = validateSearchForm({ ...validForm, productTypes: [] });
    assert.equal(errors.productTypes, "Select at least one result type.");
  });
});
