# Glooconn — Architecture & Design Decisions

This log records important technical and product decisions so future developers (and AI assistants) understand **why** things are built a certain way.

Format: **Decision → Context → Rationale → Consequences**

---

## ADR-001: Next.js App Router

**Decision:** Use Next.js 16 with the App Router (not Pages Router).

**Context:** Project bootstrapped with `create-next-app` in 2026.

**Rationale:**
- App Router is the current Next.js standard
- Server Components by default reduce client JavaScript
- Layouts map naturally to `AppShell` wrapping all pages

**Consequences:**
- Pages live in `app/` directory
- Client interactivity requires `"use client"` directive
- Must read Next.js 16 docs (APIs differ from older versions)

---

## ADR-002: Tailwind CSS v4

**Decision:** Use Tailwind CSS v4 with `@import "tailwindcss"` and `@theme inline`.

**Context:** Default setup from create-next-app.

**Rationale:**
- Utility-first CSS keeps components self-contained
- Brand colors defined as CSS variables in `globals.css`
- No separate `tailwind.config.js` needed in v4

**Consequences:**
- Custom colors use `--color-brand-*` in `@theme inline`
- Shared class strings extracted to `lib/styles.ts` to avoid duplication

---

## ADR-003: No external UI library

**Decision:** Build UI components from scratch (Button, Card, InputField) instead of using shadcn/ui, MUI, or similar.

**Context:** Beginner-friendly project; minimize dependencies.

**Rationale:**
- Full control over styling and behavior
- No extra packages to learn or maintain
- Components stay simple and well-commented

**Consequences:**
- More manual work for complex components (date pickers, modals)
- May revisit if UI complexity grows significantly

---

## ADR-004: Feature-based component folders

**Decision:** Organize components by purpose, not by type.

**Context:** Refactor at end of Week 1.

**Structure:**
```
components/home/     → page-specific sections
components/layout/   → site shell
components/search/   → search form feature
components/ui/       → generic reusable primitives
```

**Rationale:**
- Search-specific components don't belong alongside generic `Button`
- Easier to find code related to a feature
- Scales as new features add their own folders (e.g. `components/trips/`)

**Consequences:**
- Import paths differ by feature (`@/components/search/SearchCard`)
- Generic UI stays thin and reusable

---

## ADR-005: Single navigation config

**Decision:** Define all nav links once in `lib/navigation.ts`.

**Context:** Navbar and Footer previously had duplicate link definitions.

**Rationale:**
- One source of truth prevents links getting out of sync
- Footer sections are derived from the same link data

**Consequences:**
- Adding a page requires updating `NAV_LINKS` and creating the route
- Footer grouping logic lives in `pickNavLinks()`

---

## ADR-006: Client-side validation only (for now)

**Decision:** Validate search form in the browser; log results to console. No API calls.

**Context:** Week 1 focus is UI and form behavior.

**Rationale:**
- Learn React state and validation before adding backend complexity
- Console logging proves the data pipeline works
- Easy to swap `logSearchData()` for navigation or API call later

**Consequences:**
- Validation logic in `lib/search.ts` is ready to reuse server-side
- Search button does not navigate yet — planned for Week 2

---

## ADR-007: Custom hook for form state

**Decision:** Extract search form logic into `hooks/useSearchForm.ts`.

**Context:** `SearchCard` grew to include state, validation, and submit handling.

**Rationale:**
- Separates behavior from presentation
- `SearchCard` becomes a readable layout component
- Hook can be reused if search form appears elsewhere

**Consequences:**
- All form state changes go through the hook
- Testing validation separately from UI is easier

---

## ADR-008: Brand colors distinct from Booking.com

**Decision:** Use custom brand blues (`brand-50` through `brand-900`) inspired by travel sites but not copied.

**Context:** Design requirement for modern travel theme.

**Rationale:**
- Legal and brand independence
- Colors defined in `globals.css` `@theme inline` block

**Consequences:**
- All brand references use Tailwind `brand-*` classes
- Dark mode not fully designed yet (light theme prioritized)

---

## ADR-009: Git branching with `cursor/` prefix

**Decision:** Feature branches named `cursor/feature-description`.

**Context:** Development assisted by Cursor AI; each task gets its own branch.

**Rationale:**
- Clear separation of features for review
- Easy to open PRs per task on GitHub

**Consequences:**
- Multiple open branches may exist simultaneously
- Need to merge to `main` periodically

---

## ADR-010: Documentation in `docs/` folder

**Decision:** Professional documentation lives in `docs/`, separate from code.

**Context:** End of Week 1 — project organization request.

**Rationale:**
- Standard practice in professional software projects
- Keeps root directory clean
- AI assistants and new developers have a clear onboarding path

**Consequences:**
- `PROJECT_RULES.md` stays in root (AI tool convention)
- `docs/AI_HANDOFF.md` provides context for continuing development

---

## ADR-011: Split search logic into `lib/search/`

**Decision:** Replace the single `lib/search.ts` file with a `lib/search/` folder.

**Context:** Architecture review after Week 1 — one file mixed validation, payload building, and constants.

**Structure:**
```
lib/search/
  constants.ts   → TRAVEL_STYLE_OPTIONS
  validation.ts  → validateSearchForm, hasSearchFormErrors
  payload.ts     → buildSearchData, logSearchData
  index.ts       → public exports
```

**Rationale:**
- Each file has one clear job (beginner-friendly)
- Validation can be unit-tested separately from logging
- Constants live next to search logic, not inside UI components

**Consequences:**
- Import from `@/lib/search` in hooks and components
- Do not import inner files from unrelated features unless editing that module

---

## ADR-012: Domain types in `types/search.ts`

**Decision:** Move search types out of `types/index.ts` into `types/search.ts`; keep `index.ts` as a re-export barrel.

**Context:** `types/index.ts` will grow as features are added (destinations, trips, users).

