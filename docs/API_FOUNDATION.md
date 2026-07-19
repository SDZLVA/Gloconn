# API Foundation — Architecture Reference

This document is the single reference for the Glooconn API foundation (v0.11.0). It describes how data flows from the UI to providers and how to swap mock adapters for real APIs.

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
                            │
                    amadeus/auth.ts         → OAuth token (cached)
                    amadeus/client.ts       → amadeusFetch() infrastructure
                    amadeus/flightOffers.ts → GET /v2/shopping/flight-offers (raw JSON)
                    amadeus/mappers.ts      → raw JSON → Flight[] (public: mapAmadeusFlightOffersResponse)
                    amadeus/provider.ts     → still mocks (Sprint 6 wires live search)
        │                   │                   │
        └───────────────────┴───────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  types/models — shared domain types (Hotel, Flight, …)      │
└─────────────────────────────────────────────────────────────┘

Cross-cutting:
  lib/api/     — errors, ServiceResult, HTTP clients, TTL cache, validation, responses
  lib/config/  — environment variables, API key slots
```

---

## Folder structure

| Path | Purpose |
|------|---------|
| `lib/config/` | `getAppConfig()` — all env vars |
| `lib/api/` | Errors, `ServiceResult`, `searchClient`, validation, `toJsonResponse` |
| `lib/api/searchClient.ts` | Browser-safe `postSearchTrips()` → `POST /api/search` |
| `lib/api/cache.ts` | Generic in-memory TTL cache (used privately by Amadeus auth) |
| `lib/services/` | Server entry point for travel data (`searchService` is server-only) |
| `lib/services/iataResolution.ts` | Destination catalog → optional `originIata` / `destinationIata` |
| `lib/services/searchOrchestrator.ts` | Enrichment + flight airport validation + parallel providers |
| `lib/providers/flights/amadeus/auth.ts` | `getAmadeusAccessToken()` — OAuth client-credentials (test env) |
| `lib/providers/flights/amadeus/client.ts` | `amadeusFetch()` — authenticated HTTP infrastructure |
| `lib/providers/flights/amadeus/flightOffers.ts` | `buildFlightOffersSearchParams()` + `searchFlightOffers()` (raw JSON) |
| `lib/providers/flights/amadeus/mappers.ts` | `mapAmadeusFlightOffersResponse()` (public); single-offer mapper private |
| `lib/providers/flights/amadeus/mappingHelpers.ts` | Pure parse/map helpers (package-private) |
| `lib/providers/flights/amadeus/types.ts` | Internal Amadeus response/error shapes |
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
| Flight HTTP | `searchFlightOffers()` ready (Sprint 4); mapping ready (Sprint 5); provider still mocks (Sprint 6) |

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

**Prerequisites done:**

- Sprint 1 — server search boundary (`POST /api/search`)
- Sprint 2 — IATA enrichment + flight airport validation
- Sprint 3 — OAuth + token cache + `amadeusFetch` infrastructure
- Sprint 4 — Flight Offers HTTP (`searchFlightOffers` returns raw JSON)

### Amadeus OAuth (Sprint 3 — complete)

```
getAmadeusAccessToken()                    [amadeus/auth.ts]
  → getCached("amadeus:access_token")      [lib/api/cache.ts — private to auth]
  → on miss: POST test.api.amadeus.com/v1/security/oauth2/token
  → setCached(token, expires_in − 60s)

amadeusFetch(path)                         [amadeus/client.ts]
  → getAmadeusAuthHeaders() → Bearer token
  → fetch(test base URL + path)
```

**Why auth lives inside the Amadeus adapter:** OAuth is vendor-specific; orchestrator/UI never see tokens.  
**Why the cache is generic:** `lib/api/cache.ts` has no Amadeus types; auth imports it privately.  
**Why the client owns HTTP:** one place for base URL, auth headers, and network errors.

### Flight Offers HTTP (Sprint 4 — complete)

```
searchFlightOffers(request)                [amadeus/flightOffers.ts]
  → buildFlightOffersSearchParams(request)   (pure; SearchRequest → URLSearchParams)
  → amadeusFetch("/v2/shopping/flight-offers?" + params)
  → parse JSON → AmadeusFlightOffersResponse (raw; no Glooconn Flight mapping)
