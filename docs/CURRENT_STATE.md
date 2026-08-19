# Glooconn — Current State

**Last updated:** August 19, 2026  
**Active branch:** `milestone-12-hotel-search`  
**Current release:** **v0.19.0** — Travel Packages  
**Completed:** **Milestone 15** — MVP Conversion (Sprints 15.1–15.4; release commit pending)  
**Status:** Focused MVP UI — flights + hotels + Recommended Packages; live SerpAPI when configured  
**Live providers:** SerpAPI Google Flights · SerpAPI Google Hotels  
**Long-term flights:** Amadeus Enterprise  
**Markers:** `v0.17.0` · `v0.18.0` · **`v0.19.0`** · Milestone 15 MVP Conversion (unreleased)

---

## Sprint status

| Sprint | Name | Status | Branch |
|--------|------|--------|--------|
| Milestone 13 / **v0.19.0** | Travel Packages | ✅ Released | `milestone-12-hotel-search` |
| Sprint 14.1–14.4 | MVP Focus | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 15.1 | MVP Conversion discovery audit | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 15.2 | Price Trust + Critical MVP Fixes | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 15.3 | Recommended Package UX | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 15.4 | Flexible Budget + Budget Compatibility Warning | ✅ Complete | `milestone-12-hotel-search` |
| **Next** | Commit M15 + **v0.20.0** release (CTO) | ⏳ | — |

---

## What works today

- Focused search form: From, Destination (with **swap**), Dates, Travelers, Optional Budget (dynamic currency label), Stays, Flights
- Budget is **optional** — leave empty to search without a budget constraint
- Results: **⭐ Recommended Packages** (up to 5 initially, "Show more") → **Browse Flights** → **Browse Hotels**
- Package quality badges: "Top Pick" (≥80) · "Good Match" (≥60) — replaces opaque numeric score
- Package breakdown: "Flight (per person) + hotel (N nights, 1 room)" + "est. total"
- **Budget compatibility warning** — shown above Recommended Packages when all same-currency packages exceed the user's budget; suppressed when currencies don't match (no FX conversion)
- Package candidate selection: quality-aware "6+2" pool (6 cheapest + 2 highest-rated)
- Filters (hotels/flights only) + sort; Edit search; Save trip (when Supabase configured)
- Flight price labeled "per person"; hotel price labeled "N nights · 1 room"
- Flight route context (e.g. LHR → CDG) shown when IATA codes are available
- One-way search hotel warning when return date is missing
- Nav: Logo, Search, My Trips, Sign in / Profile (no Destinations/About links)
- Trip search via `POST /api/search`; packages via `PackageComposer`
- Live SerpAPI flights & hotels when env-configured; mock default
- **551 automated tests**; typecheck + build green; 0 vulnerabilities

---

## What does not work yet / known limits

- Destinations / About **pages** still not built (links removed from MVP nav)
- Booking CTAs removed (informational cards only)
- Transport UI hidden (providers retained)
- Supabase unset → auth / saved trips disabled locally
- SerpAPI RT `departure_token` outbound fallback; hotel `children_ages` default `8`
- Cosmetic: `SectionHeading` hydration warning in dev overlay
- currencyService DI debt (ADR-035)

---

## Environment notes

- Default: `USE_MOCK_PROVIDERS=true`
- Live SerpAPI: `USE_MOCK_PROVIDERS=false`, `FLIGHTS_PROVIDER=serpapi` and/or `HOTELS_PROVIDER=serpapi`, `SERPAPI_API_KEY`
- Restart `npm run dev` after `.env.local` changes

---

## Key docs

| Doc | Purpose |
|-----|---------|
| [releases/v0.19.0.md](./releases/v0.19.0.md) | Travel Packages release |
| [TODO.md](./TODO.md) | Active tasks |
| [ROADMAP.md](./ROADMAP.md) | Product roadmap |
| [Provider_Guide.md](./Provider_Guide.md) | Provider patterns |
| [API_FOUNDATION.md](./API_FOUNDATION.md) | Search architecture |
