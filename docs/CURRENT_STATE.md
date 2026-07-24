# Glooconn — Current State

**Last updated:** July 25, 2026  
**Active branch:** `cursor/milestone-10-6-hardening-release`  
**Current release:** **v0.16.0** — Milestone 10 Search Experience complete  
**Status:** Production-ready **multi-provider architecture** + **Milestone 10 search experience**; SerpAPI **Sprint 11.2 hardening** (datetime, round-trip token, currency)  
**Temporary flight provider (dev/test):** SerpAPI Google Flights  
**Long-term production flights provider:** Amadeus Enterprise  
**Markers:** `flight-api-v1` (Sprint 6) · `v0.13.0` (Sprint 7) · `v0.14.0` (Sprint 8) · `v0.15.0` (Sprint 9) · `v0.16.0` (Milestone 10)

---

## Sprint status

| Sprint | Name | Status | Branch |
|--------|------|--------|--------|
| Sprint 1 | Server search boundary | ✅ Complete | `cursor/project-principles` |
| Sprint 2 | IATA resolution | ✅ Complete | `cursor/project-principles` |
| Sprint 3 | Amadeus OAuth & token cache | ✅ Complete | `cursor/project-principles` |
| Sprint 4 | Flight Offers HTTP | ✅ Complete | `cursor/project-principles` |
| Sprint 5 | Flight response mapping | ✅ Complete | `cursor/project-principles` |
| Sprint 6 | Wire live Amadeus provider | ✅ Complete | `cursor/project-principles` |
| Sprint 7 | Flight API automated testing | ✅ Complete | `cursor/project-principles` |
| Sprint 8 | Flight API production hardening | ✅ Complete | `cursor/project-principles` |
| Sprint 9.1–9.10 | SerpAPI multi-provider (docs → release) | ✅ Complete | `cursor/project-principles` |
| Milestone 10.1 | Professional Search Results UI | ✅ Complete | `cursor/milestone-10-1-results-ui` |
| Milestone 10.2 | Search Reliability (`SearchResponse`) | ✅ Complete | `cursor/milestone-10-2-search-reliability` |
| Milestone 10.3 | Search Quality (filters / sort / rank) | ✅ Complete | `cursor/milestone-10-3-search-quality` |
| Milestone 10.4 | Search Performance (client cache / render) | ✅ Complete | `cursor/milestone-10-4-search-performance` |
| Milestone 10.5 | Destination Search Quality | ✅ Complete | `cursor/milestone-10-5-destination-quality` |
| Milestone 10.6 | Hardening & Release (v0.16.0) | ✅ Complete | `cursor/milestone-10-6-hardening-release` |
| Sprint 11.1 / 11.1b | Live SerpAPI validation | ✅ Complete | `cursor/milestone-10-6-hardening-release` |
| Sprint 11.2 | SerpAPI production hardening | ✅ Complete | `cursor/milestone-10-6-hardening-release` |
| Sprint 11.3 | SerpAPI production readiness | ✅ Complete | `cursor/milestone-10-6-hardening-release` |
| Release v0.17.0 | Live Flights | ⏳ Ready for CTO commit/tag | `cursor/milestone-10-6-hardening-release` |

---

## What works today

- Home page with full search form (origin, destination, dates, budget, travelers, product types)
- Search results page with hotels, flights, buses, trains
- Trip search runs **server-side** via `POST /api/search`
- Flights providers: **mock** (default), **Amadeus** (production path), **SerpAPI** (dev/test)
- **SearchResponse** live contract with optional `warnings` (ADR-037)
- **Partial provider failure** — one domain can fail without blanking the search
- **Client search quality** — richer filters, Recommended/Cheapest/Fastest/Highest rated/Best value sort, deterministic ranking (`lib/results/rank.ts`)
- **Destination search quality** — IATA/name/country ranking, Cities/Airports grouping, match highlight (`lib/destinations/rank.ts`)
- **Client search performance** — stable search cache keys, 45s client TTL + in-flight dedupe, keep-previous-data queries, debounced autocomplete/price filters, memoized result cards
- **272 automated tests** (Flight API + SerpAPI 11.2 hardening + search reliability + results quality + performance + destination quality)
- Supabase auth (Google + email), profile, saved trips
- CI: typecheck, lint, test, build
- Sprint **10.1** professional results UI
- Sprint **10.2** search reliability
- Sprint **10.3** search quality (client-only)
- Sprint **10.4** search performance (client-only)
- Sprint **10.5** destination search quality (client-only)
- Sprint **10.6** hardening + v0.16.0 release

