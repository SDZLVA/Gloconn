# Glooconn — Progress Log

A week-by-week record of completed work. Update this file at the end of each development week.

---

## Week 1 — Project foundation

**Dates:** Early July 2026  
**Branch history:** `cursor/initial-glooconn-setup` → `cursor/main-layout` → `cursor/home-hero-section` → `cursor/search-form-state` → `cursor/search-button-console-log` → `cursor/ui-polish` → `cursor/project-cleanup`

### Day 1 — Environment and project setup

- Created Next.js 16 project with TypeScript, Tailwind CSS, and App Router
- Resolved Windows PowerShell `npm` execution policy issue
- Installed Git and GitHub CLI
- Initialized Git repository and pushed to [github.com/SDZLVA/Gloconn](https://github.com/SDZLVA/Gloconn)
- Added `PROJECT_RULES.md` for development guidelines

### Day 2 — Main layout

- Built sticky `Navbar` with Glooconn logo and navigation links
- Built responsive mobile hamburger menu
- Built `Footer` with link groups and copyright
- Created `AppShell` layout wrapper used on every page
- Added brand color tokens to `globals.css`

**Files added:** `Navbar.tsx`, `Footer.tsx`, `AppShell.tsx`

### Day 3 — Home page hero

- Created `HeroSection` with headline, subtitle, and gradient background
- Created reusable `Card`, `Button`, and `InputField` UI components
- Created `SearchCard` with destination and date fields (UI only at this stage)

**Files added:** `HeroSection.tsx`, `Card.tsx`, `Button.tsx`, `InputField.tsx`, `SearchCard.tsx`

### Day 4 — Search form logic

- Expanded search fields: Destination, Departure date, Return date, Budget, Travelers, Travel style
- Added React state management to `SearchCard`
- Created `TravelStyleSelector` (Budget / Standard / Luxury)
- Added required-field validation with inline error messages

**Files added:** `TravelStyleSelector.tsx`, `types/search.ts` (later merged into `types/index.ts`)

### Day 5 — Search button and validation

- Extracted validation to `lib/validateSearchForm.ts` (later merged into `lib/search.ts`)
- Extracted console logging to `lib/logSearchData.ts` (later merged into `lib/search.ts`)
- Created `SearchButton` component (later removed in refactor; `Button` used directly)
- Search click validates all fields and logs data to browser console on success

### Day 6 — UI polish

- Added hover animations with `motion-safe:` (respects reduced-motion preference)
- Improved typography (`text-balance`, `text-pretty`, semibold labels)
- Rounded cards (`rounded-3xl`), improved spacing, mobile-responsive form grid
- Added accessibility: focus rings, `sr-only` required labels, `aria-*` attributes

### Day 7 — Code refactor and documentation

- Consolidated navigation links into `lib/navigation.ts`
- Merged search helpers into `lib/search.ts`
- Extracted shared styles to `lib/styles.ts`
- Created `useSearchForm` hook
- Moved search components to `components/search/`
- Created shared `FormField`, `PageContainer`, `NavLinkItem` components
- Removed duplicated code across navbar, footer, and form components
- Created professional `docs/` folder (this documentation)

---

## Week 1 summary

| Metric | Count |
|--------|-------|
| Pages live | 1 (`/`) |
| React components | ~17 |
| Custom hooks | 1 (`useSearchForm`) |
| Lib modules | `navigation`, `styles`, `utils`, `search/*` (4 files) |
| Type modules | `types/search.ts` + barrel `types/index.ts` |
| Git commits (feature branches) | 7+ |
| External APIs connected | 0 |

---

## Week 2 — Search card improvements

**Branch:** `cursor/search-card-improvements`

### Changes

- Added destination autocomplete with mock data (`lib/destinations.ts`)
- Added recent searches (localStorage) and popular destinations sections
- Added reusable `Autocomplete` and `NumberStepper` UI components
- Replaced single travelers number input with `TravelersSelector` (Adults, Children, Infants, Rooms)
- Updated search types, validation, and payload for structured travelers data
- Renamed date labels to "Departure" and "Return"
- Updated all documentation

**Files added:** `lib/destinations.ts`, `lib/destinations/recentSearches.ts`, `lib/search/travelers.ts`, `hooks/useRecentDestinationSearches.ts`, `components/ui/Autocomplete.tsx`, `components/ui/NumberStepper.tsx`, `components/search/DestinationAutocomplete.tsx`, `components/search/TravelersSelector.tsx`

### Travel calendar

- Replaced native `<input type="date">` fields with `TravelDatesSelector` dropdown
- Added reusable `TravelCalendar` UI component (range/single selection, past dates disabled)
- Added round-trip / one-way trip type toggle
- Added `lib/calendar/` date utilities and `TripType` to search form state
- Updated validation (return date required only for round-trip)
- Updated all documentation

**Files added:** `lib/calendar/dates.ts`, `lib/calendar/index.ts`, `lib/search/dates.ts`, `components/ui/TravelCalendar.tsx`, `components/search/TravelDatesSelector.tsx`

### Budget slider

- Replaced optional budget number input with `BudgetSelector` and reusable `BudgetSlider`
- Added currency selector (EUR, USD, GBP) with live formatted value display
- Added min/max budget labels (€500–€10,000) and clear action for optional field
- Added `lib/budget/` helpers and slider track styles in `globals.css`
- Updated search payload to include `budgetCurrency` when a budget is set
- Updated all documentation

**Files added:** `lib/budget/currencies.ts`, `lib/budget/index.ts`, `components/ui/BudgetSlider.tsx`, `components/search/BudgetSelector.tsx`

### Passengers selector

- Extracted reusable `PassengersSelector` UI component (Adults, Children, Infants, Rooms with +/- steppers)
- Added `lib/search/passengers.ts` with limits, summary formatting, and `validatePassengers()`
- Infants are capped at adult count during stepper use; form validation reuses the same rules
- `TravelersSelector` now wraps `PassengersSelector` for the search card
- Updated all documentation

**Files added:** `lib/search/passengers.ts`, `components/ui/PassengersSelector.tsx`

---

## Week 2 — Core pages (in progress)

### Search results page

- Added `/search/results` route with mock hotels, flights, buses, and trains
- Built reusable result cards (`HotelResultCard`, `FlightResultCard`, `BusResultCard`, `TrainResultCard`)
- Added filter sidebar (transport type, price range, minimum rating) and sort bar
- Responsive layout: collapsible filters on mobile, sticky sidebar on desktop
- Search form now navigates to results via URL query params (`lib/search/params.ts`)
- Mock data in `lib/results/` with filter and sort helpers
- Updated all documentation

**Files added:** `app/search/results/page.tsx`, `types/results.ts`, `lib/results/`, `lib/search/params.ts`, `components/results/`

See [TODO.md](./TODO.md) for remaining Week 2 tasks.

---

## Authentication and saved trips

**Dates:** July 2026

### Changes

- Added Supabase authentication (Google OAuth + email/password)
- Protected `/my-trips` and `/profile` via `middleware.ts`
- Built login, signup, profile, and my-trips pages
- Saved trips stored in Supabase `saved_trips` table with Row Level Security
- Save trip button on search results page
- Navbar user menu with sign in / profile / sign out

**Packages added:** `@supabase/supabase-js`, `@supabase/ssr`

**Files added:** `lib/auth/`, `lib/trips/`, `middleware.ts`, `app/login/`, `app/signup/`, `app/profile/`, `app/my-trips/`, `app/auth/`, `components/auth/`, `components/trips/`, `hooks/useAuth.ts`, `supabase/schema.sql`, `.env.example`

---

## API foundation

**Branch:** `cursor/api-foundation`

### Changes

- Added `lib/api/` — centralized env (`USE_MOCK_PROVIDERS`), `ApiError`, `ServiceResult` / `ServiceState`, and `validateSearchRequest`
- Added `lib/providers/` — `DestinationProvider` and `SearchProvider` interfaces; mock implementations as first providers
- Added `lib/services/` — `destinationService` and `searchService` as the UI entry point for travel data
- Added `hooks/useServiceQuery.ts` — reusable loading / success / error state for async services
- Moved `Destination` type to `types/destination.ts`
- Wired `DestinationAutocomplete` and `SearchResultsPage` through services (loading and error UI)
- Kept `lib/destinations.ts` and `lib/results/index.ts` as backward-compatible re-exports
- Updated `.env.example` with `USE_MOCK_PROVIDERS`

**No external APIs connected** — mock provider remains the default.

---

## Provider folder scaffold

**Branch:** `cursor/api-foundation`

### Changes

- Scaffolded `lib/providers/core/`, `hotels/`, `flights/`, `ground/` with future provider slots
- Added `lib/providers/destinations/google-maps/` placeholder
- Added stub files: `searchOrchestrator.ts`, `lib/api/cache.ts`, `types/search-response.ts`
- Added `app/api/destinations/` and `app/api/search/` Route Handler slots
- No business logic, UI changes, or API connections

---

## Shared domain models

**Branch:** `cursor/api-foundation`

### Changes

- Added `types/models/` with documented provider-independent models
- Models: Hotel, Flight, Bus, Train, Destination, Restaurant, Attraction, Traveler, Budget, SearchRequest, SearchResponse
- `types/results.ts` now extends shared models with `type` discriminators
- `SearchData` preserved for backward compatibility; `SearchRequest` is canonical for new code

---

## Provider interfaces

**Branch:** `cursor/api-foundation`

### Changes

- Added `lib/providers/core/base.ts` — `BaseProvider` with `name`
- Added domain interfaces: `DestinationProvider`, `HotelsProvider`, `FlightsProvider`, `TransportProvider`, `RestaurantsProvider`, `AttractionsProvider`
- Marked legacy `SearchProvider` as deprecated
- No new provider implementations — existing mock adapters unchanged

---

## Mock provider classes

**Branch:** `cursor/api-foundation`

### Changes

- Added `MockHotelsProvider`, `MockFlightsProvider`, `MockTransportProvider`, `MockDestinationProvider` classes
- Centralized shared logic in `lib/providers/mock/shared.ts`
- Implemented `lib/providers/orchestrate.ts` — parallel domain provider calls
- `searchService` now uses orchestrator instead of monolithic `SearchProvider`
- Legacy `SearchProvider` delegates to orchestrator for backward compatibility
- UI unchanged — still receives `SearchResult[]` via `searchTrips()`

---

## Service layer with provider injection

**Branch:** `cursor/api-foundation`

### Changes

- Added `lib/services/context.ts` — `getServiceProviders()`, `setServiceProviders()` for simple DI
- Centralized provider selection in `lib/providers/core/registry.ts` and `config.ts`
- Moved search orchestration to `lib/services/searchOrchestrator.ts`
- Added `lib/api/searchMappers.ts` — `toSearchRequest`, `mergeSearchResults`, catalog search
- Services call provider interfaces only — no direct mock data imports
- Recent destinations resolve stored IDs via `destinationService.getDestinationsByIds()`
- Removed `lib/providers/orchestrate.ts` (orchestration now lives in services)

---

## Centralized error handling

**Branch:** `cursor/api-foundation`

### Changes

- Enhanced `lib/api/errors.ts` — error factories, HTTP status mapping, `isApiError`
- Added `lib/api/responses.ts` — `ApiResponse<T>`, `toJsonResponse()` for Route Handlers
- Added `runService()` / `runServiceSync()` in `lib/api/types.ts` — DRY try/catch in services
- Validation uses `createValidationError()` with optional `field`
- `useServiceQuery` catches unexpected promise rejections
- Services refactored to use `runService()` instead of manual try/catch

---

## Centralized environment configuration

**Branch:** `cursor/api-foundation`

### Changes

- Added `lib/config/` — `getAppConfig()`, `loadAppConfig()`, `validateAppConfig()`
- Typed sections: `app`, `supabase`, `providers`, `apiKeys`, `validation`
- Per-domain provider env vars: `DESTINATIONS_PROVIDER`, `HOTELS_PROVIDER`, etc.
- Placeholder API key slots: Amadeus, Booking, Omio, Google Maps (no real keys)
- `lib/api/env.ts` and `lib/auth/env.ts` delegate to centralized config
- Expanded `.env.example` with documentation and future key placeholders
- Server logs config warnings/errors once on first `getAppConfig()` call

---

## API foundation review

**Branch:** `cursor/api-foundation`

### Changes

- Added `lib/providers/core/factories.ts` — per-domain provider selection from env
- Added `lib/providers/flights/amadeus/` — `AmadeusFlightsProvider` stub (swap point)
- Consolidated `ServiceProviders` → re-export of `ProviderRegistry`
- Deduplicated orchestration (`searchAllDomains`, destination id enrichment)
- Deprecated `mockSearchProvider` delegates to service orchestrator
- Removed dead `lib/providers/search/mock/search.ts`
- Added `docs/API_FOUNDATION.md` — architecture reference and Amadeus swap guide
- Extended models: `Destination.iataCode`, `SearchRequest.origin`
- Updated all docs for accuracy (removed stale `app/api/` claims where needed)

---

## Search card — provider-ready fields & layout

**Branch:** `cursor/api-foundation`

### Provider-ready form fields

- Added `destinationId`, `origin`, `originId`, and `productTypes` to form state and URL params
- Added `OriginAutocomplete`, `SearchProductSelector`, and `SearchCardContainer` (URL hydration)
- Orchestrator respects `productTypes` and skips destination re-resolution when `destinationId` is set
- Mock destinations include IATA codes; added Milan
- Edit search on results prefills the home page form via URL params

### Responsive layout pass

- Grouped fields into sections: **Where**, **When**, **Trip details**, **Preferences**
- Origin and destination side-by-side on large screens; travelers and budget side-by-side on medium+
- Consistent section spacing, subtle dividers, wider card (`max-w-4xl`)
- Semantic `<form>` with `aria-label` and section `role="group"` headings
- Updated `docs/PROJECT.md`, `docs/AI_HANDOFF.md`, `docs/PROGRESS.md`

### Reusable SearchForm refactor

- Added `types/search-form.ts` — `SearchFormState`, `SearchFormActions`, `SearchFormController`, `PlaceSelection`
- Added `SearchForm` (presentational UI), `SearchFormSection`, `SearchFormWithState`
- `useSearchForm` returns `SearchFormController`; `SearchCard` is card chrome only
- Updated all documentation

### Form validation (required fields)

- **From** is now required (was optional)
- **Budget** is now required with min/max checks via `lib/search/budget.ts`
- Validation summary alert when submit fails; inline errors under each field
- `validateSearchRequest` aligned with the same rules for results page
- Updated documentation

### Reusable SearchRequest builder

- Added `lib/search/request.ts` — single module to collect form values into `SearchRequest`
- `validateAndBuildSearchRequest()` used on form submit; `serializeSearchRequest()` for future API body
- `searchOrchestrator.orchestrateTripSearch()` now accepts `SearchRequest` directly
- `validateSearchRequest()` returns `ServiceResult<SearchRequest>`
- URL serialization delegated to `searchRequestToParams()`; `buildSearchData()` delegates to request builder
- Updated documentation

### Search engine completion

- Results route parses `SearchRequest` via `parseSearchRequestFromParams`
- `searchTrips` and results UI use `Partial<SearchRequest>` end to end
- Added `POST /api/search` Route Handler (`app/api/search/route.ts`)
- Added `resolveProductTypes` for explicit empty-array validation
- Expanded mock destinations with descriptions (Berlin, Singapore added)
- Added unit tests (`lib/search/search.test.ts`) and `npm test` script
- Added GitHub Actions CI (typecheck, lint, test, build)
- Updated all documentation

---

**Branch:** `cursor/architecture-improvements`

### Changes

- Split `lib/search.ts` into `lib/search/` (validation, payload, constants)
- Split search types into `types/search.ts` with barrel re-export in `types/index.ts`
- Added `SectionHeading` UI component — shared hero and card headings
- Added `BrandLogo` layout component — shared navbar/footer wordmark
- Renamed `TRAVEL_STYLES` → `TRAVEL_STYLE_OPTIONS` in `lib/search/constants.ts`
- Removed duplicate `formLabel` class string from `FormField` (uses `lib/styles.ts`)
- Added `"use client"` to `TravelStyleSelector` for correct client boundary
- Updated `README.md` and all `docs/` files to reflect new structure

---

## Sprint 1 — Server search boundary ✅ Complete

**Branch:** `cursor/project-principles`  
**Commit:** `99742bd` — *Route trip search through POST /api/search so providers run server-side only.*  
**Dates:** July 2026  
**Status:** Completed successfully — quality gate passed

### Objective

Move trip search execution from the browser to the server while keeping existing functionality unchanged.

### Definition of Done (verified)

- [x] `SearchResultsPage` calls `postSearchTrips()` — not `searchTrips()` directly
- [x] `lib/services/searchService.ts` marked `server-only`
- [x] `POST /api/search` is the only path from browser to providers for trip search
- [x] Existing search, validation, filters, and sorting unchanged from the user’s perspective
- [x] Build, lint, and tests pass
- [x] Documentation updated (`API_FOUNDATION.md`, `AI_HANDOFF.md`, `DECISIONS.md` ADR-030)

### Changes

- Added `lib/api/searchClient.ts` — `postSearchTrips()` calls `POST /api/search`
- Added `serviceResultFromApiResponse()` and `apiErrorFromBody()` in `lib/api/responses.ts`
- Exported `postSearchTrips` from `lib/api/index.ts`
- Updated `SearchResultsPage` to use `postSearchTrips()` instead of direct `searchTrips()`
- Added `import "server-only"` to `lib/services/searchService.ts`
- Updated `docs/API_FOUNDATION.md`, `docs/AI_HANDOFF.md`, `docs/DECISIONS.md` (ADR-030)

### Result

```
Browser → postSearchTrips() → POST /api/search → searchTrips() → orchestrator → providers
```

No client import of `searchService`. API keys and real provider HTTP clients can run on the server starting Sprint 2.

---

## Sprint 2 — IATA resolution ✅ Complete

**Branch:** `cursor/project-principles`  
**Dates:** July 2026  
**Status:** Completed — enrichment + flight airport validation documented (ADR-031)

### Objective

Resolve origin/destination airport IATA codes on the server before flight providers run, without coupling the UI or flight adapters to the destination catalog.

### Definition of Done (verified)

- [x] Optional `originIata` / `destinationIata` on `SearchRequest`
- [x] `lib/services/iataResolution.ts` helper (enrichment only)
- [x] Orchestrator enriches via helper before providers
- [x] Flights requested + missing IATA → clear validation error (no silent skip)
- [x] Hotels/transport-only searches work without IATA
- [x] No Amadeus / OAuth / UI changes
- [x] Documentation updated (`API_FOUNDATION.md`, `AI_HANDOFF.md`, ADR-031, `TODO.md`, `CURRENT_STATE.md`)

### Changes

- Extended `types/models/search-request.ts` with optional IATA fields
- Added `lib/services/iataResolution.ts` — `enrichSearchRequestWithAirports()`, `AirportRef`, etc.
- Wired enrichment into `searchOrchestrator.enrichSearchRequest()`
- Added `assertFlightAirportsResolved()` in the orchestrator
- Updated foundation docs and ADR-031

### Result

```
POST /api/search → searchTrips()
  → enrichSearchRequestWithAirports()
  → assertFlightAirportsResolved()   (flights only)
  → hotels / flights / transport
```

Ready for Sprint 3 — Amadeus client can consume `originIata` / `destinationIata`.

---

## Sprint 3 — Amadeus OAuth & token cache ✅ Complete

**Branch:** `cursor/project-principles`  
**Dates:** July 2026  
**Status:** Completed — OAuth + TTL cache + `amadeusFetch` (ADR-032). No Flight Offers yet.

### Objective

Add server-only Amadeus OAuth (test environment) and a generic token cache so future Flight Offers Search can authenticate without coupling the UI or orchestrator to Amadeus.

### Definition of Done (verified)

- [x] Generic TTL cache in `lib/api/cache.ts`
- [x] `getAmadeusAccessToken()` in `amadeus/auth.ts` (credentials from `getAppConfig`)
- [x] Cache used privately inside auth — not exposed on `@/lib/api` barrel
- [x] `amadeusFetch` / `getAmadeusAuthHeaders` in `amadeus/client.ts`
- [x] Test environment host (`test.api.amadeus.com`)
- [x] No Flight Offers Search, mappers, UI, or orchestrator changes
- [x] Documentation updated (ADR-032, foundation, handoff, progress, todo, current state, roadmap)

### Changes

- Implemented `lib/api/cache.ts` — `getCached` / `setCached` / `deleteCached` / `clearCache`
- Added `lib/providers/flights/amadeus/auth.ts`
- Replaced stub `amadeus/client.ts` with HTTP infrastructure using auth
- Documented architecture in ADR-032

### Result

```
Amadeus adapter (server-only)
  auth.ts  → getAmadeusAccessToken() → TTL cache
  client.ts → amadeusFetch(path) → Bearer token + test base URL
AmadeusFlightsProvider.search → still mock (Sprint 5)
```

---

## Sprint 4 — Flight Offers HTTP ✅ Complete

**Branch:** `cursor/project-principles`  
**Dates:** July 2026  
**Status:** Completed — GET Flight Offers returns raw JSON (ADR-033). Provider still mocks.

### Objective

Call Amadeus Flight Offers Search over HTTP using enriched IATA fields, without mapping to Glooconn `Flight` or changing app search UX.

### Definition of Done (verified)

- [x] Internal raw types in `amadeus/types.ts`
- [x] Pure `buildFlightOffersSearchParams(request)`
- [x] `searchFlightOffers(request)` via `amadeusFetch` (GET `/v2/shopping/flight-offers`)
- [x] Safe `createProviderError` on HTTP failures
- [x] No response mapping, provider wiring, orchestrator, or UI changes
- [x] Documentation updated (ADR-033, foundation, handoff, progress, todo, current state, roadmap)

### Changes

- Added `lib/providers/flights/amadeus/types.ts`
- Added `lib/providers/flights/amadeus/flightOffers.ts`
- Documented architecture in ADR-033

### Result

```
searchFlightOffers(request)
  → buildFlightOffersSearchParams() → amadeusFetch(...) → raw JSON
AmadeusFlightsProvider.search → still mock
```

Ready for Sprint 5 — mapper (provider wiring deferred to Sprint 6).

---

## Sprint 5 — Flight response mapping ✅ Complete

**Branch:** `cursor/project-principles`  
**Dates:** July 2026  
**Status:** Completed — Amadeus → `Flight` mapping (ADR-034). Provider still mocks.

### Objective

Map raw Amadeus Flight Offers JSON to Glooconn `Flight` models inside the Amadeus package, without wiring the live provider or changing app search UX.

### Definition of Done (verified)

- [x] Expanded internal Amadeus types (mapper fields only)
- [x] Pure helpers in `mappingHelpers.ts`
- [x] `mapAmadeusOfferToFlight` → `Flight | null` (throws on unsupported currency)
- [x] `mapAmadeusFlightOffersResponse` → `Flight[]`
- [x] Public barrel exports only `mapAmadeusFlightOffersResponse` (plus existing provider)
- [x] No provider, HTTP, orchestrator, or UI changes
- [x] Documentation updated (ADR-034, foundation, handoff, progress, todo, current state, roadmap)

### Changes

- Added `lib/providers/flights/amadeus/mappingHelpers.ts`
- Added `lib/providers/flights/amadeus/mappers.ts`
- Expanded `lib/providers/flights/amadeus/types.ts`
- Updated `lib/providers/flights/amadeus/index.ts` exports
- Documented architecture in ADR-034

### Result

```
mapAmadeusFlightOffersResponse(raw, { destinationId }) → Flight[]
AmadeusFlightsProvider.search → still mock
```

Ready for Sprint 6 — wire live provider.

---

## Sprint 6 — Live Amadeus provider ✅ Complete

**Branch:** `cursor/project-principles`  
**Dates:** July 2026  
**Status:** Completed — `AmadeusFlightsProvider` uses Flight Offers pipeline (ADR-035).

### Objective

Wire `AmadeusFlightsProvider.search` to `searchFlightOffers` + `mapAmadeusFlightOffersResponse`, with `destinationId` validation, without changing registry selection.

### Definition of Done (verified)

- [x] Provider calls live HTTP + mapper; mock delegation removed
- [x] Missing `destinationId` → `createProviderError`
- [x] Factory selection still mock vs Amadeus by env
- [x] `currencyService` client boundary fixed (mock currency direct; debt recorded)
- [x] No orchestrator / UI / SearchRequest / registry logic changes
- [x] Documentation updated (ADR-035, foundation, handoff, progress, todo, current state, roadmap)

### Changes

- Updated `lib/providers/flights/amadeus/provider.ts`
- Updated `lib/services/currencyService.ts` (client `server-only` boundary)
- Documented architecture in ADR-035

### Result

```
AmadeusFlightsProvider.search → searchFlightOffers → mapAmadeusFlightOffersResponse → Flight[]
USE_MOCK_PROVIDERS=true → mock flights (default)
```

Flight API sprints 1–6 complete for Amadeus search path.

---

## Sprint 7 — Flight API automated testing ✅ Complete

**Branch:** `cursor/project-principles`  
**Dates:** July 2026  
**Status:** Completed — unit + integration tests for Flight API (mocked fetch; no live Amadeus in CI).

### Objective

Add a comprehensive automated test suite for helpers, mappers, query builder, TTL cache, and `AmadeusFlightsProvider.search` without changing production Flight API behavior.

### Definition of Done (verified)

- [x] Fixtures + `server-only` test stub
- [x] `mappingHelpers.test.ts`
- [x] `mappers.test.ts`
- [x] `flightOffers.test.ts` (query builder) + `cache.test.ts`
- [x] `provider.test.ts` (mocked fetch integration)
- [x] `npm test` green — **85** automated tests
- [x] Documentation updated

### Result

```
Unit: helpers, mappers, buildFlightOffersSearchParams, cache
Integration: AmadeusFlightsProvider.search (mocked token + offers)
Manual Amadeus sandbox → Sprint 8 checklist
```

---

## Sprint 8 — Flight API production hardening ✅ Complete

**Branch:** `cursor/project-principles`  
**Dates:** July 2026  
**Status:** Completed — timeouts, 401 retry, 429 handling, centralized Amadeus config, structured logging, docs + sandbox checklist.

### Objective

Harden the live Amadeus Flight API path for production readiness without changing provider contracts or mock behavior.

### Definition of Done (verified)

- [x] Request timeouts on OAuth + `amadeusFetch`
- [x] 401 → clear cache → single retry
- [x] 429 → no retry; safe user message; Retry-After not in UI
- [x] `AMADEUS_ENV=test|production` → known hosts; timeout envs via `lib/config`
- [x] Structured Amadeus logs (`provider`, `operation`, `httpStatus`, `durationMs`, `errorCode`)
- [x] Automated tests — **115** total (`npm test`)
- [x] Documentation + manual sandbox checklist (`SPRINT_8_SUMMARY.md`)

### Result

```
Hardening: timeouts · 401 retry · 429 · AMADEUS_ENV + timeouts config · structured logs
Tests: 115 (config, timeouts, retry, logging, Flight API pipeline)
Manual sandbox: checklist documented (not CI)
Debt still open: currencyService DI (ADR-035), partial provider failure
```

**Flight API Sprint 8 complete.** Status: **maintenance mode** — release tag `v0.14.0`.

---

## Flight API — Sprint 9 (SerpAPI multi-provider → v0.15.0)

**Goal:** Add SerpAPI Google Flights as a temporary **dev/test** `FlightsProvider` without changing Amadeus, `Flight`, or search orchestration (ADR-036).

### Done

- [x] ADR-036 + Provider Guide + config (`SerpApiConfig`)
- [x] `lib/providers/flights/serpapi/` — types, query, HTTP, mapper, provider
- [x] Factory registration + fail-fast invalid provider
- [x] Integration / edge / logging / regression tests
- [x] Docs sync + [releases/v0.15.0.md](./releases/v0.15.0.md)
- [x] Automated tests — **192** total (`npm test`)

### Result

```
Providers: mock · amadeus (production path) · serpapi (dev/test)
Tests: 192
Release: v0.15.0
```

**Sprint 9 complete.** Multi-provider architecture shipped as **v0.15.0**.

---

## Milestone 10.1 — Professional Search Results UI ✅ Complete

**Branch:** `cursor/milestone-10-1-results-ui`  
**Scope:** Presentation only — no API, provider, SearchRequest, or backend changes.

### Done

- [x] Loading skeletons for results list
- [x] Results header + richer summary bar (origin → destination, criteria chips)
- [x] Empty states (`no-results` vs `no-matches`) with Edit search / Clear filters
- [x] Error state with Try again + Edit search
- [x] Removed “mock provider” copy
- [x] Spacing / typography / mobile layout polish on `/search/results`

**Files added:** `ResultsLoadingSkeleton.tsx`, `ResultsEmptyState.tsx`, `ResultsErrorState.tsx`, `ResultsHeader.tsx`  
**Files updated:** `SearchResultsPage.tsx`, `ResultsSummaryBar.tsx`, `ResultsList.tsx`, `ResultsSortBar.tsx`

---

## Milestone 10.2 — Search Reliability ✅ Complete

**Branch:** `cursor/milestone-10-2-search-reliability`  
**ADR:** ADR-037

### Done

- [x] Orchestrator uses `Promise.allSettled` for hotels / flights / transport
- [x] `SearchResponse` is the live search success payload (service + API + client)
- [x] `warnings[]` with provider-agnostic `PROVIDER_UNAVAILABLE` messages
- [x] All requested domains failing → hard `PROVIDER_ERROR`
- [x] Validation failures remain blocking
- [x] Results UI warning banner
- [x] Automated tests (partial success, all-fail, validation) — **200** total
- [x] Docs: foundation, handoff, current state, TODO, PROGRESS, ADR-037

**Key files:** `searchOrchestrator.ts`, `searchService.ts`, `searchClient.ts`, `searchMappers.ts`, `SearchResultsPage.tsx`, `ResultsWarningsBanner.tsx`, `searchOrchestrator.test.ts`

---

## Milestone 10.3 — Search Quality ✅ Complete

**Branch:** `cursor/milestone-10-3-search-quality`  
**Scope:** Client-only — `lib/results`, `components/results`, tests, docs. No provider / API / SearchRequest / SearchResponse / orchestrator changes.

### Done

- [x] Richer filters from shared models: price, rating, type, max stops, cabin, airlines, hotel stars, operators, amenities
- [x] Facets derived from the current result set (`collectFilterFacets`)
- [x] Sort options: Recommended · Cheapest · Fastest · Highest rated · Best value
- [x] Pure deterministic ranking (`lib/results/rank.ts`) with documented weights + budget fit
- [x] Default sort = Recommended; budget from search request feeds ranking
- [x] Tests: `filter.test.ts`, `sort.test.ts`, `rank.test.ts`

### Ranking weights (sum = 1.0)

| Signal | Weight | Notes |
|--------|--------|-------|
| Price competitiveness | 0.35 | Cheaper relative to the set scores higher |
| Rating quality | 0.25 | `rating / 5` |
| Journey efficiency | 0.25 | Duration (70%) + flight stops (30%) |
| Stay quality | 0.15 | Hotel stars / 5; neutral 0.5 for non-hotels |

Budget fit multiplies the base score: at/under budget → 1.0; over budget → down to 0.5 at 2× budget.

**Files added:** `lib/results/rank.ts`, `lib/results/filter.test.ts`, `lib/results/sort.test.ts`, `lib/results/rank.test.ts`  
**Files updated:** `types/results.ts`, `lib/results/filter.ts`, `lib/results/sort.ts`, `ResultsFilterSidebar.tsx`, `SearchResultsPage.tsx`, docs

---

## Milestone 10.4 — Search Performance ✅ Complete

**Branch:** `cursor/milestone-10-4-search-performance`  
**Scope:** Client-only optimizations — no provider / API / SearchRequest / SearchResponse / orchestrator / backend changes. No new product features.

### Done

- [x] Stable `buildSearchCacheKey` (canonical fields + sorted `productTypes`)
- [x] Client search TTL cache (~45s) + in-flight request dedupe (`searchResultCache`)
- [x] `useServiceQuery` keeps previous data while loading
- [x] Results page shows skeleton only when no data yet (cache / remount feel instant)
- [x] Destination autocomplete: debounce (~160ms), match cache (~8s), `onListOpen` only on open
- [x] Recent-search reload skips `setState` when IDs unchanged
- [x] Price filter debounce (~200ms) before filter/sort/rank
- [x] Memoized `ResultCard`; stable callbacks on results page
- [x] Tests: `lib/api/searchPerformance.test.ts` — **245** total

### Observed improvements

| Area | Before | After |
|------|--------|-------|
| Remount / back-nav same search | Full POST + blank skeleton | Cache hit (≤45s); keep prior data |
| Concurrent identical POSTs | Multiple network calls | Single shared in-flight promise |
| Autocomplete keystrokes | Reload recents + filter every key | Open-only reload; debounced + cached filter |
| Price typing | Filter/sort/rank every input event | Debounced commit (~200ms) |
| Filter/sidebar churn | All cards re-render | Unchanged cards skipped (`memo`) |

**Files added:** `lib/search/cacheKey.ts`, `lib/api/clientTtlCache.ts`, `lib/api/searchResultCache.ts`, `lib/destinations/filterCache.ts`, `hooks/useDebouncedValue.ts`, `lib/api/searchPerformance.test.ts`  
**Files updated:** `searchClient.ts`, `useServiceQuery.ts`, `SearchResultsPage.tsx`, `ResultsFilterSidebar.tsx`, `ResultCard.tsx`, `Autocomplete.tsx`, `DestinationAutocomplete.tsx`, `useRecentDestinationSearches.ts`, docs

---

## Milestone 10.5 — Destination Search Quality ✅ Complete

**Branch:** `cursor/milestone-10-5-destination-quality`  
**Scope:** Client-only destination autocomplete — no providers / API / SearchRequest / SearchResponse / orchestrator / search execution changes.

### Done

- [x] Client ranker (`lib/destinations/rank.ts`) using existing Destination fields only
- [x] Matching: name, label, id, country, region, IATA (exact + prefix), whole-word
- [x] Soft boosts: recent (+8), popular (+5)
- [x] Deduplicate by canonical `destination.id`
- [x] UX: match highlight, Cities / Airports grouping, IATA in description, Home/End keys
- [x] Tests: `rank.test.ts`, `autocompleteNav.test.ts` — **267** total

### Ranking algorithm (base score, first match wins)

| Score | Match |
|------:|-------|
| 120 | Exact IATA |
| 100 | Exact name / label |
| 95 | Exact id |
| 80 | Name / label prefix |
| 75 | Id prefix |
| 70 | IATA prefix |
| 65 | Whole-word in name / label |
| 60 | Country prefix |
| 45 | Country whole-word |
| 40 | Name / label contains |
| 30 | Country contains |
| 20 | Region |
| 15 | Id contains |

Tie-break: score → name → id. Empty query returns `[]` (idle UI uses recent + popular).

**Files added:** `lib/destinations/normalize.ts`, `match.ts`, `rank.ts`, `options.ts`, `highlight.ts`, `rank.test.ts`, `autocompleteNav.test.ts`  
**Files updated:** `filterCache.ts`, `DestinationAutocomplete.tsx`, `Autocomplete.tsx`, `AutocompleteDropdown.tsx`, docs

---

## Milestone 10.6 — Hardening & Release ✅ Complete → **v0.16.0**

**Branch:** `cursor/milestone-10-6-hardening-release`  
**Scope:** Quality only — a11y, cleanup, docs, release. No new features; no provider / API / SearchRequest / SearchResponse / algorithm changes.

### Done

- [x] Regression review of Milestone 10 flows (covered by suite + UI contracts)
- [x] Accessibility fixes (combobox ARIA, filter `aria-controls`, unique CTA labels, rating label, price focus rings, route “to”, empty autocomplete status)
- [x] Client cleanup (unused imports/exports, obsolete helpers)
- [x] Docs sync + [releases/v0.16.0.md](./releases/v0.16.0.md)
- [x] Production checks: test, typecheck, lint, build
- [x] Version bump `package.json` → **0.16.0**

**Milestone 10 complete.**

---

## Milestone 11 — Live Flights (v0.17.0)

**Dates:** July 2026  
**Branch:** `cursor/milestone-10-6-hardening-release`  
**Release:** **v0.17.0** — [releases/v0.17.0.md](./releases/v0.17.0.md) · [../CHANGELOG.md](../CHANGELOG.md)

### Sprint 11.1 / 11.1b — Live validation

- Confirmed existing SerpAPI adapter against live Google Flights API
- Matrix: one-way, round-trip, domestic, international, empty/invalid IATA
- Evidence: [SPRINT_11_1_VALIDATION.md](./SPRINT_11_1_VALIDATION.md), [SPRINT_11_1B_LIVE_RESULTS.json](./SPRINT_11_1B_LIVE_RESULTS.json)

### Sprint 11.2 — Production hardening

- Full date-time mapping (`YYYY-MM-DD HH:mm`)
- Currency fallbacks (response → request → EUR)
- Round-trip `departure_token` return lookups (capped; outbound fallback)
- Automated tests updated — suite at **272**
- Summary: [SPRINT_11_2_SUMMARY.md](./SPRINT_11_2_SUMMARY.md)

### Sprint 11.3 — Production readiness

- End-to-end UI + API validation; performance (`deep_search` on/off); error experience
- Conditional GO for v0.17.0; RT token HTTP 400 documented as follow-up
- Report: [SPRINT_11_3_PRODUCTION_READINESS.md](./SPRINT_11_3_PRODUCTION_READINESS.md)

### Release

- [x] Version bump `package.json` → **0.17.0**
- [x] Release notes + changelog
- [x] Health check (typecheck, test, build) green
- [x] Milestone **11** marked complete; Milestone **12** (hotels) is next

**Milestone 11 complete.**

---

## Milestone 12 — Live Hotels (v0.18.0 prep)

**Dates:** July 2026  
**Branch:** `milestone-12-hotel-search`  
**Release:** **v0.18.0** — release tagging not started · [../CHANGELOG.md](../CHANGELOG.md)

### Sprint 12.1 — SerpAPI Hotels discovery

- API capability matrix, shared `Hotel` mapping table, architecture compatibility assessment
- Risks, testing strategy, Sprint 12.2 proposal

### Sprint 12.2 — SerpAPI Hotels adapter

- `lib/providers/hotels/serpapi/` — query, client, mapper, provider, fixtures, tests
- Factory: `HOTELS_PROVIDER=serpapi`; shared `SERPAPI_API_KEY` with flights
- Automated tests with mocked HTTP only

### Sprint 12.3 — Live validation

- Live searches: Milan, Rome, Paris, Tokyo, New York; currency, guests, empty results
- Critical fix: `children_ages` default when `children > 0`
- Evidence: [SPRINT_12_3_VALIDATION.md](./SPRINT_12_3_VALIDATION.md)

### Sprint 12.4 — Production hardening

- Consolidated SerpAPI logging; expanded error handling and test coverage
- Documentation sync (Provider Guide, API_FOUNDATION, CURRENT_STATE, CHANGELOG)
- Automated tests — suite at **317**
- Report: [SPRINT_12_4_PRODUCTION_READINESS.md](./SPRINT_12_4_PRODUCTION_READINESS.md)

### Release prep (next)

- [ ] Version bump `package.json` → **0.18.0**
- [ ] Release notes + tag
- [ ] Sprint 12.5 audit blockers resolved (docs sync + M12 commit)

**Milestone 12 complete** — awaiting v0.18.0 release.

---

## Milestone 13 — Travel Packages (v0.19.0 prep)

**Dates:** August 2026  
**Branch:** `milestone-12-hotel-search`  
**Release:** **v0.19.0** — release tagging not started · [../CHANGELOG.md](../CHANGELOG.md)

### Sprint 13.1 — Discovery

- Architecture: compose above FlightsProvider + HotelsProvider (no PackagesProvider)
- CTO approval: TravelPackage model, caps, scoring weights, partial-failure policy

### Sprint 13.2 — TravelPackage + PackageComposer

- Shared `TravelPackage` model; pure `composePackages` + isolated scoring
- Currency match, candidate caps, stable ids, deterministic ranking
- Unit tests for composer + score helpers

### Sprint 13.3 — Orchestrator integration

- `SearchResponse.packages` always present (`[]` when none)
- Compose after domain settle; ADR-037 unchanged; packages never call providers
- Integration tests with mock providers

### Sprint 13.4 — Recommended Packages UI

- `RecommendedPackagesSection` + `TravelPackageCard` (memoized)
- Hero above existing results list; hidden when empty; informational only

### Sprint 13.5 — Validation & hardening

- Live SerpAPI routes P1–P5 all **pass** (packages price/currency/nights/destination/ranking)
- Label fix: package timeline Arrive (not misleading Return under RT fallback)
- Docs sync; suite **358**; typecheck + build green
- Report: [SPRINT_13_5_PRODUCTION_READINESS.md](./SPRINT_13_5_PRODUCTION_READINESS.md)

### Release

- [x] Version bump `package.json` → **0.19.0**
- [x] Release notes `docs/releases/v0.19.0.md` + changelog
- [x] Annotated tag **v0.19.0**

**Milestone 13 complete. Released as v0.19.0.**

---

## Milestone 14 — MVP Focus

**Dates:** August 2026  
**Branch:** `milestone-12-hotel-search`  
**Release:** optional **v0.20.0** — not tagged yet · [../CHANGELOG.md](../CHANGELOG.md)

### Sprint 14.1 — Discovery

- KEEP / HIDE / REMOVE audit for first-search MVP

### Sprint 14.2 — UI simplification

- Hide Travel Style, Rooms, transport toggles/results/filters (architecture retained)
- Remove Destinations/About nav and fake booking CTAs
- Default product types: hotels + flights

### Sprint 14.3 — UX polish

- Origin ↔ destination swap; dynamic `Budget (CODE)` label
- Flight trip-type wording; Browse Flights / Browse Hotels hierarchy
- Mobile auth menu parity

### Sprint 14.4 — Validation

- E2E MVP journey validated (packages, flights, hotels, filters, edit/save chrome)
- **381** tests; typecheck + build green
- Docs synchronized

- [ ] Commit Milestone 14
- [ ] Optional v0.20.0 tag (CTO)

**Milestone 14 engineering complete — included in M15 commit.**

---

## Milestone 15 — MVP Conversion

**Dates:** August 19, 2026  
**Branch:** `milestone-12-hotel-search`  
**Release:** **v0.20.0** — not tagged yet · [../CHANGELOG.md](../CHANGELOG.md)

### Sprint 15.1 — Discovery audit

- CTO-level product audit of the MVP as a new user
- Identified gaps in price honesty, package UX, and budget UX

### Sprint 15.2 — Price Trust + Critical MVP Fixes

- Flight price explicitly labeled "per person" on flight cards and package flight box
- Hotel price labeled "N nights · 1 room" on hotel cards and package hotel box
- Package footer: "Flight (per person) + hotel (N nights, 1 room) · est. total"
- Quality badge ("Top Pick" / "Good Match") replaces opaque numeric score
- Zero-star hotels show "Unrated" instead of an empty string
- Multi-room warning for groups > 2 adults

### Sprint 15.3 — Recommended Package UX

- Packages capped at 5 initially with "Show N more packages" toggle
- One-line "What's included" summary per card ("Flight + N nights at Hotel")
- Result counts ("X flights · Y hotels") in sort bar
- Flight route context (e.g. LHR → CDG) on flight cards and package cards
- One-way hotel warning banner when return date is missing
- Quality-aware "6+2" candidate pool (6 cheapest + 2 highest-rated)

### Sprint 15.4 — Flexible Budget + Budget Compatibility Warning

- Budget is now **optional** — empty input passes validation; `buildSearchRequest` emits `null` budget
- `BudgetSelector`: currency + input side-by-side on desktop; stacked on mobile; no required asterisk; placeholder "Any budget"
- Budget compatibility warning banner above Recommended Packages when all same-currency packages exceed the user's budget
- Currency-safe logic: warning suppressed when no packages share the budget's currency (no FX conversion)
- `shouldShowBudgetCompatibilityWarning` pure helper in `lib/results/packagesUi.ts`

### M15 Closeout — Documentation + Flight Price Wording

- Flight browse cards (`FlightResultCard`) now show "per person" suffix instead of "total"
- All documentation synchronized (AI_HANDOFF, CURRENT_STATE, CHANGELOG, TODO, ROADMAP, README, PROGRESS)

**Result:** 551 tests · typecheck clean · build clean · 0 vulnerabilities · security S1–S4 intact

**Milestone 15 complete — released as v0.20.0.**

---

## Milestone 16 — Recommendation Intelligence

**Branch:** `milestone-12-hotel-search`  
**Release:** **v0.21.0** — [../CHANGELOG.md](../CHANGELOG.md) · [releases/v0.21.0.md](./releases/v0.21.0.md)

### Sprint 16.1 — Discovery

- Read-only audit of Recommended Packages ranking quality
- Confirmed SerpAPI `Flight.rating` always 0; cartesian clones dominate naive top 5
- Architecture locked inside `PackageComposer`

### Sprint 16.2 — Candidate quality

- `lib/packages/candidates.ts` — flight quality via stops + duration; hotel via stars + rating + price
- Budget-aware quality-slot nudge; currency-safe scoring budget

### Sprint 16.3 — Diversity

- `lib/packages/diversity.ts` — greedy post-score diversity; repetition caps; exact duplicate suppression
- UI still shows 5 initially; composer max remains 20

### Sprint 16.4 — Explainability

- `lib/packages/explanations.ts` — deterministic roles + reasons at render time
- Replaces Top Pick / Good Match badges on package cards

### Sprint 16.5 — Product validation

- Live human-quality review across five routes
- Verdict B: small honesty fixes needed

### Sprint 16.5.1 — Label honesty

- Best hotel ≥3★; highly rated ≥3★ + ≥4.5; Fastest ≥45m; Lowest price ≥5%

### Sprint 16.6 — Release v0.21.0

- Version bump, changelog, release notes, documentation sync, annotated tag

**Result:** 615 tests · typecheck clean · build clean · 0 vulnerabilities · security baseline intact

**Milestone 16 complete — released as v0.21.0.**

---

## Budget UI — numeric input

**Branch:** `cursor/project-principles`

### Changes

- Replaced the search-form budget **slider** with a **numeric text input** in `BudgetSelector`
- Kept `CurrencySelector`, existing props (`value`, `currency`, `onChange`, `onCurrencyChange`), and all validation / `SearchRequest` / URL / API contracts
- Left `BudgetSlider.tsx` in the codebase (unused by the search form)
- Label: `Budget (€)`; placeholder: `Example: 1500`; visible `€` prefix; digits-only typing
- Updated `docs/AI_HANDOFF.md`, `docs/PROJECT.md`, `docs/PROGRESS.md`

**Files changed:** `components/search/BudgetSelector.tsx`, docs above

---

## Week 2 — (Historical)
