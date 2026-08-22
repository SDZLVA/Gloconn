# Glooconn — Current State

**Last updated:** August 22, 2026  
**Active branch:** `milestone-12-hotel-search`  
**Current release:** **v0.21.0** — Recommendation Intelligence  
**Completed:** **Milestone 16** — Recommendation Intelligence (Sprints 16.1–16.6; tagged as v0.21.0)  
**Status:** Focused MVP UI — flights + hotels + Recommended Packages with diversity + explainability  
**Live providers:** SerpAPI Google Flights · SerpAPI Google Hotels  
**Long-term flights:** Amadeus Enterprise  
**Markers:** `v0.17.0` · `v0.18.0` · `v0.19.0` · `v0.20.0` · **`v0.21.0`**

---

## Sprint status

| Sprint | Name | Status | Branch |
|--------|------|--------|--------|
| Milestone 13 / **v0.19.0** | Travel Packages | ✅ Released | `milestone-12-hotel-search` |
| Milestone 14–15 / **v0.20.0** | MVP Focus + Conversion | ✅ Released | `milestone-12-hotel-search` |
| Sprint 16.1 | Recommendation discovery | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 16.2 | Candidate quality | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 16.3 | Diversity & clone suppression | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 16.4 | Explainability | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 16.5 | Product validation | ✅ Complete | `milestone-12-hotel-search` |
| Sprint 16.5.1 | Label honesty gates | ✅ Complete | `milestone-12-hotel-search` |
| **v0.21.0** | Recommendation Intelligence release | ✅ Tagged | `milestone-12-hotel-search` |

---

## What works today

- Focused search form: From, Destination (with **swap**), Dates, Travelers, Optional Budget, Stays, Flights
- Results: **⭐ Recommended Packages** (up to 5 initially, "Show more") → **Browse Flights** → **Browse Hotels**
- Package pipeline: candidates → compose → score → **diversity** → UI roles
- Package roles: **Recommended** (exactly one in top 5) plus optional Lowest price / Best hotel / Best value / Fastest / Direct flight / Fits your budget
- Honesty gates: Best hotel ≥3★; “highly rated” ≥3★ and ≥4.5 rating; Fastest ≥45m; Lowest price ≥5%
- Package breakdown: "Flight (per person) + hotel (N nights, 1 room)" + "est. total"
- Budget compatibility warning (currency-safe)
- Flight price "per person"; hotel "N nights · 1 room"; route context when IATA available
- Live SerpAPI flights & hotels when env-configured; mock default
- **615 automated tests**; typecheck + build green; 0 vulnerabilities

---

## What does not work yet / known limits

- Same-airline near-duplicate flight offers can still appear in the top five when SerpAPI returns many similar offer IDs (identity-level diversity only)
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
| [releases/v0.21.0.md](./releases/v0.21.0.md) | Recommendation Intelligence release (current) |
| [releases/v0.20.0.md](./releases/v0.20.0.md) | MVP Focus release |
| [TODO.md](./TODO.md) | Active tasks |
| [ROADMAP.md](./ROADMAP.md) | Product roadmap |
| [Provider_Guide.md](./Provider_Guide.md) | Provider patterns |
| [API_FOUNDATION.md](./API_FOUNDATION.md) | Search architecture |
