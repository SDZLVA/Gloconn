# Glooconn — TODO

Active and upcoming tasks. Check items off as they are completed and move done items to [PROGRESS.md](./PROGRESS.md).

**Current release:** **v0.17.0**  
**Completed milestone:** **Milestone 11** (Live Flights)  
**Active milestone:** **Milestone 12** — Hotel Search Integration

---

## 🏃 Milestone 12 — Hotel Search Integration

**Goal:** Live (or staged live) hotel search behind the existing `HotelsProvider` abstraction — same architecture as flights.

### Foundation
- [ ] Confirm `HotelsProvider` contract and shared hotel model remain sufficient
- [ ] Env / config for hotel vendor selection (mirror flights factory pattern)
- [ ] Document hotel vendor in Provider Guide / API foundation

### Adapter
- [ ] Implement hotel vendor adapter under `lib/providers/hotels/<vendor>/`
- [ ] Query builder → HTTP client → mapper → shared hotel model
- [ ] Wire factory selection; keep mock default for CI/local

### Integration
- [ ] Orchestrator already calls hotels — verify live path end-to-end
- [ ] Partial failure / warnings behavior unchanged (ADR-037)
- [ ] Automated tests (mocked fetch; no live vendor in CI)

### Docs & release readiness
- [ ] Update CURRENT_STATE / ROADMAP / release notes when hotels go live
- [ ] Operator env examples in `.env.example`

### Carry-forward from Milestone 11 (optional / polish)
- [ ] SerpAPI round-trip `departure_token` return enrichment (fix HTTP 400 request shape)
- [ ] Flight card trip-type label (one-way vs round-trip)
- [ ] Investigate `SectionHeading` hydration warning

---

## ✅ Milestone 11 — Live Flights (archived)

**Release:** **v0.17.0** — [releases/v0.17.0.md](./releases/v0.17.0.md)

- [x] **11.1 / 11.1b** Live SerpAPI discovery & validation
- [x] **11.2** Production hardening (datetime, currency, `departure_token` path, tests)
- [x] **11.3** Production readiness & operational validation
- [x] Release docs + health check → **v0.17.0**

Evidence: [SPRINT_11_1_VALIDATION.md](./SPRINT_11_1_VALIDATION.md) · [SPRINT_11_2_SUMMARY.md](./SPRINT_11_2_SUMMARY.md) · [SPRINT_11_3_PRODUCTION_READINESS.md](./SPRINT_11_3_PRODUCTION_READINESS.md)

---

## ✅ Milestone 10 — Search Experience (archived)

- [x] **10.1** Professional Search Results UI
- [x] **10.2** Partial provider failure + `SearchResponse` (ADR-037)
- [x] **10.3** Search quality (filters / sort / ranking)
- [x] **10.4** Search performance
- [x] **10.5** Destination search quality
- [x] **10.6** Hardening + docs release (**v0.16.0**)

---

## 🔴 High priority — Product pages (parallel / after M12 kickoff)

- [ ] **Destinations page** (`app/destinations/page.tsx`)
- [ ] **About page** (`app/about/page.tsx`)
- [ ] **Custom 404 page** (`app/not-found.tsx`)

---

## 🟡 Medium priority — Flight / platform debt

- [ ] Execute manual Amadeus sandbox checklist (`docs/SPRINT_8_SUMMARY.md`)
- [ ] Restore currencyService → registry DI without client importing Amadeus `server-only` (ADR-035)
- [ ] Enable live Amadeus in local/prod when Enterprise credentials are ready

---

## 🟢 Low priority — Backlog

- [ ] Connect first external destination provider
- [ ] Add favicon and Open Graph metadata
- [ ] Add static assets to `public/`
- [ ] Expand mock destination dataset for Destinations page
- [ ] Ground transport live provider (Omio or similar)

---

## How to use this file

1. Pick a task from **Milestone 12** or High priority
2. Create a feature branch: `cursor/task-name`
3. Complete the task following `PROJECT_RULES.md`
4. Commit, push, and open a PR
5. Check off the item here and add details to `PROGRESS.md`
