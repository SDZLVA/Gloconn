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
| Stage | Week 1 complete + architecture refactor |
| APIs | None connected |

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

### Live route
- `/` — Home page with `HeroSection` + `SearchCard`

### Nav links (pages NOT built yet — will 404)
- `/destinations`
- `/my-trips`
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
| `TravelStyleSelector` | `components/search/` | Budget / Standard / Luxury picker |
| `Button`, `Card`, `InputField` | `components/ui/` | Generic UI primitives |
| `SectionHeading` | `components/ui/` | Reusable title + description for sections |
| `FormLabel`, `FormError` | `components/ui/FormField.tsx` | Shared form helpers |

### Key logic

| Module | Location | Purpose |
|--------|----------|---------|
| `useSearchForm` | `hooks/useSearchForm.ts` | Form state, validation trigger, submit |
| `validateSearchForm` | `lib/search/validation.ts` | Required-field validation |
| `buildSearchData` | `lib/search/payload.ts` | Converts form strings to typed payload |
| `logSearchData` | `lib/search/payload.ts` | Console.log on successful search |
| `TRAVEL_STYLE_OPTIONS` | `lib/search/constants.ts` | Travel style labels and values |
| `NAV_LINKS` | `lib/navigation.ts` | Single source of truth for nav links |
| `focusRing`, etc. | `lib/styles.ts` | Shared Tailwind class strings |
| Search types | `types/search.ts` | `SearchFormState`, `TravelStyle`, etc. |

**Import convention:** Use `@/lib/search` and `@/types` — not the inner files directly from components (unless you are editing the search module itself).

---

## Search form behavior (do not break)

1. User fills fields in `SearchCard`
2. User clicks **Search** button
3. `useSearchForm.handleSearch()` runs
4. `validateSearchForm()` checks required fields
5. If invalid → red error messages appear under fields
6. If valid → `logSearchData()` prints to browser console (F12)
7. **No API calls, no navigation** (yet)

Required fields: Destination, Departure date, Return date, Travelers, Travel style.  
Optional: Budget.  
Return date must be ≥ departure date.

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
lib/                  → other plain TS modules (navigation, styles, utils)
types/search.ts       → search-related types
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

1. **Destinations page** — `app/destinations/page.tsx` + mock data in `lib/destinations.ts`
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
| Search form | `hooks/useSearchForm.ts`, `lib/search/`, `components/search/SearchCard.tsx` |
| Navigation | `lib/navigation.ts`, `components/layout/Navbar.tsx` |
| New page | `app/layout.tsx`, `components/layout/AppShell.tsx`, an existing page |
| Styling | `app/globals.css`, `lib/styles.ts` |
| Types | `types/search.ts`, `types/index.ts` |

---

## What NOT to do

- ❌ Do not add API integrations without being asked
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
