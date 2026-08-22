# Glooconn — AI Handoff Guide

This document gives AI coding assistants (Cursor, Claude, etc.) the context needed to continue development without breaking existing work.

**Read this file first** before making any changes to the Glooconn codebase.

---

## Project snapshot

| Key | Value |
|-----|-------|
| Product | Glooconn — travel planning web app |
| Owner | Shehan De Silva (@SDZLVA) — **beginner developer** |
| Repo | https://github.com/SDZLVA/Gloconn |
| Stack | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Stage | **v0.21.0** released — Milestone **16** Recommendation Intelligence complete |
| APIs | Supabase Auth + PostgreSQL; travel data via mock providers by default; optional live **SerpAPI** / Amadeus |

---

## Rules you must follow

Read and obey `PROJECT_RULES.md` in the project root:

1. **Small changes only** — one task at a time
2. **Explain every file** you create or modify
3. **Beginner-friendly** code with helpful comments
4. **Do not remove features** unless explicitly asked
5. **No unnecessary packages** — explain if one is needed
6. **Commit and push** after each completed task
7. End every task with: what was done, files changed, how to test, next step

Additional user preference: **push edits to GitHub** after each task on a `cursor/feature-name` branch.

---

## What exists today

### Live routes
- `/` — Home page with `HeroSection` + `SearchCard`
- `/search/results` — Search results (filters + sorting); **live flights and hotels** when SerpAPI is configured; **Recommended Packages** when both domains return results
- `/login`, `/signup` — Google and email authentication
- `/profile` — Protected user profile
- `/my-trips` — Protected saved trips list

### Nav (MVP)
- Logo, **Search**, **My Trips**, Sign in / Profile
- `/destinations` and `/about` pages are **not linked** in MVP (pages still unbuilt)

### Key components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AppShell` | `components/layout/` | Wraps every page: navbar + main + footer |
| `BrandLogo` | `components/layout/` | Glooconn wordmark (navbar link or footer text) |
| `Navbar` | `components/layout/` | Sticky nav, mobile menu |
| `Footer` | `components/layout/` | Site footer |
| `HeroSection` | `components/home/` | Home page hero |
| `SearchCard` | `components/search/` | Home page card wrapper (heading + `SearchForm`) |
| `SearchCardContainer` | `components/search/` | Hydrates SearchCard from URL params (edit search flow) |
| `SearchForm` | `components/search/` | Presentational trip search form — pass `SearchFormController` |
| `SearchFormWithState` | `components/search/` | `useSearchForm` + `SearchForm` convenience wrapper |
| `SearchFormSection` | `components/search/` | Accessible section group + divider for form layout |
| `OriginAutocomplete` | `components/search/` | Optional departure city field |
| `SearchProductSelector` | `components/search/` | Stays / Flights / Transport toggles |
| `DestinationAutocomplete` | `components/search/` | Destination field — recent, popular, and filtered mock suggestions |
| `TravelDatesSelector` | `components/search/` | Round-trip / one-way dates picker with calendar dropdown |
| `TravelersSelector` | `components/search/` | Search-form wrapper around `PassengersSelector` |
| `PassengersSelector` | `components/ui/` | Reusable Adults / Children / Infants / Rooms picker |
| `TravelStyleSelector` | `components/search/` | Budget / Standard / Luxury picker |
| `BudgetSelector` | `components/search/` | Optional max budget numeric input with currency selector; currency + input side-by-side on desktop |
| `Button`, `Card`, `InputField` | `components/ui/` | Generic UI primitives |
| `BudgetSlider` | `components/ui/` | Reusable range slider (kept; search form uses numeric input) |
| `CurrencySelector` | `components/ui/` | Currency dropdown backed by mock provider data |
| `Autocomplete` | `components/ui/` | Reusable accessible combobox (sections, keyboard navigation) |
| `TravelCalendar` | `components/ui/` | Reusable date picker — single or range, disables past dates |
| `NumberStepper` | `components/ui/` | Reusable +/- numeric counter |
| `PassengersSelector` | `components/ui/` | Reusable passengers & rooms dropdown with steppers |
| `SectionHeading` | `components/ui/` | Reusable title + description for sections |
| `SearchResultsPage` | `components/results/` | Client orchestrator for results layout |
| `RecommendedPackagesSection` | `components/results/` | Hero packages list (hidden when empty) |
| `TravelPackageCard` | `components/results/` | Informational flight+hotel package card |
| `ResultCard` | `components/results/` | Dispatches to hotel/flight/bus/train cards |
| `ResultsFilterSidebar` | `components/results/` | Type, price, rating + model-backed facets (stops, cabin, airlines, stars, operators, amenities) |
| `ResultsSortBar` | `components/results/` | Sort dropdown (Recommended / Cheapest / Fastest / Highest rated / Best value) |
| `FormLabel`, `FormError` | `components/ui/FormField.tsx` | Shared form helpers |
| Budget helpers | `lib/budget/` | Currency options, limits, and formatting |
| Currency mock provider | `lib/providers/currencies/mock/` | Static currency list for selectors |
| `getCurrencies` | `lib/services/currencyService.ts` | Loads currencies via `mockCurrencyProvider` directly (Sprint 6 debt — see ADR-035) |