**Rationale:**
- One file per domain keeps types easy to find
- `@/types` import path stays stable via re-exports

**Consequences:**
- New domains get their own file (e.g. `types/destination.ts`)
- Search-specific code may import `@/types/search` directly

---

## ADR-013: Shared `SectionHeading` and `BrandLogo` components

**Decision:** Extract repeated heading and brand markup into reusable components.

**Context:** Hero, SearchCard, Navbar, and Footer duplicated similar class strings.

**Rationale:**
- One place to update typography and brand styling
- New pages get consistent headings for free

**Consequences:**
- Use `SectionHeading` for title + description blocks
- Use `BrandLogo` for the Glooconn wordmark (never inline duplicate markup)
- `FormLabel` uses `formLabel` from `lib/styles.ts` (no duplicated class string)

---

## Pending decisions (to resolve in future phases)

| Topic | Options under consideration |
|-------|----------------------------|
| State management at scale | React Context vs. Zustand vs. server state |
| First destination API | Google Places vs. GeoNames vs. CMS |
| First search API | Amadeus vs. Duffel vs. affiliate APIs |
| Caching layer | Next.js cache vs. Redis |

Record new decisions in this file as they are made.

---

## ADR-021: Reusable SearchForm with separated UI and logic

**Decision:** Split the search card into `useSearchForm` (logic), `SearchForm` (UI), and `SearchCard` (home page chrome).

**Context:** Search card grew to include layout, state, validation, and navigation in one file.

**Structure:**
```
useSearchForm() → SearchFormController { form, errors, actions }
SearchForm      → presentational; receives controller
SearchCard      → Card + heading + SearchForm
types/search-form.ts → SearchFormState, SearchFormActions, PlaceSelection
```

**Rationale:**
- `SearchForm` can be reused without the card (modals, sidebars) via `SearchFormWithState`
- Business logic stays in the hook and `lib/search/` — no routing in UI components
- `SearchFormController` is a stable, typed contract between hook and UI

**Consequences:**
- Import form types from `@/types/search-form` or `@/types` barrel
- `SearchData` (validated payload) stays in `types/search.ts`
- Field components (`DestinationAutocomplete`, etc.) remain in `components/search/`

---

## Resolved (formerly pending)

| Topic | Decision |
|-------|----------|
| Search results routing | URL query params ✅ |
| Mock data location | Mock providers in `lib/providers/` ✅ |
| Database | Supabase ✅ (ADR-020) |
| Authentication | Supabase Auth ✅ (ADR-020) |

---

## ADR-014: Mock destination autocomplete (no API)

**Decision:** Use a static `lib/destinations.ts` list with client-side filtering for destination autocomplete.

**Context:** Search card improvement — users expect destination suggestions while typing.

**Rationale:**
- No backend or third-party API yet
- Same mock data will power the Destinations page later
- Generic `Autocomplete` UI component stays reusable for other fields

**Consequences:**
- Users can type freely or pick from suggestions
- `DestinationAutocomplete` wraps `Autocomplete` with Glooconn destination data
- Replace filtering with API calls when backend is ready

---

## ADR-015: Structured travelers selector

**Decision:** Replace the single "Number of travelers" input with a dropdown containing Adults, Children, Infants, and Rooms steppers.

**Context:** Search card improvement — travel booking UIs typically separate guest types.

**Structure:**
```
TravelersState = { adults, children, infants, rooms }
```

**Rationale:**
- Matches real travel search UX (Booking.com-style)
- `NumberStepper` is reusable for other counters
- Validation rules: min 1 adult, min 1 room, infants ≤ adults

**Consequences:**
- `SearchData` includes `travelers` object and `totalGuests` count
- `formatTravelersSummary()` builds trigger button label (e.g. "2 Adults · 1 Room")
- `lib/search/travelers.ts` holds limits, labels, and helpers

---

## ADR-016: Generic Autocomplete component

**Decision:** Build a reusable `Autocomplete` in `components/ui/` rather than a destination-only input.

**Context:** Destination field needs combobox behavior with keyboard navigation.

**Rationale:**
- Parent passes `options` — component has no domain knowledge
- Full a11y: `role="combobox"`, `aria-expanded`, arrow keys, Enter, Escape
- `DestinationAutocomplete` in `components/search/` wires mock data

**Consequences:**
- Future fields (airport, hotel) can reuse `Autocomplete`
- Feature-specific wrappers live in `components/search/` or other feature folders

---

## ADR-017: Recent searches and popular destinations in autocomplete

**Decision:** Show grouped sections (Recent searches, Popular destinations) when the destination field is empty; filter ranked mock results while typing. Persist recent picks in `localStorage` (no API).

**Context:** Destination autocomplete improvement — users expect quick picks and memory of prior searches.

**Rationale:**
- Matches professional travel search UX (Booking.com-style)
- `Autocomplete` gains optional `sections` prop for reuse elsewhere
- Recent list syncs on select and successful form submit
- Popular destinations are flagged on mock data (`popular: true`)

**Consequences:**
- `lib/destinations/recentSearches.ts` handles browser persistence
- `useRecentDestinationSearches` hook loads recents when the dropdown opens
- Replace localStorage with user account history when auth exists

---

## ADR-018: Custom travel calendar (no date library)

**Decision:** Replace native `<input type="date">` with a custom `TravelCalendar` in `components/ui/` and a `TravelDatesSelector` wrapper in `components/search/`.

**Context:** Search card improvement — travel UIs use visual calendars with range selection and trip type toggles.

**Rationale:**
- No external date library needed (keeps dependencies minimal)
- `TravelCalendar` is domain-agnostic — parent controls mode (`single` | `range`)
- Past dates disabled via `minDate` (defaults to today)
- Round-trip shows two months; one-way shows one
- `TripType` added to form state; return date optional for one-way

