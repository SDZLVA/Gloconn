# Glooconn — Destination Autocomplete Feature Review

**Date:** July 6, 2026  
**Branch:** `cursor/api-foundation`  
**Latest commits:** `8dc93c2` → `e42eba4` (autocomplete dropdown, search-while-typing, recent searches, popular destinations)  
**Repository:** [github.com/SDZLVA/Gloconn](https://github.com/SDZLVA/Gloconn)

This report covers the **destination autocomplete feature** only: the combobox used for **From** and **Destination** fields in the search card. It reflects the full conversation history, current codebase, and `docs/` folder as of this date.

---

# Feature Summary

## What is the purpose of this feature?

The destination autocomplete helps users pick where they are going (and where they are leaving from) on the home-page search card. It should feel like a professional travel search UI: type to filter suggestions, use keyboard or mouse to select, see recent picks and popular destinations when the field is empty, and store choices locally without a backend.

Selected places feed into `SearchFormState` as a **label** (display string) and optional **canonical id** (`destinationId` / `originId`), which are later mapped into the canonical `SearchRequest` model on submit.

## What has been implemented so far?

| Capability | Status |
|------------|--------|
| Reusable combobox (`Autocomplete`) | Done |
| Extracted dropdown list (`AutocompleteDropdown`) | Done |
| Feature wrapper (`DestinationAutocomplete`) | Done |
| Origin field reuse (`OriginAutocomplete`) | Done |
| Mock destination data (21 cities) | Done |
| Search while typing (ranked filter) | Done |
| Case- and accent-insensitive matching | Done |
| "No destinations found" empty state | Done |
| Keyboard navigation (↑ ↓ Enter Escape Tab) | Done |
| Mouse selection + hover highlight | Done |
| Recent searches (last 5, localStorage) | Done |
| Separate recent buckets for origin vs destination | Done |
| Popular destinations on empty input | Done |
| Reusable `PopularDestinations` component | Done |
| Loose coupling to search form (`PlaceSelection`) | Done |
| Persist recents on select + form submit | Done |
| Responsive dropdown (mobile-friendly height/padding) | Done |
| Dropdown open animation (reduced-motion safe) | Done |
| Real external Places API | Not connected |
| `destinationService` wiring in UI | **Removed** — uses mock helpers directly |
| Unit tests for filter/recent helpers | Not started |
| Clear-recent-searches UI | Not started |
| Destinations browse page reuse | Not started |

## What architectural decisions have been made?

| ADR | Decision |
|-----|----------|
| **ADR-014** | Mock destination autocomplete — static catalog + client-side filtering (no API at first) |
| **ADR-016** | Generic `Autocomplete` in `components/ui/`; domain wrappers in `components/search/` |
| **ADR-017** | Recent searches + popular destinations sections; `localStorage` persistence |
| **ADR-021** | Search form UI/logic split — autocomplete receives controlled props only |
| **ADR-028** | `SearchRequest` built in `lib/search/request.ts`; autocomplete does not build the model |

**Integration pattern (loose coupling):**

```
SearchForm
  → value={form.destination}
  → onChange={actions.updateDestination}      // typing clears destinationId
  → onDestinationSelect={actions.selectDestination}  // sets label + id

DestinationAutocomplete
  → mock filter / popular / recent helpers
  → Autocomplete → AutocompleteDropdown

useSearchForm.submit()
  → validateAndBuildSearchRequest()
  → rememberDestinationById / rememberDestinationByLabel
  → router.push(results URL)
```

The autocomplete **never imports** `SearchRequest`, `useSearchForm`, or `SearchCard`.

## What components, services, models, or files were created?

### UI components

| File | Role |
|------|------|
| `components/ui/Autocomplete.tsx` | Generic accessible combobox (input + open/close + keyboard) |
| `components/ui/AutocompleteDropdown.tsx` | Reusable suggestion list (sections, highlight, click) |
| `components/ui/autocomplete-types.ts` | Shared `AutocompleteOption`, `AutocompleteSection` types |
| `components/search/DestinationAutocomplete.tsx` | Destination/origin field — sections builder |
| `components/search/OriginAutocomplete.tsx` | Thin wrapper with `recentScope="origin"` |
| `components/destinations/PopularDestinations.tsx` | Reusable popular-destinations list UI |
| `components/destinations/buildPopularDestinationsSection.ts` | Builds autocomplete section from mock data |

### Hooks

| File | Role |
|------|------|
| `hooks/useRecentDestinationSearches.ts` | Loads/saves recent IDs from localStorage; resolves via mock catalog |

### Library / data

| File | Role |
|------|------|
| `lib/providers/destinations/mock/data.ts` | `MOCK_DESTINATIONS` (includes `popular`, `iataCode`) |
| `lib/providers/destinations/mock/helpers.ts` | `filterDestinations`, `normalizeSearchText`, scoring, lookups |
| `lib/destinations/popularDestinations.ts` | `getPopularDestinations()`, heading constant |
| `lib/destinations/recentSearches.ts` | localStorage read/write, scoped keys, remember helpers |
| `lib/destinations.ts` | Backward-compatible re-exports |

### Types / models

| File | Role |
|------|------|
| `types/search-form.ts` | `PlaceSelection`, `SearchFormState.destinationId` / `originId` |
| `types/models/destination.ts` | `Destination` model (`popular`, `iataCode`, etc.) |
| `types/models/search-request.ts` | `SearchRequest.destination`, `destinationId`, `origin`, `originId` |

### Services (exist but not used by autocomplete UI today)

| File | Role |
|------|------|
| `lib/services/destinationService.ts` | `searchDestinations`, `getPopularDestinations` — for future API swap |
| `lib/providers/destinations/mock/provider.ts` | Provider adapter wrapping mock helpers |

### Styles

| File | Role |
|------|------|
| `app/globals.css` | `.autocomplete-dropdown` open animation |

---

# Current Progress

**Overall Feature Progress: 88%**

| Section | Progress | Notes |
|---------|----------|-------|
| Core combobox UX (type, select, keyboard, mouse) | 95% | Complete for mock data |
| Search-while-typing filter | 95% | Ranked, case/accent insensitive, 10-result cap |
| Recent searches | 90% | Last 5, scoped storage, select + submit persistence |
| Popular destinations | 90% | Empty state + reusable component; excludes recents |
| Form integration (`PlaceSelection`) | 95% | Origin + destination wired in `SearchForm` |
| Reusability / architecture | 90% | Good split; minor doc/code drift on service layer |
| Real API / provider swap | 15% | Service layer exists; UI bypasses it |
| Tests | 0% | No unit tests for filter or recent helpers |
| Documentation sync | 70% | ADRs good; PROJECT/AI_HANDOFF still say "via service" |

---

# Completed Tasks

1. **Generic `Autocomplete` component** — Accessible combobox with sections, keyboard nav, and focus management.
2. **`AutocompleteDropdown` extraction** — Reusable list UI with responsive max-height and touch-friendly padding.
3. **`DestinationAutocomplete` wrapper** — Wires mock data into the generic combobox.
4. **`OriginAutocomplete`** — Reuses destination autocomplete with separate label/placeholder and `recentScope="origin"`.
5. **Mock destination catalog** — 21 destinations with `popular` flags and IATA codes for future flight APIs.
6. **Search while typing** — `filterDestinations()` with relevance scoring as user types.
7. **Case-insensitive search** — `normalizeSearchText()` lowercases and strips accents.
8. **Empty-state message** — Shows "No destinations found" when filter returns zero matches.
9. **Recent searches (localStorage)** — Last 5 destination IDs, deduped, most recent first.
10. **Scoped recent storage** — Separate keys for destination vs origin (`glooconn-recent-destinations` / `glooconn-recent-origins`).
11. **Recent selection** — Click or keyboard to fill field; updates `destinationId` / `originId` via `PlaceSelection`.
12. **Recent persistence on submit** — `useSearchForm` calls `rememberDestinationById` / `rememberOriginById`.
13. **Popular destinations** — Shown when input is empty; deduped against recent list.
14. **`PopularDestinations` reusable component** — Standalone list for future Destinations page or panels.
15. **`buildPopularDestinationsSection`** — Bridges popular data into autocomplete sections.
16. **Dropdown animation** — Subtle fade/slide-in in `globals.css` (respects reduced motion).
17. **Loose coupling to search form** — Controlled `value` + `onChange` + `onDestinationSelect` only.
18. **`SearchRequest` mapping** — `destination` + `destinationId` populated in `lib/search/request.ts` on submit.

---

# Remaining Tasks

Recommended implementation order:

1. **Sync documentation** — Update PROJECT.md and AI_HANDOFF.md to state autocomplete uses mock helpers directly (not `destinationService`); add `PopularDestinations` to module tables; add PROGRESS entries for commits `8dc93c2`–`e42eba4`.
2. **Add unit tests** — `normalizeSearchText`, `filterDestinations`, `addRecentDestinationId` cap/dedupe, `buildPopularDestinationsSection` exclude logic.
3. **Re-connect service layer (optional path)** — Either document mock-only as intentional, or route autocomplete through `destinationService` + `useServiceQuery` when `USE_MOCK_PROVIDERS=false` for real Places API.
4. **Expand mock dataset** — Add `description`, `imageUrl` for Destinations browse page reuse (TODO.md item).
5. **Clear recent searches UX** — "Clear history" action in dropdown or profile settings.
6. **Debounce filter (optional)** — Only needed when switching to network-backed search; not required for static mock data.
7. **Loading / error states** — Prepare UI for async provider responses when external API is connected.
8. **Destinations page** — Reuse `PopularDestinations` and mock catalog on `/destinations`.
9. **Account-backed recents** — Migrate from localStorage to Supabase user history when authenticated (ADR-017 consequence).
10. **Origin-specific popular list (optional)** — Today origin shares destination popular list; may want departure-hub curation later.

---

# Code Quality Review

## Code organization — **Strong**

Clear three-layer split: generic UI (`components/ui/`), feature wrapper (`components/search/`), data helpers (`lib/providers/destinations/mock/` + `lib/destinations/`). Recent and popular concerns are in dedicated modules.

## Reusability — **Strong**

`Autocomplete`, `AutocompleteDropdown`, and `PopularDestinations` are domain-agnostic or lightly wrapped. `OriginAutocomplete` demonstrates reuse without duplicating logic.

## Scalability — **Good**

`destinationService` and `DestinationProvider` interface exist for a future API swap. Current UI bypasses the service layer — fast for mock data, but the swap will need a deliberate refactor (inject data source or restore `useServiceQuery`).

## Maintainability — **Good with caveats**

- Docs still describe service-based autocomplete; code uses direct mock helpers — **documentation drift**.
- `PopularDestinations` UI component and `buildPopularDestinationsSection` overlap in presentation logic (acceptable for now).
- `destinationService.getDestinationsByIds` still exists but recent hook uses `getDestinationsByIds` from mock helpers.

## Readability — **Strong**

Small files, JSDoc on key exports, section headings match user-facing labels ("Recent searches", "Popular destinations", "Suggestions").

## Beginner friendliness — **Strong**

`PlaceSelection` contract is easy to understand. `SearchForm` wiring is explicit. ADR-017 explains why localStorage is used.

## Technical debt before continuing

| Item | Severity | Action |
|------|----------|--------|
| Docs say autocomplete uses `destinationService` | Medium | Update PROJECT.md, AI_HANDOFF.md, PROGRESS.md |
| UI bypasses service layer | Medium | Decide: keep mock-direct or restore service abstraction |
| No unit tests on filter/recent | Medium | Add before connecting real API |
| `PopularDestinations` not used in autocomplete dropdown directly | Low | Could unify rendering later |
| No "clear recents" UI | Low | Add when polishing UX |
| Stale IDs in localStorage if mock catalog changes | Low | Filter unknown IDs silently (already done via `getDestinationsByIds`) |

---

# Documentation Status

| File | Up to date? | Notes |
|------|-------------|-------|
| **PROJECT.md** | **Partially** | Still says destination autocomplete uses `destinationService`; should mention `PopularDestinations`, `AutocompleteDropdown`, mock-direct path |
| **ROADMAP.md** | **Partially** | Does not list autocomplete sub-features as complete; Destinations page still planned |
| **PROGRESS.md** | **Partially** | Missing commits `8dc93c2`–`e42eba4`; still mentions recent IDs via `destinationService` |
| **TODO.md** | **Partially** | Autocomplete marked done in Week 1 block; no tasks for tests, doc sync, or API swap |
| **DECISIONS.md** | **Yes** | ADR-014, ADR-016, ADR-017 accurate |
| **AI_HANDOFF.md** | **Partially** | Module table lists `searchDestinations` flow; code path is mock-direct; missing `PopularDestinations`, `AutocompleteDropdown` |

**Why updates are needed:** The autocomplete was refactored from `useServiceQuery` + `destinationService` to synchronous mock helpers for "no API" requirements. Core docs were not fully updated after that change.

**Existing review docs:** `docs/FEATURE_REVIEW_SEARCH.md` (broader search feature, 82%) and this file (autocomplete-only, 88%).

---

# Risks

| Risk | Impact | Mitigation |
|------|----------|------------|
| Service layer bypassed in UI | Harder swap to Google Places / real API | Reintroduce `destinationService` behind a hook when connecting APIs |
| Documentation drift | Future contributors wire wrong data path | Sync docs in next doc-only commit |
| localStorage only | Recents lost across devices/browsers | Plan Supabase migration for logged-in users |
| Mock catalog size (21 items) | Weak demo for typeahead | Expand dataset before Destinations page |
| Origin uses destination popular list | UX mismatch for "From" field | Curate origin-popular subset if needed |
| No debounce when API added | Excessive network calls | Add debounce in hook when switching to async |
| Dual validation of place labels | Free-text submit without id still works; orchestrator resolves id | Document as intentional; optional resolve on submit |
| OneDrive `.next` build locks | Local build failures on Windows | Build outside synced folder or exclude `.next` |

---

# Recommended Next Step

**Update documentation to match the current mock-direct autocomplete implementation** (PROJECT.md, AI_HANDOFF.md, PROGRESS.md) and **add unit tests for `filterDestinations` and recent-search helpers**.

This is low risk, prevents architectural confusion, and protects the filtering/recent logic before any real API integration.

---

*Generated for Glooconn destination autocomplete feature review. No code changes were made as part of this report.*