### Key logic

| Module | Location | Purpose |
|--------|----------|---------|
| `useSearchForm` | `hooks/useSearchForm.ts` | Returns `SearchFormController` (form, errors, actions) |
| `useRecentDestinationSearches` | `hooks/useRecentDestinationSearches.ts` | Recent destination list (localStorage) |
| `validateSearchForm` | `lib/search/validation.ts` | Client-side required-field validation |
| `validateBudget` | `lib/search/budget.ts` | Budget min/max and required checks |
| `buildSearchData` | `lib/search/payload.ts` | Legacy `SearchData` from form (delegates to request builder) |
| `buildSearchRequest` | `lib/search/request.ts` | Form state → canonical `SearchRequest` |
| `validateAndBuildSearchRequest` | `lib/search/request.ts` | Validate form + build `SearchRequest` (submit) |
| `serializeSearchRequest` | `lib/search/request.ts` | JSON body for `POST /api/search` |
| `postSearchTrips` | `lib/api/searchClient.ts` | Client HTTP call to `POST /api/search` (45s TTL cache + in-flight dedupe, Sprint 10.4) |
| `buildSearchCacheKey` | `lib/search/cacheKey.ts` | Stable client cache / query key (sorted productTypes) |
| `withSearchResultCache` | `lib/api/searchResultCache.ts` | Browser TTL + concurrent fetch dedupe (not server `lib/api/cache.ts`) |
| `filterDestinationsCached`, `rankDestinationsCached` | `lib/destinations/filterCache.ts` | Cached client destination ranker (Sprint 10.5) |
| `rankDestinations`, `filterDestinationsRanked` | `lib/destinations/rank.ts` | Deterministic destination scoring (IATA / name / country / words) |
| `highlightMatchSegments` | `lib/destinations/highlight.ts` | Autocomplete label match highlighting |
| `destinationToSearchOption` | `lib/destinations/options.ts` | Option label + region · IATA description |
| `useDebouncedValue` | `hooks/useDebouncedValue.ts` | Debounce expensive UI-driven work |
| `POST /api/search` | `app/api/search/route.ts` | Route Handler — server-only `searchTrips()` + `toJsonResponse()` |
| `buildResultsUrl` | `lib/search/params.ts` | Builds `/search/results?...` from form state |
| `buildResultsUrlFromRequest` | `lib/search/request.ts` | Builds results URL from `SearchRequest` |
| `parseSearchParams` | `lib/search/params.ts` | Reads URL params back into `SearchData` |
| `getResultsForSearch` | `lib/results/` | **Deprecated** — use `postSearchTrips()` from `@/lib/api` in UI |
| `filterResults`, `collectFilterFacets`, `countActiveFilters` | `lib/results/filter.ts` | Client-side filters + facets (Sprint 10.3) |
| `sortResults` | `lib/results/sort.ts` | Client-side sort (recommended / price / duration / rating / value) |
| `rankResults`, `scoreResult`, `RANK_WEIGHTS` | `lib/results/rank.ts` | Pure deterministic ranking (no AI/ML) |
| `shouldShowRecommendedPackages`, `selectPackagesForDisplay`, `shouldShowBudgetCompatibilityWarning`, … | `lib/results/packagesUi.ts` | Pure UI helpers for Recommended Packages: budget warning, price labels, route, stars (`formatPackageQualityBadge` retained but cards use Sprint 16 roles) |
| `selectFlightCandidates`, `selectHotelCandidates`, `resolveScoringBudgetAmount` | `lib/packages/candidates.ts` | Sprint 16.2 production-aware candidate selection |
| `selectDiversePackages`, `measureDiversityMetrics` | `lib/packages/diversity.ts` | Sprint 16.3 post-score diversity pass |
| `assignPackageExplanations`, honesty-gate helpers | `lib/packages/explanations.ts` | Sprint 16.4–16.5.1 deterministic roles + reason copy |
| `searchTrips` | `lib/services/searchService.ts` | **Server only** — validated search via orchestrator + providers |
| `serviceResultFromApiResponse` | `lib/api/responses.ts` | Converts Route Handler JSON → `ServiceResult` |
| `iataResolution` | `lib/services/iataResolution.ts` | Enrich SearchRequest with optional origin/destination IATA |
| `orchestrateTripSearch` | `lib/services/searchOrchestrator.ts` | IATA enrichment + flight airport validation + parallel providers |
| TTL cache | `lib/api/cache.ts` | Generic in-memory TTL — used privately by Amadeus auth |
| `getAmadeusAccessToken` | `lib/providers/flights/amadeus/auth.ts` | OAuth client-credentials (config host + timeout) |
| `amadeusFetch` | `lib/providers/flights/amadeus/client.ts` | Authenticated Amadeus HTTP (timeouts + 401 retry) |
| `searchFlightOffers` | `lib/providers/flights/amadeus/flightOffers.ts` | GET Flight Offers → raw Amadeus JSON (used by Amadeus provider) |
| `logAmadeusEvent` | `lib/providers/flights/amadeus/log.ts` | Structured server-only Amadeus logs |
| `mapAmadeusFlightOffersResponse` | `lib/providers/flights/amadeus/` (barrel) | Raw response → `Flight[]` (used by Amadeus provider) |
| Amadeus flights adapter | `lib/providers/flights/amadeus/` | Live pipeline in `AmadeusFlightsProvider.search` (ADR-035) — long-term production |
| SerpAPI flights adapter | `lib/providers/flights/serpapi/` | Live pipeline in `SerpApiFlightsProvider.search` (production-capable, v0.17.0; ADR-036) |
| `createFlightsProvider` | `lib/providers/core/factories.ts` | Selects mock / amadeus / serpapi |
| `getServiceProviders` | `lib/services/context.ts` | Returns injected or registry-backed providers |
| Provider registry | `lib/providers/core/registry.ts` | Central `get*Provider()` selection |
| Provider factories | `lib/providers/core/factories.ts` | Env-based mock vs external selection |
| Mock provider classes | `lib/providers/*/mock/provider.ts` | `MockHotelsProvider`, `MockFlightsProvider`, etc. |
| `searchDestinations` | `lib/services/destinationService.ts` | Autocomplete via active provider |
| `useServiceQuery` | `hooks/useServiceQuery.ts` | Loading / success / error for async services |
| API env, errors, validation | `lib/api/` | `ApiError`, `ServiceResult`, `runService`, `getAppConfig`, `validateAppConfig` |
| Provider interfaces | `lib/providers/core/types.ts` | `DestinationProvider`, `HotelsProvider`, `FlightsProvider`, `TransportProvider`, … |
| Legacy search provider | `lib/providers/types.ts` | `SearchProvider` (deprecated monolithic mock) |
| Mock providers | `lib/providers/*/mock/` | Default implementations (no external APIs) |
| `formatPassengersSummary` | `lib/search/passengers.ts` | Builds passengers trigger label |
| `validatePassengers` | `lib/search/passengers.ts` | Validates adults, children, infants, rooms |
| `formatTravelersSummary` | `lib/search/travelers.ts` | Alias for `formatPassengersSummary` |
| `formatTravelDatesSummary` | `lib/search/dates.ts` | Builds dates trigger label |
| `PASSENGERS_LIMITS` | `lib/search/passengers.ts` | Min/max for adults, children, infants, rooms |
| `TRAVELERS_LIMITS` | `lib/search/travelers.ts` | Alias for `PASSENGERS_LIMITS` |
| `TRAVEL_STYLE_OPTIONS` | `lib/search/constants.ts` | Travel style labels and values |
| `TRIP_TYPE_OPTIONS` | `lib/search/constants.ts` | Round-trip / one-way labels |
| `MOCK_DESTINATIONS` | `lib/destinations.ts` | Static destination list for autocomplete |
| `getPopularDestinations` | `lib/destinations.ts` | Curated popular destinations for empty field |
| `filterDestinations` | `lib/destinations.ts` | Client-side ranked destination filtering |
| Recent search helpers | `lib/destinations/recentSearches.ts` | localStorage read/write; resolves IDs via destination service |