**Consequences:**
- `lib/calendar/` holds ISO date formatting and month grid helpers
- `formatTravelDatesSummary()` builds the trigger label
- Validation requires return date only when `tripType === "round-trip"`
- `SearchData.returnDate` is `null` for one-way trips

---

## ADR-019: Reusable PassengersSelector component

**Decision:** Extract passenger picking into `components/ui/PassengersSelector.tsx` with logic in `lib/search/passengers.ts`. Keep `TravelersSelector` as a thin search-form wrapper.

**Context:** Search card already had travelers steppers (ADR-015); this refactor makes the UI reusable for future forms (e.g. flights) while preserving the search card label and behavior.

**Structure:**
```
PassengersState = { adults, children, infants, rooms }
PassengersSelector (ui/) → NumberStepper rows, dropdown shell
TravelersSelector (search/) → wraps PassengersSelector with "Travelers & rooms" label
```

**Rationale:**
- Matches the pattern used by `TravelCalendar` + `TravelDatesSelector`
- `validatePassengers()` is shared by the selector constraints and form validation
- Infants are capped at adult count during stepper interaction (`applyPassengerFieldUpdate`)
- `fields` prop allows hiding rows (e.g. omit rooms for flight-only forms)

**Consequences:**
- `lib/search/travelers.ts` re-exports from `passengers.ts` for backward compatibility
- `TravelersState` is a type alias for `PassengersState`
- Responsive panel scrolls on small viewports (`max-h` + `overflow-y-auto`)

---

## ADR-020: Supabase for authentication and saved trips

**Decision:** Use Supabase Auth + PostgreSQL for user accounts and saved trips.

**Context:** Phase 4 required Google login, email login, protected routes, user profile, and saved trips. The project needed a backend without adding multiple services.

**Rationale:**
- One provider covers OAuth (Google), email/password, sessions, and a database
- `@supabase/ssr` integrates cleanly with Next.js App Router middleware and cookies
- Row Level Security keeps each user's trips private
- Aligns with options already listed in the roadmap

**Structure:**
```
lib/auth/           → server/client Supabase helpers, session, middleware
lib/trips/          → saved trip queries and server actions
middleware.ts       → refresh session + protect /my-trips and /profile
app/login, signup   → email + Google sign-in
app/auth/callback   → OAuth / email confirmation handler
supabase/schema.sql → saved_trips table + RLS policies
```

**Consequences:**
- Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Google OAuth must be configured in the Supabase dashboard
- `saved_trips.search_data` stores the existing `SearchData` JSON shape
- Recent destination searches still use localStorage (ADR-017) until migrated

---

## ADR-021: Provider adapter architecture (API foundation)

**Decision:** Introduce a three-layer API architecture: `lib/api` → `lib/providers` → `lib/services`. UI calls services only; services call providers; providers map external data to Glooconn domain types.

**Context:** Travel data was read directly from mock files in components. External APIs (Amadeus, Booking.com, Omio, Google Places) will be added in future phases.

**Structure:**
```
lib/api/           → env, errors, ServiceResult/ServiceState, validation
lib/providers/     → DestinationProvider, SearchProvider interfaces + mock adapters
lib/services/      → destinationService, searchService (UI entry point)
hooks/useServiceQuery.ts → loading state for async service calls
```

**Rationale:**
- UI stays on `SearchData` and `SearchResult` — providers are swappable
- Mock data is the first provider implementation (`USE_MOCK_PROVIDERS=true` by default)
- Mirrors the successful `lib/auth/` pattern (centralized env, clear boundaries)
- Beginner-friendly: one file per concern, well-commented

**Consequences:**
- `DestinationAutocomplete` and `SearchResultsPage` use services, not mock files directly
- `lib/destinations.ts` and `lib/results/` remain as backward-compatible re-exports
- New providers are registered in `lib/providers/core/factories.ts`
- External API keys live in server env only (never `NEXT_PUBLIC_*`)

---

## ADR-022: Scalable provider folder structure

**Decision:** Scaffold per-domain provider folders (hotels, flights, ground) plus `providers/core/`, `app/api/`, and planned orchestrator files — without implementing business logic yet.

**Context:** Backend architecture design (July 2026) requires splitting the monolithic mock search provider and preparing slots for Amadeus, Booking, Omio, and Google Maps.

**Structure:**
```
lib/providers/core/       → registry, config, base types (stubs)
lib/providers/hotels/     → mock/, booking/, types, mappers
lib/providers/flights/    → mock/, amadeus/, types, mappers
lib/providers/ground/     → mock/, omio/, types, mappers
lib/providers/destinations/google-maps/  → future slot
lib/services/searchOrchestrator.ts       → stub
lib/api/cache.ts                         → stub
app/api/destinations/, app/api/search/   → Route Handler slots
types/search-response.ts                 → stub
```

**Rationale:**
- Folders document where future code lives before implementation
- UI and existing mock providers remain unchanged
- Each external API gets an isolated folder with types + mappers + provider

**Consequences:**
- Existing `lib/providers/search/` stays active until mock data is split
- Stub files export `{}` — no runtime behavior change
- Next implementation phase: split mock into hotels/flights/ground providers

---

## ADR-023: Shared domain models in `types/models/`

**Decision:** Define provider-independent TypeScript models in `types/models/` with documented properties. UI and services import from `@/types` or `@/types/models`.

**Models:** `Hotel`, `Flight`, `Bus`, `Train`, `Destination`, `Restaurant`, `Attraction`, `Traveler`, `Budget`, `SearchRequest`, `SearchResponse`.

**Rationale:**
- Single contract between UI, services, and provider mappers
- No Amadeus, Booking, Omio, or Google-specific fields in shared types
- `HotelResult` etc. extend models with a `type` discriminator for the results UI
- `SearchData` kept for backward compatibility; `SearchRequest` is the canonical search input