```

**Why `flightOffers.ts` is separate from `client.ts`:**

- `client.ts` = generic authenticated HTTP (any Amadeus path)
- `flightOffers.ts` = Flight Offers domain (query mapping + endpoint)
- Keeps infrastructure reusable for other Amadeus APIs later

**Why request building is a pure function:**

- `buildFlightOffersSearchParams()` has no I/O — easy to unit test
- Same `SearchRequest` always produces the same query string
- HTTP stays in `searchFlightOffers()` / `amadeusFetch()` only

**Why the provider remained mocked through Sprint 4:**

- Raw Amadeus JSON was not yet converted to Glooconn `Flight`
- Wiring live search before mapping would break the `FlightsProvider` contract (`Promise<Flight[]>`)

### Flight response mapping (Sprint 5 — complete)

```
AmadeusFlightOffersResponse                    [raw JSON from searchFlightOffers]
  → mapAmadeusFlightOffersResponse(response, { destinationId })
      → for each offer: mapAmadeusOfferToFlight(offer, options)   (package-private)
          → helpers: parsePrice, validateCurrency, formatTime,
                     parseDuration, mapAirline, mapCabin, calculateStops
      → drop null offers; rethrow ProviderErrors (e.g. unsupported currency)
  → Flight[]
```

**Public barrel export:** only `mapAmadeusFlightOffersResponse` (plus existing provider exports).

**Why mapping is isolated inside the Amadeus adapter:**

- Amadeus JSON shapes must not leak into UI, orchestrator, or shared domain modules
- Vendor-specific parsing stays next to HTTP/auth for that vendor
- Glooconn `Flight` remains the only flight shape outside `amadeus/`

**Why only `mapAmadeusFlightOffersResponse()` is public:**

- Sprint 6 needs one entry point: raw response → `Flight[]`
- Callers should not depend on per-offer internals or helper signatures

**Why helpers and internal types remain private:**

- `mappingHelpers.ts` and `types.ts` are implementation details that can change without a public API break
- `mapAmadeusOfferToFlight` is an internal building block of the response mapper

**Why provider integration is deferred to Sprint 6:**

- Mapping can be reviewed and tested without changing app search UX
- Wiring is a thin step: `searchFlightOffers` → `mapAmadeusFlightOffersResponse` → `Flight[]`
- Unsupported currency already throws `createProviderError` — live path must handle that deliberately

### Remaining work (Sprint 6)

| Step | File | Action |
|------|------|--------|
| 1 | `lib/providers/flights/amadeus/provider.ts` | Replace mock with `searchFlightOffers` + `mapAmadeusFlightOffersResponse` |
| 2 | `.env.local` | `USE_MOCK_PROVIDERS=false`, `FLIGHTS_PROVIDER=amadeus`, keys |
| 3 | Optional | Partial provider failure, mapper unit tests |

**Already ready (not live in UI yet):**

- `createFlightsProvider()` returns `amadeusFlightsProvider` when configured
- IATA enrichment + flight airport validation in the orchestrator
- OAuth + TTL cache + `amadeusFetch` + `searchFlightOffers`
- `mapAmadeusFlightOffersResponse()` (Sprint 5)

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

**Flight Offers HTTP errors:** `searchFlightOffers()` maps Amadeus HTTP failures to `createProviderError` using safe `title`/`detail` from the error body — never tokens or credentials. Not surfaced in the app UI until the provider is wired in Sprint 6.

**Flight mapping currency errors:** unsupported or missing offer currency throws `createProviderError` (does not silently drop the offer). Propagates from `mapAmadeusFlightOffersResponse`.

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

- Wire `AmadeusFlightsProvider` to `searchFlightOffers` + `mapAmadeusFlightOffersResponse` (Sprint 6)
- Partial provider failure (show hotels/transport if flights fail)
- `SearchResponse` wrapper model in orchestrator
- Move mock datasets from `lib/results/mock*.ts` into `lib/providers/*/mock/data.ts`
- Booking, Omio, Google Maps adapter folders (same pattern as Amadeus)
- `server-only` on additional service modules (orchestrator, destination service)
- Redis / distributed token cache (optional; in-memory TTL is enough for MVP)
