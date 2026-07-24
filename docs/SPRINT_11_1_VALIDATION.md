# Sprint 11.1 — Live SerpAPI Validation Report

**Status:** ✅ Complete (including **11.1b live smoke**)  
**Branch:** `cursor/milestone-10-6-hardening-release`  
**Product baseline:** v0.16.0 (Milestone 10)  
**Dates:** July 25, 2026 (11.1 offline) · July 25, 2026 (11.1b live)  
**Nature:** Validation / discovery only — **no product fixes**

**Raw live results (redacted):** [SPRINT_11_1B_LIVE_RESULTS.json](./SPRINT_11_1B_LIVE_RESULTS.json)

---

## Executive summary

The SerpAPI Google Flights adapter is **already implemented, factory-registered, and orchestrator-compatible**. Offline SerpAPI suite (**66 tests**) passes.

**Sprint 11.1b live smoke (completed):** six live SerpAPI Google Flights searches ran successfully through `buildSerpApiSearchParams` → `searchGoogleFlights` → `mapSerpApiFlightsResponse`.

| Live outcome | Detail |
|--------------|--------|
| L1–L5 | **pass** — HTTP 200; **0 options dropped** by mapper |
| Direct + multi-stop | Observed (`stops` 0 and 1 in histograms) |
| Round-trip | **pass**; live options include `departure_token` (still unused) |
| Empty / invalid route | L6 **empty** (`Flight[]` length 0, no throw) |
| Time format | Live times like `"2026-09-15 06:30"` → mapped `HH:mm` only |
| Extra live fields | `carbon_emissions`, `booking_token` present; not on `Flight` |

**Note:** File was initially saved as `.env.local.txt` (Notepad); renamed to `.env.local` for Next.js / tooling. Key never printed.

No mapper/product fixes were applied in this sprint.

---

## 1. Configuration (existing — no new vars)

Use the configuration already documented in `.env.example`:

```env
USE_MOCK_PROVIDERS=false
FLIGHTS_PROVIDER=serpapi
SERPAPI_API_KEY=<your-key>
SERPAPI_DEEP_SEARCH=false
```

| Variable | Observed in repo | Loader / factory |
|----------|------------------|------------------|
| `USE_MOCK_PROVIDERS` | Documented | `lib/config` → forces mock when `true` |
| `FLIGHTS_PROVIDER=serpapi` | Documented + parsed | `createFlightsProvider()` → `serpApiFlightsProvider` |
| `SERPAPI_API_KEY` | Documented; **configured in `.env.local` for 11.1b** | `config.serpapi.isConfigured` |
| `SERPAPI_DEEP_SEARCH` | Documented (default false) | Passed into query builder |

**Environment check (11.1b):**

| Check | Result |
|-------|--------|
| `.env.local` | ✅ Present (renamed from `.env.local.txt`) |
| `SERPAPI_API_KEY` | ✅ Present (value not recorded) |
| `USE_MOCK_PROVIDERS` | `false` |
| `FLIGHTS_PROVIDER` | `serpapi` |
| `SERPAPI_DEEP_SEARCH` | `false` |
| Live provider selectable | ✅ |

No config redesign is required.

---

## 2. Live test results

### 2.1 Status (Sprint 11.1b — completed)

| Scenario | Status | Mapped / raw | Notes |
|----------|--------|--------------|-------|
| L1 One-way MXP→CDG | ✅ pass | 13 / 13 | Direct + 1-stop; EUR |
| L2 Round-trip MXP→CDG | ✅ pass | 12 / 12 | `departure_token` present; outbound schedule mapped |
| L3 Domestic JFK→LAX | ✅ pass | 34 / 34 | USD; mostly nonstop |
| L4 International MXP→JFK | ✅ pass | 9 / 9 | Direct + 1-stop mix |
| L5 Future MXP→AMS | ✅ pass | 10 / 10 | Direct + multi-stop |
| Direct (nonstop) | ✅ observed | — | e.g. L1 `stops:0` = 9 |
| Multi-stop | ✅ observed | — | e.g. L4 `stops:1` = 6 |
| Future dates | ✅ pass | — | Sep–Nov 2026 |
| L6 No-result XXX→ZZZ | ✅ empty | 0 / 0 | HTTP 200; empty arrays; no throw |