**Consequences:**
- New features (restaurants, attractions) have types ready before providers exist
- Provider mappers must convert raw API shapes to these models only
- `Budget` uses `{ amount, currency }` in `SearchRequest`; legacy `SearchData` keeps flat budget fields until migrated

---

## ADR-024: Per-domain provider interfaces

**Decision:** Define generic provider interfaces in `lib/providers/core/types.ts` — one contract per travel domain.

**Interfaces:** `DestinationProvider`, `HotelsProvider`, `FlightsProvider`, `TransportProvider`, `RestaurantsProvider`, `AttractionsProvider`. All extend `BaseProvider` (`name` only).

**Operations:** Each interface exposes only `search` (or destination-specific lookup methods) using shared models (`SearchRequest`, `Hotel`, `Flight`, etc.). No provider-specific fields.

**Rationale:**
- Amadeus, Booking, Omio, and Google Maps each implement one interface
- `TransportProvider` returns `{ buses, trains }` so Omio can cover both in one adapter
- Legacy `SearchProvider` kept until monolithic mock is split

**Consequences:**
- Registry exposes `getHotelsProvider()`, `getFlightsProvider()`, etc. via `lib/providers/core/registry.ts`
- Mock implementations in `hotels/mock/`, `flights/mock/`, `ground/mock/` implement these interfaces
- `searchOrchestrator` in the service layer calls all search providers in parallel

---

## ADR-025: Mock provider classes and orchestration

**Decision:** Split the monolithic mock search adapter into class-based providers per domain (`MockHotelsProvider`, `MockFlightsProvider`, `MockTransportProvider`) with shared logic in `lib/providers/mock/shared.ts`.

**Rationale:**
- Each class implements one interface — mirrors how Amadeus/Booking/Omio adapters will be added
- Shared filter, pricing, and mapping logic avoids duplication across mock classes
- Orchestrator merges domain results into the existing `SearchResult[]` UI contract
- UI still calls `searchService.searchTrips()` — never imports mock modules

**Consequences:**
- `lib/providers/search/mock/` is deprecated but delegates to domain providers
- `SearchData` → `SearchRequest` conversion happens in `lib/search/request.ts` (`toSearchRequest` in searchMappers delegates)
- Restaurants and attractions providers remain unimplemented (no mock data yet)

---

## ADR-026: Service layer with provider injection

**Decision:** Formalize `lib/services/` as the only UI entry point for travel data. Services receive providers through a simple context (`getServiceProviders()`) backed by the central registry. Tests can call `setServiceProviders()` to inject fakes.

**Structure:**
```
UI → lib/services (destinationService, searchService)
       → lib/services/context.ts (getServiceProviders)
       → lib/providers/core/registry.ts (get*Provider)
       → Mock*Provider classes (implement interfaces)
```

**Rationale:**
- UI never imports mock data or provider modules
- Provider selection lives in one registry — not duplicated across domain folders
- `setServiceProviders()` is beginner-friendly DI without a framework
- Search orchestration lives in `lib/services/searchOrchestrator.ts` (service coordinates, providers only search)

**Consequences:**
- `lib/api/searchMappers.ts` holds shared `toSearchRequest` / `mergeSearchResults` (no mock imports)
- Recent destinations resolve IDs via `destinationService.getDestinationsByIds()`
- External APIs plug in by extending the registry when `USE_MOCK_PROVIDERS=false`

---

## ADR-027: Centralized error handling

**Decision:** Standardize errors and responses in `lib/api/` with reusable `ApiError` factories, `ServiceResult<T>` for services, and `ApiResponse<T>` for HTTP Route Handlers.

**Error types:** `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `PROVIDER_ERROR` (502), `UNKNOWN` (500).

**Factories:** `createValidationError`, `createProviderError`, `createNotFoundError`, `createUnexpectedError`.

**Helpers:**
- `runService()` — wraps async operations; catches unexpected throws via `toApiError()`
- `toApiResponse()` / `toJsonResponse()` — converts `ServiceResult` to JSON for Route Handlers
- `getApiErrorMessage()` — user-friendly UI messages (hides raw provider errors)

**Rationale:**
- One pattern for validation, provider, and unexpected failures
- Services stay thin — no duplicated try/catch blocks
- Route Handlers can reuse the same shapes when `app/api/` is implemented
- `useServiceQuery` catches promise rejections that bypass `ServiceResult`

**Consequences:**
- Validation errors include optional `field` for form mapping
- UI continues using `getApiErrorMessage()` — no component changes required
- Provider throws are mapped to `PROVIDER_ERROR` with a safe user message

---

## ADR-028: Centralized environment configuration

**Decision:** Read all environment variables through `lib/config/`. Validate on load; expose typed `AppConfig` via `getAppConfig()`.

**Structure:**
```
lib/config/
  types.ts     → AppConfig, ProvidersConfig, ApiKeysConfig
  parse.ts     → readEnv, readBooleanEnv, readProviderName
  load.ts      → loadAppConfig()
  validate.ts  → validateAppConfig() — errors + warnings
  index.ts     → getAppConfig() (cached), resetAppConfig()