### Request flow (trip search)

```
SearchResultsPage (client)
  → useServiceQuery(() => postSearchTrips(search))
    → fetch POST /api/search              [lib/api/searchClient.ts]
      → searchTrips()                     [lib/services/searchService.ts — server only]
        → validateSearchRequest()
        → searchOrchestrator.orchestrateTripSearch(request)
          → enrichSearchRequestWithAirports()   [iataResolution — data only]
          → assertFlightAirportsResolved()      [fail if flights + missing IATA]
          → Promise.allSettled([hotels, flights, transport])  [ADR-037 partial failure]
          → buildSearchResponse(+ warnings?)
      → toJsonResponse() → serviceResultFromApiResponse() → SearchResponse
    → searchResponseToResults() + filterResults/sortResults(+ budget for recommended)
    → ResultsWarningsBanner when warnings present
```

**Search quality notes (Sprint 10.3 — client only):**
- Filters / sort / ranking live in `lib/results/*` — do **not** change providers, API, `SearchRequest`, or `SearchResponse` for quality work
- Default sort is **Recommended** (`rankResults` with optional budget fit)
- Ranking weights: price 0.35 · rating 0.25 · journey 0.25 · stay 0.15 (documented in `rank.ts`)
- Facets are derived from the current result set (`collectFilterFacets`)

