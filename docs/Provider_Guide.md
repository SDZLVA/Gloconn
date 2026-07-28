# Glooconn — Flights Provider Guide

This guide explains the **multi-provider flights architecture** and how to add a **new flights vendor** (Duffel, Kiwi, Skyscanner, etc.) without breaking the API foundation.

**Read first:** [API_FOUNDATION.md](./API_FOUNDATION.md), [ADR-036](./DECISIONS.md) (SerpAPI), and ADRs 021–035 for Amadeus history.

**Rules of the road:**

- Implement `FlightsProvider` — do not invent a parallel contract.
- Map every vendor response to the shared `Flight` model — no vendor fields in `types/models/`.
- Keep credentials and HTTP **server-only**.
- Prefer a new folder under `lib/providers/flights/<vendor>/` — do not edit unrelated vendors (especially freeze Amadeus unless CTO-approved bugfix).

---

## Architecture overview

Glooconn selects one flights adapter at runtime. The UI, Route Handler, service layer, and orchestrator never import vendor-specific modules.

```
SearchRequest
      │
      ▼
Provider Factory          (lib/providers/core/factories.ts)
      │
      ▼
FlightsProvider           (mock | amadeus | serpapi)
      │
      ├── Query Builder   (SearchRequest → vendor query params)
      ├── HTTP Client     (authenticated / keyed fetch → raw JSON)
      └── Response Mapper (raw JSON → Flight[])
      ▼
Flight[]
```

| Layer | Module(s) | Responsibility |
|-------|-----------|----------------|
| UI | `postSearchTrips()` | Never imports providers |
| Route / service | `POST /api/search` → `searchTrips` | Validation + orchestrator entry |
| Orchestrator | `searchOrchestrator.ts` | IATA enrichment + flight airport rules; calls `flights.search(enrichedRequest)` |
| Factory / registry | `factories.ts`, `registry.ts` | Selects mock vs vendor from `getAppConfig()` |
| Query builder | e.g. `googleFlights.ts`, `flightOffers.ts` | Map `SearchRequest` → vendor query params; fail fast on missing IATA |
| HTTP client | e.g. `client.ts` | Server-only fetch, timeouts, safe errors, structured logs |
| Response mapper | e.g. `mappers.ts` | Vendor JSON → `Flight[]`; drop incomplete offers; currency errors |
| Shared models | `types/models/flight.ts` | Provider-independent output |

Switching vendors must not require UI or orchestrator changes.

---

## Request lifecycle (detail)

1. **Browser** builds `SearchRequest` and calls `POST /api/search`.
2. **Orchestrator** enriches IATA codes and validates airports when flights are requested.
3. **`createFlightsProvider()`** reads `USE_MOCK_PROVIDERS` + `FLIGHTS_PROVIDER`:
   - mock flag on → `mock`
   - live + unset `FLIGHTS_PROVIDER` → default **`amadeus`**
   - live + `amadeus` / `serpapi` / `mock` → that adapter
   - invalid name → `ProviderError` (no silent fallback)
   - selected vendor missing keys → mock + console warning
4. **Vendor `search(request)`** runs query builder → HTTP → mapper.
5. **Orchestrator** merges `Flight[]` into the trip search response.

---

## Purpose of `FlightsProvider`

`FlightsProvider` is the **only** flights contract used by the search orchestrator.

```ts
interface FlightsProvider extends BaseProvider {
  readonly name: string;
  search(request: SearchRequest): Promise<Flight[]>;
}
```

---

## Required folder structure

```
lib/providers/flights/
  mock/                 # Default / CI
  amadeus/              # Long-term production path
  serpapi/              # Dev/test second provider (ADR-036, v0.15.0)
  <vendor>/             # NEW adapter (e.g. duffel/)
    index.ts            # Public barrel — export provider (+ optional public mapper)
    provider.ts         # FlightsProvider implementation
    client.ts           # Authenticated / keyed HTTP (server-only)
    <searchModule>.ts   # Query builder + raw search function
    mappers.ts          # Vendor JSON → Flight[]
    mappingHelpers.ts   # Pure helpers (optional split)
    types.ts            # Vendor-only response shapes (package-private)
    log.ts              # Structured server-only logs
    __fixtures__/       # Checked-in sample JSON for tests
    *.test.ts
```

Shared timeout helpers live in `lib/api/httpTimeout.ts` (prefer reuse over copying).  
Do **not** place vendor types in `types/models/`.  
Do **not** import one vendor’s internals from another vendor package.

---

## Required files for a provider

