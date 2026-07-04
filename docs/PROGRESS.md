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