**Search performance notes (Sprint 10.4 — client only):**
- Stable `buildSearchCacheKey` prevents false refetches from key-order / `productTypes` order
- `postSearchTrips` reuses successful responses for **45s** and dedupes in-flight identical POSTs
- "Try again" clears that cache entry before refetching
- `useServiceQuery` keeps previous `data` while loading (skeleton only when no data yet)
- Destination autocomplete: debounce filter (~160ms), short-lived match cache, `onListOpen` only on closed→open
- Price filter inputs debounce commits (~200ms) so filter/sort/rank are not per-keystroke
- `ResultCard` is memoized; filter/sort already behind `useMemo`
- Do **not** use server `lib/api/cache.ts` from the browser

**Destination search quality notes (Sprint 10.5 — client only):**
- Autocomplete uses `lib/destinations/rank.ts` — **not** provider `filterDestinations` (provider helpers stay untouched)
- Matching fields from existing `Destination` only: `name`, `country`, `region`, `id`, `iataCode`, `popular`
- Score ladder (documented in `rank.ts`): IATA exact 120 → name exact 100 → … → id contains 15; soft boosts recent +8, popular +5
- Dedupes by canonical `destination.id` (keeps higher score)
- UX: match highlight, Cities / Airports grouping for IATA-like queries, Home/End keyboard jumps
- Does **not** change trip search execution / orchestrator / API

**IATA notes (ADR-031):**
- Helper enriches only — does not throw for missing codes
- Orchestrator validates when `productTypes` includes `"flights"`
- Hotels/transport-only searches do not require IATA
- UI never collects or displays IATA fields

**Partial failure notes (ADR-037):**
- One domain failure does not blank the search
- Warnings are provider-agnostic (`PROVIDER_UNAVAILABLE`) — never vendor names
- All requested domains failing → hard `PROVIDER_ERROR`
- Validation errors remain blocking
- API success payload is `SearchResponse` (not flat `SearchResult[]`)

**Amadeus notes (ADR-032 / ADR-033 / ADR-034 / ADR-035 + Sprint 8 hardening):**

