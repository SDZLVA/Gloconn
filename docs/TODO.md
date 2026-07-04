# Glooconn — TODO

Active and upcoming tasks. Check items off as they are completed and move done items to [PROGRESS.md](./PROGRESS.md).

---

## 🔴 High priority — Week 2

- [ ] **Destinations page** (`app/destinations/page.tsx`)
  - Grid of destination cards using the existing `Card` component
  - Mock destination data (name, image placeholder, short description)
  - Responsive layout (1 col mobile, 2–3 cols desktop)

- [x] **Search results page** (`app/search/results/page.tsx`)
  - Receive search data via URL query params
  - Display mock results: hotels, flights, buses, trains
  - Filter sidebar, sorting, responsive layout
  - Link from Search button after validation

- [ ] **About page** (`app/about/page.tsx`)
  - Simple content page about Glooconn
  - Match existing layout and typography

---

## 🟡 Medium priority — Week 2–3

- [ ] **Split mock search provider** into `hotels/`, `flights/`, `ground/` mock implementations
- [ ] **Implement searchOrchestrator** — parallel provider calls + merge

- [ ] **My Trips page** (`app/my-trips/page.tsx`)
  - [x] Protected route with Supabase auth
  - [x] List saved trips from database
  - [x] Save trip from search results page

- [ ] **Custom 404 page** (`app/not-found.tsx`)
  - Branded not-found page with link back to Home

- [ ] **Mock destination dataset**
  - Expand `lib/destinations.ts` with images and descriptions for the Destinations page
  - Reuse on Destinations page and Search results

- [ ] **Merge open PR branches to main**
  - Review feature branches on GitHub
  - Consolidate into a single `main` branch when ready

---

## 🟢 Low priority — Backlog

- [x] Shared domain models in `types/models/`
- [ ] Connect first external destination provider (behind `USE_MOCK_PROVIDERS=false`)
- [ ] Connect first external search provider (hotels or flights)
- [ ] Add unit tests for `lib/api/validation.ts`
- [ ] Add favicon and Open Graph metadata
- [ ] Add static assets to `public/` (logo, placeholder images)
- [x] Improve date input UX (custom date picker component)
- [x] Loading states for API calls (service layer + UI)
- [ ] Add unit tests for `lib/search/validation.ts`
- [ ] Set up GitHub Actions for CI (lint + build on PR)
- [ ] Update root `README.md` with Glooconn-specific content

---

## ✅ Completed (Week 1)

- [x] Next.js project setup
- [x] Git + GitHub repository
- [x] Sticky navbar with mobile menu
- [x] Footer
- [x] AppShell layout
- [x] Home page hero section
- [x] Search card with all fields
- [x] React state for search form
- [x] Travel style selector
- [x] Form validation
- [x] Search → console logging
- [x] UI polish (cards, hover, typography, accessibility)
- [x] Project structure refactor
- [x] Documentation folder (`docs/`)
- [x] Architecture refactor (split lib/search, types, shared UI components)
- [x] Destination autocomplete with mock data
- [x] Travelers selector (Adults, Children, Infants, Rooms)
- [x] Reusable Autocomplete and NumberStepper components
- [x] Travel calendar with round-trip / one-way and range selection

---

## How to use this file

1. Pick a task from **High priority**
2. Create a feature branch: `cursor/task-name`
3. Complete the task following `PROJECT_RULES.md`
4. Commit, push, and open a PR
5. Check off the item here and add details to `PROGRESS.md`
