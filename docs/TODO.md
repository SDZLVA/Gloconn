# Glooconn — TODO

Active and upcoming tasks. Check items off as they are completed and move done items to [PROGRESS.md](./PROGRESS.md).

**Current release:** **v0.19.0** (travel packages)  
**Completed milestone:** **Milestone 14** (MVP Focus — Sprints 14.1–14.4 ✅ validation)  
**Next:** Commit Milestone 14 work · optional **v0.20.0** (CTO)

---

## ✅ Milestone 14 — MVP Focus (ready to commit)

- [x] Sprint 14.1 — Discovery audit (KEEP / HIDE / REMOVE)
- [x] Sprint 14.2 — UI simplification
- [x] Sprint 14.3 — UX polish
- [x] Sprint 14.4 — Validation & release readiness
- [ ] Commit all Milestone 14 changes
- [ ] Optional: **v0.20.0** version bump + release notes + tag (CTO)

---

## ✅ Milestone 13 — Travel Packages (archived)

**Release:** **v0.19.0** — [releases/v0.19.0.md](./releases/v0.19.0.md)

- [x] Sprint 13.1–13.6 → **v0.19.0**

### Carry-forward / polish (optional)
- [ ] UI display cap for packages (top 5–8)
- [ ] Diversify package hotel candidates beyond cheapest-first
- [ ] SerpAPI round-trip `departure_token` return enrichment (from M11)
- [x] Flight card trip-type label (one-way vs round-trip) — done in Sprint 14.3
- [ ] Investigate `SectionHeading` hydration warning

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

## 🟡 Medium priority — Flight / platform debt

- [ ] Execute manual Amadeus sandbox checklist (`docs/SPRINT_8_SUMMARY.md`)
- [ ] Restore currencyService → registry DI without client importing Amadeus `server-only` (ADR-035)
- [ ] Enable live Amadeus in local/prod when Enterprise credentials are ready

---

## 🟢 Lower priority / later horizons

- [ ] Activities / attractions live providers
- [ ] Ground transport live providers (UI currently hidden in MVP)
- [ ] Saved package contents (not just search criteria)
- [ ] AI trip planner / price prediction
- [ ] Booking integrations
