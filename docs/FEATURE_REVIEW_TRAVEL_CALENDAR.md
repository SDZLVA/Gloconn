# Travel Calendar — Feature Review

**Project:** Glooconn  
**Branch:** `cursor/api-foundation` (uncommitted calendar work in working tree)  
**Review date:** July 6, 2026  
**Scope:** Travel calendar feature only (not full API foundation branch)

---

# Feature Summary

## What is the purpose of this feature?

Replace native HTML `<input type="date">` fields in the trip search form with a professional travel-style date picker that supports:

- **Round-trip** — departure + return with visual date range
- **One-way** — single departure date
- **Date range selection** — click start, then end; hover preview while selecting
- **Past dates disabled** — users cannot pick dates before today
- **Responsive layout** — usable on mobile and desktop
- **Reusable component** — generic calendar UI separate from search-specific wiring
- **No external API** — pure client-side date math and UI

The feature integrates with `SearchForm` → `useSearchForm` → `SearchRequest` and flows through URL params to `/search/results`.

## What has been implemented so far?

### Core UI (complete)

- **`TravelCalendar`** — reusable picker with `single` and `range` modes
- **`TravelDatesSelector`** — search-form dropdown with trip type toggle, date chips, Done button
- **Sub-components** — `CalendarNav`, `MonthView`, `DayCell`, range styling helpers
- **Portal positioning** — `useAnchoredPopover` anchors panel below trigger (fixes bottom-of-page bug)
- **Responsive months** — `stackMonthsOnMobile` shows 1 month on small screens, 2 on `sm+` for round-trip
- **Touch targets** — 44px day cells on mobile (`h-11`)

### Date logic (complete)

- **`lib/calendar/dates.ts`** — ISO formatting, parsing, month grids, comparisons
- **`lib/calendar/rangeSelection.ts`** — two-click range flow, hover preview end
- **`lib/search/dates.ts`** — trigger label, sanitization, past-date validation messages

### Form integration (complete)

- `tripType`, `departureDate`, `returnDate` on `SearchFormState`
- `updateTripType`, `updateDates` in `useSearchForm`
- Return date required only for round-trip
- Past dates rejected in `validateSearchForm` and API `validateSearchRequest`
- `sanitizeTravelDates` on date change (clears invalid/past values)
- Wired in `SearchForm` under the **When** section

### Fixes applied during development (this conversation)

1. Component split into `components/ui/calendar/` subfolder
2. Range selection — highlight departure while awaiting return; hover preview fix
3. Past dates — disabled UI, nav clamp, form/API validation, sanitization
4. Mobile responsiveness — touch targets, stacked months (later revised)
5. **Positioning bug** — removed `fixed bottom-0` bottom sheet; portal + anchored popover; hero `overflow-x-hidden` only

## What architectural decisions have been made?

| Decision | Detail |
|----------|--------|
| **ADR-018** | Custom calendar, no date library (date-fns, react-day-picker, etc.) |
| **Two-layer split** | `TravelCalendar` (generic UI) + `TravelDatesSelector` (search wrapper) — mirrors `PassengersSelector` / `TravelersSelector` |
| **ISO date strings** | `YYYY-MM-DD` in local timezone — same as native date inputs |
| **Controlled components** | Parent owns `startDate` / `endDate`; calendar is presentational + interaction |
| **Portal popover** | Panel rendered via `createPortal` to `document.body` to escape `overflow-hidden` ancestors |
| **Trip type mapping** | `one-way` → `mode: "single"`; `round-trip` → `mode: "range"` |

## What components, services, models, or files were created?

### Components

| File | Role |
|------|------|
| `components/ui/calendar/TravelCalendar.tsx` | Main calendar |
| `components/ui/calendar/CalendarNav.tsx` | Month navigation |
| `components/ui/calendar/MonthView.tsx` | Weekday headers + grid |
| `components/ui/calendar/DayCell.tsx` | Single day button + styles |
| `components/ui/calendar/rangePosition.ts` | Range highlight positions |
| `components/ui/calendar/types.ts` | Shared types |
| `components/ui/calendar/index.ts` | Public exports |
| `components/ui/TravelCalendar.tsx` | Backward-compatible re-export |
| `components/search/TravelDatesSelector.tsx` | Search form date field |

### Hooks

| File | Role |
|------|------|
| `hooks/useAnchoredPopover.ts` | Portal popover positioning |
| `hooks/useMediaQuery.ts` | Responsive breakpoint helper (available; selector now uses CSS + portal) |
| `hooks/useBodyScrollLock.ts` | Scroll lock (created for bottom sheet; **currently unused**) |

