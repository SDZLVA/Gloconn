# Glooconn — Current State

**Last updated:** September 28, 2026  
**Active branch:** `milestone-18-budget-engine` (merge to `main` via PR)  
**Current release:** **v0.23.0** — Budget-First Engine  
**Completed:** **Milestone 18** — Budget-First Engine  
**Live site:** [https://glooconn.vercel.app](https://glooconn.vercel.app)  
**Status:** Focused MVP UI — flights + hotels + Recommended Packages + flexible-date explore  
**Live providers:** SerpAPI Google Flights · SerpAPI Google Hotels  
**Long-term flights:** Amadeus Enterprise  
**Markers:** `v0.17.0` · `v0.18.0` · `v0.19.0` · `v0.20.0` · `v0.21.0` · `v0.22.0` · **`v0.23.0`**

---

## Sprint / release status

| Item | Name | Status | Branch |
|------|------|--------|--------|
| Milestone 16 / **v0.21.0** | Recommendation Intelligence | ✅ Released | (prior) |
| Milestone 17 / **v0.22.0** | Hotel Actionability + Cleanup | ✅ Released | `main` |
| Milestone 18 | Budget-First Engine | ✅ Complete | `milestone-18-budget-engine` |
| **v0.23.0** | Budget-First Engine | ✅ Release docs | `milestone-18-budget-engine` |

---

## What works today

- Focused search form: From, Destination (with **swap**), Dates, **Exact/±1–3 flexible days**, Travelers, Optional Budget, Stays, Flights
- Results: **⭐ Recommended Packages** → **Sort browse results** → **Browse Flights** → **Browse Hotels**
- When budget is set and all packages are over budget: **Find cheaper options** (or Exact → flex hint)
- Explore: date price strip with **from €X** chips; chip click loads full packages for that date pair
- `POST /api/search/date-options` — rate-limited, cached (~15m), `EXPLORE_DATES_ENABLED` kill switch
- Honest SerpAPI round-trip prices (return lookup required; unenriched offers dropped)
- Browse lists stay visible when everything is over budget (filter opens to observed range)
- Live SerpAPI flights & hotels when env-configured; mock default
- Production hosting on Vercel from **`main`** → [glooconn.vercel.app](https://glooconn.vercel.app)
- CI runs on **every branch push** and on PRs into `main`
- Automated tests green (**804**); typecheck + build green; Next.js **16.3.3**

---

## What does not work yet / known limits

- SerpAPI **250 searches/month** typical plan — explore ±3 ≈ 18 calls; use kill switch if needed
- Same-airline near-duplicate flight offers can still appear in the top five
- Destinations / About **pages** still not built (links removed from MVP nav)
- Booking CTAs removed (informational cards + safe external links only — no in-app checkout)
- Transport UI hidden (providers retained); nearby airports not in scope for M18
- Supabase unset → auth / saved trips disabled locally
- Hotel `children_ages` default `8`
- Cosmetic: `SectionHeading` hydration warning in dev overlay
- currencyService DI debt (ADR-035)

---

## Environment notes

- Default: `USE_MOCK_PROVIDERS=true`
- Live SerpAPI: `USE_MOCK_PROVIDERS=false`, `FLIGHTS_PROVIDER=serpapi` and/or `HOTELS_PROVIDER=serpapi`, `SERPAPI_API_KEY`
- Explore kill switch: `EXPLORE_DATES_ENABLED=true` (default) or `false` / `0` to disable date-options
- Hotel sealed refs: `PROPERTY_REF_SEAL_SECRET` (server-only)
- Restart `npm run dev` after `.env.local` changes

---

## Key docs

| Doc | Purpose |
|-----|---------|
| [releases/v0.23.0.md](./releases/v0.23.0.md) | Budget-First Engine release (current) |
| [releases/v0.22.0.md](./releases/v0.22.0.md) | Hotel Actionability + Cleanup |
| [TODO.md](./TODO.md) | Active tasks |
| [ROADMAP.md](./ROADMAP.md) | Product roadmap |
| [Provider_Guide.md](./Provider_Guide.md) | Provider patterns + scout / explore |
| [API_FOUNDATION.md](./API_FOUNDATION.md) | Search architecture |
