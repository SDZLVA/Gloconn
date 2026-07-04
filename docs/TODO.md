# Glooconn — TODO

Active and upcoming tasks. Check items off as they are completed and move done items to [PROGRESS.md](./PROGRESS.md).

---

## 🔴 High priority — Week 2

- [ ] **Destinations page** (`app/destinations/page.tsx`)
  - Grid of destination cards using the existing `Card` component
  - Mock destination data (name, image placeholder, short description)
  - Responsive layout (1 col mobile, 2–3 cols desktop)

- [ ] **Search results page** (`app/search/results/page.tsx` or similar)
  - Receive search data via URL query params or Next.js navigation state
  - Display mock results based on destination and travel style
  - Link from Search button after validation (replace console-only flow)

- [ ] **About page** (`app/about/page.tsx`)
  - Simple content page about Glooconn
  - Match existing layout and typography

---

## 🟡 Medium priority — Week 2–3

- [ ] **My Trips page** (`app/my-trips/page.tsx`)
  - Placeholder UI: "No trips saved yet"
  - Prepare structure for future trip cards

- [ ] **Custom 404 page** (`app/not-found.tsx`)
  - Branded not-found page with link back to Home

- [ ] **Mock destination dataset**
  - Create `lib/destinations.ts` with typed destination data
  - Reuse on Destinations page and Search results

- [ ] **Merge open PR branches to main**
  - Review feature branches on GitHub
  - Consolidate into a single `main` branch when ready

---

## 🟢 Low priority — Backlog

- [ ] Add favicon and Open Graph metadata
- [ ] Add static assets to `public/` (logo, placeholder images)
- [ ] Improve date input UX (custom date picker component)
- [ ] Add loading states for future API calls
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

---

## How to use this file

1. Pick a task from **High priority**
2. Create a feature branch: `cursor/task-name`
3. Complete the task following `PROJECT_RULES.md`
4. Commit, push, and open a PR
5. Check off the item here and add details to `PROGRESS.md`
