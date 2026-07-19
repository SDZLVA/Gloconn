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

## Week 2 — (Historical)
