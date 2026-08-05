# Glooconn — Product Roadmap

High-level product roadmap. Dates are approximate.

**Current release:** **v0.19.0** — Travel Packages  
**Completed milestone:** **Milestone 14** — MVP Focus (Sprints 14.1–14.4; release tagging pending)  
**Next:** Commit M14 work · optional **v0.20.0** MVP Focus release (CTO)

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

## Phase 5 — External APIs ✅ through Milestone 13

| Milestone / sprint | Focus | Status |
|--------------------|--------|--------|
| Sprints 1–8 | Amadeus Flight API path | ✅ Complete |
| Sprint 9 | SerpAPI multi-provider adapter | ✅ Complete → **v0.15.0** |
| Milestone 10 | Search Experience | ✅ Complete → **v0.16.0** |
| Milestone 11 | Live Flights | ✅ Complete → **v0.17.0** |
| Milestone 12 | Live Hotels | ✅ Complete → **v0.18.0** |
| Milestone 13 | Travel Packages | ✅ Complete → **v0.19.0** |
| **Milestone 14** | **MVP Focus (simplify + polish + validate)** | ✅ **Complete — release pending** |

### Provider posture (current)

| Domain | Status |
|--------|--------|
| **Flights — SerpAPI** | ✅ Live, production-capable |
| **Flights — Amadeus** | ✅ Path complete; long-term Enterprise |
| **Hotels — SerpAPI** | ✅ Live, production-capable when configured |
| **Packages** | ✅ Product-layer composition (v0.19.0) |
| Destinations / ground | Mock (transport UI hidden in MVP) |

---

## Milestone 14 — MVP Focus

**Goal:** A polished first-search experience — flights + hotels + packages only.

| Sprint | Focus | Status |
|--------|--------|--------|
| 14.1 | Discovery audit (KEEP / HIDE / REMOVE) | ✅ |
| 14.2 | UI simplification (hide transport, travel style, rooms; remove fake CTAs & dead nav) | ✅ |
| 14.3 | UX polish (swap, budget label, trip wording, hierarchy, mobile auth) | ✅ |
| 14.4 | Validation & release readiness | ✅ (await CTO) |

---

## Later horizons

| Horizon | Focus |
|---------|--------|
| Mid-term | Destinations / About pages; Amadeus Enterprise enablement |
| Ops | Caching, rate limits, monitoring |
| Long-term | Activities, ground transport APIs, booking, PWA |

Technical debt: currencyService DI (ADR-035); hotel child ages; RT `departure_token`; hydration warning.

---

## Out of scope (for now)

- Booking / payment checkout
- Multi-language support
- Native mobile apps
