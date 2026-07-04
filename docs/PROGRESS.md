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

## Week 2 — (Not started)

Planned focus: Destinations page, search results page, About page placeholder.

See [TODO.md](./TODO.md) for the active task list.

---

## Architecture improvements (post–Week 1)

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
