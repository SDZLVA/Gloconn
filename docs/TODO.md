# Glooconn — TODO

Active and upcoming tasks. Check items off as they are completed and move done items to [PROGRESS.md](./PROGRESS.md).

**Current release:** **v0.19.0** (travel packages)  
**Completed milestone:** **Milestone 15** (MVP Conversion — Sprints 15.1–15.4 ✅)  
**Next:** Commit Milestone 15 changes · **v0.20.0** release (CTO)

---

## ✅ Milestone 15 — MVP Conversion (ready to commit)

- [x] Sprint 15.1 — Discovery audit
- [x] Sprint 15.2 — Price trust + critical MVP fixes
- [x] Sprint 15.3 — Recommended Package UX
- [x] Sprint 15.4 — Flexible budget + budget compatibility warning
- [x] M15 closeout — documentation sync + flight price wording fix
- [ ] Commit all Milestone 15 changes (includes M14)
- [ ] **v0.20.0** version bump + release notes + tag (CTO)

---

## ✅ Milestone 14 — MVP Focus (archived, included in M15 commit)

- [x] Sprint 14.1 — Discovery audit (KEEP / HIDE / REMOVE)
- [x] Sprint 14.2 — UI simplification
- [x] Sprint 14.3 — UX polish
- [x] Sprint 14.4 — Validation & release readiness

---

## ✅ Milestone 13 — Travel Packages (archived)

**Release:** **v0.19.0** — [releases/v0.19.0.md](./releases/v0.19.0.md)

- [x] Sprint 13.1–13.6 → **v0.19.0**

### M13 carry-forward (resolved in M15)
- [x] UI display cap for packages (top 5) — Sprint 15.3
- [x] Diversify package hotel candidates (quality-aware 6+2 pool) — Sprint 15.3
- [x] Flight card trip-type label (one-way vs round-trip) — Sprint 14.3

---

## ✅ Milestone 12 — Live Hotels (archived)

**Release:** **v0.18.0**

---

## ✅ Milestone 11 — Live Flights (archived)

**Release:** **v0.17.0**

---

## 🔴 High priority — Product pages

- [ ] **Destinations page** (`app/destinations/page.tsx`) — re-add nav when ready
- [ ] **About page** (`app/about/page.tsx`) — re-add nav when ready
- [ ] **Custom 404 page** (`app/not-found.tsx`)

---

## 🟡 Medium priority — UX / platform debt

- [ ] One-way proactive note — brief inline note in `TravelDatesSelector` when one-way + stays selected (identified in Sprint 15.4 discovery; deferred)
- [ ] `SectionHeading` hydration warning — cosmetic dev-overlay issue (carry-forward)
- [ ] Execute manual Amadeus sandbox checklist (`docs/SPRINT_8_SUMMARY.md`)
- [ ] Restore currencyService → registry DI without client importing Amadeus `server-only` (ADR-035)
- [ ] Enable live Amadeus in local/prod when Enterprise credentials are ready
- [ ] SerpAPI round-trip `departure_token` return enrichment (carry-forward from M11)

---

## 🟢 Lower priority / later horizons

- [ ] Activities / attractions live providers
- [ ] Ground transport live providers (UI currently hidden in MVP)
- [ ] Saved package contents (not just search criteria)
- [ ] AI trip planner / price prediction
- [ ] Booking integrations
