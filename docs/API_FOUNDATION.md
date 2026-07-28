# API Foundation — Architecture Reference

This document is the single reference for the Glooconn API foundation (**v0.17.0** — Live Flights + multi-provider architecture + Milestone 10 search experience). It describes how data flows from the UI to providers and how to swap mock adapters for real APIs.

**Flights providers:** `mock` (default) · `serpapi` (**live, production-capable**, v0.17.0) · `amadeus` (long-term Enterprise path). See [Provider_Guide.md](./Provider_Guide.md) and [releases/v0.17.0.md](./releases/v0.17.0.md).

**Search contract:** success payload is `SearchResponse` (ADR-037) — domain arrays + optional `warnings`.

---

## Layer diagram

```
???????????????????????????????????????????????????????????????
?  UI (components, hooks)                                     ?
?  ? trip search: postSearchTrips() ? POST /api/search        ?
?  ? other data: lib/services (e.g. destinations)             ?
?  ? uses ServiceState<T> via useServiceQuery                 ?
???????????????????????????????????????????????????????????????
                            ? HTTP (trip search)
???????????????????????????????????????????????????????????????
?  app/api/search/route.ts                                    ?
?  ? calls searchTrips() on the server                        ?
???????????????????????????????????????????????????????????????
                            ?
???????????????????????????????????????????????????????????????
?  lib/services (server-only for trip search)                 ?
?  searchService ? searchOrchestrator                         ?
?    1. iataResolution (enrich ids + IATA)                    ?
?    2. assert flights have airports (business rule)          ?
?    3. Promise.allSettled domain providers (ADR-037)         ?
?    4. buildSearchResponse (+ warnings?)                     ?
?  context.ts ? getServiceProviders() (simple DI)             ?
???????????????????????????????????????????????????????????????
                            ?
???????????????????????????????????????????????????????????????
?  lib/providers/core                                         ?
?  registry.ts ? getProviderRegistry()                        ?
?  factories.ts ? createFlightsProvider(), etc.               ?
???????????????????????????????????????????????????????????????
                            ?
        ?????????????????????????????????????????
        ?                   ?                   ?
  destinations/mock   flights/mock|amadeus|serpapi   hotels/mock
                            ?
              ?????????????????????????????
              ?                           ?
         amadeus/                    serpapi/
         auth + client               googleFlights + client
         flightOffers                mappers + provider
         mappers + provider          (live, production-capable)
        ?                   ?                   ?
        ?????????????????????????????????????????
                            ?
???????????????????????????????????????????????????????????????
?  types/models ? shared domain types (Hotel, Flight, ?)      ?
???????????????????????????????????????????????????????????????

Cross-cutting:
  lib/api/     ? errors, ServiceResult, HTTP clients, TTL cache, httpTimeout, validation, responses
  lib/config/  ? environment variables, Amadeus + SerpAPI settings, API key slots
```

---

## Folder structure

