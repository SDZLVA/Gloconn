# Glooconn — Current State

**Last updated:** September 22, 2026  
**Active branch:** `main`  
**Current release:** **v0.22.0** — Hotel Actionability + Cleanup  
**Completed:** **Milestone 17** — Hotel Actionability · **17.9 Cleanup**  
**Live site:** [https://glooconn.vercel.app](https://glooconn.vercel.app)  
**Status:** Focused MVP UI — flights + hotels + Recommended Packages + actionable hotel details  
**Live providers:** SerpAPI Google Flights · SerpAPI Google Hotels  
**Long-term flights:** Amadeus Enterprise  
**Markers:** `v0.17.0` · `v0.18.0` · `v0.19.0` · `v0.20.0` · `v0.21.0` · **`v0.22.0`**

---

## Sprint / release status

| Item | Name | Status | Branch |
|------|------|--------|--------|
| Milestone 13 / **v0.19.0** | Travel Packages | ✅ Released | (prior) |
| Milestone 14–15 / **v0.20.0** | MVP Focus + Conversion | ✅ Released | (prior) |
| Milestone 16 / **v0.21.0** | Recommendation Intelligence | ✅ Released | (prior) |
| Milestone 17 | Hotel Actionability | ✅ Complete | `main` |
| 17.9 Cleanup | Security + branch + CI | ✅ Complete | `main` |
| **v0.22.0** | Hotel Actionability + Cleanup | ✅ Release docs | `main` |

---

## What works today

- Focused search form: From, Destination (with **swap**), Dates, Travelers, Optional Budget, Stays, Flights
- Results: **⭐ Recommended Packages** (up to 5 initially, "Show more") → **Browse Flights** → **Browse Hotels**
- Package pipeline: candidates → compose → score → **diversity** → UI roles + honesty gates
- **Hotel actionability:** View hotel drawer, Google Maps, property details API, safe external links, sealed `gpref1` property refs
- Live SerpAPI flights & hotels when env-configured; mock default
- Production hosting on Vercel from **`main`** → [glooconn.vercel.app](https://glooconn.vercel.app)
- CI runs on **every branch push** and on PRs into `main`
- **717 automated tests**; typecheck + build green; **0 vulnerabilities** (Next.js **16.3.3**)

---

## What does not work yet / known limits

- Same-airline near-duplicate flight offers can still appear in the top five when SerpAPI returns many similar offer IDs (identity-level diversity only)
- Destinations / About **pages** still not built (links removed from MVP nav)
- Booking CTAs removed (informational cards + safe external links only — no in-app checkout)
- Transport UI hidden (providers retained)
- Supabase unset → auth / saved trips disabled locally
- SerpAPI RT `departure_token` outbound fallback; hotel `children_ages` default `8`
- Cosmetic: `SectionHeading` hydration warning in dev overlay
- currencyService DI debt (ADR-035)

---

## Environment notes

- Default: `USE_MOCK_PROVIDERS=true`
- Live SerpAPI: `USE_MOCK_PROVIDERS=false`, `FLIGHTS_PROVIDER=serpapi` and/or `HOTELS_PROVIDER=serpapi`, `SERPAPI_API_KEY`
- Hotel sealed refs: `PROPERTY_REF_SEAL_SECRET` (server-only; required for sealed property refs in live/prod)
- Restart `npm run dev` after `.env.local` changes

---

## Key docs

| Doc | Purpose |
|-----|---------|
| [releases/v0.22.0.md](./releases/v0.22.0.md) | Hotel Actionability + Cleanup release (current) |
| [releases/v0.21.0.md](./releases/v0.21.0.md) | Recommendation Intelligence release |
| [TODO.md](./TODO.md) | Active tasks |
| [ROADMAP.md](./ROADMAP.md) | Product roadmap |
| [Provider_Guide.md](./Provider_Guide.md) | Provider patterns |
| [API_FOUNDATION.md](./API_FOUNDATION.md) | Search architecture |
