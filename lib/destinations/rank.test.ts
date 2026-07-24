import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { highlightMatchSegments } from "@/lib/destinations/highlight";
import { isAirportMatchKind } from "@/lib/destinations/match";
import {
  hasWholeWordMatch,
  normalizeDestinationQuery,
} from "@/lib/destinations/normalize";
import {
  dedupeRankedDestinations,
  filterDestinationsRanked,
  rankDestinations,
  shouldGroupAirportMatches,
  splitRankedByMatchGroup,
  type RankedDestination,
} from "@/lib/destinations/rank";
import type { Destination } from "@/types/destination";

const CATALOG: Destination[] = [
  {
    id: "paris",
    name: "Paris",
    country: "France",
    region: "Europe",
    popular: true,
    iataCode: "CDG",
  },
  {
    id: "prague",
    name: "Prague",
    country: "Czech Republic",
    region: "Europe",
    iataCode: "PRG",
  },
  {
    id: "new-york",
    name: "New York",
    country: "United States",
    region: "North America",
    popular: true,
    iataCode: "JFK",
  },
  {
    id: "cancun",
    name: "Cancún",
    country: "Mexico",
    region: "North America",
    iataCode: "CUN",
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    region: "Europe",
    popular: true,
    iataCode: "LHR",
  },
];

describe("normalizeDestinationQuery", () => {
  it("trims, lowercases, and strips accents", () => {
    assert.equal(normalizeDestinationQuery("  Cancún  "), "cancun");
    assert.equal(normalizeDestinationQuery("PARÍS"), "paris");
  });
});

describe("hasWholeWordMatch", () => {
  it("matches whole words and word prefixes", () => {
    assert.equal(hasWholeWordMatch("new york", "york"), true);
    assert.equal(hasWholeWordMatch("new york", "new"), true);
    assert.equal(hasWholeWordMatch("united kingdom", "king"), true);
    assert.equal(hasWholeWordMatch("paris", "ari"), false);
  });
});

describe("rankDestinations", () => {
  it("returns empty for an empty query", () => {
    assert.deepEqual(rankDestinations("", { catalog: CATALOG }), []);
  });

  it("ranks exact name matches first", () => {
    const ranked = rankDestinations("paris", { catalog: CATALOG });
    assert.equal(ranked[0]?.destination.id, "paris");
    assert.equal(ranked[0]?.matchKind, "name-exact");
  });

  it("ranks exact IATA matches above name contains", () => {
    const ranked = rankDestinations("cdg", { catalog: CATALOG });
    assert.equal(ranked[0]?.destination.id, "paris");
    assert.equal(ranked[0]?.matchKind, "iata-exact");
  });

  it("supports IATA prefix matches", () => {
    const ranked = rankDestinations("cd", { catalog: CATALOG });
    assert.ok(ranked.some((entry) => entry.destination.id === "paris"));
    assert.equal(
      ranked.find((entry) => entry.destination.id === "paris")?.matchKind,
      "iata-prefix",
    );
  });

  it("supports prefix matches on city name", () => {
    const ranked = rankDestinations("lon", { catalog: CATALOG });
    assert.equal(ranked[0]?.destination.id, "london");
    assert.equal(ranked[0]?.matchKind, "name-prefix");
  });

  it("supports contains matches", () => {
    const ranked = rankDestinations("ague", { catalog: CATALOG });
    assert.ok(ranked.some((entry) => entry.destination.id === "prague"));
  });

  it("supports whole-word matches (York in New York)", () => {
    const ranked = rankDestinations("york", { catalog: CATALOG });
    assert.equal(ranked[0]?.destination.id, "new-york");
    assert.equal(ranked[0]?.matchKind, "word");
  });

  it("matches accent-insensitive names", () => {
    const ranked = rankDestinations("cancun", { catalog: CATALOG });
    assert.equal(ranked[0]?.destination.id, "cancun");
  });

  it("matches country names", () => {
    const ranked = rankDestinations("france", { catalog: CATALOG });
    assert.ok(ranked.some((entry) => entry.destination.id === "paris"));
  });

  it("boosts popular destinations on ties", () => {
    // "pr" → prague (prefix) and could relate to others; use a synthetic catalog
    const catalog: Destination[] = [
      {
        id: "porto",
        name: "Porto",
        country: "Portugal",
        region: "Europe",
        popular: false,
      },
      {
        id: "paris",
        name: "Paris",
        country: "France",
        region: "Europe",
        popular: true,
      },
    ];
    const ranked = rankDestinations("p", { catalog });
    // Both name-prefix 80; popular +5 → paris first
    assert.equal(ranked[0]?.destination.id, "paris");
  });

  it("boosts recent destinations", () => {
    const ranked = rankDestinations("p", {
      catalog: CATALOG,
      recentIds: ["prague"],
    });
    const prague = ranked.find((entry) => entry.destination.id === "prague");
    const paris = ranked.find((entry) => entry.destination.id === "paris");
    assert.ok(prague && paris);
    // prague base may be lower; recent boost should lift it when both match "p"
    assert.ok(prague.score > prague.baseScore);
  });

  it("is deterministic for the same inputs", () => {
    const a = rankDestinations("united", { catalog: CATALOG }).map(
      (entry) => entry.destination.id,
    );
    const b = rankDestinations("united", { catalog: CATALOG }).map(
      (entry) => entry.destination.id,
    );
    assert.deepEqual(a, b);
  });
});

describe("dedupeRankedDestinations", () => {
  it("keeps the higher-scoring duplicate id", () => {
    const paris = CATALOG[0]!;
    const ranked: RankedDestination[] = [
      {
        destination: paris,
        baseScore: 40,
        score: 40,
        matchKind: "contains",
      },
      {
        destination: paris,
        baseScore: 100,
        score: 100,
        matchKind: "name-exact",
      },
    ];
    const deduped = dedupeRankedDestinations(ranked);
    assert.equal(deduped.length, 1);
    assert.equal(deduped[0]?.score, 100);
    assert.equal(deduped[0]?.destination.id, "paris");
  });
});

describe("airport grouping helpers", () => {
  it("groups IATA queries into airports vs cities", () => {
    const ranked = rankDestinations("cdg", { catalog: CATALOG });
    assert.equal(shouldGroupAirportMatches("cdg", ranked), true);
    const { airports, cities } = splitRankedByMatchGroup(ranked);
    assert.ok(airports.every((entry) => isAirportMatchKind(entry.matchKind)));
    assert.ok(cities.every((entry) => !isAirportMatchKind(entry.matchKind)));
  });
});

describe("filterDestinationsRanked", () => {
  it("returns destinations in ranked order", () => {
    const results = filterDestinationsRanked("cdg", { catalog: CATALOG });
    assert.equal(results[0]?.id, "paris");
  });
});

describe("highlightMatchSegments", () => {
  it("highlights a case-insensitive substring", () => {
    const segments = highlightMatchSegments("Paris, France", "par");
    assert.deepEqual(segments, [
      { text: "Par", match: true },
      { text: "is, France", match: false },
    ]);
  });

  it("handles accent-insensitive queries", () => {
    const segments = highlightMatchSegments("Cancún, Mexico", "cancun");
    assert.ok(segments.some((segment) => segment.match));
    assert.equal(segments.map((segment) => segment.text).join(""), "Cancún, Mexico");
  });

  it("returns a single segment when there is no match", () => {
    assert.deepEqual(highlightMatchSegments("Paris, France", "xyz"), [
      { text: "Paris, France", match: false },
    ]);
  });
});