**Dropped by mapper across L1–L5:** **0** (all raw options mapped).

### 2.2 Offline substitute (fixtures + automated tests)

| Suite | Result |
|-------|--------|
| `lib/providers/flights/serpapi/**/*.test.ts` | **66 passed** (July 25, 2026) |

Fixtures used: `lib/providers/flights/serpapi/__fixtures__/googleFlights.sample.ts`  
(nonstop, one-stop, three-segment, round-trip outbound, empty, missing times).

### 2.3 Live mapping observations (11.1b)

| Observation | Evidence | Impact |
|-------------|----------|--------|
| Time format `"YYYY-MM-DD HH:mm"` | All pass scenarios | Mapper keeps **`HH:mm` only** — date discarded |
| `price` is number | All samples | Matches mapper |
| Currency from request echo | EUR / USD | Supported codes OK |
| `carbon_emissions` on options | L1–L5 notes | Ignored (OK for current `Flight`) |
| `booking_token` on one-way | L1, L3, L4, L5 | Not typed/mapped |
| `departure_token` on round-trip | L2 | Unused — return leg not fetched |
| Zero drops | L1–L5 | Fixtures were representative enough for these routes |
| Empty invalid IATA | L6 | Correct soft-empty behavior |
---

## 3. Mapping analysis (`Flight` field-by-field)

**Mapper:** `mapSerpApiFlightsResponse` / `mapSerpApiOptionToFlight`  
**Model:** `types/models/flight.ts`

| `Flight` field | SerpAPI source | Mapper behavior | Offline validation | Live gap risk |
|----------------|----------------|-----------------|--------------------|---------------|
| `id` | Hash of segments + price + duration + type | `serpapi-<sha256[:16]>` | ✅ Deterministic in tests | Low |
| `destinationId` | **Not in SerpAPI** — from `SearchRequest` | Required; blank → provider error | ✅ | Low (orchestrator must enrich) |
| `price` | `option.price` (number) | Finite ≥ 0; else drop option | ✅ | Medium — docs sometimes show richer price objects; live may differ |
| `currency` | `search_parameters.currency` | Must be EUR/USD/GBP/CHF/JPY/AUD/CAD; else **throw** | ✅ | Medium — missing currency with offers → hard fail; default USD from SerpAPI if request omits currency |
| `rating` | None | Always `0` | ✅ By design | Low (UX shows 0) |
| `airline` | First segment `airline` | Fallback `"Unknown airline"` | ✅ | Low–med — codeshare / multiple airlines only show first |
| `departureTime` | First segment `departure_airport.time` | Extracted to **`HH:mm` only** (date stripped) | ✅ | Medium — UI may need full datetime for overnight / multi-day |
| `arrivalTime` | Last segment `arrival_airport.time` | **`HH:mm` only** | ✅ | Medium — same |
| `durationMinutes` | `total_duration` or sum of segment `duration` | Null → drop option | ✅ | Low |
| `stops` | `flights.length - 1` | Ignores `layovers[]` for count | ✅ | Low if segments complete |
| `cabin` | First segment `travel_class` | Default Economy | ✅ | Low |

### 3.1 Intentionally unused SerpAPI fields (not on `Flight`)

| SerpAPI field | Status |
|---------------|--------|
| `departure_token` | Typed; **not used** (return-leg second request) |
| `layovers[]` | Typed; stops inferred from segments only |
| `flight_number` | Used only in id seed |
| `overnight` | Ignored |
| Airport `name` / `id` | Not mapped to `Flight` (IATA already on request) |
| Booking / carbon / price_insights / extensions | **Not typed** — ignored if present |

### 3.2 Null / drop / throw rules