```

**Variable groups:**
| Group | Prefix | Examples |
|-------|--------|----------|
| Browser-safe | `NEXT_PUBLIC_` | `NEXT_PUBLIC_SITE_URL`, Supabase URL/anon key |
| Provider flags | none | `USE_MOCK_PROVIDERS`, `HOTELS_PROVIDER` |
| API keys | none (server-only) | `AMADEUS_API_KEY`, `GOOGLE_MAPS_API_KEY` |

**Validation:**
- `USE_MOCK_PROVIDERS=true` (default) — no API keys required; Supabase missing → warning only
- `USE_MOCK_PROVIDERS=false` — errors when a non-mock provider is selected but its API keys are missing
- Warnings logged once on server startup via `getAppConfig()`

**Rationale:**
- Single source of truth — `lib/api/env.ts` and `lib/auth/env.ts` delegate here
- `.env.example` documents all future keys without real values
- Prepares for Amadeus, Booking, Omio, Google Maps without wiring them yet
- Beginner-friendly: copy `.env.example` → `.env.local`, set `USE_MOCK_PROVIDERS=true`

**Consequences:**
- Never read `process.env` in components or providers — use `getAppConfig()`
- API keys must never use `NEXT_PUBLIC_` prefix
- `.env.local` is gitignored; `.env.example` is committed as the template

---

## ADR-029: API foundation review and provider factories

**Decision:** Complete API foundation review with per-domain provider factories, Amadeus flights stub, deduplicated orchestration, and consolidated documentation in `docs/API_FOUNDATION.md`.

**Changes:**
- `lib/providers/core/factories.ts` — `createFlightsProvider()` etc. honor env-based selection
- `lib/providers/flights/amadeus/` — stub `AmadeusFlightsProvider` (swap point for real API)
- `ServiceProviders` re-exports `ProviderRegistry` (one type, not two)
- `searchOrchestrator` — shared `searchAllDomains()`, enriches `destinationId`
- Deprecated `mockSearchProvider` delegates to service orchestrator (no duplicated logic)
- Removed dead `search/mock/search.ts`
- Extended `Destination.iataCode` and `SearchRequest.origin` for flight APIs

**Rationale:**
- Swapping mock → Amadeus requires only factory + adapter implementation — no UI/service changes
- Single registry type reduces confusion
- Central review doc prevents doc drift across ADRs

**Consequences:**
- `lib/results/mock*.ts` remain as mock data source (move to providers planned)
- `app/api/` routes still planned — use `toJsonResponse` when added
- Amadeus stub delegates to mock until `client.ts` is implemented

---

## ADR-028: Central SearchRequest builder

**Decision:** Introduce `lib/search/request.ts` as the single place to collect search form values into the canonical `SearchRequest` model. Form submit, URL serialization, service validation, and future Route Handlers all use this module — no API calls yet.

**Flow:**
```
SearchFormState → validateAndBuildSearchRequest() → SearchRequest
  → buildResultsUrlFromRequest()     (navigation)
  → serializeSearchRequest()         (future POST /api/search body)
SearchData (URL / saved trips) → buildSearchRequestFromData() → SearchRequest
```

**Rationale:**
- One model for providers, orchestrator, and future HTTP APIs
- `SearchData` kept for URL params and saved trips; conversion is explicit
- `validateSearchRequest()` returns `SearchRequest` so services never re-map

**Consequences:**
- `lib/api/searchMappers.toSearchRequest()` delegates to `buildSearchRequestFromData()`
- `orchestrateTripSearch()` accepts `SearchRequest` only
- `buildSearchData()` delegates to the request builder for consistency

---

## ADR-029: Search API Route Handler

**Decision:** Add `POST /api/search` that accepts JSON `SearchRequest`, delegates to `searchTrips()`, and returns `toJsonResponse()`. Results page parses URL params into `SearchRequest` via `parseSearchRequestFromParams`.

**Rationale:** Completes the search pipeline for future mobile clients and SDK integrations without changing the service layer.

**Consequences:**
- `searchTrips()` accepts `Partial<SearchRequest> | Partial<SearchData>`
- Unit tests cover request builder, validation, and URL round-trip
- GitHub Actions CI runs typecheck, lint, test, and build

---

## ADR-030: Server search boundary (Sprint 1)

**Decision:** Trip search execution runs on the server only. Client components call `POST /api/search` via `postSearchTrips()` — never `searchTrips()` or `searchService` directly.

**Context:** The results page previously imported `searchService`, bundling the provider registry into the client. Real flight APIs (Amadeus) require server-only credentials.

**Structure:**
```
SearchResultsPage (client)
  → postSearchTrips()           [lib/api/searchClient.ts]
    → POST /api/search          [app/api/search/route.ts]
      → searchTrips()           [lib/services/searchService.ts — import "server-only"]
        → searchOrchestrator → providers
```

**Changes:**
- `lib/api/searchClient.ts` — `postSearchTrips()` HTTP client
- `lib/api/responses.ts` — `serviceResultFromApiResponse()` (generic JSON → `ServiceResult`)
- `lib/services/searchService.ts` — `import "server-only"`
- `SearchResultsPage` — uses `postSearchTrips()` instead of `searchTrips()`

**Rationale:**
- API keys and provider HTTP clients stay on the server
- Same `SearchRequest` / `SearchResult` contracts — no UI redesign
- `serviceResultFromApiResponse<T>()` is reusable for future domain API clients
- Build fails if a client component imports `searchService` again

**Consequences:**
- Destination and currency services may still run from the client (mock-only today)
- Filters and sorting remain client-side after results load
- Future Amadeus work plugs into the existing server path without UI changes

---

## ADR-031: IATA resolution in the orchestrator (Sprint 2)

**Decision:** Resolve airport IATA codes on the server during trip search orchestration. A dedicated helper enriches `SearchRequest`; the orchestrator enforces flight-specific validation. Flight providers never call the destination catalog.

**Context:** Amadeus (and similar APIs) require origin/destination airport codes. Sprint 1 moved search to the server. Catalog cities already expose optional `Destination.iataCode`.

**Structure:**
```
orchestrateTripSearch(request)
  → enrichSearchRequestWithAirports()     [lib/services/iataResolution.ts]
      — DestinationProvider → originId / destinationId / originIata / destinationIata
  → assertFlightAirportsResolved()        [searchOrchestrator business rule]
      — if flights requested and IATA missing → createValidationError
  → hotels / flights / transport.search(enrichedRequest)
