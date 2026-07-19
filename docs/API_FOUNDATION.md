# API Foundation — Architecture Reference

This document is the single reference for the Glooconn API foundation (v0.8.0). It describes how data flows from the UI to providers and how to swap mock adapters for real APIs.

---

## Layer diagram

```
┌─────────────────────────────────────────────────────────────┐
│  UI (components, hooks)                                     │
│  — trip search: postSearchTrips() → POST /api/search        │
│  — other data: lib/services (e.g. destinations)             │
│  — uses ServiceState<T> via useServiceQuery                 │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP (trip search)
┌───────────────────────────▼─────────────────────────────────┐
│  app/api/search/route.ts                                    │
│  — calls searchTrips() on the server                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  lib/services (server-only for trip search)                 │
│  searchService → searchOrchestrator                         │
│    1. iataResolution (enrich ids + IATA)                    │
│    2. assert flights have airports (business rule)          │
│    3. parallel domain providers                             │
│  context.ts — getServiceProviders() (simple DI)             │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  lib/providers/core                                         │
│  registry.ts — getProviderRegistry()                        │
│  factories.ts — createFlightsProvider(), etc.               │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  destinations/mock   flights/mock|amadeus   hotels/mock
        │                   │                   │
        └───────────────────┴───────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  types/models — shared domain types (Hotel, Flight, …)      │
└─────────────────────────────────────────────────────────────┘

Cross-cutting:
  lib/api/     — errors, ServiceResult, HTTP clients, validation, responses
  lib/config/  — environment variables, API key slots
```

---

## Folder structure

| Path | Purpose |
|------|---------|
| `lib/config/` | `getAppConfig()` — all env vars |
| `lib/api/` | Errors, `ServiceResult`, `searchClient`, validation, `toJsonResponse` |
| `lib/api/searchClient.ts` | Browser-safe `postSearchTrips()` → `POST /api/search` |
| `lib/services/` | Server entry point for travel data (`searchService` is server-only) |
| `lib/services/iataResolution.ts` | Destination catalog → optional `originIata` / `destinationIata` |
| `lib/services/searchOrchestrator.ts` | Enrichment + flight airport validation + parallel providers |
| `lib/providers/core/` | Interfaces, registry, factories |
| `lib/providers/<domain>/mock/` | Mock adapter class |
| `lib/providers/<domain>/<vendor>/` | Real API adapter (e.g. `flights/amadeus/`) |
| `lib/providers/mock/shared.ts` | Shared mock filter/pricing logic |
| `types/models/` | Provider-independent domain models |
| `lib/results/` | Client-side filter/sort + legacy mock data files |

**Naming note:** Ground transport uses folder `ground/` but the interface is `TransportProvider` and env var is `TRANSPORT_PROVIDER`.

---

## Request flow (search)

```
Browser (SearchResultsPage)
  → postSearchTrips(search)                 [lib/api/searchClient.ts]
    → POST /api/search                      [app/api/search/route.ts]
      → searchTrips()                       [lib/services/searchService.ts — server-only]
        → validateSearchRequest()           [lib/api/validation.ts]
        → orchestrateTripSearch(request)
            1. enrichSearchRequestWithAirports()   [lib/services/iataResolution.ts]
               — resolve originId / destinationId via DestinationProvider
               — set optional originIata / destinationIata from Destination.iataCode
            2. assertFlightAirportsResolved()      [searchOrchestrator — business rule]
               — if productTypes includes "flights" and IATA missing → VALIDATION_ERROR
            3. Promise.all(hotels, flights, transport)
            4. mergeSearchResults()
      → toJsonResponse()
  → serviceResultFromApiResponse()
  → filterResults() + sortResults()         [client]
```

Step list:

1. `useSearchForm.submit()` → `validateAndBuildSearchRequest()` → `SearchRequest`
2. Navigate to results via `buildResultsUrlFromRequest(request)` (URL params)
3. `SearchResultsPage` → `useServiceQuery(() => postSearchTrips(search))`
4. `postSearchTrips()` → `POST /api/search` with JSON `SearchRequest`
5. Route Handler → `searchService.searchTrips()` → `validateSearchRequest()` → `runService()`
6. Orchestrator enriches ids + IATA, validates flights need airports, then calls providers
7. `mergeSearchResults()` → `toJsonResponse()` → `serviceResultFromApiResponse()` in the client
8. UI filters/sorts in the browser

### IATA enrichment (Sprint 2)

| Concern | Owner | Responsibility |
|---------|-------|----------------|
| Data enrichment | `lib/services/iataResolution.ts` | Map places → catalog destinations → optional IATA codes |
| Business rule | `searchOrchestrator` | Fail when flights are requested but airports cannot be resolved |
| Flight HTTP | Not yet | Amadeus client is Sprint 3 |

**Why enrichment is in the orchestrator path (via helper):**

- Runs on the server after Sprint 1’s boundary — safe for catalog lookups
- All providers receive one enriched `SearchRequest`
- Flight adapters never call `DestinationProvider` themselves

**Why the helper only enriches:**

- Pure, reusable, no product-type policy
- Missing codes return empty fields — callers decide what to do
- Future airport metadata can extend `AirportRef` without touching UI

**Why validation is in the orchestrator:**

- Product rules (`productTypes` includes `"flights"`) are orchestration concerns
- Hotels/transport-only searches must not fail when IATA is absent
- When flights are selected and IATA is missing → clear validation error (no silent skip)

