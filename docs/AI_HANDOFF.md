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
| Stage | Week 2+ — auth, API foundation, server search, IATA enrichment |
| APIs | Supabase Auth + PostgreSQL; travel data via mock providers (default) |

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
- `/search/results` — Search results with mock hotels, flights, buses, trains (filters + sorting)
- `/login`, `/signup` — Google and email authentication
- `/profile` — Protected user profile
- `/my-trips` — Protected saved trips list

### Nav links (pages NOT built yet — will 404)
- `/destinations`
- `/about`

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
| `BudgetSelector` | `components/search/` | Required max budget slider with currency |
| `Button`, `Card`, `InputField` | `components/ui/` | Generic UI primitives |
| `BudgetSlider` | `components/ui/` | Reusable range slider with currency selector and live value |
| `CurrencySelector` | `components/ui/` | Currency dropdown backed by mock provider data |
| `Autocomplete` | `components/ui/` | Reusable accessible combobox (sections, keyboard navigation) |
| `TravelCalendar` | `components/ui/` | Reusable date picker — single or range, disables past dates |
| `NumberStepper` | `components/ui/` | Reusable +/- numeric counter |
| `PassengersSelector` | `components/ui/` | Reusable passengers & rooms dropdown with steppers |
| `SectionHeading` | `components/ui/` | Reusable title + description for sections |
| `SearchResultsPage` | `components/results/` | Client orchestrator for results layout |
| `ResultCard` | `components/results/` | Dispatches to hotel/flight/bus/train cards |
| `ResultsFilterSidebar` | `components/results/` | Transport type, price, rating filters |
| `ResultsSortBar` | `components/results/` | Sort dropdown and result count |
| `FormLabel`, `FormError` | `components/ui/FormField.tsx` | Shared form helpers |
| Budget helpers | `lib/budget/` | Currency options, limits, and formatting |
| Currency mock provider | `lib/providers/currencies/mock/` | Static currency list for selectors |
| `getCurrencies` | `lib/services/currencyService.ts` | Loads currencies via provider registry |

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
| `postSearchTrips` | `lib/api/searchClient.ts` | Client HTTP call to `POST /api/search` |
| `POST /api/search` | `app/api/search/route.ts` | Route Handler — server-only `searchTrips()` + `toJsonResponse()` |
| `buildResultsUrl` | `lib/search/params.ts` | Builds `/search/results?...` from form state |
| `buildResultsUrlFromRequest` | `lib/search/request.ts` | Builds results URL from `SearchRequest` |
| `parseSearchParams` | `lib/search/params.ts` | Reads URL params back into `SearchData` |
| `getResultsForSearch` | `lib/results/` | **Deprecated** — use `postSearchTrips()` from `@/lib/api` in UI |
| `filterResults`, `sortResults` | `lib/results/` | Client-side filter and sort helpers |
| `searchTrips` | `lib/services/searchService.ts` | **Server only** — validated search via orchestrator + providers |
| `serviceResultFromApiResponse` | `lib/api/responses.ts` | Converts Route Handler JSON → `ServiceResult` |
| `iataResolution` | `lib/services/iataResolution.ts` | Enrich SearchRequest with optional origin/destination IATA |
| `orchestrateTripSearch` | `lib/services/searchOrchestrator.ts` | IATA enrichment + flight airport validation + parallel providers |
| `getServiceProviders` | `lib/services/context.ts` | Returns injected or registry-backed providers |
| Provider registry | `lib/providers/core/registry.ts` | Central `get*Provider()` selection |
| Provider factories | `lib/providers/core/factories.ts` | Env-based mock vs external selection |
| Amadeus flights stub | `lib/providers/flights/amadeus/` | Swap point for real flight API |
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
          → Promise.all([hotels, flights, transport])
          → mergeSearchResults()
      → toJsonResponse() → serviceResultFromApiResponse()
    → useServiceQuery sets loading / data / error
  → filterResults() + sortResults() in the browser