```

**Model:**
- `SearchRequest.originIata?` and `SearchRequest.destinationIata?` are optional
- Not collected by the UI or URL — filled only by server enrichment
- Hotels and transport ignore these fields

**Responsibilities:**

| Layer | Role |
|-------|------|
| `iataResolution.ts` | Data enrichment only — no product-type policy, no throws for missing codes |
| `searchOrchestrator` | Business decision — fail when flights need airports that cannot be resolved |
| `FlightsProvider` | Consumes IATA on `SearchRequest` (Amadeus in Sprint 3) |
| UI | Unchanged — never imports IATA helpers or Amadeus |

**Rationale:**
- Keeps providers independent of the destination catalog
- Keeps the helper reusable for future airport metadata (`AirportRef`)
- Optional IATA preserves hotels/transport-only searches
- Clear validation errors instead of silently skipping flights

**Consequences:**
- Free-typed cities without catalog match fail when flights are selected (user must pick autocomplete)
- Multi-airport cities use one primary `iataCode` for MVP
- Amadeus client can assume IATA is present when flights run (or receive validation failure earlier)

---

## ADR-032: Amadeus OAuth and generic token cache (Sprint 3)

**Decision:** Implement OAuth 2.0 client-credentials for Amadeus inside the Amadeus adapter, backed by a generic in-memory TTL cache. Expose authenticated HTTP infrastructure via `amadeusFetch()` without calling Flight Offers yet.

**Context:** Sprint 2 prepared IATA on `SearchRequest`. Live flight search needs a Bearer token. Auth must stay server-only and must not leak into the UI, orchestrator, or `FlightsProvider` interface.

**Structure:**
```
lib/api/cache.ts                         — generic getCached / setCached / deleteCached
lib/providers/flights/amadeus/auth.ts    — getAmadeusAccessToken() (uses cache privately)
lib/providers/flights/amadeus/client.ts  — getAmadeusAuthHeaders(), amadeusFetch()
```

**Authentication lifecycle:**
```
getAmadeusAccessToken()
  → cache hit? return token
  → else POST https://test.api.amadeus.com/v1/security/oauth2/token
       (client_credentials + AMADEUS_API_KEY / AMADEUS_API_SECRET from getAppConfig)
  → cache token with expires_in − 60s buffer
  → return token

amadeusFetch(path)   [future Flight Offers]
  → Authorization: Bearer <token>
  → fetch(test.api.amadeus.com + path)
```

**Responsibilities:**

| Layer | Role |
|-------|------|
| `lib/api/cache.ts` | Vendor-agnostic TTL store — not re-exported from `@/lib/api` |
| `amadeus/auth.ts` | Amadeus-specific OAuth; only public API is `getAmadeusAccessToken()` |
| `amadeus/client.ts` | Single HTTP entry point for future Amadeus endpoints |
| `AmadeusFlightsProvider` | Still mocks until Sprint 4 wires Flight Offers |
| Orchestrator / UI | Unchanged — never import Amadeus auth |

**Rationale:**
- Auth inside the adapter keeps domain interfaces clean
- Generic cache can serve Booking/Omio later without renaming
- Client owns HTTP so Flight Offers does not reimplement OAuth
- Test environment by default (`test.api.amadeus.com`)

**Consequences:**
- Cache is process-local (not Redis) — fine for MVP / single instance
- No retry-on-401 yet (deferred)
- Production Amadeus host can be added later via config
- App search UX unchanged until provider stops delegating to mock

---

## ADR-033: Flight Offers HTTP without provider wiring (Sprint 4)

**Decision:** Implement GET `/v2/shopping/flight-offers` in a dedicated `flightOffers.ts` module. Return raw Amadeus JSON. Do not map to `Flight` and do not change `AmadeusFlightsProvider` (still mocks).

**Context:** Sprint 3 provided OAuth + `amadeusFetch`. Sprint 2 provides IATA on `SearchRequest`. Live UI results need mapping first.

**Structure:**
```
amadeus/types.ts          — AmadeusFlightOffersResponse, AmadeusApiErrorResponse (internal)
amadeus/flightOffers.ts   — buildFlightOffersSearchParams() + searchFlightOffers()
amadeus/client.ts         — amadeusFetch() only (unchanged role)
amadeus/provider.ts       — still delegates to mock
```

**Request lifecycle:**
```
searchFlightOffers(SearchRequest)
  → buildFlightOffersSearchParams(request)   // pure
  → amadeusFetch("/v2/shopping/flight-offers?" + params)
      → getAmadeusAccessToken() → TTL cache / OAuth
  → JSON → AmadeusFlightOffersResponse
  // STOP — no mapAmadeusOfferToFlight, no provider.search change
```

**Responsibilities:**

| Module | Role |
|--------|------|
| `buildFlightOffersSearchParams` | Pure SearchRequest → URLSearchParams |
| `searchFlightOffers` | HTTP + safe provider errors; raw response |
| `amadeusFetch` | Auth headers + test base URL |
| `AmadeusFlightsProvider` | Unchanged mock until Sprint 5 |

**Rationale:**
- Separating `flightOffers.ts` from `client.ts` keeps HTTP infrastructure generic
- Pure query builder is easy to test without network
- Deferring mapping avoids breaking `Promise<Flight[]>` with raw Amadeus shapes
- App UX stays on mock flights until mapping + provider wiring land together

**Consequences:**
- `searchFlightOffers` unused by live path until Sprint 6 (ADR-035) wired the provider
- GET MVP only (POST multi-city deferred)
- Mapping landed in Sprint 5 (ADR-034); live provider wiring = Sprint 6

---

## ADR-034: Amadeus → Flight mapping without provider wiring (Sprint 5)

**Decision:** Implement pure Amadeus → Glooconn `Flight` mapping inside the Amadeus adapter package. Expose only `mapAmadeusFlightOffersResponse` from the package barrel. Do not change `AmadeusFlightsProvider` (still mocks).

**Context:** Sprint 4 returns raw Flight Offers JSON. Live UI needs `Flight[]`. Separating mapping from provider wiring keeps UX on mock data while the mapper is reviewed.

**Structure:**
```
amadeus/types.ts            — mapper-needed Amadeus shapes (package-private)
amadeus/mappingHelpers.ts   — parseDuration, formatTime, calculateStops,
                               mapAirline, mapCabin, parsePrice, validateCurrency