| Path | Purpose |
|------|---------|
| `lib/config/` | `getAppConfig()` ? all env vars (including Amadeus env/timeouts) |
| `lib/config/amadeusHosts.ts` | Known Amadeus hosts + default timeout constants |
| `lib/api/` | Errors, `ServiceResult`, `searchClient`, validation, `toJsonResponse` |
| `lib/api/searchClient.ts` | Browser-safe `postSearchTrips()` ? `POST /api/search` |
| `lib/api/cache.ts` | Generic in-memory TTL cache (used privately by Amadeus auth) |
| `lib/services/` | Server entry point for travel data (`searchService` is server-only) |
| `lib/services/iataResolution.ts` | Destination catalog ? optional `originIata` / `destinationIata` |
| `lib/services/searchOrchestrator.ts` | Enrichment + flight airport validation + parallel providers |
| `lib/providers/flights/amadeus/auth.ts` | `getAmadeusAccessToken()` ? OAuth client-credentials (config host) |
| `lib/providers/flights/amadeus/client.ts` | `amadeusFetch()` ? timeouts + 401 single retry |
| `lib/providers/flights/amadeus/flightOffers.ts` | `buildFlightOffersSearchParams()` + `searchFlightOffers()` (raw JSON) |
| `lib/providers/flights/amadeus/log.ts` | Structured Amadeus console logging (server-only) |
| `lib/providers/flights/amadeus/mappers.ts` | `mapAmadeusFlightOffersResponse()` (public); single-offer mapper private |
| `lib/providers/flights/amadeus/mappingHelpers.ts` | Pure parse/map helpers (package-private) |
| `lib/providers/flights/amadeus/httpTimeout.ts` | Timeout helpers for Amadeus OAuth + fetch |
| `lib/providers/flights/amadeus/types.ts` | Internal Amadeus response/error shapes |
| `lib/providers/flights/serpapi/` | SerpAPI Google Flights adapter (live, production-capable, v0.17.0) |
| `lib/api/httpTimeout.ts` | Shared timeout helpers (used by SerpAPI; prefer reuse) |
| `lib/providers/core/` | Interfaces, registry, factories |
| `lib/providers/<domain>/mock/` | Mock adapter class |
| `lib/providers/<domain>/<vendor>/` | Real API adapter (e.g. `flights/amadeus/`, `flights/serpapi/`) |
| `lib/providers/mock/shared.ts` | Shared mock filter/pricing logic |
| `types/models/` | Provider-independent domain models |
| `lib/results/` | Client-side filter/sort + legacy mock data files |

**Naming note:** Ground transport uses folder `ground/` but the interface is `TransportProvider` and env var is `TRANSPORT_PROVIDER`.

---

## Request flow (search)

```
Browser (SearchResultsPage)
  ? postSearchTrips(search)                 [lib/api/searchClient.ts]
    ? POST /api/search                      [app/api/search/route.ts]
      ? searchTrips()                       [lib/services/searchService.ts ? server-only]
        ? validateSearchRequest()           [lib/api/validation.ts]
        ? orchestrateTripSearch(request)
            1. enrichSearchRequestWithAirports()   [lib/services/iataResolution.ts]
            2. assertFlightAirportsResolved()      [searchOrchestrator ? business rule]
            3. Promise.allSettled(hotels, flights, transport)  [partial failure ? ADR-037]
            4. buildSearchResponse(+ warnings?)
      ? toJsonResponse() ? ServiceResult<SearchResponse>
  ? searchResponseToResults() + filter/sort  [client]
  ? ResultsWarningsBanner when warnings[]
```

Step list:

1. `useSearchForm.submit()` ? `validateAndBuildSearchRequest()` ? `SearchRequest`
2. Navigate to results via `buildResultsUrlFromRequest(request)` (URL params)
3. `SearchResultsPage` ? `useServiceQuery(() => postSearchTrips(search))`
4. `postSearchTrips()` ? `POST /api/search` with JSON `SearchRequest`
5. Route Handler ? `searchService.searchTrips()` ? `validateSearchRequest()` ? `runService()`
6. Orchestrator enriches ids + IATA, validates flights need airports, then calls providers with **settled** isolation
7. `buildSearchResponse()` ? `toJsonResponse()` ? `serviceResultFromApiResponse()` in the client
8. UI flattens with `searchResponseToResults()`, shows warnings, then filters/sorts

### IATA enrichment (Sprint 2)

| Concern | Owner | Responsibility |
|---------|-------|----------------|
| Data enrichment | `lib/services/iataResolution.ts` | Map places ? catalog destinations ? optional IATA codes |
| Business rule | `searchOrchestrator` | Fail when flights are requested but airports cannot be resolved |
| Flight HTTP | Live Amadeus pipeline when selected (Sprints 4?6); default app path still mock via `USE_MOCK_PROVIDERS` |

**Why enrichment is in the orchestrator path (via helper):**

- Runs on the server after Sprint 1?s boundary ? safe for catalog lookups
- All providers receive one enriched `SearchRequest`
- Flight adapters never call `DestinationProvider` themselves

**Why the helper only enriches:**

- Pure, reusable, no product-type policy
- Missing codes return empty fields ? callers decide what to do
- Future airport metadata can extend `AirportRef` without touching UI

**Why validation is in the orchestrator:**

- Product rules (`productTypes` includes `"flights"`) are orchestration concerns
- Hotels/transport-only searches must not fail when IATA is absent
- When flights are selected and IATA is missing ? clear validation error (no silent skip)