Amadeus remains the **long-term Enterprise** flights path. Prefer not to modify `amadeus/` unless CTO-approved. SerpAPI is the **current production-capable live flights** path (**v0.17.0**, Milestone 11).
```
AmadeusFlightsProvider.search(request)
  → require destinationId or createProviderError
  → searchFlightOffers(request)
  → mapAmadeusFlightOffersResponse(raw, { destinationId })
  → Flight[]
```
- Auth, HTTP, mapping, and provider wiring live inside the Amadeus adapter
- Cache is generic; not exported from `@/lib/api` barrel
- Only `mapAmadeusFlightOffersResponse` is exported from the Amadeus barrel (plus provider)
- Helpers, `mapAmadeusOfferToFlight`, and Amadeus types stay package-private
- Selection: `USE_MOCK_PROVIDERS=true` → mock; false + `FLIGHTS_PROVIDER=amadeus|serpapi` → that vendor (live unset defaults to amadeus)
- Hosts: `AMADEUS_ENV=test|production` via `getAppConfig().amadeus.baseUrl` (no arbitrary URLs)
- Timeouts / 401 retry / 429 / structured logs are Amadeus-package concerns (Sprint 8)
- SerpAPI uses shared `lib/api/httpTimeout.ts` + vendor-local structured logs (Sprint 9+)
- Unsupported currency throws `createProviderError` — do not silently skip those offers
- `rating` is always `0` (do not fabricate)
- **Debt:** `currencyService` uses `mockCurrencyProvider` directly so the client budget UI does not import Amadeus `server-only` via the registry

**Flight API tests (Sprints 7–11):**
```
npm test  → 317 automated tests (node:test via tsx)
  Amadeus: helpers / mappers / query / cache / provider / hardening
  SerpAPI flights: config / types / query / client / mappers / provider / factory / integration
  SerpAPI hotels: query / client / mapper / provider / factory / integration
  fixtures + mocked fetch only (no live Amadeus or SerpAPI in CI)
  server-only stub: test/register-server-only.mjs
```
- Manual Amadeus sandbox checklist: `docs/SPRINT_8_SUMMARY.md`
- Keep `npm test` green when changing flight adapters
- Do not log tokens, credentials, Authorization headers, payloads, or PII
### Error handling flow

```
Service function
  → validateSearchRequest()     → serviceFailure(createValidationError(...))  [400]
  → runService(async () => ...) → serviceSuccess(data) | serviceFailure(toApiError(...))
UI hook (useServiceQuery)
  → toServiceState(result)      → { status, data, error }
  → .catch()                    → unexpected promise rejections → UNKNOWN error
Component
  → getApiErrorMessage(error)   → safe user-facing string
Route Handler + HTTP client
  → toJsonResponse(result)      → { ok: true, data } | { ok: false, error }
  → serviceResultFromApiResponse() → ServiceResult for useServiceQuery
```

### Environment variables

**How to manage env vars:**

1. Copy `.env.example` → `.env.local` (`.env.local` is gitignored — never commit it)
2. Leave `USE_MOCK_PROVIDERS=true` for local dev — no travel API keys needed
3. Add Supabase vars only when testing auth / saved trips
4. Read config via `getAppConfig()` from `@/lib/config` — never `process.env` in components

| Variable | Required? | Client-safe? | Purpose |
|----------|-----------|--------------|---------|
| `USE_MOCK_PROVIDERS` | No (default `true`) | No | Mock vs real travel providers |
| `NEXT_PUBLIC_SITE_URL` | No | Yes | OAuth redirect base URL |
| `NEXT_PUBLIC_SUPABASE_*` | No | Yes | Auth + saved trips (warns if missing) |
| `DESTINATIONS_PROVIDER` etc. | No | No | Per-domain provider name |
| `AMADEUS_ENV` | No (default `test`) | No | `test` or `production` host selection |
| `AMADEUS_API_KEY` / `AMADEUS_API_SECRET` | When live Amadeus | **Never** | Server-only API credentials |
| `AMADEUS_OAUTH_TIMEOUT_MS` | No (default `10000`) | No | OAuth request timeout |
| `AMADEUS_FETCH_TIMEOUT_MS` | No (default `15000`) | No | Authenticated Amadeus fetch timeout |
| `FLIGHTS_PROVIDER` | No (live default `amadeus`) | No | `mock` · `amadeus` · `serpapi` |
| `SERPAPI_API_KEY` | When live SerpAPI | **Never** | SerpAPI Google Flights (live / production-capable) |
| `SERPAPI_DEEP_SEARCH` | No (default `false`) | No | SerpAPI `deep_search` flag |

