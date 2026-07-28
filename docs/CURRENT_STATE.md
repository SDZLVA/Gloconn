# Glooconn — Current State

**Last updated:** July 28, 2026  
**Active branch:** `cursor/milestone-10-6-hardening-release`  
**Current release:** **v0.17.0** — Live Flights  
**Current milestone:** **Milestone 11 complete**; next is **Milestone 12** (Hotel Search Integration)  
**Status:** Multi-provider architecture + Search Experience (M10) + **live SerpAPI flights (production-capable)**  
**Live flights provider (current):** SerpAPI Google Flights  
**Long-term / future flights provider:** Amadeus Enterprise  
**Markers:** `flight-api-v1` · `v0.13.0`–`v0.16.0` · **`v0.17.0` (Milestone 11)**

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
| Milestone 10.1–10.6 | Search Experience → **v0.16.0** | ✅ Complete | Milestone 10 branches |
| Sprint 11.1 / 11.1b | Live SerpAPI validation | ✅ Complete | `cursor/milestone-10-6-hardening-release` |
| Sprint 11.2 | SerpAPI production hardening | ✅ Complete | `cursor/milestone-10-6-hardening-release` |
| Sprint 11.3 | SerpAPI production readiness | ✅ Complete | `cursor/milestone-10-6-hardening-release` |
| **Release v0.17.0** | **Live Flights** | ✅ **Released** | `cursor/milestone-10-6-hardening-release` |

---

## What works today

- Home page with full search form (origin, destination, dates, budget, travelers, product types)
- Search results page with hotels, flights, buses, trains
- Trip search runs **server-side** via `POST /api/search`
- **Live Flight Search** via **SerpAPI** (production-capable) when env-configured
- Flights providers: **mock** (default), **SerpAPI** (live), **Amadeus** (long-term Enterprise path)
- **SearchResponse** live contract with optional `warnings` (ADR-037)
- **Partial provider failure** — one domain can fail without blanking the search
- Client search quality, destination ranking, and search performance (Milestone 10)
- **272 automated tests**
- Supabase auth (Google + email), profile, saved trips
- CI: typecheck, lint, test, build

---

## What does not work yet

- `/destinations` and `/about` pages (nav links 404)
- Live hotels provider (→ **Milestone 12**)
- currencyService registry DI (ADR-035 debt)
- Manual Amadeus sandbox smoke (checklist ready — not yet a formal QA pass)
- SerpAPI round-trip return-leg enrichment via `departure_token` (HTTP 400 → outbound fallback; follow-up)

---

## Active technical focus

**Shipped:** Milestone **11** — Live Flights (**v0.17.0**).

**Next:** Milestone **12** — Hotel Search Integration.

**Also queued:** Destinations / About pages; Amadeus Enterprise enablement; RT token polish; currencyService DI (ADR-035).

**Amadeus:** long-term future production path — prefer bugfixes unless CTO-approved feature work.

---

## Environment notes

- Default: `USE_MOCK_PROVIDERS=true` — mock flights; no vendor keys required
- Live SerpAPI: `USE_MOCK_PROVIDERS=false`, `FLIGHTS_PROVIDER=serpapi`, `SERPAPI_API_KEY`, optional `SERPAPI_DEEP_SEARCH=false`
- Live Amadeus: `USE_MOCK_PROVIDERS=false`, `FLIGHTS_PROVIDER=amadeus`, keys + `AMADEUS_ENV=test|production`
- Live with unset `FLIGHTS_PROVIDER` defaults to **amadeus**
- Restart `npm run dev` after `.env.local` changes
- CI never calls real Amadeus or SerpAPI

---

## Key architecture (v0.17.0)

```
UI → postSearchTrips → POST /api/search → searchTrips [server-only]
  → enrichSearchRequestWithAirports
  → assertFlightAirportsResolved (if flights)
  → Promise.allSettled(hotels / flights / transport)  [ADR-037]
  → SearchResponse (+ warnings?)

flights/ → mock | serpapi (live, production-capable) | amadeus (long-term Enterprise)
```

See [Provider_Guide.md](./Provider_Guide.md) for the full request lifecycle.

---

## Roadmap snapshot

| Horizon | Focus |
|---------|--------|
| **Next** | **Milestone 12 — Hotel Search Integration** |
| Short-term | Destinations / About; SerpAPI RT token polish |
| Mid-term | Activities; Amadeus Enterprise enablement |
| Long-term | More providers, AI travel optimization |

Details: [releases/v0.17.0.md](./releases/v0.17.0.md) · [ROADMAP.md](./ROADMAP.md) · [../CHANGELOG.md](../CHANGELOG.md)

---

## Documentation index

| File | Purpose |
|------|---------|
| [PROJECT.md](./PROJECT.md) | Overview and structure |
| [PROGRESS.md](./PROGRESS.md) | Completed work log |
| [TODO.md](./TODO.md) | Active tasks (Milestone 12) |
| [ROADMAP.md](./ROADMAP.md) | Long-term phases |
| [DECISIONS.md](./DECISIONS.md) | Architecture decisions (incl. ADR-036 / ADR-037) |
| [API_FOUNDATION.md](./API_FOUNDATION.md) | Provider architecture |
| [Provider_Guide.md](./Provider_Guide.md) | How to add a flights vendor |
| [AI_HANDOFF.md](./AI_HANDOFF.md) | Developer / AI context |
| [releases/v0.17.0.md](./releases/v0.17.0.md) | v0.17.0 Live Flights release notes |
| [releases/v0.16.0.md](./releases/v0.16.0.md) | v0.16.0 Milestone 10 release notes |
| [SPRINT_11_3_PRODUCTION_READINESS.md](./SPRINT_11_3_PRODUCTION_READINESS.md) | Sprint 11.3 readiness gate |
| [SPRINT_11_2_SUMMARY.md](./SPRINT_11_2_SUMMARY.md) | Sprint 11.2 SerpAPI hardening |
| [SPRINT_11_1_VALIDATION.md](./SPRINT_11_1_VALIDATION.md) | Sprint 11.1 / 11.1b live validation |
| [../CHANGELOG.md](../CHANGELOG.md) | Release history |
| [../PROJECT_PRINCIPLES.md](../PROJECT_PRINCIPLES.md) | Mission and values |
