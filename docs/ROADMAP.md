# Glooconn — Product Roadmap

High-level product roadmap. Dates are approximate.

**Current release:** **v0.17.0** — Live Flights  
**Completed milestone:** **Milestone 12** — Hotel Search Integration (Sprints 12.1–12.4)  
**Next:** **v0.18.0** release (tag + release notes — not started)

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

## Phase 5 — External APIs ✅ through Milestone 12

**Goal:** Real travel data behind the existing service layer.

| Milestone / sprint | Focus | Status |
|--------------------|--------|--------|
| Sprints 1–8 | Amadeus Flight API path | ✅ Complete |
| Sprint 9 | SerpAPI multi-provider adapter | ✅ Complete → **v0.15.0** |
| Milestone 10 | Search Experience | ✅ Complete → **v0.16.0** |
| **Milestone 11** | **Live Flights (SerpAPI validation + hardening + readiness)** | ✅ **Complete → v0.17.0** |
| **Milestone 12** | **Live Hotels (SerpAPI discovery + adapter + validation + hardening)** | ✅ **Complete → v0.18.0 prep** |

### Provider posture (current)

| Domain | Status |
|--------|--------|
| **Flights — SerpAPI** | ✅ Live, **production-capable** (v0.17.0) |
| **Flights — Amadeus** | ✅ Path complete; **long-term Enterprise / future production** vendor |
| **Hotels — SerpAPI** | ✅ Live, **production-capable when configured** (v0.18.0 prep) |
| Destinations / ground | Mock (live providers later) |

---

## v0.18.0 — Live Hotels release

**Goal:** Tag and publish Milestone 12 (SerpAPI Google Hotels) as **v0.18.0**.

- Release notes + version bump (not started)
- Carry-forward polish from Milestone 11 where needed (e.g. SerpAPI round-trip `departure_token` enrichment)

---

## Later horizons

| Horizon | Focus |
|---------|--------|
| Mid-term | Destinations / About pages; destinations API; Amadeus Enterprise enablement |
| Ops | Caching, rate limits, monitoring |
| Long-term | Activities, ground transport APIs, maps, trip sharing, AI optimization, PWA |

Technical debt (ongoing): currencyService registry DI (ADR-035); hotel `children_ages` default; no hotel `rooms` param; page-1 results only.

---

## Out of scope (for now)

- **Booking / payment checkout** (live **search** for flights and hotels is in scope)
- Multi-language support
- Native mobile apps

These may be revisited after core product pages and release cadence are in place.