**Rules:**
- `NEXT_PUBLIC_` only for values safe in the browser
- API keys (Amadeus, SerpAPI, Booking, Omio, Google) — no `NEXT_PUBLIC_` prefix
- Amadeus / SerpAPI host/timeouts/credentials — only via `getAppConfig()` (never `process.env` in vendor modules)
- `.env.example` is the committed template; put real secrets only in `.env.local`
| Calendar date helpers | `lib/calendar/` | ISO formatting, month grids, range checks |
| `NAV_LINKS` | `lib/navigation.ts` | Single source of truth for nav links |
| `focusRing`, etc. | `lib/styles.ts` | Shared Tailwind class strings |
| Search types | `types/search-form.ts`, `types/search.ts` | `SearchFormController`, `SearchData`, `SearchRequest` |
| Results types | `types/results.ts`, `types/models/` | `SearchResult`, `Hotel`, `Flight`, `Bus`, `Train` |
| Shared models | `types/models/` | All provider-independent domain types |

**Import convention:** Use `@/lib/search` and `@/types` — not the inner files directly from components (unless you are editing the search module itself).

---

## Search form behavior (do not break)

1. User fills fields in `SearchCard`
2. **From** — required; type or pick a departure city from suggestions
3. **Destination** — required; type to filter mock suggestions; empty field shows recent searches and popular destinations; pick with mouse or arrow keys + Enter; selections persist in localStorage
4. **Dates** — required; click trigger to open calendar; choose Round-trip or One-way; pick departure (and return for round-trip) on the calendar; past dates are disabled; click Done
5. **Travelers** — required; click trigger to open panel; adjust Adults, Children, Infants, Rooms with +/- steppers; infants cannot exceed adults; click Done
6. **Budget** — required numeric input (€0–€10,000); pick a currency; type amount (e.g. 1500)
7. User clicks **Search** button
8. `actions.submit()` runs `validateAndBuildSearchRequest()` → `SearchRequest`
9. If invalid → summary alert at top + red error messages under each field
10. If valid → `router.push(buildResultsUrlFromRequest(request))` navigates to `/search/results`
11. Results page calls `postSearchTrips()` via `useServiceQuery` → `POST /api/search` (server runs providers)
12. Providers run **server-side only** — default is mock; optional live SerpAPI (flights + hotels) or Amadeus flights via env

Required fields: From, Destination, Departure, Return (round-trip only), Travelers (≥1 adult, ≥1 room), Travel style, at least one result type.  
Return date must be ≥ departure date.  
Infants cannot exceed adults.

---

## Folder conventions

```
app/                  → routes and page files only
components/home/      → home page sections
components/layout/    → navbar, footer, shell, brand
components/search/    → search feature (NOT generic ui)
components/ui/        → generic reusable components only
hooks/                → custom React hooks
lib/search/           → search validation, payload, constants
lib/api/              → env, errors, types, searchClient, validation, HTTP responses
  searchClient.ts     → postSearchTrips() (browser → POST /api/search)
  cache.ts            → generic TTL cache (imported privately by Amadeus auth)
lib/providers/        → provider adapters (mock + external APIs)
  core/               → registry, config, factories, interfaces
  destinations/       → mock ✅, google-maps (planned)
  search/             → monolithic mock ✅ (legacy; prefer domain providers)
  hotels/             → mock, serpapi/ (live ✅ v0.18.0), booking (stub → mock)
    serpapi/          → googleHotels, client, mappers, provider, fixtures, integration tests
  flights/            → mock ✅, serpapi/ (live, production-capable ✅ v0.17.0), amadeus/ (long-term Enterprise ✅)
    amadeus/          → OAuth, client, flightOffers, mappers, provider
    serpapi/          → googleFlights, client, mappers, provider, fixtures, integration tests
  ground/             → mock, omio (planned)
lib/packages/         → PackageComposer (TravelPackage composition + scoring) — product layer, not a provider
lib/services/         → server-side service layer (searchService is server-only)
  context.ts          → getServiceProviders / setServiceProviders (simple DI)
  iataResolution.ts   → enrich SearchRequest with optional airport IATA codes
  searchOrchestrator  → enrichment + flight IATA validation + parallel providers + package compose
lib/providers/core/   → registry + config (selects active adapters)
app/api/search/       → POST /api/search Route Handler
lib/                  → other plain TS modules (navigation, styles, utils)
types/models/         → shared domain models incl. TravelPackage (import from @/types)
types/search.ts       → form types; SearchData legacy alias
types/results.ts      → SearchResult union
docs/                 → project documentation
```

