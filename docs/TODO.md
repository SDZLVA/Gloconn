# Glooconn — TODO

Active and upcoming tasks. Check items off as they are completed and move done items to [PROGRESS.md](./PROGRESS.md).

**Current release:** **v0.19.0** (travel packages)  
**Completed milestone:** **Milestone 13** (Travel Packages — Sprints 13.1–13.6 ✅)  
**Next:** Awaiting founder/CTO authorization for the next milestone

---

## ✅ Milestone 13 — Travel Packages (archived)

**Release:** **v0.19.0** — [releases/v0.19.0.md](./releases/v0.19.0.md)

- [x] Sprint 13.1 — Architecture discovery + CTO approval
- [x] Sprint 13.2 — `TravelPackage` model + pure `PackageComposer`
- [x] Sprint 13.3 — Orchestrator integration + `SearchResponse.packages`
- [x] Sprint 13.4 — Recommended Packages UI
- [x] Sprint 13.5 — Live validation + hardening + docs
- [x] Sprint 13.6 — Release **v0.19.0**

### Carry-forward / polish (optional)
- [ ] UI display cap for packages (top 5–8)
- [ ] Diversify package hotel candidates beyond cheapest-first
- [ ] SerpAPI round-trip `departure_token` return enrichment (from M11)
- [ ] Flight card trip-type label (one-way vs round-trip)
- [ ] Investigate `SectionHeading` hydration warning

---

## ✅ Milestone 12 — Live Hotels (archived)

**Release:** **v0.18.0** — [releases/v0.18.0.md](./releases/v0.18.0.md)

- [x] **12.1** SerpAPI Hotels discovery
- [x] **12.2** SerpAPI Hotels adapter
- [x] **12.3** Live hotels validation
- [x] **12.4** Production hardening

Evidence: [SPRINT_12_3_VALIDATION.md](./SPRINT_12_3_VALIDATION.md) · [SPRINT_12_4_PRODUCTION_READINESS.md](./SPRINT_12_4_PRODUCTION_READINESS.md)

---

## ✅ Milestone 11 — Live Flights (archived)

**Release:** **v0.17.0** — [releases/v0.17.0.md](./releases/v0.17.0.md)

- [x] **11.1 / 11.1b** Live SerpAPI discovery & validation
- [x] **11.2** Production hardening
- [x] **11.3** Production readiness & operational validation
- [x] Release docs + health check → **v0.17.0**

---

## ✅ Milestone 10 — Search Experience (archived)

- [x] **10.1**–**10.6** → **v0.16.0**

---

## 🔴 High priority — Product pages

- [ ] **Destinations page** (`app/destinations/page.tsx`)
- [ ] **About page** (`app/about/page.tsx`)
- [ ] **Custom 404 page** (`app/not-found.tsx`)

---

## 🟡 Medium priority — Flight / platform debt

- [ ] Execute manual Amadeus sandbox checklist (`docs/SPRINT_8_SUMMARY.md`)
- [ ] Restore currencyService → registry DI without client importing Amadeus `server-only` (ADR-035)
- [ ] Enable live Amadeus in local/prod when Enterprise credentials are ready

---

## 🟢 Lower priority / later horizons

- [ ] Activities / attractions live providers
- [ ] Ground transport live providers
- [ ] Saved package contents (not just search criteria)
- [ ] AI trip planner / price prediction
- [ ] Booking integrations
