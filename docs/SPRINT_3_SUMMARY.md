# Sprint 3 Summary — Amadeus OAuth & Token Cache

**Status:** ✅ Complete  
**Branch:** `cursor/project-principles`  
**Dates:** July 2026  
**Product version:** 0.9.0  
**Decision record:** ADR-032 (`docs/DECISIONS.md`)

---

## Objective

Add **server-only** Amadeus authentication for the **test** environment, plus a reusable token cache and authenticated HTTP helper — without calling Flight Offers Search yet and without changing the UI.

---

## What was delivered

| Deliverable | Detail |
|-------------|--------|
| Generic TTL cache | `lib/api/cache.ts` — `getCached` / `setCached` / `deleteCached` / `clearCache` |
| Amadeus OAuth | `lib/providers/flights/amadeus/auth.ts` — `getAmadeusAccessToken()` |
| Authenticated HTTP | `lib/providers/flights/amadeus/client.ts` — `amadeusFetch()` / `getAmadeusAuthHeaders()` |
| Credentials | Read from `getAppConfig()` (`AMADEUS_API_KEY` / `AMADEUS_API_SECRET`) |
| Host | Test API: `test.api.amadeus.com` |
| Documentation | ADR-032, foundation, handoff, progress, todo, current state, roadmap |

---

## What was intentionally deferred to Sprint 4

- Flight Offers Search endpoint calls
- `mapAmadeusOfferToFlight()` implementation
- Wiring `AmadeusFlightsProvider.search` to live Amadeus (still uses mock)
- Partial provider failure handling
- Enabling live flights with `USE_MOCK_PROVIDERS=false`

---

## Architecture (after Sprint 3)

```
Amadeus adapter (server-only)
  auth.ts   → getAmadeusAccessToken() → TTL cache
  client.ts → amadeusFetch(path) → Bearer token + test base URL

AmadeusFlightsProvider.search → still mock until Sprint 4
```

**Rules:**
- UI and orchestrator never import Amadeus auth
- Cache is generic — Amadeus auth uses it privately
- Secrets stay server-side (`server-only`)

---

## Files changed

| Path | Change |
|------|--------|
| `lib/api/cache.ts` | Generic in-memory TTL cache |
| `lib/providers/flights/amadeus/auth.ts` | **New** — OAuth client-credentials |
| `lib/providers/flights/amadeus/client.ts` | Authenticated HTTP infrastructure |
| `docs/*` | Sprint 3 status, ADR-032, version 0.9.0 |

---

## How to verify

1. `npm run typecheck` — passes
2. `npm run build` — passes
3. App UX unchanged with `USE_MOCK_PROVIDERS=true` (default)
4. With Amadeus keys set, OAuth can be exercised from server-only Amadeus modules (not from the browser)

---

## Next sprint

**Sprint 4 — Amadeus Flight Offers**  
Call Flight Offers via `amadeusFetch`, map responses to `Flight`, and remove mock delegation from `AmadeusFlightsProvider`.

See `docs/TODO.md` and `docs/CURRENT_STATE.md`.