**Do not** put feature-specific components in `components/ui/`.  
**Do not** put React or JSX in `lib/`.

---

## Styling conventions

- Brand colors: `brand-50` through `brand-900` (defined in `globals.css`)
- Use `motion-safe:` prefix for hover animations (accessibility)
- Use `focusRing` from `lib/styles.ts` for keyboard focus
- Use `PageContainer` for consistent max-width and padding
- Use `SectionHeading` for section titles instead of duplicating heading classes
- Use `BrandLogo` for the Glooconn wordmark instead of inline markup
- Page background: `#f8fafc` (slate-50)

---

## Common tasks after Milestone 16

**Milestone 13–15** ✅ **v0.19.0 / v0.20.0**. **Milestone 16 — Recommendation Intelligence** ✅ **v0.21.0**.

Recommended next priorities (see [TODO.md](./TODO.md)):

1. **Milestone 17** — only after CTO authorization
2. **Destinations / About pages** — then restore nav links
3. Optional: airline-level near-duplicate suppression in package top 5
4. One-way proactive note in `TravelDatesSelector` (deferred)
5. **Amadeus Enterprise** — enablement when credentials are ready
6. SerpAPI round-trip `departure_token` enrichment polish (carry-forward)
7. Fix `SectionHeading` hydration warning (dev overlay)

---

## Current architecture (flights + hotels + packages)

```
SearchRequest → factory → FlightsProvider (mock | serpapi | amadeus)
  → query builder → HTTP client → mapper → Flight[]

SearchRequest → factory → HotelsProvider (mock | serpapi | booking stub)
  → query builder → HTTP client → mapper → Hotel[]

Flight[] + Hotel[] + SearchRequest
  → PackageComposer
      candidates (16.2) → compose → score → diversity (16.3)
  → TravelPackage[]
  → UI top 5 + assignPackageExplanations (16.4 / 16.5.1)
  → SearchResponse.packages (product layer — never a provider)
```

| Domain | Provider | Role |
|--------|----------|------|
| Flights | `mock` | Default local + CI |
| Flights | `serpapi` | **Live flights — production-capable (v0.17.0)** |
| Flights | `amadeus` | Long-term Enterprise / future production path |
| Hotels | `mock` | Default local + CI |
| Hotels | `serpapi` | **Live hotels — production-capable (v0.18.0)** |
| Packages | ✅ Product layer | Composed in orchestrator via `lib/packages` (candidates → score → diversity → UI explanations) |

**Completed:** Sprints 1–8 · Sprint 9 · Milestone 10 · **Milestone 11 → v0.17.0** · **Milestone 12 → v0.18.0** · **Milestone 13 → v0.19.0** · **Milestone 14–15 → v0.20.0** · **Milestone 16 → v0.21.0**

**Known limitations:** RT `departure_token` return fetches may HTTP 400 → outbound fallback; hotels require `returnDate`; `children_ages` defaults to `8`; package candidates skew budget; currencyService DI debt; no live vendor calls in CI.

---

## Git workflow

```bash
git checkout -b cursor/task-name
# ... make changes ...
git add <files>
git commit -m "Concise message describing why."
git push -u origin cursor/task-name
```

Current active branch may vary. Check with `git branch --show-current`.

On Windows PowerShell, if `npm` fails, use `npm.cmd run dev`.

---

## Files to read before editing

| If working on… | Read these first |
|----------------|------------------|
| Search form / results | `docs/API_FOUNDATION.md`, `lib/services/`, `hooks/useSearchForm.ts` |
| Navigation | `lib/navigation.ts`, `components/layout/Navbar.tsx` |
| New page | `app/layout.tsx`, `components/layout/AppShell.tsx`, an existing page |
| Styling | `app/globals.css`, `lib/styles.ts` |
| Types | `types/search.ts`, `types/index.ts` |

---

## What NOT to do