**Why `originIata` / `destinationIata` are optional on `SearchRequest`:**

- Hotels and ground transport do not need airport codes
- UI and URL params never collect IATA ? server fills them when possible
- Keeps the model provider-independent (not Amadeus-specific)

### SearchRequest builder (`lib/search/request.ts`)

| Function | Purpose |
|----------|---------|
| `buildSearchRequest(form)` | Form state ? canonical model |
| `validateAndBuildSearchRequest(form)` | Validate + build (used on submit) |
| `buildSearchRequestFromData(data)` | Legacy `SearchData` ? `SearchRequest` |
| `searchRequestToParams(request)` | URL query serialization |
| `buildResultsUrlFromRequest(request)` | Results page href |
| `serializeSearchRequest(request)` | JSON-ready body for `POST /api/search` |

The search form does not call HTTP directly ? navigation uses URL params. The results page calls `POST /api/search`. Form/URL do **not** serialize IATA fields; the orchestrator resolves them on each search.

### HTTP Route Handler

`POST /api/search` ? accepts JSON `SearchRequest`, calls `searchTrips()` (server-only), returns `toJsonResponse()`.

### HTTP client (`lib/api/searchClient.ts`)

| Function | Purpose |
|----------|---------|
| `postSearchTrips(search)` | `fetch("/api/search")` ? `serviceResultFromApiResponse()` |

Reuses `serviceResultFromApiResponse()` from `lib/api/responses.ts` ? generic for future domain API clients.

---

## Swapping Mock ? Amadeus (flights)

**Prerequisites done:**

- Sprint 1 ? server search boundary (`POST /api/search`)
- Sprint 2 ? IATA enrichment + flight airport validation
- Sprint 3 ? OAuth + token cache + `amadeusFetch` infrastructure
- Sprint 4 ? Flight Offers HTTP (`searchFlightOffers` returns raw JSON)

### Amadeus OAuth (Sprint 3 ? complete)

```
getAmadeusAccessToken()                    [amadeus/auth.ts]
  ? getCached("amadeus:access_token")      [lib/api/cache.ts ? private to auth]
  ? on miss: POST test.api.amadeus.com/v1/security/oauth2/token
  ? setCached(token, expires_in ? 60s)

amadeusFetch(path)                         [amadeus/client.ts]
  ? getAmadeusAuthHeaders() ? Bearer token
  ? fetch(test base URL + path)
```

**Why auth lives inside the Amadeus adapter:** OAuth is vendor-specific; orchestrator/UI never see tokens.  
**Why the cache is generic:** `lib/api/cache.ts` has no Amadeus types; auth imports it privately.  
**Why the client owns HTTP:** one place for base URL, auth headers, and network errors.

### Flight Offers HTTP (Sprint 4 ? complete)

```
searchFlightOffers(request)                [amadeus/flightOffers.ts]
  ? buildFlightOffersSearchParams(request)   (pure; SearchRequest ? URLSearchParams)
  ? amadeusFetch("/v2/shopping/flight-offers?" + params)
  ? parse JSON ? AmadeusFlightOffersResponse (raw; no Glooconn Flight mapping)
```

**Why `flightOffers.ts` is separate from `client.ts`:**

- `client.ts` = generic authenticated HTTP (any Amadeus path)
- `flightOffers.ts` = Flight Offers domain (query mapping + endpoint)
- Keeps infrastructure reusable for other Amadeus APIs later

**Why request building is a pure function:**

- `buildFlightOffersSearchParams()` has no I/O ? easy to unit test
- Same `SearchRequest` always produces the same query string
- HTTP stays in `searchFlightOffers()` / `amadeusFetch()` only

**Why the provider remained mocked through Sprint 4:**

- Raw Amadeus JSON was not yet converted to Glooconn `Flight`
- Wiring live search before mapping would break the `FlightsProvider` contract (`Promise<Flight[]>`)

### Flight response mapping (Sprint 5 ? complete)

