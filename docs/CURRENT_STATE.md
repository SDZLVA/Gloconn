# Glooconn — Current State

**Last updated:** July 19, 2026  
**Active branch:** `cursor/project-principles`  
**Current version:** 0.14.0  
**Release:** `v0.14.0` · Milestone: **Flight API v0.14.0**  
**Flight API status:** **Maintenance mode** (Sprints 1–8 complete — architecture, tests, hardening)  
**Markers:** `flight-api-v1` (Sprint 6) · `v0.13.0` (Sprint 7) · `v0.14.0` (Sprint 8)

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

---

## What works today

- Home page with full search form (origin, destination, dates, budget, travelers, product types)
- Search results page with hotels, flights, buses, trains
- Trip search runs **server-side** via `POST /api/search`
- Amadeus live pipeline when env-selected (default remains mock)
- Production hardening: timeouts, 401 single retry, 429 handling, `AMADEUS_ENV` hosts, structured Amadeus logs
- **115 automated tests** (config, timeouts, retries, logging, Flight API pipeline — mocked fetch)
- Supabase auth (Google + email), profile, saved trips
- CI: typecheck, lint, test, build

---

## What does not work yet

- `/destinations` and `/about` pages (nav links 404)
- Partial provider failure (one provider error fails entire search)
- currencyService registry DI (ADR-035 debt)
- Manual Amadeus sandbox smoke (checklist ready — not yet executed as a formal QA pass)

---

## Active technical focus

**Done:** Sprint 8 — Flight API production hardening. Flight API is in **maintenance mode** (`v0.14.0`).

**Next (product backlog):** destinations/about pages; execute manual Amadeus sandbox checklist; partial provider failure; currencyService DI cleanup (ADR-035). Prefer not to expand Flight API features unless fixing regressions.

---

## Environment notes

- Default: `USE_MOCK_PROVIDERS=true` — mock flights; no Amadeus keys required
- Live Amadeus: `USE_MOCK_PROVIDERS=false`, `FLIGHTS_PROVIDER=amadeus`, keys + `AMADEUS_ENV=test|production`
- Hosts are fixed per env (`test.api.amadeus.com` / `api.amadeus.com`) — no arbitrary base URLs
- Optional: `AMADEUS_OAUTH_TIMEOUT_MS`, `AMADEUS_FETCH_TIMEOUT_MS`
- CI never calls real Amadeus — use the sandbox checklist in `docs/SPRINT_8_SUMMARY.md` for live smoke

---

## Key architecture (post–Sprint 8)

```
AmadeusFlightsProvider.search (when selected)
  → require destinationId
  → searchFlightOffers → mapAmadeusFlightOffersResponse → Flight[]

Hardening:
  config (AMADEUS_ENV, timeouts, credentials)
  → OAuth + amadeusFetch (timeouts, 401 retry, 429)
  → structured logs (provider / operation / httpStatus / durationMs / errorCode)

Automated tests (npm test):
  fixtures + mocked fetch + server-only stub
  → no real Amadeus network in CI
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
| [SPRINT_6_SUMMARY.md](./SPRINT_6_SUMMARY.md) | Sprint 6 completion summary |
| [SPRINT_7_SUMMARY.md](./SPRINT_7_SUMMARY.md) | Sprint 7 completion summary |
| [SPRINT_8_SUMMARY.md](./SPRINT_8_SUMMARY.md) | Sprint 8 completion summary (hardening + sandbox checklist) |
| [../PROJECT_PRINCIPLES.md](../PROJECT_PRINCIPLES.md) | Mission and values |