- ❌ Do not treat SerpAPI as a throwaway prototype — it is the **production-capable live flights** path (v0.17.0); still keep Amadeus as the long-term Enterprise path
- ❌ Do not modify `lib/providers/flights/amadeus/**` unless CTO-approved (long-term Enterprise path)
- ❌ Do not call `searchTrips()` or `searchService` from client components — use `postSearchTrips()` from `@/lib/api`
- ❌ Do not assume search success data is `SearchResult[]` — it is `SearchResponse` (flatten with `searchResponseToResults`)
- ❌ Do not mention vendor names in search warning copy
- ❌ Do not treat one provider throw as a full search failure in new orchestration code — use settled isolation (ADR-037)
- ❌ Do not call provider modules directly from UI — use services (server) or HTTP clients (browser)
- ❌ Do not put flight IATA validation inside `iataResolution.ts` — enrichment only; orchestrator owns product rules
- ❌ Do not resolve IATA inside `FlightsProvider` adapters — use enriched `SearchRequest` fields
- ❌ Do not call Amadeus OAuth / `amadeusFetch` / `searchFlightOffers` or SerpAPI `searchGoogleFlights` from UI / orchestrator — only vendor adapter code
- ❌ Do not re-export `lib/api/cache` from the public `@/lib/api` barrel — auth imports it privately
- ❌ Do not pass empty `destinationId` into flight mappers — provider must validate first
- ❌ Do not import vendor `mappingHelpers` or package-private `types` outside that vendor package — use the public barrel
- ❌ Do not silently skip offers for unsupported currency — surface `createProviderError`
- ❌ Do not fabricate flight ratings (mapper uses `rating: 0`)
- ❌ Do not call real Amadeus or SerpAPI APIs from automated tests — use mocked `fetch` and fixtures
- ❌ Do not set arbitrary Amadeus base URLs — use `AMADEUS_ENV=test|production` only
- ❌ Do not log API keys, tokens, Authorization headers, credentialed URLs, payloads, or PII
- ❌ Do not reintroduce client imports of the full provider registry that pull `server-only` (see currencyService debt / ADR-035)
- ❌ Do not change `Flight`, `SearchRequest`, or search orchestration to fit a vendor
- ❌ Do not add external API integrations without being asked
- ❌ Do not install UI libraries (shadcn, MUI) without approval
- ❌ Do not refactor unrelated code during a feature task
- ❌ Do not duplicate nav links outside `lib/navigation.ts`
- ❌ Do not duplicate brand markup — use `BrandLogo`
- ❌ Do not duplicate heading styles — use `SectionHeading`
- ❌ Do not use Pages Router patterns (this is App Router only)

---

## Documentation index

| File | When to read |
|------|--------------|
| [PROJECT.md](./PROJECT.md) | Project overview and structure |
| [ROADMAP.md](./ROADMAP.md) | Long-term feature plan |
| [PROGRESS.md](./PROGRESS.md) | What was completed each week |
| [TODO.md](./TODO.md) | What to build next |
| [DECISIONS.md](./DECISIONS.md) | Why things are built this way (incl. ADR-036) |
| [API_FOUNDATION.md](./API_FOUNDATION.md) | API layers, provider swap guide |
| [Provider_Guide.md](./Provider_Guide.md) | How to add a flights vendor |
| [CURRENT_STATE.md](./CURRENT_STATE.md) | Latest release snapshot |
| [releases/v0.17.0.md](./releases/v0.17.0.md) | v0.17.0 Live Flights (Milestone 11) |
| [releases/v0.16.0.md](./releases/v0.16.0.md) | v0.16.0 Milestone 10 Search Experience release |
| [releases/v0.15.0.md](./releases/v0.15.0.md) | v0.15.0 SerpAPI multi-provider release |
| [../CHANGELOG.md](../CHANGELOG.md) | Release history |
| [SPRINT_8_SUMMARY.md](./SPRINT_8_SUMMARY.md) | Sprint 8 hardening + sandbox checklist |
| [AI_HANDOFF.md](./AI_HANDOFF.md) | This file — start here |

---

## User context

- **Experience level:** Beginner — explain concepts clearly
- **Communication style:** Wants explanations of every file and step
- **Location:** Milan, Italy (timezone UTC+2)
- **GitHub:** SDZLVA
- **Company name in profile:** Glooconn

When in doubt, ask before making large changes.
