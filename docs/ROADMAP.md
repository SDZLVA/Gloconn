# Glooconn — Product Roadmap

This roadmap outlines planned development phases. Dates are approximate and will be updated as the project progresses.

---

## Phase 1 — Foundation (Week 1) ✅ Complete

**Goal:** Set up the project, layout, and home page search UI.

| Item | Status |
|------|--------|
| Next.js + TypeScript + Tailwind project setup | ✅ Done |
| Git repository and GitHub integration | ✅ Done |
| Main layout (navbar, footer, responsive shell) | ✅ Done |
| Home page hero section | ✅ Done |
| Search card with all form fields | ✅ Done |
| React state + client-side validation | ✅ Done |
| Search button → console logging | ✅ Done |
| UI polish (cards, hover, typography) | ✅ Done |
| Code structure refactor | ✅ Done |
| Project documentation (`docs/`) | ✅ Done |

---

## Phase 2 — Core pages (Week 2–3)

**Goal:** Build the remaining navigation pages and connect search to results.

| Item | Priority | Notes |
|------|----------|-------|
| Destinations page | High | Grid of destination cards using `Card` component |
| Search results page | High | ✅ Mock hotels, flights, buses, trains; filters; sorting; URL params |
| About page | Medium | Company/product information |
| My Trips page | Medium | Placeholder UI for saved trips |
| 404 / not-found page styling | Low | Match Glooconn brand |

---

## Phase 3 — Data and persistence (Week 4–5) 🚧 In progress

**Goal:** Replace direct mock access with a provider-based service layer.

| Item | Priority | Notes |
|------|----------|-------|
| API foundation (providers + services) | High | ✅ Mock providers; ✅ folder scaffold for multi-provider |
| Mock destination dataset | High | ✅ In mock provider; expand for Destinations page |
| Search → results data flow | High | ✅ Via `searchService` with URL params |
| Local storage for saved trips | Medium | ✅ Supabase `saved_trips` (replaces browser-only plan) |
| Date picker improvements | Medium | ✅ Custom `TravelCalendar` component |
| Connect external travel APIs | Low | Out of scope until foundation is stable |

---

## Phase 4 — Backend and auth (Week 6+) ✅ Complete

**Goal:** User accounts and server-side data.

| Item | Priority | Notes |
|------|----------|-------|
| Database selection and setup | High | ✅ Supabase PostgreSQL |
| User authentication | High | ✅ Google + email via Supabase |
| Save trips to user account | High | ✅ `saved_trips` table + save button on results |
| User profile page | High | ✅ `/profile` |
| Protected routes | High | ✅ Proxy for `/my-trips`, `/profile` |
| Destination API or CMS | Medium | Dynamic destination content |

---

## Phase 5 — External APIs (In progress)

**Goal:** Connect real travel data providers behind the existing service layer.

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 1 | Server search boundary (`POST /api/search`) | ✅ Complete |
| Sprint 2 | IATA resolution (orchestrator enrichment + validation) | ✅ Complete |
| Sprint 3 | Amadeus OAuth + token cache + `amadeusFetch` | ✅ Complete |
| Sprint 4 | Flight Offers HTTP (`searchFlightOffers` raw JSON) | ✅ Complete |
| Sprint 5 | Map Amadeus offers → `Flight` (mapper only) | ✅ Complete |
| Sprint 6 | Wire live Amadeus provider | ✅ Complete |
| Sprint 7 | Flight API automated testing | ✅ Complete |
| Sprint 8 | Flight API production hardening | ✅ Complete |
| Sprint 9 | SerpAPI multi-provider (dev/test) + docs | ✅ Complete → **v0.15.0** |
| Milestone 10 | Search Experience (UI → reliability → quality → perf → destinations → hardening) | ✅ Complete → **v0.16.0** |

**Release milestone — Flight API v1** (architecture + tests + docs): ✅ (`v0.13.0`, Sprint 7)

**Release milestone — Flight API v0.14.0** (timeouts, 401/429, config, logging): ✅ (`v0.14.0`, Sprint 8)

**Release milestone — Multi-provider v0.15.0** (SerpAPI + factory + Provider Guide): ✅ (`v0.15.0`, Sprint 9)

**Release milestone — Search Experience v0.16.0** (Milestone 10): ✅ (`v0.16.0`, Sprints 10.1–10.6)

| Item | Notes |
|------|-------|
| Destinations API | Google Places, GeoNames, or CMS — swap mock destination provider |
| **Flights API (Amadeus)** | ✅ Sprints 1–8; long-term production / Enterprise path |
| **Flights API (SerpAPI)** | ✅ Sprint 9 — temporary **dev/test** only (ADR-036) |
| **Search Experience** | ✅ Milestone 10 — results UI, reliability, quality, performance, destinations |
| Hotels / activities API | Booking.com hotels + activities later |
| Partial provider failure | ✅ Sprint 10.2 / ADR-037 |
| Manual Amadeus sandbox | Checklist in `SPRINT_8_SUMMARY.md` — execute when enabling live keys |
| currencyService client boundary | Technical debt (ADR-035) — restore DI without Amadeus `server-only` on client |
| Monitoring / performance | Ops focus after v0.16.0 |
| Ground transport API | Omio or similar for buses and trains |
| Caching and rate limiting | Protect Route Handlers and provider quotas |
| Budget-aware trip suggestions | Use budget + travel style from search |
| Interactive maps | Destination locations |
| Trip sharing | Share itineraries with others |
| AI travel optimization | Long-term |
| Mobile app or PWA | Optional long-term |
| Payment / booking integration | Optional long-term |

---

## Out of scope (for now)

- Real hotel or flight booking APIs
- Payment processing
- Multi-language support
- Native mobile apps

These may be revisited after core pages and user accounts are in place.
