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
| Stage | Week 2+ — auth, saved trips, and API foundation live |
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
| `SearchCard` | `components/search/` | Trip search form (layout only) |
| `DestinationAutocomplete` | `components/search/` | Destination field — recent, popular, and filtered mock suggestions |
| `TravelDatesSelector` | `components/search/` | Round-trip / one-way dates picker with calendar dropdown |
| `TravelersSelector` | `components/search/` | Search-form wrapper around `PassengersSelector` |
| `PassengersSelector` | `components/ui/` | Reusable Adults / Children / Infants / Rooms picker |
| `TravelStyleSelector` | `components/search/` | Budget / Standard / Luxury picker |
| `BudgetSelector` | `components/search/` | Optional max budget slider with currency |
| `Button`, `Card`, `InputField` | `components/ui/` | Generic UI primitives |
| `BudgetSlider` | `components/ui/` | Reusable range slider with currency selector and live value |
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

### Key logic

| Module | Location | Purpose |
|--------|----------|---------|
| `useSearchForm` | `hooks/useSearchForm.ts` | Form state, validation trigger, submit |
| `useRecentDestinationSearches` | `hooks/useRecentDestinationSearches.ts` | Recent destination list (localStorage) |
| `validateSearchForm` | `lib/search/validation.ts` | Required-field validation |
| `buildSearchData` | `lib/search/payload.ts` | Converts form strings to typed payload |
| `buildResultsUrl` | `lib/search/params.ts` | Builds `/search/results?...` from form state |
| `parseSearchParams` | `lib/search/params.ts` | Reads URL params back into `SearchData` |
| `getResultsForSearch` | `lib/results/` | **Deprecated** — use `searchTrips` from `@/lib/services` |
| `filterResults`, `sortResults` | `lib/results/` | Client-side filter and sort helpers |
| `searchTrips` | `lib/services/searchService.ts` | Validated search via active provider |
| `searchDestinations` | `lib/services/destinationService.ts` | Autocomplete via active provider |
| `useServiceQuery` | `hooks/useServiceQuery.ts` | Loading / success / error for async services |
| API env, errors, validation | `lib/api/` | `getApiEnv`, `ApiError`, `ServiceResult`, `validateSearchRequest` |
| Provider interfaces | `lib/providers/types.ts` | `DestinationProvider`, `SearchProvider` |
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
| Recent search helpers | `lib/destinations/recentSearches.ts` | localStorage read/write for recent picks |
| Calendar date helpers | `lib/calendar/` | ISO formatting, month grids, range checks |
| `NAV_LINKS` | `lib/navigation.ts` | Single source of truth for nav links |
| `focusRing`, etc. | `lib/styles.ts` | Shared Tailwind class strings |
| Search types | `types/search.ts` | `SearchFormState`, `PassengersState`, `TripType`, `TravelStyle`, etc. |
| Results types | `types/results.ts` | `HotelResult`, `FlightResult`, `BusResult`, `TrainResult`, filters, sort |

**Import convention:** Use `@/lib/search` and `@/types` — not the inner files directly from components (unless you are editing the search module itself).

---

## Search form behavior (do not break)

1. User fills fields in `SearchCard`
2. **Destination** — type to filter mock suggestions; empty field shows recent searches and popular destinations; pick with mouse or arrow keys + Enter; selections persist in localStorage
3. **Dates** — click trigger to open calendar; choose Round-trip or One-way; pick departure (and return for round-trip) on the calendar; past dates are disabled; click Done
4. **Travelers** — click trigger to open panel; adjust Adults, Children, Infants, Rooms with +/- steppers; infants cannot exceed adults; click Done
5. **Budget** — optional slider (€500–€10,000); pick EUR, USD, or GBP; live formatted value; clear to remove limit
6. User clicks **Search** button
7. `useSearchForm.handleSearch()` runs
8. `validateSearchForm()` checks required fields
9. If invalid → red error messages appear under fields
10. If valid → `router.push(buildResultsUrl(form))` navigates to `/search/results`
11. Results page calls `searchTrips()` via `useServiceQuery` — mock provider by default
12. **No external travel APIs** — mock provider returns static data through the service layer

Required fields: Destination, Departure, Return (round-trip only), Travelers (≥1 adult, ≥1 room), Travel style.  
Optional: Budget.  
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
lib/api/              → env, errors, types, validation for services
lib/providers/        → provider adapters (mock + future external APIs)
lib/services/         → service layer — UI calls these for travel data
lib/                  → other plain TS modules (navigation, styles, utils)
types/search.ts       → search-related types
types/destination.ts  → destination domain type
types/index.ts        → re-exports all types
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
| Search form / results | `hooks/useSearchForm.ts`, `lib/search/`, `lib/services/`, `components/search/SearchCard.tsx` |
| Navigation | `lib/navigation.ts`, `components/layout/Navbar.tsx` |
| New page | `app/layout.tsx`, `components/layout/AppShell.tsx`, an existing page |
| Styling | `app/globals.css`, `lib/styles.ts` |
| Types | `types/search.ts`, `types/index.ts` |

---

## What NOT to do

- ❌ Do not call provider modules directly from UI — use `@/lib/services`
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
| [AI_HANDOFF.md](./AI_HANDOFF.md) | This file — start here |

---

## User context

- **Experience level:** Beginner — explain concepts clearly
- **Communication style:** Wants explanations of every file and step
- **Location:** Milan, Italy (timezone UTC+2)
- **GitHub:** SDZLVA
- **Company name in profile:** Glooconn

When in doubt, ask before making large changes.