### Libraries

| File | Role |
|------|------|
| `lib/calendar/dates.ts` | Date utilities |
| `lib/calendar/rangeSelection.ts` | Range click + preview logic |
| `lib/calendar/index.ts` | Barrel export |
| `lib/search/dates.ts` | Search-specific labels + validation helpers |

### Types / constants

- `TripType` — `"round-trip" \| "one-way"` in `types/models/search-request.ts`
- `TRIP_TYPE_OPTIONS` — `lib/search/constants.ts`
- Form fields on `SearchFormState` in `types/search-form.ts`

### Modified integration files

- `hooks/useSearchForm.ts` — `updateTripType`, `updateDates` with sanitization
- `lib/search/validation.ts` — past date + round-trip rules
- `lib/api/validation.ts` — server-side past date checks
- `components/search/SearchForm.tsx` — `TravelDatesSelector` in When section
- `components/home/HeroSection.tsx` — `overflow-x-hidden` (was `overflow-hidden`)

---

# Current Progress

**Overall Feature Progress: 88%**

| Section | Progress | Notes |
|---------|----------|-------|
| Core calendar UI | 95% | Single/range, nav, highlighting, disabled days |
| Search form integration | 95% | Wired, validated, sanitized |
| Range selection UX | 90% | Two-click flow + hover preview; no keyboard range pick |
| Past date handling | 95% | UI + validation + sanitization |
| Responsive / positioning | 85% | Portal anchor works; no dedicated mobile sheet; limited device QA |
| Documentation | 70% | ADR-018 exists; PROGRESS/TODO updated; post-refactor gaps |
| Tests | 0% | No unit tests for date/range logic |
| Git / release hygiene | 50% | Large uncommitted diff on `cursor/api-foundation` |

---

# Completed Tasks

1. **Replaced native date inputs** — `TravelDatesSelector` in `SearchForm` instead of two `InputField type="date"`.
2. **Built reusable `TravelCalendar`** — generic `single` / `range` modes in `components/ui/calendar/`.
3. **Round-trip / one-way toggle** — `TRIP_TYPE_OPTIONS` + `TripType` on form state.
4. **Date range selection** — `resolveRangeDayClick`, hover preview, in-range highlighting.
5. **Highlight selected dates** — endpoint pills + brand range fill via `DayCell` / `rangePosition`.
6. **Disable past dates** — `minDate` default today; disabled styling; click blocked.
7. **Past date validation** — `getPastTravelDateErrors` in form and API validation.
8. **Date sanitization** — `sanitizeTravelDates` on `updateDates`.
9. **Trigger summary label** — `formatTravelDatesSummary` (e.g. `Jul 4 — Jul 10`).
10. **Component architecture split** — `CalendarNav`, `MonthView`, `DayCell` subfolder.
11. **Responsive month layout** — `stackMonthsOnMobile` for 1 vs 2 months.
12. **Mobile touch targets** — taller day cells on small screens.
13. **Popover positioning fix** — portal + `useAnchoredPopover` (no viewport-bottom sheet).
14. **Hero overflow fix** — `overflow-x-hidden` so dropdowns are not clipped vertically.
15. **SearchRequest integration** — dates flow through validation → URL → results.
16. **ADR-018 documented** — custom calendar decision in `DECISIONS.md`.
17. **Initial docs pass** — `PROJECT.md`, `PROGRESS.md`, `TODO.md`, `ROADMAP.md`, `AI_HANDOFF.md`.

---

# Remaining Tasks

Recommended order:

1. **Commit and stabilize** — commit calendar refactor on `cursor/api-foundation` (or dedicated branch); large uncommitted diff is a merge risk.
2. **Update documentation** — PROGRESS, AI_HANDOFF, DECISIONS for portal popover, calendar subfolder, `useAnchoredPopover`, past-date helpers (see Documentation Status).
3. **Remove or reuse dead code** — `useBodyScrollLock` is unused after portal fix; decide keep for future modals or delete.
4. **Keyboard accessibility** — arrow keys between days, Enter to select, focus trap in dialog (partial a11y today).
5. **Unit tests** — `resolveRangeDayClick`, `getRangeHighlightEnd`, `sanitizeTravelDates`, `getPastTravelDateErrors`, `getDayRangePosition`.
6. **`maxDate` prop** — optional upper bound for booking windows (not requested yet).
7. **Locale / i18n** — weekday/month labels hardcoded to `en-US`.
8. **Manual QA matrix** — mobile Safari, narrow desktop, results-page edit-search flow via URL params with past dates.
9. **Consider shared popover primitive** — extract portal + anchor pattern for `PassengersSelector`, `Autocomplete` if clipping recurs.