| File | Required? | Role |
|------|-----------|------|
| `provider.ts` | Yes | Implements `FlightsProvider` |
| `index.ts` | Yes | Public exports only |
| `types.ts` | Yes | Raw vendor shapes (internal) |
| Search/HTTP module | Yes | Build params + fetch raw JSON |
| `mappers.ts` | Yes | Map to `Flight[]` |
| `__fixtures__/` | Yes | Deterministic tests |
| `*.test.ts` | Yes | Unit + mocked HTTP + integration |
| `log.ts` | Strongly recommended | Structured logs |
| Timeout helpers | Recommended | Prefer `lib/api/httpTimeout.ts` |

---

## Required interface implementation

1. `readonly name` — stable vendor id string (e.g. `"serpapi"`, `"duffel"`).
2. `search(request)`:
   - Validate adapter-local preconditions (e.g. non-empty `destinationId`) with `createProviderError`.
   - Rely on orchestrator for IATA when flights are requested (`originIata` / `destinationIata`).
   - Call vendor HTTP → map → return `Flight[]`.
   - Return `[]` for empty successful responses.
3. Export a singleton instance from the barrel for the factory.

**Do not** change `FlightsProvider`, `Flight`, or `SearchRequest` to fit a vendor.

---

## Configuration rules

| Rule | Detail |
|------|--------|
| Central config only | Read secrets via `getAppConfig()` / `lib/config` — never `process.env` in UI or random modules |
| Document in `.env.example` | Every new env var before or with loading implementation |
| Selection | `USE_MOCK_PROVIDERS=true` → always mock; when `false`, `FLIGHTS_PROVIDER=<vendor>` selects the adapter |
| Default live vendor | Missing `FLIGHTS_PROVIDER` → **amadeus** |
| Credentials | Server-only — never `NEXT_PUBLIC_` |
| Missing keys | Factory falls back to mock + console warning; validation errors when live vendor is intended |
| Validation | Extend `validateAppConfig` when the vendor is selected and mocks are off |
| Invalid name | Factory throws `ProviderError` — do not silently fall back |

Example env pattern:

```env
USE_MOCK_PROVIDERS=false
FLIGHTS_PROVIDER=<vendor>
<VENDOR>_API_KEY=
```

**SerpAPI (live / production-capable):**

```env
USE_MOCK_PROVIDERS=false
FLIGHTS_PROVIDER=serpapi
SERPAPI_API_KEY=
SERPAPI_DEEP_SEARCH=false
```

---

## Mapping rules

| Rule | Detail |
|------|--------|
| Shared output | Always `Flight` from `types/models/flight.ts` |
| `destinationId` | From enriched `SearchRequest` — not invented from vendor city names |
| Drop incomplete offers | Return `null` and filter when required fields are missing |
| Currency | Prefer response currency; fall back to request / vendor default when missing; unsupported codes → `createProviderError` (do not silently drop a priced offer) |
| Schedule times | Prefer full local date-time when the vendor provides it (`Flight` allows ISO / localized strings) |
| Ratings | Do not fabricate; use `0` when the vendor has no rating |
| Schedule fields | Prefer outbound/first usable itinerary; document round-trip gaps |
| Public surface | Prefer one public response mapper; keep helpers package-private |

---

## Error handling rules

| Situation | Pattern |
|-----------|---------|
| Invalid adapter input | `createProviderError` before HTTP |
| Missing IATA for flights | Orchestrator `createValidationError` (do not duplicate in every vendor) |
| Vendor HTTP / API failure | `createProviderError` with a safe user-facing message |
| Empty results | `[]` |
| Secrets in errors | Never include API keys, tokens, or full request URLs with credentials |

Use existing `ApiError` / `createProviderError` — do not invent a parallel error type. Do not swallow or rewrap errors in the provider.

---

## Logging rules

| Rule | Detail |
|------|--------|
| Server-only | Logs live in Route Handler / provider path only |
| Structured fields | e.g. `provider`, `operation`, `httpStatus?`, `durationMs`, `errorCode?` |
| Never log | API keys, tokens, Authorization headers, full payloads, PII, credentialed URLs |
| Keep vendor-local | Prefer `<vendor>/log.ts` so packages stay independent |
| Emit once | One success or failure log per HTTP attempt |

---

## Testing requirements

| Requirement | Detail |
|-------------|--------|
| Runner | `npm test` (Node `node:test` via `tsx`; `server-only` stub) |
| No live vendor in CI | Mock `globalThis.fetch`; use `__fixtures__/` |
| Unit | Query builder, pure helpers, mappers |
| Provider | Collaborators mocked or HTTP mocked; call order + error propagation |
| Integration | Factory → `Provider.search` with mocked HTTP → `Flight[]` |
| Config | Credential required when live; mock bypass |
| Logging | Success/failure once; no secrets in log payload |
| Negatives | Auth/rate-limit/server errors; validation before HTTP |
| Regression | Existing Amadeus + mock suites must remain green |

---

## How to add a new provider

### 1. Required files

Create `lib/providers/flights/<vendor>/` with the files listed above. Follow Amadeus or SerpAPI as reference packages.