```

**IATA notes (ADR-031):**
- Helper enriches only — does not throw for missing codes
- Orchestrator validates when `productTypes` includes `"flights"`
- Hotels/transport-only searches do not require IATA
- UI never collects or displays IATA fields

Destination autocomplete still calls `lib/services` directly (mock provider, no external API keys yet).

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
| `AMADEUS_API_KEY` etc. | When provider active | **Never** | Server-only API credentials |

**Rules:**
- `NEXT_PUBLIC_` only for values safe in the browser
- API keys (Amadeus, Booking, Omio, Google) — no `NEXT_PUBLIC_` prefix
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
6. **Budget** — required slider (€0–€10,000); pick a currency; move slider to set amount
7. User clicks **Search** button
8. `actions.submit()` runs `validateAndBuildSearchRequest()` → `SearchRequest`
9. If invalid → summary alert at top + red error messages under each field
10. If valid → `router.push(buildResultsUrlFromRequest(request))` navigates to `/search/results`
11. Results page calls `postSearchTrips()` via `useServiceQuery` → `POST /api/search` (server runs providers)
12. **No external travel APIs** — mock provider returns static data through the service layer on the server

Required fields: From, Destination, Departure, Return (round-trip only), Budget, Travelers (≥1 adult, ≥1 room), Travel style, at least one result type.  
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
lib/providers/        → provider adapters (mock + future external APIs)
  core/               → registry, config, base interfaces (stubs)
  destinations/       → mock ✅, google-maps (planned)
  search/             → monolithic mock ✅ (to split into hotels/flights/ground)
  hotels/             → mock, booking (planned)
  flights/            → mock, amadeus (planned)
  ground/             → mock, omio (planned)
lib/services/         → server-side service layer (searchService is server-only)
  context.ts          → getServiceProviders / setServiceProviders (simple DI)
  iataResolution.ts   → enrich SearchRequest with optional airport IATA codes
  searchOrchestrator  → enrichment + flight IATA validation + parallel providers
lib/providers/core/   → registry + config (selects active adapters)
app/api/search/       → POST /api/search Route Handler
lib/                  → other plain TS modules (navigation, styles, utils)
types/models/         → shared domain models (import from @/types)
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

## Common tasks for Week 2

When the user asks to continue development, likely next tasks are:

1. **Destinations page** — `app/destinations/page.tsx` + expand `lib/destinations.ts`
2. **Search results** — navigate after valid search, show mock results
3. **About page** — static content page
4. **My Trips page** — empty state placeholder

See [TODO.md](./TODO.md) for the full prioritized list.

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

- ❌ Do not call `searchTrips()` or `searchService` from client components — use `postSearchTrips()` from `@/lib/api`
- ❌ Do not call provider modules directly from UI — use services (server) or HTTP clients (browser)
- ❌ Do not put flight IATA validation inside `iataResolution.ts` — enrichment only; orchestrator owns product rules
- ❌ Do not resolve IATA inside `FlightsProvider` / Amadeus — use enriched `SearchRequest` fields
- ❌ Do not add external API integrations without being asked
- ❌ Do not install UI libraries (shadcn, MUI) without approval
- ❌ Do not refactor unrelated code during a feature task
- ❌ Do not remove console logging until search results page replaces it
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
| [DECISIONS.md](./DECISIONS.md) | Why things are built this way |
| [API_FOUNDATION.md](./API_FOUNDATION.md) | API layers, provider swap guide |
| [AI_HANDOFF.md](./AI_HANDOFF.md) | This file — start here |

---

## User context

- **Experience level:** Beginner — explain concepts clearly
- **Communication style:** Wants explanations of every file and step
- **Location:** Milan, Italy (timezone UTC+2)
- **GitHub:** SDZLVA
- **Company name in profile:** Glooconn

When in doubt, ask before making large changes.
