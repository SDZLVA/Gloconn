# Glooconn — TODO

Active and upcoming tasks. Check items off as they are completed and move done items to [PROGRESS.md](./PROGRESS.md).

**Current release:** **v0.23.0** (Budget-First Engine)  
**Completed milestones:** **Milestone 18** · **Milestone 17** · **17.9 Cleanup**  
**Next:** **Milestone 19 (proposed)** — nearby airports/cities, trains & buses, affiliate links, real user testing

---

## 🔴 NEXT — Milestone 19 (proposed) — not started

- [ ] Nearby airports / cities discovery
- [ ] Trains & buses in the product surface (providers already exist; UI currently hidden)
- [ ] Affiliate / monetization links (careful UX + compliance)
- [ ] Real user testing / feedback loop

---

## ✅ Milestone 18 — Budget-First Engine (released as v0.23.0)

- [x] 18.1 — Flexible date-shift helper + tests
- [x] 18.2 — Flexible dates control on search form + URL
- [x] 18.3 — Cheaper-options CTA and Exact flex hint
- [x] 18.4a — Scout mode + date options service
- [x] 18.4b — `POST /api/search/date-options` (rate limit, cache, kill switch)
- [x] 18.5 — Date price strip UI (“from €X”)
- [x] 18.6 — Chip selection loads full packages
- [x] 18.7a — Return-lookup quota guard (later adjusted in 18.8)
- [x] 18.8 — Honest RT prices, browse visibility, clearer sort scope
- [x] 18.9 — Release **v0.23.0**

---

## ✅ Milestone 17 — Hotel Actionability (released as v0.22.0)

- [x] View hotel drawer + Google Maps
- [x] Property details API + safe external links
- [x] Hotel card polish
- [x] Sealed property refs (`gpref1` + `PROPERTY_REF_SEAL_SECRET`)
- [x] CSP nonce fix for Vercel hydration
- [x] Real-data replay mode + package details UX

---

## ✅ 17.9 Cleanup (included in v0.22.0)

- [x] Next.js **16.3.1 → 16.3.3** + `npm audit fix` (**0 vulnerabilities**)
- [x] Create **`main`** branch (GitHub default + Vercel production)
- [x] CI runs on every branch push
- [x] Release docs / version bump to **v0.22.0**

---

## ✅ Milestone 16 — Recommendation Intelligence (released as v0.21.0)

- [x] Sprints 16.1–16.6 → **v0.21.0**

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

---

## 🟢 Lower priority / later horizons

- [ ] Activities / attractions live providers
- [ ] Ground transport live providers (UI currently hidden in MVP) — see Milestone 19 proposal
- [ ] Saved package contents (not just search criteria)