### 2. Config

1. Add the vendor name to `ProviderName` in `lib/config/types.ts`.
2. Load credentials in `lib/config/load.ts` only.
3. Validate in `lib/config/validate.ts` when live selection is intended.
4. Document env vars in `.env.example`.

### 3. Factory

Add a `case "<vendor>"` in `createFlightsProvider()` that returns the singleton (mock fallback when keys missing). No request logic in the factory.

### 4. Required tests

- Config load/validate
- Query builder
- HTTP client (mocked `fetch`)
- Mapper + fixtures
- Provider orchestration
- Factory selection
- End-to-end integration (factory → `Flight[]`)
- Logging safety (no API keys / credentialed URLs)

### 5. Required review process

1. Ship in small CTO-approved slices (config → types → query → HTTP → mapper → provider → factory → docs).
2. Do not modify unrelated vendors (especially Amadeus) unless approved.
3. Do not change `Flight`, `SearchRequest`, or search orchestration.
4. CI green (`npm test`, typecheck, lint, build).
5. Update [Provider_Guide.md](./Provider_Guide.md), [API_FOUNDATION.md](./API_FOUNDATION.md), [AI_HANDOFF.md](./AI_HANDOFF.md), [CURRENT_STATE.md](./CURRENT_STATE.md), and an ADR if the decision is material.
6. State production vs **dev/test** role clearly when the vendor is temporary.

---

## Definition of Done (any future flights provider)

- [ ] New package under `lib/providers/flights/<vendor>/` only (no edits to unrelated vendors unless approved)
- [ ] Implements `FlightsProvider`; `Flight` / `SearchRequest` unchanged
- [ ] Config load + validate + `.env.example` entries
- [ ] Factory `case` selects vendor; mock fallback when misconfigured; invalid name throws
- [ ] Default app behavior still mock (`USE_MOCK_PROVIDERS=true`)
- [ ] Mapper + fixtures + unit/integration tests; CI green
- [ ] Structured logging without secrets
- [ ] Docs: ADR (if material), `API_FOUNDATION`, `AI_HANDOFF`, `CURRENT_STATE` / `TODO` as needed
- [ ] Production vs dev/test role stated clearly when the vendor is temporary

---

## Hotels provider (SerpAPI — Milestone 12)

Same layered pattern as flights. Orchestrator calls `hotels.search(enrichedRequest)` when `"hotels"` is in `productTypes`.

```
lib/providers/hotels/
  mock/                 # Default / CI
  serpapi/              # Live Google Hotels (Sprint 12.2–12.4)
    index.ts
    provider.ts         # HotelsProvider
    query.ts            # SearchRequest → google_hotels params
    client.ts           # HTTP (shared SerpAPI log + search URL)
    mapper.ts           # properties[] → Hotel[]
    mappingHelpers.ts   # Hotel-specific + shared currency helpers
    types.ts            # Vendor JSON (package-private)
    __fixtures__/
    *.test.ts
```

**Factory:** `HOTELS_PROVIDER=serpapi` when `USE_MOCK_PROVIDERS=false` and `SERPAPI_API_KEY` is set. Missing key → mock + console warning.

**Env (shared SerpAPI key with flights):**

```env
USE_MOCK_PROVIDERS=false
HOTELS_PROVIDER=serpapi
SERPAPI_API_KEY=
```

**Documented limitations:** requires `returnDate` for check-out; `children_ages` defaults to `8` per child until ages exist on `SearchRequest`; no hotel `rooms` API param; maps `properties[]` only (not `ads[]`).

**Evidence:** [SPRINT_12_3_VALIDATION.md](./SPRINT_12_3_VALIDATION.md) · [SPRINT_12_4_PRODUCTION_READINESS.md](./SPRINT_12_4_PRODUCTION_READINESS.md)

---

## Current vendors

| Folder | Role | Status |
|--------|------|--------|
| `mock/` | Default local + CI | Active |
| `amadeus/` | **Long-term production** | Complete through Sprint 8; maintenance / Enterprise path |
| `serpapi/` (flights) | **Live — production-capable** | v0.17.0 |
| `serpapi/` (hotels) | **Live — production-capable** | Milestone 12 — release prep v0.18.0 |

---

## Related docs

| File | Purpose |
|------|---------|
| [API_FOUNDATION.md](./API_FOUNDATION.md) | End-to-end API layers |
| [DECISIONS.md](./DECISIONS.md) | ADR-021+ provider architecture; ADR-036 SerpAPI |
| [AI_HANDOFF.md](./AI_HANDOFF.md) | Do-nots for assistants |
| [CURRENT_STATE.md](./CURRENT_STATE.md) | Active release snapshot |
| [releases/v0.15.0.md](./releases/v0.15.0.md) | SerpAPI multi-provider release notes |