**Why `originIata` / `destinationIata` are optional on `SearchRequest`:**

- Hotels and ground transport do not need airport codes
- UI and URL params never collect IATA — server fills them when possible
- Keeps the model provider-independent (not Amadeus-specific)

### SearchRequest builder (`lib/search/request.ts`)

| Function | Purpose |
|----------|---------|
| `buildSearchRequest(form)` | Form state → canonical model |
| `validateAndBuildSearchRequest(form)` | Validate + build (used on submit) |
| `buildSearchRequestFromData(data)` | Legacy `SearchData` → `SearchRequest` |
| `searchRequestToParams(request)` | URL query serialization |
| `buildResultsUrlFromRequest(request)` | Results page href |
| `serializeSearchRequest(request)` | JSON-ready body for `POST /api/search` |

The search form does not call HTTP directly — navigation uses URL params. The results page calls `POST /api/search`. Form/URL do **not** serialize IATA fields; the orchestrator resolves them on each search.

### HTTP Route Handler

`POST /api/search` — accepts JSON `SearchRequest`, calls `searchTrips()` (server-only), returns `toJsonResponse()`.

### HTTP client (`lib/api/searchClient.ts`)

| Function | Purpose |
|----------|---------|
| `postSearchTrips(search)` | `fetch("/api/search")` → `serviceResultFromApiResponse()` |

Reuses `serviceResultFromApiResponse()` from `lib/api/responses.ts` — generic for future domain API clients.

---

## Swapping Mock → Amadeus (flights)

**Prerequisite (done in Sprint 2):** `SearchRequest` can carry `originIata` / `destinationIata` after orchestrator enrichment. Flight providers should read those fields — not resolve destinations themselves.

**Files to implement (Sprint 3 — no UI changes):**

| Step | File | Action |
|------|------|--------|
| 1 | `lib/providers/flights/amadeus/client.ts` | OAuth + Flight Offers Search HTTP |
| 2 | `lib/providers/flights/mappers.ts` | `mapAmadeusOfferToFlight()` |
| 3 | `lib/providers/flights/amadeus/provider.ts` | Replace mock delegation with client + mapper |
| 4 | `.env.local` | `USE_MOCK_PROVIDERS=false`, `FLIGHTS_PROVIDER=amadeus`, keys |

**Already wired:**

- `createFlightsProvider()` in `factories.ts` returns `amadeusFlightsProvider` when configured
- `AmadeusFlightsProvider` implements `FlightsProvider`
- Config validation checks `AMADEUS_API_KEY` + `AMADEUS_API_SECRET`
- IATA enrichment + flight airport validation in the orchestrator

---

## Error handling

| Type | Factory | HTTP | UI message |
|------|---------|------|------------|
| Validation | `createValidationError()` | 400 | Exact message |
| Provider | `createProviderError()` | 502 | Generic travel data message |
| Not found | `createNotFoundError()` | 404 | Exact message |
| Unknown | `createUnexpectedError()` | 500 | Generic retry message |

Services use `runService()` — never raw try/catch.

**Flight IATA validation:** when `productTypes` includes `"flights"` and `originIata` or `destinationIata` is missing after enrichment, the orchestrator throws `createValidationError(...)` asking the user to pick cities from autocomplete. `runService` maps this to a failed `ServiceResult`; the UI shows the exact message.

---

## Environment variables

See `.env.example`. Summary:

- `USE_MOCK_PROVIDERS=true` — default, no API keys needed
- `FLIGHTS_PROVIDER=amadeus` — selects Amadeus adapter (when mock flag is false)
- API keys are **server-only** (no `NEXT_PUBLIC_` prefix)
- Read via `getAppConfig()` — never `process.env` in components

---

## Deprecated / legacy (do not use in new code)

| Item | Use instead |
|------|-------------|
| `searchTrips()` from client components | `postSearchTrips()` from `@/lib/api` |
| `lib/destinations.ts` sync helpers | `@/lib/services` |
| `lib/results/getResultsForSearch` | `postSearchTrips()` (UI) or `searchTrips()` (server) |
| `getSearchProvider()` | Domain providers via registry |
| `SearchProvider` interface | `HotelsProvider`, `FlightsProvider`, etc. |
| `SearchData` | `SearchRequest` via `lib/search/request.ts` |
| `toSearchRequest()` in searchMappers | `buildSearchRequestFromData()` (delegates) |
| `getApiEnv()` | `getAppConfig().providers` |

---

## Testing provider swaps

```typescript
import { setServiceProviders, resetServiceProviders } from "@/lib/services";
import { mockFlightsProvider } from "@/lib/providers/flights/mock";

beforeEach(() => {
  setServiceProviders({ ...getServiceProviders(), flights: mockFlightsProvider });
});

afterEach(() => resetServiceProviders());
```

---

## Planned (not implemented)

- Amadeus OAuth + Flight Offers Search (Sprint 3)
- Partial provider failure (show hotels/transport if flights fail)
- `SearchResponse` wrapper model in orchestrator
- Move mock datasets from `lib/results/mock*.ts` into `lib/providers/*/mock/data.ts`
- Booking, Omio, Google Maps adapter folders (same pattern as Amadeus)
- `server-only` on additional service modules (orchestrator, destination service)
