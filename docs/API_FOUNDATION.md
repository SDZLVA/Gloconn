# API Foundation — Architecture Reference

This document is the single reference for the Glooconn API foundation (v0.7.1). It describes how data flows from the UI to providers and how to swap mock adapters for real APIs.

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
│  searchService, searchOrchestrator, destinationService      │
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
| `lib/providers/core/` | Interfaces, registry, factories |
| `lib/providers/<domain>/mock/` | Mock adapter class |
| `lib/providers/<domain>/<vendor>/` | Real API adapter (e.g. `flights/amadeus/`) |
| `lib/providers/mock/shared.ts` | Shared mock filter/pricing logic |
| `types/models/` | Provider-independent domain models |
| `lib/results/` | Client-side filter/sort + legacy mock data files |

**Naming note:** Ground transport uses folder `ground/` but the interface is `TransportProvider` and env var is `TRANSPORT_PROVIDER`.

---

## Request flow (search)

1. `useSearchForm.submit()` → `validateAndBuildSearchRequest()` → `SearchRequest`
2. Navigate to results via `buildResultsUrlFromRequest(request)` (URL params)
3. `SearchResultsPage` → `useServiceQuery(() => postSearchTrips(search))`
4. `postSearchTrips()` → `POST /api/search` with JSON `SearchRequest`
5. Route Handler → `searchService.searchTrips()` → `validateSearchRequest()` → `runService()`
6. `searchOrchestrator.orchestrateTripSearch(request)` → enriches `destinationId` → parallel provider calls
7. `mergeSearchResults()` → `toJsonResponse()` → `serviceResultFromApiResponse()` in the client
8. UI filters/sorts in the browser

### SearchRequest builder (`lib/search/request.ts`)

| Function | Purpose |
|----------|---------|
| `buildSearchRequest(form)` | Form state → canonical model |
| `validateAndBuildSearchRequest(form)` | Validate + build (used on submit) |
| `buildSearchRequestFromData(data)` | Legacy `SearchData` → `SearchRequest` |
| `searchRequestToParams(request)` | URL query serialization |
| `buildResultsUrlFromRequest(request)` | Results page href |
| `serializeSearchRequest(request)` | JSON-ready body for `POST /api/search` |

The search form does not call HTTP directly — navigation uses URL params. The results page calls `POST /api/search`.

### HTTP Route Handler

`POST /api/search` — accepts JSON `SearchRequest`, calls `searchTrips()` (server-only), returns `toJsonResponse()`.

### HTTP client (`lib/api/searchClient.ts`)

| Function | Purpose |
|----------|---------|
| `postSearchTrips(search)` | `fetch("/api/search")` → `serviceResultFromApiResponse()` |

Reuses `serviceResultFromApiResponse()` from `lib/api/responses.ts` — generic for future domain API clients.

---

## Swapping Mock → Amadeus (flights)

**Files to implement (no UI or service changes):**

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

**Model gaps to fill before production Amadeus:**

- `Destination.iataCode` — airport code per destination (optional field added)
- `SearchRequest.origin` — departure city (required for user searches)
- Populate IATA codes in destination mock data or via Google Places adapter

---

## Error handling

| Type | Factory | HTTP | UI message |
|------|---------|------|------------|
| Validation | `createValidationError()` | 400 | Exact message |
| Provider | `createProviderError()` | 502 | Generic travel data message |
| Not found | `createNotFoundError()` | 404 | Exact message |
| Unknown | `createUnexpectedError()` | 500 | Generic retry message |

Services use `runService()` — never raw try/catch.

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

- `SearchResponse` wrapper model in orchestrator
- Move mock datasets from `lib/results/mock*.ts` into `lib/providers/*/mock/data.ts`
- Booking, Omio, Google Maps adapter folders (same pattern as Amadeus)
- `server-only` on additional service modules (orchestrator, destination service)
