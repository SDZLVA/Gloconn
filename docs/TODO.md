# Glooconn — TODO

Active and upcoming tasks. Check items off as they are completed and move done items to [PROGRESS.md](./PROGRESS.md).

**Current release:** **v0.21.0** (Recommendation Intelligence)  
**Completed milestone:** **Milestone 16** (Sprints 16.1–16.6 ✅)  
**Next:** Milestone 17 (CTO authorization) · Destinations / About pages

---

## ✅ Milestone 16 — Recommendation Intelligence (released as v0.21.0)

- [x] Sprint 16.1 — Discovery audit
- [x] Sprint 16.2 — Candidate quality (stops/duration flights; stars/rating hotels; currency-safe budget)
- [x] Sprint 16.3 — Diversity pass + clone suppression
- [x] Sprint 16.4 — Deterministic explainability roles
- [x] Sprint 16.5 — Live product validation
- [x] Sprint 16.5.1 — Label honesty gates
- [x] Sprint 16.6 — Release v0.21.0 (version, changelog, notes, tag)

### M16 carry-forward (deferred)
- [ ] Airline-level / near-duplicate flight suppression in top 5 (same airline, similar duration/price)

---

## ✅ Milestone 15 — MVP Conversion (archived, v0.20.0)

- [x] Sprints 15.1–15.4 + closeout → **v0.20.0**

---

## ✅ Milestone 14 — MVP Focus (archived, included in v0.20.0)

- [x] Sprints 14.1–14.4

---

## ✅ Milestone 13 — Travel Packages (archived)

**Release:** **v0.19.0** — [releases/v0.19.0.md](./releases/v0.19.0.md)

---

## 🔴 High priority — Product pages

- [ ] **Destinations page** (`app/destinations/page.tsx`) — re-add nav when ready
- [ ] **About page** (`app/about/page.tsx`) — re-add nav when ready
- [ ] **Custom 404 page** (`app/not-found.tsx`)

---

## 🟡 Medium priority — UX / platform debt

- [ ] One-way proactive note — brief inline note in `TravelDatesSelector` when one-way + stays selected
- [ ] `SectionHeading` hydration warning — cosmetic dev-overlay issue
- [ ] Execute manual Amadeus sandbox checklist (`docs/SPRINT_8_SUMMARY.md`)
- [ ] Restore currencyService → registry DI without client importing Amadeus `server-only` (ADR-035)
- [ ] Enable live Amadeus in local/prod when Enterprise credentials are ready
- [ ] SerpAPI round-trip `departure_token` return enrichment (carry-forward from M11)

---

## 🟢 Lower priority / later horizons

- [ ] Activities / attractions live providers
- [ ] Ground transport live providers (UI currently hidden in MVP)
- [ ] Saved package contents (not just search criteria)
