# Glooconn — Current State

**Last updated:** July 19, 2026  
**Active branch:** `cursor/project-principles`  
**Current version:** 0.8.0

---

## Sprint status

| Sprint | Name | Status | Branch |
|--------|------|--------|--------|
| Sprint 1 | Server search boundary | ✅ Complete | `cursor/project-principles` |
| Sprint 2 | IATA resolution | ✅ Complete | `cursor/project-principles` |
| Sprint 3 | Amadeus flight integration | 📋 Planned | TBD |

---

## What works today

- Home page with full search form (origin, destination, dates, budget, travelers, product types)
- Search results page with mock hotels, flights, buses, trains
- Trip search runs **server-side** via `POST /api/search`
- Server enriches `SearchRequest` with optional `originIata` / `destinationIata`
- Flights-requested searches fail with a clear validation error when airports cannot be resolved
- Hotels/transport-only searches work without IATA
- Supabase auth (Google + email), profile, saved trips
- Provider architecture with mock adapters and Amadeus stub
- CI: typecheck, lint, test, build

---

## What does not work yet

- `/destinations` and `/about` pages (nav links 404)
- Real flight data (Amadeus not implemented — stub delegates to mock)
- OAuth token caching for Amadeus
- Partial provider failure (one provider error fails entire search)

---

## Active technical focus

**Next:** Sprint 3 — implement Amadeus OAuth + Flight Offers Search using enriched IATA fields on `SearchRequest`.

**Done:** Sprint 2 IATA enrichment + flight airport validation (ADR-031).

---

## Environment notes

- Default: `USE_MOCK_PROVIDERS=true` — no external API keys required
- Supabase optional — auth/trips disabled without `.env.local`
- Amadeus keys only needed when `FLIGHTS_PROVIDER=amadeus` and mock flag is false

---

## Key architecture (post–Sprint 2)

```
SearchResultsPage (client)
  → postSearchTrips()
    → POST /api/search
      → searchTrips() [server-only]
        → enrichSearchRequestWithAirports()
        → assertFlightAirportsResolved()   (when flights selected)
        → hotels / flights / transport providers
```

---

## Documentation index

| File | Purpose |
|------|---------|
| [PROJECT.md](./PROJECT.md) | Overview and structure |
| [PROGRESS.md](./PROGRESS.md) | Completed work log |
| [TODO.md](./TODO.md) | Active tasks |
| [ROADMAP.md](./ROADMAP.md) | Long-term phases |
| [DECISIONS.md](./DECISIONS.md) | Architecture decisions |
| [API_FOUNDATION.md](./API_FOUNDATION.md) | Provider architecture |
| [AI_HANDOFF.md](./AI_HANDOFF.md) | Developer / AI context |
| [SPRINT_2_SUMMARY.md](./SPRINT_2_SUMMARY.md) | Sprint 2 completion summary |
| [../PROJECT_PRINCIPLES.md](../PROJECT_PRINCIPLES.md) | Mission and values |
