# Sprint 2 Summary — IATA Resolution

**Status:** ✅ Complete  
**Branch:** `cursor/project-principles`  
**Dates:** July 2026  
**Decision record:** ADR-031 (`docs/DECISIONS.md`)

---

## Objective

Prepare trip search for real flight APIs (Amadeus in Sprint 3) by resolving origin and destination **airport IATA codes** on the server — without changing the UI or implementing Amadeus HTTP yet.

---

## What was delivered

| Deliverable | Detail |
|-------------|--------|
| Model fields | Optional `originIata` / `destinationIata` on `SearchRequest` |
| Enrichment helper | `lib/services/iataResolution.ts` — maps places → catalog destinations → IATA |
| Orchestrator wiring | Enrich before providers; validate when flights are requested |
| Validation | Clear error if flights are selected and airports cannot be resolved |
| Non-flight searches | Hotels / transport-only still work without IATA |
| Documentation | `API_FOUNDATION`, `AI_HANDOFF`, `PROGRESS`, `TODO`, `CURRENT_STATE`, `ROADMAP`, ADR-031 |

---

## What was intentionally deferred to Sprint 3

- Amadeus OAuth + Flight Offers Search client
- Flight offer → `Flight` mapper implementation
- OAuth token caching
- Partial provider failure (show hotels if flights fail)
- Enabling `FLIGHTS_PROVIDER=amadeus` in production

---

## Architecture (after Sprint 2)

```
Browser → POST /api/search → searchTrips() [server-only]
  → enrichSearchRequestWithAirports()
  → assertFlightAirportsResolved()   (only when flights selected)
  → hotels / flights / transport providers
```

**Rules:**
- UI never collects or displays IATA codes
- Flight providers must **not** call the destination catalog — they read enriched `SearchRequest` fields
- Enrichment helper does not enforce flight product rules; the orchestrator does

---

## Files changed

| Path | Change |
|------|--------|
| `types/models/search-request.ts` | Added optional IATA fields |
| `lib/services/iataResolution.ts` | **New** — enrichment helpers |
| `lib/services/searchOrchestrator.ts` | Enrichment + flight airport assertion |
| `docs/*` | Sprint 2 status, ADR-031, API foundation updates |

---

## How to verify

1. `npm run build` — production build succeeds
2. Search with flights selected and catalog cities (e.g. Milan → Paris) — results load
3. Search hotels-only — works without requiring IATA
4. If airports cannot be resolved for a flights search — user sees a clear validation message

---

## Next sprint

**Sprint 3 — Amadeus flight integration**  
Implement the Amadeus client and mapper using `originIata` / `destinationIata` already on `SearchRequest`.

See `docs/TODO.md` and `docs/CURRENT_STATE.md`.
