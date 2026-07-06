# Glooconn — Search Feature Review

**Date:** July 5, 2026  
**Branch:** `cursor/api-foundation`  
**Version:** 0.7.0  
**Repository:** [github.com/SDZLVA/Gloconn](https://github.com/SDZLVA/Gloconn)

This report covers the **trip search feature**: the home-page search card, form logic, validation, canonical `SearchRequest` model, URL/results navigation, and integration with the service layer. It reflects the full conversation history, current codebase, and `docs/` folder as of this date.

---

# Feature Summary

## Purpose

The search feature lets users plan a trip from the home page by entering where they are leaving from, where they want to go, travel dates, travelers, budget, travel style, and which result types to search (hotels, flights, ground transport). On submit, validated criteria flow through a single `SearchRequest` model to the results page, where mock providers return hotels, flights, buses, and trains via the service layer.

The feature is designed so that:

- UI and business logic are separated (reusable form, testable validation)
- All search values collect into one canonical model ready for future `POST /api/search`
- No external travel APIs are connected yet — mock providers only
- URL query params preserve search state for results, edit-search, and saved trips

## What Has Been Implemented

| Area | Status |
|------|--------|
| Search card UI (grouped sections, responsive layout) | Done |
| Reusable `SearchForm` + `useSearchForm` controller pattern | Done |
| Origin + destination autocomplete (mock data) | Done |
| Search-while-typing destination filter | Done |
| Recent destination/origin searches (localStorage) | Done |
| Popular destinations on empty autocomplete | Done |
| Travel calendar (round-trip / one-way) | Done |
| Travelers & rooms steppers | Done |
| Budget slider with currency selector | Done |
| Product type toggles (hotels / flights / transport) | Done |
| Travel style selector | Done |
| Client-side validation + summary alert | Done |
| `SearchRequest` builder (`lib/search/request.ts`) | Done |
| URL serialization + edit-search hydration | Done |
| Results page via `searchService.searchTrips()` | Done |
| Provider-ready fields (`originId`, `destinationId`, `productTypes`) | Done |
| HTTP Route Handlers (`app/api/search/`) | Not started |
| Real external travel APIs | Not connected |
| Unit tests for search validation / request builder | Not started |

**In progress (uncommitted in working tree):** currency provider refactor, calendar component split, popover hooks (`useAnchoredPopover`, `useBodyScrollLock`), `CurrencySelector`, and related service wiring.

## Architectural Decisions

Key ADRs in `docs/DECISIONS.md`:

| ADR | Decision |
|-----|----------|
| ADR-015 | Structured travelers (adults, children, infants, rooms) |
| ADR-021 | Reusable `SearchForm` with separated UI and logic |
| ADR-022–027 | Provider-based service layer; UI calls `lib/services` only |
| ADR-028 | Central `SearchRequest` builder in `lib/search/request.ts` |

**Data flow:**

```
SearchFormState
  → validateAndBuildSearchRequest()
  → SearchRequest
    → buildResultsUrlFromRequest()     (client navigation)
    → serializeSearchRequest()         (future API body)
URL / saved trips → SearchData → buildSearchRequestFromData() → SearchRequest
  → searchOrchestrator.orchestrateTripSearch(request)
    → hotels / flights / transport providers (mock)
```

**Type layers:**

| Type | Role |
|------|------|
| `SearchFormState` | Raw React form strings and selections |
| `SearchData` | Legacy flat format for URL params and saved trips |
| `SearchRequest` | Canonical provider contract (`types/models/search-request.ts`) |

## Components, Services, Models, and Files Created

### Components (`components/search/`)

| File | Role |
|------|------|
| `SearchCard.tsx` | Home page card chrome (heading + form) |
| `SearchCardContainer.tsx` | URL hydration for edit-search flow |
| `SearchForm.tsx` | Presentational form (UI only) |
| `SearchFormSection.tsx` | Grouped sections + dividers |
| `SearchFormWithState.tsx` | Hook + form convenience wrapper |
| `OriginAutocomplete.tsx` | Required departure city autocomplete |
| `DestinationAutocomplete.tsx` | Required destination autocomplete |
| `TravelDatesSelector.tsx` | Calendar dropdown + trip type toggle |
| `TravelersSelector.tsx` | Adults / children / infants / rooms |
| `BudgetSelector.tsx` | Budget slider + currency |
| `SearchProductSelector.tsx` | Hotels / flights / transport toggles |
| `TravelStyleSelector.tsx` | Budget / standard / luxury |

### Reusable UI (`components/ui/`)

`Autocomplete`, `TravelCalendar`, `BudgetSlider`, `NumberStepper`, `FormField`, `SectionHeading`, and related primitives.

### Hooks

| File | Role |
|------|------|
| `hooks/useSearchForm.ts` | Form state, validation, submit → results URL |
| `hooks/useRecentDestinationSearches.ts` | Recent destination list for autocomplete |

### Library (`lib/search/`)

| File | Role |
|------|------|
| `request.ts` | **SearchRequest builder** — form → model → URL → API shape |
| `validation.ts` | Client-side form validation |
| `params.ts` | URL parse/serialize (delegates to request builder) |
| `payload.ts` | Legacy `SearchData` from form |
| `budget.ts` | Budget min/max validation |
| `dates.ts` | Date summary labels and past-date checks |
| `productTypes.ts` | Product type normalization and URL encoding |
| `passengers.ts` / `travelers.ts` | Traveler limits and validation |
| `constants.ts` | Trip type, travel style, product options |
| `index.ts` | Public barrel exports |

### Services and API

| File | Role |
|------|------|
| `lib/services/searchService.ts` | UI entry point — `searchTrips()` |
| `lib/services/searchOrchestrator.ts` | Parallel provider calls; accepts `SearchRequest` |
| `lib/api/validation.ts` | Server-side `validateSearchRequest()` → `SearchRequest` |
| `lib/api/searchMappers.ts` | `toSearchRequest`, `mergeSearchResults`, catalog search |

### Types

| File | Role |
|------|------|
| `types/search-form.ts` | `SearchFormState`, `SearchFormController`, actions |
| `types/search.ts` | Legacy `SearchData` |
| `types/models/search-request.ts` | Canonical `SearchRequest` model |

### Results integration

| File | Role |
|------|------|
| `app/search/results/page.tsx` | Parses URL → `SearchResultsPage` |
| `components/results/SearchResultsPage.tsx` | Calls `searchTrips()`, filters, sorts |

---

# Current Progress

**Overall Feature Progress: 82%**

| Section | Progress | Notes |
|---------|----------|-------|
| Form UI and layout | 95% | Grouped sections, responsive; currency/calendar refactor in progress |
| Form logic and validation | 90% | All required fields; client + service rules aligned |
| Autocomplete (origin/destination) | 85% | Mock only; recent + popular done; no real Places API |
| SearchRequest model and builder | 95% | Complete; `parseSearchRequestFromParams` not yet used on results route |
| URL / navigation flow | 90% | Submit + edit-search work; results still parse `SearchData` not `SearchRequest` |
| Service layer integration | 85% | Orchestrator uses `SearchRequest`; results page still passes `Partial<SearchData>` |
| API Route Handlers | 0% | `serializeSearchRequest` ready; no `app/api/search/` |
| Tests and CI | 5% | No unit tests for search module |
| Documentation | 80% | Core docs updated; TODO/ROADMAP lag behind recent commits |

---

# Completed Tasks

1. **Search card with all fields** — Destination, dates, travelers, budget, travel style on home page.
2. **React state via `useSearchForm`** — Centralized form state and actions.
3. **Destination autocomplete** — Reusable `Autocomplete` with mock destinations.
4. **Travel calendar** — Round-trip / one-way, past dates disabled, `TravelDatesSelector`.
5. **Travelers selector** — Adults, children, infants, rooms with validation rules.
6. **Budget slider** — Currency selector, min/max validation (€0–€10,000).
7. **Architecture split** — `lib/search/` module, `types/search-form.ts`, barrel exports.
8. **Responsive layout pass** — Where / When / Trip details / Preferences sections.
9. **Provider-ready fields** — `origin`, `originId`, `destinationId`, `productTypes` in form and URL.
10. **`OriginAutocomplete` and `SearchProductSelector`** — Departure city and result-type toggles.
11. **`SearchCardContainer`** — Hydrates form from URL when editing a search.
12. **SearchForm refactor (ADR-021)** — Presentational `SearchForm` + `SearchFormController`.
13. **Required-field validation** — From, destination, dates, budget, travelers, travel style, product types.
14. **Validation summary alert** — Accessible error count banner on failed submit.
15. **SearchRequest builder (ADR-028)** — `lib/search/request.ts` with validate, build, serialize, URL helpers.
16. **Service alignment** — `validateSearchRequest` and orchestrator accept `SearchRequest`.
17. **Results page** — URL params → `searchTrips()` → filters, sort, cards.
18. **Edit search from results** — `buildHomeSearchUrl` prefills home form.
19. **Search-while-typing** — Case-insensitive mock destination filtering.
20. **Recent searches** — Last-five destinations/origins in localStorage.
21. **Popular destinations** — Empty-state suggestions from mock data.
22. **Documentation updates** — `PROJECT.md`, `PROGRESS.md`, `DECISIONS.md`, `AI_HANDOFF.md`, `API_FOUNDATION.md`.

---

# Remaining Tasks

Recommended order:

1. **Commit or discard in-progress work** — Currency provider, calendar refactor, popover hooks (large uncommitted diff on branch).
2. **Unify results route on `SearchRequest`** — Use `parseSearchRequestFromParams` in `app/search/results/page.tsx` instead of `parseSearchParams` → `SearchData`.
3. **Implement `app/api/search/` Route Handler** — `POST` body via `serializeSearchRequest`, `searchService.searchTrips`, `toJsonResponse`.
4. **Add unit tests** — `lib/search/validation.ts`, `lib/search/request.ts`, `lib/api/validation.ts`.
5. **Expand mock destination dataset** — Images and descriptions for Destinations page reuse.
6. **Connect destination provider** — Google Places or similar behind `USE_MOCK_PROVIDERS=false`.
7. **Origin autocomplete parity** — Recent/popular origins (destination side is ahead).
8. **Migrate saved trips to `SearchRequest`** — Optional: store canonical JSON instead of flat `SearchData`.
9. **Deprecate `SearchData` gradually** — Single parse/build path everywhere.
10. **CI pipeline** — Lint + `tsc` on PR (GitHub Actions).

---

# Code Quality Review

## Code organization — **Strong**

Clear separation: `components/search/` (UI), `hooks/` (state), `lib/search/` (pure logic), `lib/services/` (data), `types/` (contracts). The `request.ts` module is a well-placed single builder.

## Reusability — **Strong**

`SearchForm`, `Autocomplete`, `TravelCalendar`, `BudgetSlider`, and `NumberStepper` are reusable outside the home card. `SearchFormWithState` supports drop-in usage.

## Scalability — **Good**

`SearchRequest` + orchestrator + per-domain providers scale to real APIs. Product-type filtering and `destinationId` skip re-resolution are provider-ready.

## Maintainability — **Good with caveats**

Dual model (`SearchData` + `SearchRequest`) adds conversion overhead. Results page still uses `SearchData` while submit uses `SearchRequest` — a convergence point remains.

## Readability — **Strong**

Files are small, named by responsibility, with JSDoc on key exports. Section groups in `SearchForm` match user mental model.

## Beginner friendliness — **Strong**

`SearchFormController` is an explicit contract. `docs/AI_HANDOFF.md` documents the submit flow step by step. ADRs explain why, not only what.

## Technical debt before continuing

| Item | Severity | Action |
|------|----------|--------|
| Uncommitted calendar/currency refactor | High | Finish and commit, or stash before new features |
| `SearchData` vs `SearchRequest` dual path | Medium | Route results through `parseSearchRequestFromParams` |
| `parseSearchRequestFromParams` unused | Low | Wire results route or document as future-only |
| Duplicate validation rules (form vs API) | Medium | Consider shared validator or code-gen from one source |
| No unit tests | Medium | Add before API routes go live |
| `lib/results/mock*.ts` as data source | Low | Planned move to provider folders |
| Budget min changed to €0 (docs sometimes say €500) | Low | Align docs and UX copy |

---

# Documentation Status

| File | Up to date? | Notes |
|------|-------------|-------|
| **PROJECT.md** | Mostly yes | SearchRequest and form architecture documented; budget range shows €0–€10,000. Uncommitted currency/calendar work not reflected. |
| **ROADMAP.md** | Partially | Phase 2 still lists My Trips as placeholder; auth/trips are done. Does not mention SearchRequest builder or recent autocomplete commits. |
| **PROGRESS.md** | Partially | Covers through SearchRequest builder; missing entries for autocomplete, recent searches, popular destinations commits (`38af0a4`–`e42eba4`). |
| **TODO.md** | Stale | Week 1 search items still listed; search card improvements not checked off; no tasks for API route or SearchRequest migration. |
| **DECISIONS.md** | Yes | ADR-021, ADR-028 current. |
| **AI_HANDOFF.md** | Mostly yes | Submit flow and module table accurate; may need recent-search/origin modules added after commit. |
| **API_FOUNDATION.md** | Yes | SearchRequest builder table and flow updated. |

**Recommended doc updates (after approval):**

- Add PROGRESS entries for commits after `6a54dfc` (autocomplete, recent, popular).
- Update TODO.md — mark search improvements done; add `app/api/search/` and test tasks.
- Update ROADMAP.md — My Trips / auth status; note SearchRequest as canonical input.
- Sync AI_HANDOFF module table with `recentSearches` origin helpers if committed.

---

# Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large uncommitted diff (currency, calendar) | Merge conflicts, lost work | Commit or stash before next feature |
| `SearchData` / `SearchRequest` drift | Subtle URL or validation bugs | Single parse path on results route |
| Duplicate validation (form vs service) | Rules diverge over time | Shared validation module or tests |
| URL param size limits | Long product-type lists or labels | Keep params minimal; use ids |
| Mock-only autocomplete | UX breaks when real API added | `destinationService` abstraction already in place |
| No tests on request builder | Regressions on refactor | Add tests before API routes |
| `search` object identity in `useServiceQuery` deps | Unnecessary refetches | Memoize or stable serialize URL params |
| OneDrive + `.next` build locks | CI/local build failures | Exclude `.next` from sync or build outside OneDrive |

---

# Recommended Next Step

**Stabilize the branch: review, complete, and commit the in-progress calendar/currency/popover work** (or explicitly discard it), then **wire the results route through `parseSearchRequestFromParams`** so the entire search pipeline uses `SearchRequest` end to end.

This is the lowest-risk step before adding `POST /api/search` — it removes the last dual-model gap without connecting external APIs.

---

*Generated for Glooconn feature review. No code changes were made as part of this report.*