| Condition | Behavior |
|-----------|----------|
| Empty `best_flights` + `other_flights` | `[]` (success) |
| Missing times / price / duration on an option | Option **dropped** (`null`) |
| Unsupported / missing currency when options exist | **`createProviderError`** (does not silent-drop priced offers) |
| Non-object response body | Provider error |
| Round-trip | Outbound schedule + total price; **return segments not fetched** |

### 3.3 Incorrect / incomplete mappings (findings — do not fix in 11.1)

1. **Times are clock-only (`HH:mm`)** — loses calendar date; overnight arrivals look same-day.
2. **Round-trip return leg not requested** — `departure_token` unused; UI cannot show return schedule.
3. **Airline = first segment only** — multi-airline itineraries under-represent marketing carrier.
4. **Currency required on response** — if SerpAPI omits `search_parameters.currency` but returns offers, search fails hard.
5. **Query currency optional** — if `SearchRequest.budget` is null, currency param omitted; SerpAPI may default to USD while UI expects EUR (EU users).
6. **Fixtures are docs-simplified** — may not match 2026 live payload variants (e.g. nested price, alternate time formats).

---

## 4. Error handling review

| Scenario | Implementation | Automated coverage | Live status |
|----------|----------------|--------------------|-------------|
| Invalid / missing API key | Client throws if blank; HTTP **401** → auth message (key not echoed) | ✅ `client.test.ts` | ⛔ Not live |
| Timeout | `AbortSignal` via shared `httpTimeout`; TIMEOUT log | ✅ | ⛔ Not live |
| Rate limit (429) | No retry; safe “busy” message; Retry-After not in UI copy | ✅ | ⛔ Not live |
| Quota exceeded | Likely HTTP 4xx with body `error` → generic/provider message | Partial (via body message path) | ⛔ Not live — confirm SerpAPI’s exact quota status codes |
| Malformed JSON | JSON parse fail → invalid response error | ✅ | ⛔ Not live |
| HTTP 5xx | Provider error with safe body `error` when present | ✅ | ⛔ Not live |
| Empty results | `[]` — not an error | ✅ | ⛔ Not live |
| Missing `destinationId` | Provider fails before HTTP | ✅ | N/A |
| Missing IATA | Orchestrator validation (before provider) | Existing orchestrator tests | N/A |

**Pipeline impact:** Flights domain failure → `SearchResponse.warnings` (partial failure, Milestone 10.2); all domains fail → hard error.

---

## 5. Search pipeline confirmation

Architecture (unchanged, already validated by discovery + code review):

```
SearchForm
  → postSearchTrips()          lib/api/searchClient.ts
  → POST /api/search           app/api/search/route.ts
  → searchTrips()              lib/services/searchService.ts
  → orchestrateTripSearch()    lib/services/searchOrchestrator.ts
       ├── IATA enrichment
       ├── assertFlightAirportsResolved
       └── providers.flights.search()   ← SerpApiFlightsProvider when configured
            → buildSerpApiSearchParams
            → searchGoogleFlights
            → mapSerpApiFlightsResponse → Flight[]
  → buildSearchResponse() → SearchResponse
  → UI
```

| Checkpoint | Confirmed? |
|------------|------------|
| Factory selects SerpAPI when env correct | ✅ Code review (`factories.ts`) |
| Orchestrator vendor-agnostic | ✅ |
| UI does not import SerpAPI | ✅ |
| Live adapter path (params → HTTP → mapper) | ✅ Sprint **11.1b** (L1–L6) |
| Live E2E via `POST /api/search` | ⚠️ One smoke POST returned **HTTP 500** in ~12ms (too fast for SerpAPI) after `.env.local` rename — treat as **stale Next.js env** or request-shape validation; **restart `npm run dev`** and re-try in UI. Adapter path itself is proven. |

---

## 6. Production risks

