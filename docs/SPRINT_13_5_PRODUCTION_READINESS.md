# Sprint 13.5 — Product Validation, Hardening & Release Readiness

**Status:** ✅ Complete  
**Branch:** `milestone-12-hotel-search` (Milestone 13 work on this branch)  
**Dates:** August 3, 2026  
**Nature:** Live validation + hardening + docs — **no version bump, no tags, no release**

**Raw evidence (redacted):** [SPRINT_13_5_LIVE_RESULTS.json](./SPRINT_13_5_LIVE_RESULTS.json)  
**Runner:** `scripts/sprint-13-5-live-validation.mts`

---

## Executive summary

Recommended Travel Packages work end-to-end on live SerpAPI flights + hotels through the locked architecture. All five validation routes passed package composition checks (price, currency, nights, destination, ranking order). Automated suite, typecheck, and production build are green.

**Recommendation: GO for Release Preparation (v0.19.0)** — tagging and version bump remain a separate release sprint.

---

## 1. Validation Report

### Configuration

```env
USE_MOCK_PROVIDERS=false
FLIGHTS_PROVIDER=serpapi
HOTELS_PROVIDER=serpapi
SERPAPI_API_KEY=<configured — not recorded>
SERPAPI_DEEP_SEARCH=false
```

Stay window for all routes: **2026-09-15 → 2026-09-22** (7 nights), 2 adults, round-trip, product types `hotels` + `flights`.

### Scenario matrix

| ID | Route | Status | Flights | Hotels | Packages | Top total | Currency | Latency |
|----|-------|--------|---------|--------|----------|-----------|----------|---------|
| P1 | Milan → Tokyo | **pass** | 10 | 20 | 20 | 2173 | EUR | ~2.9 s |
| P2 | Milan → New York | **pass** | 9 | 20 | 20 | 2023 | USD | ~5.7 s |
| P3 | Paris → Bangkok | **pass** | 10 | 20 | 20 | (see JSON) | EUR | ~7.6 s |
| P4 | Rome → Dubai | **pass** | 9 | 20 | 20 | (see JSON) | EUR | ~4.3 s |
| P5 | London → Barcelona | **pass** | 10 | 20 | 20 | (see JSON) | EUR | ~2.3 s |

### Per-route checks (all OK when status=pass)

- Flights returned  
- Hotels returned  
- Packages generated  
- `totalPrice === flight.price + hotel.price`  
- Currency consistent across package / flight / hotel  
- Nights correct (7, matching hotel quote / stay)  
- Hotel `destinationId` matches route  
- Stay dates align with requested window  
- Package scores non-increasing (ranking order)

### Observed inconsistencies (documented — no provider changes)

| Issue | Severity | Notes |
|-------|----------|--------|
| SerpAPI `departure_token` return fetch HTTP **400** | Known (M11) | Outbound-only flight fallback; packages still compose |
| Candidate pre-sort favors cheaper hotels | Product | Top packages often budget stays (e.g. guest house / B&B) — see Product Review |
| Up to **20** packages in UI | Product | Cap is composer default; consider UI top-N later |

---

## 2. Product Review (recommendations only)

| Question | Assessment |
|----------|------------|
| Top package feel reasonable? | **Mostly** — totals and destinations are coherent; lodging skews budget because candidate selection prefers cheaper hotels |
| Ranking sensible? | **Yes** — score order verified; budget-fit + quality mix works; absolute scores ~60–80 are relative within the set |
| Prices understandable? | **Yes** — combined total = flight + hotel; card footer states “flight + hotel total” |
| Section visually useful? | **Yes** — hero placement above the mixed list; hidden when empty |
| Missing information? | Hotel photos (model has no image URL); cabin class; explicit outbound vs return when RT fallback applies |

**Recommended follow-ups (do not implement in 13.5):**

1. UI display cap (e.g. top 5–8 packages) while keeping composer max at 20  
2. Diversify hotel candidates (stars / rating bands) so “Recommended” is not only cheapest  
3. Optional package filter integration with sidebar  
4. Add hotel image URL to shared `Hotel` when a vendor supplies thumbnails  
5. Clarify flight trip type on package cards when RT enrichment fails  

---

## 3. Hardening Summary

| Area | Outcome |
|------|---------|
| Edge cases | Empty packages → section not rendered (verified by tests) |
| Empty states | No empty package section (by design) |
| Responsiveness | Existing card layout (stacked → row); unchanged patterns |
| Accessibility | Section `h2` + `aria-labelledby`; list `aria-label`; card articles labeled |
| Memoization | `TravelPackageCard` + `RecommendedPackagesSection` use `memo` |
| Defects fixed | Package timeline label **Return → Arrive** (misleading under outbound-only RT fallback) |

No UX redesign. No PackageComposer / orchestrator / provider changes in this sprint beyond the label fix.

---

## 4. Repository health

| Check | Result |
|-------|--------|
| `npm test` | **358** pass |
| `npm run typecheck` | Green |
| `npm run build` | Green (`Compiled successfully`) |
| Secrets | `.env.local` not committed; validation JSON redacts API key |
| Live providers in CI | None |

---

## 5. GO / NO-GO

### **GO for Release Preparation (v0.19.0)**

Milestone 13 (Travel Packages) is validation-complete and production-hardened for release prep. Version bump, release notes file under `docs/releases/v0.19.0.md`, and tagging are **out of scope** for Sprint 13.5.
