# Sprint 4 Summary — Flight Offers HTTP

**Status:** ✅ Complete  
**Branch:** `cursor/project-principles`  
**Dates:** July 2026  
**Product version:** 0.10.0  
**Decision record:** ADR-033 (`docs/DECISIONS.md`)

---

## Objective

Call Amadeus **Flight Offers Search** over HTTP (test environment) using enriched IATA fields, returning **raw Amadeus JSON** — without mapping to Glooconn `Flight` models and without changing app search UX.

---

## What was delivered

| Deliverable | Detail |
|-------------|--------|
| Internal types | `lib/providers/flights/amadeus/types.ts` — raw offer / response / error shapes |
| Query builder | `buildFlightOffersSearchParams(request)` — pure, IATA + travelers + dates |
| HTTP search | `searchFlightOffers(request)` — GET `/v2/shopping/flight-offers` via `amadeusFetch` |
| Error handling | Safe `createProviderError` messages (no tokens/credentials) |
| Documentation | ADR-033, foundation, handoff, progress, todo, current state, roadmap |

---

## What was intentionally deferred to Sprint 5

- `mapAmadeusOfferToFlight()` response mapping
- Wiring `AmadeusFlightsProvider.search` to live Amadeus (still uses mock)
- Partial provider failure (show hotels if flights fail)
- Enabling live flights with `USE_MOCK_PROVIDERS=false`

---

## Architecture (after Sprint 4)

```
searchFlightOffers(request)
  → buildFlightOffersSearchParams()
  → amadeusFetch(GET /v2/shopping/flight-offers?...)
  → raw Amadeus JSON

AmadeusFlightsProvider.search → still mock (Sprint 5)
```

**Rules:**
- Amadeus types stay inside the Amadeus package (not in UI / shared models)
- Provider and orchestrator unchanged for user-facing search
- Requires Sprint 2 IATA enrichment + Sprint 3 OAuth

---

## Files changed

| Path | Change |
|------|--------|
| `lib/providers/flights/amadeus/types.ts` | **New** — raw API types |
| `lib/providers/flights/amadeus/flightOffers.ts` | **New** — query + HTTP |
| `docs/*` | Sprint 4 status, ADR-033, version 0.10.0 |
| `package.json` | Version **0.10.0** |

---

## How to verify

1. `npm run typecheck` — passes
2. `npm run build` — passes
3. App UX unchanged with default `USE_MOCK_PROVIDERS=true`
4. `searchFlightOffers` is available for Sprint 5 wiring (not called from the UI yet)

---

## Next sprint

**Sprint 5 — Flight mapping & live provider**  
Map Amadeus offers → `Flight`, replace mock delegation in `AmadeusFlightsProvider`.

See `docs/TODO.md` and `docs/CURRENT_STATE.md`.
