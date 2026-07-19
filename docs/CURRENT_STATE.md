# Glooconn — Current State

**Last updated:** July 19, 2026  
**Active branch:** `cursor/project-principles`  
**Current version:** 0.11.0

---

## Sprint status

| Sprint | Name | Status | Branch |
|--------|------|--------|--------|
| Sprint 1 | Server search boundary | ✅ Complete | `cursor/project-principles` |
| Sprint 2 | IATA resolution | ✅ Complete | `cursor/project-principles` |
| Sprint 3 | Amadeus OAuth & token cache | ✅ Complete | `cursor/project-principles` |
| Sprint 4 | Flight Offers HTTP | ✅ Complete | `cursor/project-principles` |
| Sprint 5 | Flight response mapping | ✅ Complete | `cursor/project-principles` |
| Sprint 6 | Wire live Amadeus provider | 📋 Planned | TBD |

---

## What works today

- Home page with full search form (origin, destination, dates, budget, travelers, product types)
- Search results page with mock hotels, flights, buses, trains
- Trip search runs **server-side** via `POST /api/search`
- Server enriches `SearchRequest` with optional `originIata` / `destinationIata`
- Flights-requested searches fail with a clear validation error when airports cannot be resolved
- Amadeus OAuth + TTL cache + `amadeusFetch` (test env)
- `searchFlightOffers()` GET Flight Offers → raw Amadeus JSON
- `mapAmadeusFlightOffersResponse()` raw JSON → `Flight[]` (not wired to provider yet)
- Supabase auth (Google + email), profile, saved trips
- Provider architecture with mock adapters
- CI: typecheck, lint, test, build

---

## What does not work yet

- `/destinations` and `/about` pages (nav links 404)
- Live Amadeus flight results in the UI (`AmadeusFlightsProvider` still delegates to mock)
- Partial provider failure (one provider error fails entire search)

---

## Active technical focus

**Next:** Sprint 6 — wire `AmadeusFlightsProvider.search` to `searchFlightOffers` + `mapAmadeusFlightOffersResponse`.

**Done:** Sprint 5 Flight mapping (ADR-034) — public response mapper; provider still mocked.

---

## Environment notes

- Default: `USE_MOCK_PROVIDERS=true` — no external API keys required for app UX
- Supabase optional — auth/trips disabled without `.env.local`
- Amadeus keys required to exercise OAuth / Flight Offers HTTP: `AMADEUS_API_KEY`, `AMADEUS_API_SECRET`
- Test host: `test.api.amadeus.com`

---

## Key architecture (post–Sprint 5)

```
SearchResultsPage (client)
  → postSearchTrips()
    → POST /api/search
      → searchTrips() [server-only]
        → enrichSearchRequestWithAirports()
        → assertFlightAirportsResolved()
        → hotels / flights / transport
            AmadeusFlightsProvider.search → mock

Amadeus package (ready, not wired to provider.search):
  flightOffers.ts → raw JSON
  mappers.ts → mapAmadeusFlightOffersResponse → Flight[]
  auth.ts → OAuth token cache
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
| [SPRINT_3_SUMMARY.md](./SPRINT_3_SUMMARY.md) | Sprint 3 completion summary |
| [SPRINT_4_SUMMARY.md](./SPRINT_4_SUMMARY.md) | Sprint 4 completion summary |
| [SPRINT_5_SUMMARY.md](./SPRINT_5_SUMMARY.md) | Sprint 5 completion summary |
| [../PROJECT_PRINCIPLES.md](../PROJECT_PRINCIPLES.md) | Mission and values |
