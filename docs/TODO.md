# Glooconn — TODO

Active and upcoming tasks. Check items off as they are completed and move done items to [PROGRESS.md](./PROGRESS.md).

---

## 🏃 Sprint tracking

### Milestone 10 — Search Experience

- [x] **10.1** Professional Search Results UI (skeletons, header, empty/error, no mock wording)
- [x] **10.2** Partial provider failure + `SearchResponse` (ADR-037)
- [x] **10.3** Search quality (filters / sort / light ranking)
- [x] **10.4** Search performance
- [x] **10.5** Destination search quality
- [x] **10.6** Hardening + docs release (v0.16.0)

### Sprint 1 — Server search boundary ✅ Complete

- [x] Add `lib/api/searchClient.ts` with `postSearchTrips()`
- [x] Route `SearchResultsPage` through `POST /api/search`
- [x] Mark `searchService` as server-only
- [x] Update API foundation docs and ADR-030

### Sprint 2 — IATA resolution ✅ Complete

- [x] **Resolve IATA codes** — enrich `SearchRequest` with origin/destination airport codes via `DestinationProvider`
- [x] **Orchestrator enrichment** — resolve ids + IATA before domain providers run
- [x] **Validation** — clear error when flights are requested and airport codes are missing
- [x] **Documentation** — `API_FOUNDATION.md`, `PROGRESS.md`, `DECISIONS.md` (ADR-031), `AI_HANDOFF.md`, `CURRENT_STATE.md`

### Sprint 3 — Amadeus OAuth & token cache ✅ Complete

- [x] Generic TTL cache — `lib/api/cache.ts`
- [x] Amadeus auth module — `getAmadeusAccessToken()` (test environment)
- [x] Amadeus client infrastructure — `amadeusFetch()` / auth headers
- [x] Documentation — ADR-032, `API_FOUNDATION.md`, handoff, progress, current state

### Sprint 4 — Flight Offers HTTP ✅ Complete

- [x] Internal Amadeus response types — `amadeus/types.ts`
- [x] Pure query builder — `buildFlightOffersSearchParams()`
- [x] `searchFlightOffers()` via `amadeusFetch` (raw JSON, no mapping)
- [x] Documentation — ADR-033, foundation, handoff, progress, current state

### Sprint 5 — Flight response mapping ✅ Complete

- [x] Expanded internal Amadeus types (mapper fields only)
- [x] Pure helpers — `mappingHelpers.ts`
- [x] `mapAmadeusOfferToFlight()` → `Flight | null`
- [x] `mapAmadeusFlightOffersResponse()` → `Flight[]`
- [x] Public barrel export — only `mapAmadeusFlightOffersResponse`
- [x] Documentation — ADR-034, foundation, handoff, progress, current state

### Sprint 6 — Wire live Amadeus provider ✅ Complete

- [x] Wire `AmadeusFlightsProvider` to `searchFlightOffers` + `mapAmadeusFlightOffersResponse`
- [x] Validate `destinationId` before mapping (`createProviderError` if missing)
- [x] Confirm provider selection (mock vs Amadeus) still works
- [x] currencyService client boundary fix + debt recorded (ADR-035)
- [x] Documentation — ADR-035, foundation, handoff, progress, current state

### Sprint 7 — Flight API automated testing ✅ Complete

- [x] Fixtures + `server-only` test stub
- [x] Helper unit tests — `mappingHelpers.test.ts`
- [x] Mapper unit tests — `mappers.test.ts`
- [x] Query builder + TTL cache tests
- [x] Provider integration tests (mocked fetch)
- [x] Documentation — foundation, handoff, progress, current state, roadmap

### Sprint 8 — Flight API production hardening ✅ Complete

- [x] Request timeouts (OAuth + authenticated fetch)
- [x] 401 single retry after token cache clear
- [x] 429 handling (no retry; safe user message)
- [x] Centralized Amadeus config (`AMADEUS_ENV`, timeouts, credential validation)
- [x] Structured server-only Amadeus logging
- [x] Automated tests updated (config, timeouts, retry, logging) — **115** total
- [x] Documentation + manual Amadeus sandbox checklist

### Post–Sprint 8 backlog

**Amadeus Flight API:** long-term production path (`v0.14.0`+). Prefer bugfixes unless CTO-approved feature work.

- [ ] Execute manual Amadeus sandbox checklist (`docs/SPRINT_8_SUMMARY.md`)
- [x] Partial provider failure — show hotels/transport if flights fail (Sprint 10.2 / ADR-037)
- [ ] Restore currencyService → registry DI without client importing Amadeus `server-only`
- [ ] Enable live Amadeus flights in local/prod when ready (`USE_MOCK_PROVIDERS=false`, keys, `AMADEUS_ENV`)

### Sprint 9 — SerpAPI development flights provider ✅ Complete (v0.15.0)

**Product version:** **v0.15.0** — [releases/v0.15.0.md](./releases/v0.15.0.md)

#### Sprint 9.1 — Docs & ADR ✅

- [x] ADR-036 — SerpAPI development provider
- [x] [Provider_Guide.md](./Provider_Guide.md) — generic flights vendor guide
- [x] Docs sync — foundation, handoff, current state, todo, project
- [x] `.env.example` documents `FLIGHTS_PROVIDER`, `SERPAPI_API_KEY`, `SERPAPI_DEEP_SEARCH`

#### Sprint 9.2–9.9 — Implementation ✅

- [x] Config load/validate for SerpAPI (`ProviderName` + `SerpApiConfig`)
- [x] `lib/providers/flights/serpapi/` adapter (HTTP, mappers, provider)
- [x] Factory `case "serpapi"` + fail-fast invalid provider
- [x] Automated tests (mocked fetch; no live SerpAPI in CI) — **192** total

#### Sprint 9.10 — Release docs ✅

- [x] Version bump to **v0.15.0** + [release notes](./releases/v0.15.0.md)
- [x] Provider Guide / API foundation / AI handoff / current state synchronized

---

## 🔴 High priority — Product pages

- [x] **Search engine** — SearchRequest builder, validation, URL flow, `POST /api/search`, unit tests, CI
- [x] Search-while-typing destination autocomplete
- [x] Recent destination and origin searches (localStorage)
- [x] Popular destinations on empty autocomplete

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

- [x] Implement mock `HotelsProvider`, `FlightsProvider`, `TransportProvider`
- [x] **Implement searchOrchestrator** — parallel provider calls + merge in service layer (wire SearchResponse next)
- [x] **Service layer with provider injection** — `context.ts`, central registry, UI uses services only
- [x] **Centralized error handling** — `ApiError` factories, `ServiceResult`, `ApiResponse`, `runService()`
- [x] **Centralized environment configuration** — `lib/config/`, `.env.example`, validation
- [x] **API foundation review** — provider factories, Amadeus stub, `docs/API_FOUNDATION.md`

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
- [x] Connect first external search provider (hotels or flights) — **Sprint 6: live Amadeus flights (env-gated)**
- [ ] Add unit tests for `lib/api/validation.ts`
- [ ] Add favicon and Open Graph metadata
- [ ] Add static assets to `public/` (logo, placeholder images)
- [x] Improve date input UX (custom date picker component)
- [x] Loading states for API calls (service layer + UI)
- [ ] Add unit tests for `lib/search/validation.ts`
- [x] Add unit tests for search request builder and API validation (`lib/search/search.test.ts`)
- [x] Set up GitHub Actions for CI (lint + build on PR)
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