---

## What does not work yet

- `/destinations` and `/about` pages (nav links 404)
- currencyService registry DI (ADR-035 debt)
- Manual Amadeus sandbox smoke (checklist ready — not yet executed as a formal QA pass)
- Hotels / activities live providers

---

## Active technical focus

**Shipped:** Milestone **10** complete — Search Experience (**v0.16.0**).

**Active focus:** Product pages & providers (post–Milestone 10).

**Next priorities:** Destinations / About pages; hotels provider; Amadeus Enterprise enablement; currencyService DI (ADR-035).

**Amadeus:** long-term production path — prefer bugfixes only unless CTO-approved feature work.

---

## Environment notes

- Default: `USE_MOCK_PROVIDERS=true` — mock flights; no Amadeus/SerpAPI keys required
- Live Amadeus: `USE_MOCK_PROVIDERS=false`, `FLIGHTS_PROVIDER=amadeus`, keys + `AMADEUS_ENV=test|production`
- Live SerpAPI (dev/test): `USE_MOCK_PROVIDERS=false`, `FLIGHTS_PROVIDER=serpapi`, `SERPAPI_API_KEY`, optional `SERPAPI_DEEP_SEARCH`
- Live with unset `FLIGHTS_PROVIDER` defaults to **amadeus**
- CI never calls real Amadeus or SerpAPI

---

## Key architecture (v0.15.0 + M10.2)

```
UI → postSearchTrips → POST /api/search → searchTrips [server-only]
  → enrichSearchRequestWithAirports
  → assertFlightAirportsResolved (if flights)
  → Promise.allSettled(hotels / flights / transport)  [ADR-037]
  → SearchResponse (+ warnings?)

flights/ → mock | amadeus (long-term production) | serpapi (temporary dev/test, ADR-036)
```

See [Provider_Guide.md](./Provider_Guide.md) for the full request lifecycle.

---

## Roadmap snapshot

| Horizon | Focus |
|---------|--------|
| Short-term | Destinations / About pages; hotels provider |
| Mid-term | Hotels, activities |
| Long-term | Amadeus Enterprise, more providers, AI travel optimization |

Details: [releases/v0.16.0.md](./releases/v0.16.0.md) · [ROADMAP.md](./ROADMAP.md)

---

## Documentation index

| File | Purpose |
|------|---------|
| [PROJECT.md](./PROJECT.md) | Overview and structure |
| [PROGRESS.md](./PROGRESS.md) | Completed work log |
| [TODO.md](./TODO.md) | Active tasks |
| [ROADMAP.md](./ROADMAP.md) | Long-term phases |
| [DECISIONS.md](./DECISIONS.md) | Architecture decisions (incl. ADR-036 / ADR-037) |
| [API_FOUNDATION.md](./API_FOUNDATION.md) | Provider architecture |
| [Provider_Guide.md](./Provider_Guide.md) | How to add a flights vendor |
| [AI_HANDOFF.md](./AI_HANDOFF.md) | Developer / AI context |
| [releases/v0.16.0.md](./releases/v0.16.0.md) | v0.16.0 Milestone 10 release notes |
| [releases/v0.17.0.md](./releases/v0.17.0.md) | v0.17.0 Live Flights release notes |
| [SPRINT_8_SUMMARY.md](./SPRINT_8_SUMMARY.md) | Sprint 8 completion summary |
| [SPRINT_11_2_SUMMARY.md](./SPRINT_11_2_SUMMARY.md) | Sprint 11.2 SerpAPI hardening |
| [SPRINT_11_3_PRODUCTION_READINESS.md](./SPRINT_11_3_PRODUCTION_READINESS.md) | Sprint 11.3 production readiness / v0.17.0 gate |
| [SPRINT_11_1_VALIDATION.md](./SPRINT_11_1_VALIDATION.md) | Sprint 11.1 / 11.1b live SerpAPI validation |
| [../PROJECT_PRINCIPLES.md](../PROJECT_PRINCIPLES.md) | Mission and values |