amadeus/mappers.ts          — mapAmadeusOfferToFlight (private)
                            — mapAmadeusFlightOffersResponse (public)
amadeus/index.ts            — exports mapAmadeusFlightOffersResponse (+ provider)
amadeus/provider.ts         — still delegates to mock
```

**Mapping pipeline:**
```
AmadeusFlightOffersResponse
  → mapAmadeusFlightOffersResponse(response, { destinationId })
      → mapAmadeusOfferToFlight(offer, { destinationId, dictionaries })
          → helpers (price, currency, times, duration, airline, cabin, stops)
      → filter null; allow ProviderErrors to propagate
  → Flight[]
  // STOP — AmadeusFlightsProvider.search unchanged
```

**Responsibilities:**

| Module | Role |
|--------|------|
| `mappingHelpers` | Pure field-level parsing (no I/O) |
| `mapAmadeusOfferToFlight` | One offer → `Flight \| null`; throws on unsupported currency |
| `mapAmadeusFlightOffersResponse` | Response → `Flight[]` (public entry point) |
| `AmadeusFlightsProvider` | Unchanged mock until Sprint 6 |

**Rationale:**
- Isolating mapping in the Amadeus package prevents vendor JSON from leaking into orchestrator/UI
- One public mapper function keeps Sprint 6 wiring thin and stable
- Helpers/types stay private so internal parsing can evolve without a public API contract
- Deferring provider wiring avoids changing search UX until HTTP + mapping are both approved
- Unsupported currency uses a controlled `createProviderError` — never silently drops a priced offer
- `rating` is always `0` (Amadeus provides no rating; do not fabricate)

**Consequences:**
- Mapper requires `destinationId` from the caller (from enriched `SearchRequest`)
- Outbound itinerary only drives schedule fields on the card; price is offer total
- Shared stub `lib/providers/flights/mappers.ts` is unused — logic lives under `amadeus/`
- Live Amadeus provider wiring completed in Sprint 6 (ADR-035)

---

## ADR-035: Live Amadeus FlightsProvider wiring (Sprint 6)

**Decision:** Replace mock delegation in `AmadeusFlightsProvider.search` with the existing Flight Offers pipeline (`searchFlightOffers` → `mapAmadeusFlightOffersResponse`). Validate `destinationId` before mapping. Do not change the registry/factories selection logic.

**Context:** Sprints 4–5 delivered HTTP + mapping. Live UI results require the provider to call them. Default `USE_MOCK_PROVIDERS=true` keeps the app on mock flights until operators opt in.

**Provider pipeline:**
```
AmadeusFlightsProvider.search(request)
  → destinationId = request.destinationId?.trim()
      missing → createProviderError (do not call mapper with "")
  → searchFlightOffers(request)
  → mapAmadeusFlightOffersResponse(raw, { destinationId })
  → Flight[]
