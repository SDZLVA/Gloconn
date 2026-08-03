# Glooconn — Current State

**Last updated:** August 3, 2026  
**Active branch:** `milestone-12-hotel-search`  
**Current release:** **v0.19.0** — Travel Packages  
**In progress:** —  
**Status:** Multi-provider architecture + live SerpAPI flights & hotels + **Recommended Travel Packages**  
**Live providers:** SerpAPI Google Flights · SerpAPI Google Hotels  
**Long-term flights:** Amadeus Enterprise  
**Markers:** `v0.17.0` (flights) · `v0.18.0` (hotels) · **`v0.19.0` (packages)**

---

## Sprint status

| Sprint | Name | Status | Branch |
|--------|------|--------|--------|
| Milestone 12 / **v0.18.0** | Live Hotels (SerpAPI) | ✅ Released (notes) | `milestone-12-hotel-search` |
| Sprint 13.1 | Travel Packages discovery | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 13.2 | TravelPackage + PackageComposer | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 13.3 | Orchestrator + SearchResponse.packages | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 13.4 | Recommended Packages UI | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 13.5 | Validation + hardening | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 13.6 / **v0.19.0** | Release Travel Packages | ✅ Released | `milestone-12-hotel-search` |
| **Next** | Awaiting founder/CTO for next milestone | ⏳ | — |

---

## What works today

- Home page with full search form (origin, destination, dates, budget, travelers, product types)
- Search results page with hotels, flights, buses, trains
- **Recommended Packages** hero section when flights + hotels both return results
- Trip search runs **server-side** via `POST /api/search`
- **Live Flight Search** via **SerpAPI** when env-configured (**v0.17.0**)
- **Live Hotel Search** via **SerpAPI Google Hotels** when env-configured (**v0.18.0**)
- Packages composed product-layer via `PackageComposer` (no PackagesProvider)
- Flights: **mock** (default), **SerpAPI** (live), **Amadeus** (long-term)
- Hotels: **mock** (default), **SerpAPI** (live), **booking** (stub → mock)
- **SearchResponse** with `packages: TravelPackage[]` + optional `warnings` (ADR-037)
- **358 automated tests**; CI: typecheck, lint, test, build
- Supabase auth, profile, saved trips

---

## What does not work yet

- `/destinations` and `/about` pages (nav links 404)
- currencyService registry DI (ADR-035 debt)
- SerpAPI round-trip `departure_token` return enrichment (HTTP 400 → outbound fallback)
- Child ages on `SearchRequest` (hotels default age `8` when `children > 0`)
- Package booking / saved package contents / AI trip planner

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
| [SPRINT_13_5_PRODUCTION_READINESS.md](./SPRINT_13_5_PRODUCTION_READINESS.md) | Milestone 13 validation gate |
| [SPRINT_13_5_LIVE_RESULTS.json](./SPRINT_13_5_LIVE_RESULTS.json) | Redacted live package validation evidence |
| [releases/v0.19.0.md](./releases/v0.19.0.md) | Travel Packages release |
| [SPRINT_12_4_PRODUCTION_READINESS.md](./SPRINT_12_4_PRODUCTION_READINESS.md) | Hotels hardening |
| [Provider_Guide.md](./Provider_Guide.md) | Flights + hotels provider patterns |
| [API_FOUNDATION.md](./API_FOUNDATION.md) | Search architecture |
| [releases/v0.18.0.md](./releases/v0.18.0.md) | Live hotels release |
| [releases/v0.17.0.md](./releases/v0.17.0.md) | Live flights release |
