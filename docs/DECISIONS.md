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
- New providers are registered in `lib/providers/destinations/index.ts` and `lib/providers/search/index.ts`
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
