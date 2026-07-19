# Sprint 6 Summary — Live Amadeus Provider

**Status:** ✅ Complete  
**Branch:** `cursor/project-principles`  
**Dates:** July 2026  
**Product version:** 0.12.0  
**Milestone tag:** `flight-api-v1`  
**Decision record:** ADR-035 (`docs/DECISIONS.md`)

---

## Objective

Wire `AmadeusFlightsProvider.search` to the existing Flight Offers HTTP + mapping pipeline, with `destinationId` validation, without changing registry selection logic.

---

## What was delivered

| Deliverable | Detail |
|-------------|--------|
| Live provider | `searchFlightOffers` → `mapAmadeusFlightOffersResponse` → `Flight[]` |
| `destinationId` check | Missing/blank → `createProviderError` (mapper never gets `""`) |
| Selection unchanged | Mock vs Amadeus still driven by `USE_MOCK_PROVIDERS` / keys |
| Client boundary | `currencyService` uses `mockCurrencyProvider` directly (debt recorded) |
| Documentation | ADR-035, foundation, handoff, progress, todo, current state, roadmap |

---

## Provider pipeline

```
AmadeusFlightsProvider.search(request)
  → require destinationId
  → searchFlightOffers(request)
  → mapAmadeusFlightOffersResponse(raw, { destinationId })
  → Flight[]
```

**Selection:**

| Env | Result |
|-----|--------|
| `USE_MOCK_PROVIDERS=true` (default) | mock flights |
| `USE_MOCK_PROVIDERS=false` + Amadeus keys | live Amadeus |
| Amadeus selected, keys missing | mock fallback |

---

## Technical debt

`currencyService` no longer goes through the provider registry. This avoided pulling Amadeus `server-only` HTTP into the client budget UI after provider wiring. Restore DI without a client→Amadeus import path (see ADR-035).

---

## What remains (backlog)

- Partial provider failure
- Mapper / Flight Offers unit tests
- currencyService registry cleanup

---

## Files changed (code — earlier step)

| Path | Change |
|------|--------|
| `lib/providers/flights/amadeus/provider.ts` | Live pipeline + `destinationId` validation |
| `lib/services/currencyService.ts` | Direct mock currency (client boundary) |
| `docs/*` | Sprint 6 status, ADR-035, version 0.12.0 |
| `package.json` | Version **0.12.0** |

---

## How to verify

1. `npm run typecheck` / `npm run build` — pass
2. Default env → mock flights in UI
3. With Amadeus env + keys → live Flight Offers results on search

---

## Flight API status

**Sprints 1–6 complete** for the Amadeus flight search foundation (server boundary → IATA → OAuth → HTTP → mapping → live provider).

Marked in git as annotated tag **`flight-api-v1`** (product **v0.12.0**).