```
AmadeusFlightOffersResponse                    [raw JSON from searchFlightOffers]
  ? mapAmadeusFlightOffersResponse(response, { destinationId })
      ? for each offer: mapAmadeusOfferToFlight(offer, options)   (package-private)
          ? helpers: parsePrice, validateCurrency, formatTime,
                     parseDuration, mapAirline, mapCabin, calculateStops
      ? drop null offers; rethrow ProviderErrors (e.g. unsupported currency)
  ? Flight[]
```

**Public barrel export:** only `mapAmadeusFlightOffersResponse` (plus existing provider exports).

**Why mapping is isolated inside the Amadeus adapter:**

- Amadeus JSON shapes must not leak into UI, orchestrator, or shared domain modules
- Vendor-specific parsing stays next to HTTP/auth for that vendor
- Glooconn `Flight` remains the only flight shape outside `amadeus/`

**Why only `mapAmadeusFlightOffersResponse()` is public:**

- Sprint 6 needs one entry point: raw response ? `Flight[]`
- Callers should not depend on per-offer internals or helper signatures

**Why helpers and internal types remain private:**

- `mappingHelpers.ts` and `types.ts` are implementation details that can change without a public API break
- `mapAmadeusOfferToFlight` is an internal building block of the response mapper

**Why provider integration was deferred to Sprint 6:**

- Mapping could be reviewed without changing app search UX
- Wiring is a thin step: `searchFlightOffers` ? `mapAmadeusFlightOffersResponse` ? `Flight[]`
- Unsupported currency already throws `createProviderError` ? live path must handle that deliberately

### Live Amadeus provider (Sprint 6 ? complete)

```
AmadeusFlightsProvider.search(request)
  ? require destinationId (trimmed) or createProviderError
  ? searchFlightOffers(request)
  ? mapAmadeusFlightOffersResponse(raw, { destinationId })
  ? Flight[]
```

**Provider selection (`createFlightsProvider` ? v0.15.0):**

| Condition | Active provider |
|-----------|-----------------|
| `USE_MOCK_PROVIDERS=true` (default) | `mock` |
| `USE_MOCK_PROVIDERS=false` + `FLIGHTS_PROVIDER` unset | `amadeus` (default live) |
| `USE_MOCK_PROVIDERS=false` + `FLIGHTS_PROVIDER=amadeus` + keys | `amadeus` |
| `USE_MOCK_PROVIDERS=false` + `FLIGHTS_PROVIDER=serpapi` + key | `serpapi` (live, production-capable) |
| Vendor selected but keys missing | `mock` (factory fallback + warning) |
| Invalid `FLIGHTS_PROVIDER` | `ProviderError` (fail fast) |

**`destinationId` validation:** missing/blank `request.destinationId` ? `createProviderError` before HTTP or mapping. Do not pass empty context into the mapper.

**currencyService technical debt (Sprint 6):**

- `getCurrencies()` calls `mockCurrencyProvider` directly instead of `getServiceProviders()`
- **Why:** wiring Amadeus HTTP into `AmadeusFlightsProvider` pulled `server-only` modules into the client bundle via `currencyService` ? registry ? factories ? Amadeus
- Currencies remain mock-only; behavior for the budget UI is unchanged
- **Debt:** restore registry/DI for currencies without importing server-only flight adapters into client components (split client-safe factories / lazy Amadeus load)

### Client search performance (Sprint 10.4)

Browser-only ? does not change API contracts or providers:

- Stable search cache keys (`lib/search/cacheKey.ts`)
- Short-lived search response cache + in-flight dedupe (`lib/api/searchResultCache.ts`, TTL 45s)
- Separate from server `lib/api/cache.ts` (Amadeus OAuth) ? never share those modules with the browser
- Autocomplete debounce + destination filter cache; price filter debounce; memoized result cards

### Destination search quality (Sprint 10.5)

Browser-only autocomplete improvements ? does not change trip search execution or API contracts:

- Deterministic ranker in `lib/destinations/rank.ts` (IATA, name, country, region, id, whole-word)
- Soft boosts for recent (+8) and popular (+5); dedupe by canonical destination id
- UX: match highlighting, Cities/Airports grouping, Home/End keyboard navigation
- Provider `filterDestinations` helpers remain unchanged (service path)