```

**Provider selection (unchanged factories):**

| Condition | Provider |
|-----------|----------|
| `USE_MOCK_PROVIDERS=true` | mock |
| `USE_MOCK_PROVIDERS=false` + Amadeus configured | amadeus (live) |
| Amadeus selected, keys missing | mock fallback |

**currencyService adjustment (technical debt):**

- Client budget UI imports `getCurrencies` → previously pulled registry → factories → Amadeus `server-only` into the client bundle after provider wiring
- Fix: `currencyService` calls `mockCurrencyProvider` directly (currencies were already always mock)
- **Debt:** restore DI/registry for currencies without importing server-only flight adapters on the client (e.g. split client-safe factories)

**Rationale:**
- Reuses HTTP + mapper without new business logic in the orchestrator/UI
- Explicit `destinationId` check avoids invalid mapper context
- Factory selection stays the single switch for mock vs live Amadeus
- Temporary currencyService bypass unblocks build while documenting cleanup

**Consequences:**
- Live Amadeus results appear when env selects Amadeus (not under default mock flag)
- ~~Flights `ProviderError` still fails the whole orchestrator `Promise.all` (partial failure deferred)~~ → resolved in ADR-037 / Sprint 10.2
- currencyService no longer participates in `setServiceProviders` injection for currencies

---

## ADR-036: SerpAPI development flights provider (Sprint 9.1 → v0.15.0)

**Status:** Accepted and **implemented** (shipped in **v0.15.0**). **Status update (v0.17.0 / Milestone 11):** SerpAPI is now the **production-capable live flights** path after validation and hardening. Amadeus remains the **long-term Enterprise / future commercial** flights provider.  
**Date:** July 2026  
**Product version:** originally v0.15.0; current live posture **v0.17.0**

**Decision:** Add **SerpAPI Google Flights** as a **second** `FlightsProvider` implementation under `lib/providers/flights/serpapi/`, selected only via env (`FLIGHTS_PROVIDER=serpapi`). **Do not modify, remove, or replace** any Amadeus code. Amadeus remains the **future Enterprise** flights provider.

### Why SerpAPI is being added

- Local and staging development need live-shaped flight results without waiting for Amadeus Enterprise access.
- SerpAPI Google Flights can return usable itineraries for sandbox UX and mapper confidence.
- The existing provider architecture already supports multiple vendors behind one interface.

### Why Amadeus remains the future production provider

- Amadeus is the intended commercial / enterprise flight inventory path (Sprints 3–8 complete: OAuth, HTTP, mapping, live wiring, hardening, tests).
- Production hardening (timeouts, 401 retry, 429, config, logging) already exists for Amadeus.
- SerpAPI is a scrape/search proxy suitable for **dev/test**, not the long-term production commercial relationship.

### Why the existing `FlightsProvider` abstraction is sufficient

- Contract is already vendor-neutral: `search(request: SearchRequest): Promise<Flight[]>`.
- Orchestrator, `POST /api/search`, and UI do not know which vendor is active.
- Factories already switch on `USE_MOCK_PROVIDERS` + `FLIGHTS_PROVIDER` (extend with one `case`, no interface change).
- See also [Provider_Guide.md](./Provider_Guide.md).

### Why no shared models will change

- `Flight` and `SearchRequest` are provider-independent (ADR-023).
- Sprint 2 already enriches `originIata` / `destinationIata` for any flights vendor.
- Vendor-specific JSON stays inside `serpapi/types.ts` (same rule as Amadeus package-private types).

### Why SerpAPI was initially development/testing only

*(Historical rationale at ADR acceptance — superseded for live posture by Milestone 11 / **v0.17.0** status update above.)*

- Not the long-term commercial inventory source of record.
- Cost, quotas, response shape drift, and `deep_search` latency/timeout risk remain operational concerns.
- Amadeus remains the intended Enterprise commercial relationship.

**v0.17.0 posture:** SerpAPI is **production-capable for live flight search**; operators may enable it via env. Docs should state this clearly while keeping Amadeus as the **long-term Enterprise** path. Default remains `USE_MOCK_PROVIDERS=true` for local/CI; CI must not call real SerpAPI.

### Alternatives considered

| Alternative | Rejected because |
|-------------|------------------|
| Replace Amadeus with SerpAPI | Throws away production path and Sprint 3–8 investment |
| Dual-call Amadeus + SerpAPI in one search | Cost, latency, conflicting results, complex merge |
| Change `Flight` / `SearchRequest` for SerpAPI fields | Couples domain to one vendor; breaks ADR-023 |
| Call SerpAPI from the browser | Exposes API keys; violates server search boundary (ADR-030) |
| Put SerpAPI code inside `amadeus/` | Contaminates frozen production adapter |

### Consequences

- Sprint 9.2–9.10 implemented config, HTTP, mappers, factory, tests, and docs under `serpapi/` (and factory only).
- Config surface: `SERPAPI_API_KEY`, `SERPAPI_DEEP_SEARCH` via `lib/config`.
- Amadeus package remains the long-term **Enterprise** path (prefer bugfixes unless CTO directs).
- Product versions: adapter introduced **v0.15.0**; live production-capable posture **v0.17.0**.
- See [releases/v0.17.0.md](./releases/v0.17.0.md) and [Provider_Guide.md](./Provider_Guide.md).

### Known limitations (accepted for v1 SerpAPI)

- Round-trip return legs may need a second SerpAPI request (`departure_token`); v1 may map outbound-focused options and document gaps.
- `deep_search=true` increases latency and has historically timed out on SerpAPI’s side — default **false**.
- Response shapes can drift; fixtures + null-filtering required.
- Unsupported currencies should use `createProviderError` (same as Amadeus), not silent drops.
- Partial provider failure (orchestrator) remains unchanged backlog.

### Non-goals

- Modifying `lib/providers/flights/amadeus/**` as part of SerpAPI work
- Changing `FlightsProvider`, `Flight`, or `SearchRequest`
- Dual-provider fan-out in one search
- Client-side SerpAPI calls
- Live SerpAPI (or Amadeus) calls in CI
- Making SerpAPI the default provider
- Fixing currencyService DI or partial provider failure in this initiative

---

## ADR-037: SearchResponse + partial provider failure (Sprint 10.2)

**Status:** Accepted and implemented  
**Date:** July 2026  
**Milestone:** 10.2 — Search Reliability

**Decision:** Make `SearchResponse` the canonical trip-search success payload end to end (`orchestrateTripSearch` → `searchTrips` → `POST /api/search` → `postSearchTrips`). Isolate domain provider failures with `Promise.allSettled` so successful domains still return results and failed domains become `SearchResponse.warnings`.

### Why SearchResponse is now the live contract

- The model already existed (ADR-023) with `warnings` for partial failure — it was unused while the API returned flat `SearchResult[]`.
- Grouped domain arrays + `totalCount` + `searchedAt` + optional `warnings` match orchestration reality better than a flat list.
- The UI still flattens via `searchResponseToResults()` for existing cards/filters — no card redesign required.

### Why partial failure lives only in the orchestrator

- Provider interfaces stay `Promise<T>` that may throw — adapters do not need soft-fail APIs.
- Product policy (fail-all vs partial) is an orchestration concern, not a vendor concern.
- Validation (missing IATA when flights requested, invalid request) remains blocking via `createValidationError`.

### Behavior

| Situation | Result |
|-----------|--------|
| One/some requested domains fail | HTTP/service **success** with remaining results + `warnings[]` |
| All requested domains fail | `PROVIDER_ERROR` (hard failure) |
| Validation / missing flight airports | `VALIDATION_ERROR` (blocking) |

### Warning rules

- Code: `PROVIDER_UNAVAILABLE`
- Message: provider-agnostic (e.g. “Some travel results are temporarily unavailable. Showing available results.”)
- Never mention Amadeus, SerpAPI, mock, or other vendor names
- Domain uses `hotels` | `flights` | `transport` (transport covers buses + trains)

### Consequences

- `searchTrips` / `postSearchTrips` return `ServiceResult<SearchResponse>`
- Deprecated monolithic `mockSearchProvider` maps `SearchResponse` → `SearchResult[]` for its legacy interface only
- Domain mock/live providers, factories, registry, `SearchRequest`, and `Flight`/`Hotel`/`Bus`/`Train` models unchanged
- UI shows `ResultsWarningsBanner` when `warnings` is non-empty

### Non-goals

- Changing provider implementations or interfaces
- Dual-vendor fan-out
- Retrying failed domains inside the orchestrator
- currencyService DI cleanup
