# Glooconn — Current State

**Last updated:** August 5, 2026  
**Active branch:** `milestone-12-hotel-search`  
**Current release:** **v0.19.0** — Travel Packages  
**In progress:** **Milestone 14** — MVP Focus (Sprints 14.1–14.4 validation complete; release commit pending)  
**Status:** Focused MVP UI — flights + hotels + Recommended Packages; live SerpAPI when configured  
**Live providers:** SerpAPI Google Flights · SerpAPI Google Hotels  
**Long-term flights:** Amadeus Enterprise  
**Markers:** `v0.17.0` · `v0.18.0` · **`v0.19.0`** · Milestone 14 MVP polish (unreleased)

---

## Sprint status

| Sprint | Name | Status | Branch |
|--------|------|--------|--------|
| Milestone 13 / **v0.19.0** | Travel Packages | ✅ Released | `milestone-12-hotel-search` |
| Sprint 14.1 | MVP discovery audit | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 14.2 | MVP UI simplification | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 14.3 | UX polish | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 14.4 | MVP validation & release readiness | ✅ Complete (await CTO) | `milestone-12-hotel-search` |
| **Next** | Commit M14 + optional **v0.20.0** release (CTO) | ⏳ | — |

---

## What works today

- Focused search form: From, Destination (with **swap**), Dates, Travelers, Budget (dynamic currency label), Stays, Flights
- Results: **⭐ Recommended Packages** → **Browse Flights** → **Browse Hotels**
- Filters (hotels/flights only) + sort; Edit search; Save trip (when Supabase configured)
- Nav: Logo, Search, My Trips, Sign in / Profile (no Destinations/About links)
- Trip search via `POST /api/search`; packages via `PackageComposer`
- Live SerpAPI flights & hotels when env-configured; mock default
- **381 automated tests**; typecheck + build green

---

## What does not work yet / known limits

- Destinations / About **pages** still not built (links removed from MVP nav)
- Booking CTAs removed (informational cards only)
- Transport UI hidden (providers retained)
- Supabase unset → auth / saved trips disabled locally
- SerpAPI RT `departure_token` outbound fallback; hotel `children_ages` default `8`
- Cosmetic: `SectionHeading` hydration warning in dev overlay

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
