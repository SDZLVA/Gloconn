# Glooconn — Product Roadmap

High-level product roadmap. Dates are approximate.

**Current release:** **v0.17.0** — Live Flights  
**Completed milestone:** **Milestone 11**  
**Next milestone:** **Milestone 12** — Hotel Search Integration

---

## Phase 1 — Foundation ✅ Complete

Project setup, layout, home search UI, documentation baseline.

---

## Phase 2 — Core pages

| Item | Status |
|------|--------|
| Search results page | ✅ Done |
| My Trips / auth-backed trips | ✅ Done |
| Destinations page | Planned |
| About page | Planned |
| Branded 404 | Planned |

---

## Phase 3 — Data and persistence ✅ Complete

Provider-based service layer, mock destinations, search → results via `searchService` / `POST /api/search`, Supabase saved trips, travel calendar.

---

## Phase 4 — Backend and auth ✅ Complete

Supabase auth, profile, protected routes, saved trips.

---

## Phase 5 — External APIs ✅ through Milestone 11

**Goal:** Real travel data behind the existing service layer.

| Milestone / sprint | Focus | Status |
|--------------------|--------|--------|
| Sprints 1–8 | Amadeus Flight API path | ✅ Complete |
| Sprint 9 | SerpAPI multi-provider adapter | ✅ Complete → **v0.15.0** |
| Milestone 10 | Search Experience | ✅ Complete → **v0.16.0** |
| **Milestone 11** | **Live Flights (SerpAPI validation + hardening + readiness)** | ✅ **Complete → v0.17.0** |

### Provider posture (current)

| Domain | Status |
|--------|--------|
| **Flights — SerpAPI** | ✅ Live, **production-capable** (v0.17.0) |
| **Flights — Amadeus** | ✅ Path complete; **long-term Enterprise / future production** vendor |
| Hotels | Mock only → **Milestone 12** |
| Destinations / ground | Mock (live providers later) |

---

## Milestone 12 — Hotel Search Integration

**Goal:** Add a live (or staged live) hotels search path behind the existing `HotelsProvider` abstraction — same architecture as flights (factory → vendor adapter → shared hotel model → orchestrator).

High-level scope (detail in [TODO.md](./TODO.md)):

- Hotels provider selection and configuration
- Vendor adapter (query → HTTP → map to shared hotel model)
- Wire into `orchestrateTripSearch` without redesigning the search stack
- Tests + docs
- Carry-forward polish from Milestone 11 where needed (e.g. SerpAPI round-trip `departure_token` enrichment)

---

## Later horizons

| Horizon | Focus |
|---------|--------|
| Mid-term | Destinations / About pages; destinations API; Amadeus Enterprise enablement |
| Ops | Caching, rate limits, monitoring |
| Long-term | Activities, ground transport APIs, maps, trip sharing, AI optimization, PWA |

Technical debt (ongoing): currencyService registry DI (ADR-035).

---

## Out of scope (for now)

- **Booking / payment checkout** (live **search** for flights is in scope as of v0.17.0)
- Multi-language support
- Native mobile apps

These may be revisited after hotel search and core product pages are in place.
