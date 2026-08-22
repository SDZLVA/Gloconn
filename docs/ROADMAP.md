# Glooconn — Product Roadmap

High-level product roadmap. Dates are approximate.

**Current release:** **v0.21.0** — Recommendation Intelligence  
**Completed milestone:** **Milestone 16** — Recommendation Intelligence (Sprints 16.1–16.6)  
**Next:** Milestone 17 (CTO) · Destinations / About pages

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

## Phase 5 — External APIs ✅ through Milestone 16

| Milestone / sprint | Focus | Status |
|--------------------|--------|--------|
| Sprints 1–8 | Amadeus Flight API path | ✅ Complete |
| Sprint 9 | SerpAPI multi-provider adapter | ✅ Complete → **v0.15.0** |
| Milestone 10 | Search Experience | ✅ Complete → **v0.16.0** |
| Milestone 11 | Live Flights | ✅ Complete → **v0.17.0** |
| Milestone 12 | Live Hotels | ✅ Complete → **v0.18.0** |
| Milestone 13 | Travel Packages | ✅ Complete → **v0.19.0** |
| Milestone 14–15 | MVP Focus + Conversion | ✅ Complete → **v0.20.0** |
| **Milestone 16** | **Recommendation Intelligence** | ✅ **Complete → v0.21.0** |

### Provider posture (current)

| Domain | Status |
|--------|--------|
| **Flights — SerpAPI** | ✅ Live, production-capable |
| **Flights — Amadeus** | ✅ Path complete; long-term Enterprise |
| **Hotels — SerpAPI** | ✅ Live, production-capable when configured |
| **Packages** | ✅ Product-layer composition + diversity + explainability (v0.21.0) |
| Destinations / ground | Mock (transport UI hidden in MVP) |

---

## Milestone 16 — Recommendation Intelligence ✅

**Goal:** Better package candidates, diverse top recommendations, honest explainability.

| Sprint | Focus | Status |
|--------|--------|--------|
| 16.1 | Discovery audit | ✅ |
| 16.2 | Candidate quality (stops/duration; stars/rating; currency-safe budget) | ✅ |
| 16.3 | Diversity pass + clone suppression | ✅ |
| 16.4 | Deterministic roles + reasons | ✅ |
| 16.5 | Live product validation | ✅ |
| 16.5.1 | Label honesty gates | ✅ |
| 16.6 | Release v0.21.0 | ✅ |

---

## Later horizons

| Horizon | Focus |
|---------|--------|
| Mid-term | Destinations / About pages; Amadeus Enterprise enablement; near-duplicate flight suppression |
| Ops | Caching, rate limits, monitoring |
| Long-term | Activities, ground transport APIs, booking, PWA |

Technical debt: currencyService DI (ADR-035); hotel child ages; RT `departure_token`; hydration warning.

---

## Out of scope (for now)

- Booking / payment checkout
- AI / LLM personalized recommendations
- Multi-language support
- Native mobile apps
