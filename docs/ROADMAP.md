# Glooconn — Product Roadmap

High-level product roadmap. Dates are approximate.

**Current release:** **v0.23.0** — Budget-First Engine  
**Completed milestones:** **Milestone 18** — Budget-First Engine  
**Next:** **Milestone 19 (proposed)** — nearby airports/cities, trains & buses, affiliate links, real user testing (**not started**)

---

## Phase 1 — Foundation ✅ Complete

Project setup, layout, home search UI, documentation baseline.

---

## Phase 2 — Core pages

| Item | Status |
|------|--------|
| Search results page | ✅ Done |
| My Trips / auth-backed trips | ✅ Done |
| Destinations page | Planned (nav link removed from MVP until built) |
| About page | Planned (nav link removed from MVP until built) |
| Branded 404 | Planned |

---

## Phase 3 — Data and persistence ✅ Complete

Provider-based service layer, mock destinations, search → results via `searchService` / `POST /api/search`, Supabase saved trips, travel calendar.

---

## Phase 4 — Backend and auth ✅ Complete

Supabase auth, profile, protected routes, saved trips.

---

## Phase 5 — External APIs ✅ through Milestone 18

| Milestone / sprint | Focus | Status |
|--------------------|--------|--------|
| Sprints 1–8 | Amadeus Flight API path | ✅ Complete |
| Sprint 9 | SerpAPI multi-provider adapter | ✅ Complete → **v0.15.0** |
| Milestone 10 | Search Experience | ✅ Complete → **v0.16.0** |
| Milestone 11 | Live Flights | ✅ Complete → **v0.17.0** |
| Milestone 12 | Live Hotels | ✅ Complete → **v0.18.0** |
| Milestone 13 | Travel Packages | ✅ Complete → **v0.19.0** |
| Milestone 14–15 | MVP Focus + Conversion | ✅ Complete → **v0.20.0** |
| Milestone 16 | Recommendation Intelligence | ✅ Complete → **v0.21.0** |
| Milestone 17 | Hotel Actionability (+ 17.9 Cleanup) | ✅ Complete → **v0.22.0** |
| **Milestone 18** | **Budget-First Engine** | ✅ **Complete → v0.23.0** |

### Provider posture (current)

| Domain | Status |
|--------|--------|
| **Flights — SerpAPI** | ✅ Live, production-capable; honest RT via return lookup (ADR-038) |
| **Flights — Amadeus** | ✅ Path complete; long-term Enterprise |
| **Hotels — SerpAPI** | ✅ Live, production-capable when configured |
| **Packages** | ✅ Product-layer composition + diversity + explainability |
| **Hotel details** | ✅ Actionable drawer + sealed refs + details API |
| **Flexible dates / explore** | ✅ Form + date-options API + strip + chip → full search |
| Destinations / ground | Mock (transport UI hidden in MVP) |

---

## Milestone 17 — Hotel Actionability ✅ → v0.22.0

**Goal:** Let users open hotel details, see maps, and follow safe external links without in-app booking.

---

## Milestone 18 — Budget-First Engine ✅ → v0.23.0

**Goal:** When Exact dates are over budget, explore nearby date pairs with honest “from €X” scout chips and load full packages for a selected pair.

| Sprint | Focus | Status |
|--------|--------|--------|
| 18.1 | Flexible date-shift helper | ✅ |
| 18.2 | Form + URL `flex` | ✅ |
| 18.3 | Cheaper-options CTA / Exact hint | ✅ |
| 18.4a–b | Scout service + date-options API | ✅ |
| 18.5–18.6 | Date strip + chip → full search | ✅ |
| 18.7a / 18.8 | Quota + price honesty + browse/sort UX | ✅ |
| 18.9 | Release **v0.23.0** | ✅ |

---

## Milestone 19 (proposed) — NEXT — not started

**Goal (draft):** Expand discovery and monetization carefully after Budget-First Engine.

| Theme | Focus | Status |
|-------|--------|--------|
| Nearby airports / cities | Broader origin/destination discovery | Planned — **not started** |
| Trains & buses | Surface ground transport in product UI | Planned — **not started** |
| Affiliate links | Careful external monetization | Planned — **not started** |
| Real user testing | Feedback loop with real travelers | Planned — **not started** |

---

## Later horizons

| Horizon | Focus |
|---------|--------|
| Mid-term | Destinations / About pages; Amadeus Enterprise enablement; near-duplicate flight suppression |
| Ops | Caching, rate limits, monitoring, SerpAPI quota ops |
| Long-term | Activities, booking, PWA |

Technical debt: currencyService DI (ADR-035); hotel child ages; hydration warning.

---

## Out of scope (for now)

- Booking / payment checkout
- AI / LLM personalized recommendations
- Multi-language support
- Native mobile apps