### Milestone 10 hardening (Sprint 10.6 ? v0.16.0)

- Accessibility polish on results + autocomplete (no API/provider behavior changes)
- Client dead-code cleanup; docs + [releases/v0.16.0.md](./releases/v0.16.0.md)
- Production verification: test, typecheck, lint, build

### Remaining work (post–v0.17.0)

| Step | Action |
|------|--------|
| 1 | **Milestone 12** — Hotel Search Integration |
| 2 | SerpAPI round-trip `departure_token` enrichment polish |
| 3 | currencyService registry DI cleanup (ADR-035) |
| 4 | Execute manual Amadeus sandbox checklist (`docs/SPRINT_8_SUMMARY.md`) |
| 5 | Destinations / About product pages |
| 6 | Monitoring for live providers (ongoing) |

### SerpAPI live flights provider (ADR-036 → hardened in Milestone 11 / v0.17.0)

| Item | Status |
|------|--------|
| ADR-036 + Provider Guide + docs | ✅ Complete (v0.15.0) |
| Config / `serpapi/` adapter / factory / tests | ✅ Complete |
| Milestone 11 validation + hardening + readiness | ✅ Complete → **v0.17.0** |
| Role | **Live flights — production-capable** (Amadeus remains long-term Enterprise) |
| Amadeus | Long-term Enterprise path; prefer bugfixes unless CTO-approved |

**Env:**

```env
USE_MOCK_PROVIDERS=false
FLIGHTS_PROVIDER=serpapi
SERPAPI_API_KEY=
SERPAPI_DEEP_SEARCH=false
```

**Live pipelines when configured:**

- `AmadeusFlightsProvider.search` ? Flight Offers HTTP + mapping (production path)
- `SerpApiFlightsProvider.search` — Google Flights query + HTTP + mapping (live, production-capable)
  - **Sprint 11.2:** full local date-time on `Flight` times; round-trip return fetch via `departure_token` (capped); currency defaults/fallbacks to EUR
- IATA enrichment + flight airport validation in the orchestrator
- Factory selection as above
- Timeouts + structured logs (vendor-local); Amadeus also has 401 retry / 429 handling

See [SPRINT_11_2_SUMMARY.md](./SPRINT_11_2_SUMMARY.md) and [SPRINT_11_1_VALIDATION.md](./SPRINT_11_1_VALIDATION.md).

### Flight API automated testing (Sprint 7 ? complete)

**Strategy:** unit tests for pure logic; integration tests with **mocked `fetch`** for the provider pipeline; **no real Amadeus calls in CI**. Manual sandbox testing uses the Sprint 8 checklist.

**Architecture:**
```
npm test  (tsx --test + server-only stub register)
  ??? Unit: mappingHelpers, mappers, buildFlightOffersSearchParams, cache
  ??? Integration: AmadeusFlightsProvider.search (mocked fetch + fixtures)
  ??? Existing: lib/search/search.test.ts
```

**Covered components (Sprint 7 base):**

| Area | Test file |
|------|-----------|
| Helpers | `amadeus/mappingHelpers.test.ts` |
| Mapper | `amadeus/mappers.test.ts` |
| Query builder | `amadeus/flightOffers.test.ts` |
| TTL cache | `lib/api/cache.test.ts` |
| Provider | `amadeus/provider.test.ts` |

**Infrastructure:**

| Piece | Role |
|-------|------|
| `amadeus/__fixtures__/flightOffers.sample.ts` | Checked-in Amadeus JSON variants |
| `test/stubs/server-only.js` + `test/register-server-only.mjs` | Allow Amadeus modules under `tsx` |
| Mocked `globalThis.fetch` | Token + Flight Offers HTTP without network |

### Flight API production hardening (Sprint 8 ? complete)

| Area | Behavior |
|------|----------|
| Timeouts | OAuth + `amadeusFetch` use `AbortSignal.timeout`; clear ProviderError on timeout |
| 401 | Clear token cache ? refresh ? **one** retry |
| 429 | No retry; clear user message; Retry-After never in UI copy |
| Config | `AMADEUS_ENV=test\|production` ? known hosts only; timeouts via `lib/config` |
| Logging | `logAmadeusEvent` ? `provider`, `operation`, `httpStatus?`, `durationMs`, `errorCode?` |

