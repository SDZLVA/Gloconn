# Glooconn — Current State

**Last updated:** July 28, 2026  
**Active branch:** `milestone-12-hotel-search`  
**Current release:** **v0.17.0** — Live Flights  
**In progress:** **Milestone 12** — Hotel Search Integration (Sprints 12.1–12.4 complete; release prep next)  
**Status:** Multi-provider architecture + **live SerpAPI flights & hotels** (production-capable when configured)  
**Live providers:** SerpAPI Google Flights · SerpAPI Google Hotels  
**Long-term flights:** Amadeus Enterprise  
**Markers:** `v0.17.0` (flights) · **v0.18.0** (hotels — release prep)

---

## Sprint status

| Sprint | Name | Status | Branch |
|--------|------|--------|--------|
| Milestone 11 / **v0.17.0** | Live Flights (SerpAPI) | ✅ Released | `cursor/milestone-10-6-hardening-release` |
| Sprint 12.1 | SerpAPI Hotels discovery | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 12.2 | SerpAPI Hotels adapter | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 12.3 | Live hotels validation | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 12.4 | Hotels production hardening | ✅ Complete | `milestone-12-hotel-search` |
| **Next** | **v0.18.0 release prep** | ⏳ Not started | — |

---

## What works today

- Home page with full search form (origin, destination, dates, budget, travelers, product types)
- Search results page with hotels, flights, buses, trains
- Trip search runs **server-side** via `POST /api/search`
- **Live Flight Search** via **SerpAPI** when env-configured (**v0.17.0**)
- **Live Hotel Search** via **SerpAPI Google Hotels** when env-configured (Milestone 12 — release prep)
- Flights: **mock** (default), **SerpAPI** (live), **Amadeus** (long-term)
- Hotels: **mock** (default), **SerpAPI** (live), **booking** (stub → mock)
- **SearchResponse** with optional `warnings` (ADR-037 partial failure)
- **317 automated tests**; CI: typecheck, lint, test, build
- Supabase auth, profile, saved trips

---

## What does not work yet

- `/destinations` and `/about` pages (nav links 404)
- **v0.18.0** tag / release notes (release prep not started)
- currencyService registry DI (ADR-035 debt)
- SerpAPI round-trip `departure_token` return enrichment (HTTP 400 → outbound fallback)
- Child ages on `SearchRequest` (hotels default age `8` when `children > 0`)

---

## Environment notes

- Default: `USE_MOCK_PROVIDERS=true` — mock all domains; no vendor keys required
- Live SerpAPI flights: `USE_MOCK_PROVIDERS=false`, `FLIGHTS_PROVIDER=serpapi`, `SERPAPI_API_KEY`
- Live SerpAPI hotels: `USE_MOCK_PROVIDERS=false`, `HOTELS_PROVIDER=serpapi`, `SERPAPI_API_KEY` (same key)
- Live Amadeus flights: `FLIGHTS_PROVIDER=amadeus` + Amadeus credentials
- Restart `npm run dev` after `.env.local` changes
- CI never calls live SerpAPI or Amadeus

---

## Key docs

| Doc | Purpose |
|-----|---------|
| [SPRINT_12_3_VALIDATION.md](./SPRINT_12_3_VALIDATION.md) | Live hotels validation |
| [SPRINT_12_4_PRODUCTION_READINESS.md](./SPRINT_12_4_PRODUCTION_READINESS.md) | Hotels hardening |
| [Provider_Guide.md](./Provider_Guide.md) | Flights + hotels provider patterns |
| [API_FOUNDATION.md](./API_FOUNDATION.md) | Search architecture |
| [releases/v0.17.0.md](./releases/v0.17.0.md) | Live flights release |