---

# Code Quality Review

## Code organization — **Good**

Clear separation: `lib/calendar/` (pure logic), `components/ui/calendar/` (UI), `components/search/TravelDatesSelector.tsx` (feature), `lib/search/dates.ts` (search labels). Matches project folder conventions.

## Reusability — **Good**

`TravelCalendar` has no search knowledge. Another feature (hotel stay) could reuse it with different wrapper. `minDate`, `monthsToShow`, `stackMonthsOnMobile` are configurable props.

## Scalability — **Moderate**

No date library — fine for current scope; may strain if you add time zones, blackout dates, or multi-city legs. Portal positioning is per-instance, not a shared `Popover` primitive yet.

## Maintainability — **Good with caveats**

Sub-component split helps. Duplicate export path (`components/ui/TravelCalendar.tsx` re-export) is intentional but should be documented. Uncommitted WIP on a busy branch increases maintenance risk.

## Readability — **Good**

Beginner-friendly comments on main files. Range logic extracted to `rangeSelection.ts` rather than buried in JSX.

## Beginner friendliness — **Good**

Follows same dropdown pattern as `PassengersSelector`. ADR-018 explains why no library.

## Technical debt before continuing

| Item | Severity |
|------|----------|
| Uncommitted calendar changes on `cursor/api-foundation` | High |
| `useBodyScrollLock` unused | Low |
| No tests for date/range edge cases | Medium |
| No keyboard navigation in calendar grid | Medium |
| ADR-018 outdated (no portal, subfolder, rangeSelection module) | Low |
| Brief layout flash possible before `useAnchoredPopover` computes position | Low |

---

# Documentation Status

| File | Up to date? | Notes |
|------|-------------|-------|
| **PROJECT.md** | Mostly yes | Lists `TravelCalendar`, `TravelDatesSelector`, `lib/calendar/`. Missing calendar subfolder structure, `useAnchoredPopover`, portal behavior. |
| **ROADMAP.md** | Yes | Date picker marked complete. |
| **PROGRESS.md** | Partially | Travel calendar section exists but predates refactor (portal, subfolder, range fixes, positioning bugfix). |
| **TODO.md** | Yes | Date picker and travel calendar marked complete. |
| **DECISIONS.md** | Partially | ADR-018 accurate at high level; missing portal popover, component split, `rangeSelection.ts`, sanitization helpers. |
| **AI_HANDOFF.md** | Partially | Lists components; missing `useAnchoredPopover`, calendar subfolder files, past-date validation flow, portal note. |

**Why update:** Post-conversation changes (portal positioning, calendar module split, range/past-date logic, hero overflow) are not fully reflected. New ADR or ADR-018 amendment recommended for portal pattern.

**Existing review docs:** `docs/FEATURE_REVIEW_SEARCH.md` mentions calendar as done but notes uncommitted WIP — still accurate.

---

# Risks

1. **Uncommitted work** — Calendar changes mixed with currency/provider WIP on same branch; easy to lose or conflict.
2. **No automated tests** — Date edge cases (month boundaries, DST, URL params with past dates) rely on manual QA.
3. **Portal popover without focus trap** — Screen reader / keyboard users may tab behind open panel.
4. **Layout flash** — Panel renders only after `useAnchoredPopover` first layout pass (`position` null initially).
5. **Locale hardcoding** — `en-US` formatters; international users see US-style dates.
6. **No `maxDate`** — Cannot restrict far-future bookings without new prop + validation.
7. **Timezone assumptions** — Local `Date` only; fine for MVP, risky for global flights later.
8. **Popover positioning on scroll** — Listeners on scroll/resize help, but rapid layout shifts (e.g. mobile keyboard) may need more testing.

---

# Recommended Next Step

**Stabilize: commit the travel calendar work on a focused branch (or clean commit on `cursor/api-foundation`), then update PROGRESS.md and ADR-018 for the portal + subfolder architecture.**

Rationale: The feature is functionally complete but lives in a large uncommitted diff. Committing and documenting locks in the positioning fix and range/past-date work before adding keyboard a11y or tests.

---

*Generated for Glooconn travel calendar feature review. No code changes were made as part of this report.*
