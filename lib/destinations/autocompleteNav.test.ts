import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildAutocompleteListItems } from "@/components/ui/AutocompleteDropdown";
import type { AutocompleteSection } from "@/components/ui/autocomplete-types";

/**
 * Keyboard navigation uses a flat option index across section headings.
 * These tests lock the indexing contract used by ArrowUp/Down/Home/End.
 */
describe("buildAutocompleteListItems — keyboard navigation indices", () => {
  it("assigns contiguous option indices across sections", () => {
    const sections: AutocompleteSection[] = [
      {
        id: "recent",
        heading: "Recent searches",
        options: [
          { id: "paris", label: "Paris, France" },
          { id: "rome", label: "Rome, Italy" },
        ],
      },
      {
        id: "airports",
        heading: "Airports",
        options: [{ id: "london", label: "London, United Kingdom" }],
      },
    ];

    const items = buildAutocompleteListItems(sections);
    const options = items.filter((item) => item.type === "option");

    assert.equal(options.length, 3);
    assert.deepEqual(
      options.map((item) =>
        item.type === "option" ? item.index : -1,
      ),
      [0, 1, 2],
    );
    assert.equal(options[0]?.type === "option" && options[0].option.id, "paris");
    assert.equal(options[2]?.type === "option" && options[2].option.id, "london");
  });

  it("skips headings without breaking option indices", () => {
    const sections: AutocompleteSection[] = [
      {
        id: "cities",
        heading: "Cities",
        options: [{ id: "tokyo", label: "Tokyo, Japan" }],
      },
    ];

    const items = buildAutocompleteListItems(sections);
    assert.equal(items[0]?.type, "heading");
    assert.equal(items[1]?.type, "option");
    if (items[1]?.type === "option") {
      assert.equal(items[1].index, 0);
    }
  });
});