**Additional test coverage (Sprint 8):**

| Area | Test file |
|------|-----------|
| Amadeus config | `lib/config/amadeusConfig.test.ts` |
| Timeouts | `amadeus/httpTimeout.test.ts`, `amadeus/client.timeout.test.ts` |
| 401 / 429 | `amadeus/client.retry.test.ts` (+ provider assertions) |
| Structured logs | `amadeus/log.test.ts` |

**Automated suite size:** **192** tests (`npm test`) ? search request helpers + Amadeus Flight API + SerpAPI (config through integration) + factory.

**Not in CI:** live Amadeus/SerpAPI sandbox smoke, OAuth against real test host, Playwright E2E.  
**Manual plan:** see `docs/SPRINT_8_SUMMARY.md` (Amadeus sandbox checklist).

---

## Error handling

| Type | Factory | HTTP | UI message |
|------|---------|------|------------|
| Validation | `createValidationError()` | 400 | Exact message |
| Provider | `createProviderError()` | 502 | Generic travel data message |
| Not found | `createNotFoundError()` | 404 | Exact message |
| Unknown | `createUnexpectedError()` | 500 | Generic retry message |

Services use `runService()` ? never raw try/catch.

**Flight IATA validation:** when `productTypes` includes `"flights"` and `originIata` or `destinationIata` is missing after enrichment, the orchestrator throws `createValidationError(...)` asking the user to pick cities from autocomplete. `runService` maps this to a failed `ServiceResult`; the UI shows the exact message.

**Flight Offers HTTP errors:** `searchFlightOffers()` maps Amadeus HTTP failures to `createProviderError` using safe `title`/`detail` from the error body ? never tokens or credentials. Surfaced when the Amadeus provider is selected (not when `USE_MOCK_PROVIDERS=true`).

**Timeouts / rate limits / auth refresh (Sprint 8):**

- Timeout ? clear ProviderError ("timed out?"); structured log `errorCode: "TIMEOUT"`
- HTTP 429 ? clear "temporarily busy" message; structured log `RATE_LIMITED` (Retry-After not in UI)
- HTTP 401 on authenticated fetch ? one unauthorized retry after token cache clear

**Missing `destinationId` on Amadeus search:** `AmadeusFlightsProvider` throws `createProviderError` (programming/config error ? orchestrator should have enriched the request).

**Flight mapping currency errors:** unsupported or missing offer currency throws `createProviderError` (does not silently drop the offer). Propagates from `mapAmadeusFlightOffersResponse`.

---

## Environment variables

See `.env.example`. Summary:

- `USE_MOCK_PROVIDERS=true` ? default, no API keys needed
- `FLIGHTS_PROVIDER=amadeus|serpapi|mock` ? selects flights adapter (when mock flag is false; unset defaults to amadeus)
- `AMADEUS_ENV=test|production` ? known hosts only (default `test`)
- `AMADEUS_OAUTH_TIMEOUT_MS` / `AMADEUS_FETCH_TIMEOUT_MS` ? optional (defaults 10000 / 15000)
- `SERPAPI_API_KEY` / `SERPAPI_DEEP_SEARCH` — SerpAPI Google Flights (live / production-capable)
- API keys are **server-only** (no `NEXT_PUBLIC_` prefix)
- Read via `getAppConfig()` ? never `process.env` in components or vendor modules outside `lib/config`

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

- Restore currencyService ? registry DI without client importing Amadeus `server-only` (technical debt from Sprint 6)
- Manual Amadeus sandbox smoke (OAuth + live offers) ? not automated CI
- Monitoring / performance budgets for live providers
- Hotels and activities live providers
- Move mock datasets from `lib/results/mock*.ts` into `lib/providers/*/mock/data.ts`
- Booking, Omio, Google Maps adapter folders (same pattern as Amadeus / SerpAPI)
- `server-only` on additional service modules (orchestrator, destination service)
- Redis / distributed token cache (optional; in-memory TTL is enough for MVP)

Shipped in Sprint **10.2** (ADR-037): partial provider failure + `SearchResponse` as the live search API contract.
