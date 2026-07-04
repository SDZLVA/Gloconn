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

## Pending decisions (to resolve in Week 2+)

| Topic | Options under consideration |
|-------|----------------------------|
| Search results routing | URL query params vs. Next.js `useRouter` state |
| Mock data location | `lib/destinations.ts` vs. `data/destinations.json` |
| State management at scale | React Context vs. Zustand vs. server state |
| Database | Supabase vs. PlanetScale vs. local JSON (prototype) |
| Authentication | NextAuth.js vs. Clerk vs. custom |

Record new decisions in this file as they are made.