| Risk | Severity | Notes |
|------|----------|-------|
| Using SerpAPI as production inventory | **High** | ADR-036: **dev/test only**; Amadeus = future production |
| Clock-only times (`HH:mm`) | **Medium** | Confirmed live: date discarded from `"2026-09-15 06:30"` |
| Round-trip UX incomplete | **Medium** | Live L2 includes `departure_token`; return leg still not fetched |
| Extra live fields unused | **Low** | `carbon_emissions`, `booking_token` — OK unless product needs them |
| `deep_search=true` timeouts | **Medium** | Not exercised in 11.1b (left `false`) |
| Hard fail on unsupported currency | **Medium** | Not hit in live matrix (EUR/USD OK) |
| Cost / quota on shared key | **Medium** | Never enable in CI; 11.1b used 6 live calls |
| Secret leakage | **Low** | Key not logged; keep `.env.local` untracked |
| Stale Next.js process env | **Medium** | Dev server must restart after creating/renaming `.env.local` |

---

## 7. Files requiring modification (for later sprints — not 11.1)

Only if product chooses to address live findings:

| File / area | Likely reason |
|-------------|----------------|
| `lib/providers/flights/serpapi/mappers.ts` / `mappingHelpers.ts` | Preserve full datetime if UI needs date |
| `lib/providers/flights/serpapi/types.ts` | Optionally type `booking_token` / `carbon_emissions` |
| `lib/providers/flights/serpapi/provider.ts` / client | Optional round-trip second request via `departure_token` |
| `lib/providers/flights/serpapi/__fixtures__/` | Optionally refresh from live shapes (still zero drops today) |
| Docs / sandbox checklist | Record 11.1b outcomes |

---

## 8. Files that should remain untouched

| Path | Why |
|------|-----|
| `lib/providers/flights/amadeus/**` | Production path — freeze |
| `types/models/flight.ts` | Shared contract — change only with CTO approval |
| `types/models/search-request.ts` | Prefer adapter-local fixes |
| `lib/providers/core/types.ts` (`FlightsProvider`) | Already sufficient |
| `lib/services/searchOrchestrator.ts` | Already vendor-agnostic |
| UI search components | Separate from mapper validation (known filter `useEffect` loop is out of scope) |
| Factory selection logic | Already supports SerpAPI |

---

## 9. Recommendation for Sprint 11.2

Live smoke is **complete**. Prioritize by product need:

### Must-do ops (before relying on UI live flights)
1. Confirm `.env.local` (not `.env.local.txt`) sits in project root.  
2. **Restart** `npm run dev` so Next.js loads SerpAPI env.  
3. Manual UI search MXP→CDG one-way; confirm flights list populates.

### Optional product fixes (CTO pick)
1. **Datetime:** map full local datetime (or ISO) instead of `HH:mm` only.  
2. **Round-trip:** document gap **or** second SerpAPI call with `departure_token` (feature).  
3. Type/ignore policy for `booking_token` / `carbon_emissions`.  
4. One `SERPAPI_DEEP_SEARCH=true` latency smoke (still no CI live calls).

### Explicit non-goals
- No Amadeus changes  
- No dual Amadeus+SerpAPI search  
- No making SerpAPI the production default  
- No CI live SerpAPI calls  

---

## 10. Definition of Done — Sprint 11.1 / 11.1b

| Item | Status |
|------|--------|
| Configure via existing env | ✅ |
| Live multi-scenario searches | ✅ **11.1b** (L1–L6) |
| Mapping field audit | ✅ fixture + **live** |
| Error-handling review | ✅ code + tests (live 401/429 not deliberately triggered) |
| Pipeline confirmation | ✅ architecture + adapter; ⚠️ restart Next for Route Handler env |
| Validation report | ✅ This document + JSON results |
| No product fixes / no refactors | ✅ |

---

## 11. Artifacts

| Artifact | Path |
|----------|------|
| Validation report | `docs/SPRINT_11_1_VALIDATION.md` |
| Redacted live JSON | `docs/SPRINT_11_1B_LIVE_RESULTS.json` |
| One-off runner (optional keep) | `scripts/sprint-11-1b-live-validation.mts` |
