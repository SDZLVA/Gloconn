# Sprint 11.3 — Production Readiness Report

**Status:** ✅ Complete (validation only — no product code changes)  
**Branch:** `cursor/milestone-10-6-hardening-release`  
**Product baseline:** v0.16.0  
**Date:** July 25, 2026  
**Target release under evaluation:** **v0.17.0**

**Evidence:** [SPRINT_11_3_LIVE_RESULTS.json](./SPRINT_11_3_LIVE_RESULTS.json)  
**Runner:** `scripts/sprint-11-3-production-validation.mts`

---

## Executive recommendation

**Conditional GO for v0.17.0** — one-way SerpAPI search is production-ready for the current architecture. Round-trip return-leg enrichment via `departure_token` is **not** working against the live API (HTTP 400 → silent outbound fallback). That is a **High** issue for Sprint **11.4**, not a hard block on shipping one-way live flights if the release notes document the RT limitation.

No architecture changes. No product features implemented in this sprint.

---

## 1. Manual testing summary

### Environment

| Check | Result |
|-------|--------|
| `.env.local` | Present |
| `USE_MOCK_PROVIDERS` | `false` |
| `FLIGHTS_PROVIDER` | `serpapi` |
| `SERPAPI_API_KEY` | Set (not recorded) |
| `SERPAPI_DEEP_SEARCH` | `false` (default for UI) |
| Dev server | Required **restart** after env changes — stale process served **mock** flights (`flight-paris-1` in ~20ms) until restart |

### Phase 1 — End-to-end matrix

| Scenario | Channel | Result | Notes |
|----------|---------|--------|-------|
| One-way international MXP→CDG | UI + API + provider script | ✅ Pass | 13 flights; easyJet/AF/Condor/Vueling/SWISS; full datetime; € prices |
| Round-trip MXP→CDG | UI + API + provider script | ⚠️ Partial | Results show; prices look RT-level (€85+); **no `serpapi-rt-*` packages**; return fetches HTTP **400** |
| Domestic JFK→LAX | UI + API | ✅ Pass | USD (`$376`+); Delta/JetBlue/American + others; overnight dates preserved |
| International long-haul MXP→JFK | Provider script | ✅ Pass | Direct + 1-stop mix |
| Direct | Observed | ✅ | e.g. MXP→CDG stops histogram `0:10` |
| Multi-stop | Observed | ✅ | e.g. Condor/Vueling/SWISS 1-stop cards; MXP→AMS mostly 1-stop |
| Invalid / nonsense destination in autocomplete | UI | ⚠️ Soft | Typing `asdfghqwerty` falls back to **popular destinations** (no empty-state message) |
| No-result / invalid IATA ZZZ→YYY | API | ✅ Pass | `flights: []`, HTTP 200, ~1.2s (no crash) |
| Filters / sort | UI | ✅ Pass | Filters panel opens; airline/stops/price/sort controls present |

### Verify checklist (live UI)

| Check | Result |
|-------|--------|
| Search completes | ✅ |
| Results displayed | ✅ |
| Prices plausible | ✅ (EUR / USD) |
| Airlines display | ✅ |
| Date/time formatting | ⚠️ Acceptable but dense (`YYYY-MM-DD HH:mm`) |
| Filters work | ✅ |
| Console / runtime | ⚠️ React **hydration** error overlay (`SectionHeading` / results header) — page still usable |
| Runtime exceptions (crash) | ✅ None observed |

---

## 2. Performance measurements

### Provider script (`docs/SPRINT_11_3_LIVE_RESULTS.json`)

| Metric | `deep_search=false` | `deep_search=true` |
|--------|---------------------|--------------------|
| One-way MXP→CDG wall time | **109 ms** | **2586 ms** |
| Flight count | 13 | 13 |

**Caveat:** The `false` sample was warm (same route already hit in P1). Cold-ish API probe MXP→AMS (`false`) measured **~2.2 s** via `POST /api/search`.

### Additional live timings (restarted Next server)

| Call | Time | Notes |
|------|------|-------|
| One-way MXP→CDG API | ~1.9 s | First live call after restart |
| Round-trip MXP→CDG API (cached outbound) | ~0.2–1.4 s | Extra return lookups fail fast (~150 ms × N) with HTTP 400 |
| Domestic JFK→LAX API | ~0.95 s | |
| Invalid IATA empty | ~1.2 s | |
| Provider RT P2 | 1385 ms | |
| Provider P5 MXP→AMS | 3555 ms | |

### Interpretation

- Default **`SERPAPI_DEEP_SEARCH=false`** is the right production default.
- **`true`** adds ~2+ seconds on the measured route with **no count gain** in this sample — keep off unless quality investigation needs it.
- Round-trip latency is dominated by outbound + failed return attempts (quota waste).

---

## 3. UI review

| Area | Observation | Severity | Action |
|------|-------------|----------|--------|
| Flight cards | Clear airline, duration, Direct/N-stop, price, CTA | — | OK |
| Date/time | Full `YYYY-MM-DD HH:mm` shown as one bold line | Low | Optional polish in 11.4 (date + time lines) |
| Trip-type label | **Hardcoded** `Round-trip · per person` even for one-way | Medium | Sprint 11.4 (`FlightResultCard.tsx`) |
| Long airline names | Handled (wrap); no truncation bugs seen | — | OK |
| Multi-stop | `1 stop` / Direct labels correct | — | OK |
| Currency | € and $ format correctly | — | OK |
| Mobile | Narrow viewport usable; filters behind “Show filters” | — | OK |
| Mixed mock domains | Mock hotels/buses/trains still appear (Paris hotels on JFK→LAX) | Medium (pre-existing) | Document; hotels live is out of scope |
| Return leg on RT cards | Only outbound schedule shown | High (linked to token bug) | Sprint 11.4 |
| Hydration overlay | Dev “1 Issue” badge on results/home | Medium | Sprint 11.4 investigate `SectionHeading` |

Evidence-only recommendations — no UI features implemented in 11.3.

---

## 4. Error handling assessment

| Scenario | Result | UI / UX |
|----------|--------|---------|
| Invalid API key | Provider throws: `SerpAPI authentication failed. Check SERPAPI_API_KEY.` | Orchestrator → flights warning / hard fail depending on other domains; **does not crash** |
| Timeout | Default client timeout **15 s**; invalid route once hit timeout in provider script | User-facing timeout message exists; can feel slow |
| Quota exceeded | Not exercised (would burn quota) | Expected to surface as provider error via existing client mapping |
| Empty responses | `[]` mapped; HTTP 200 | No dedicated “no flights” empty copy verified when other mock domains fill the list |
| Network failure | Not simulated end-to-end | Client maps to network provider error (existing) |
| Malformed query (missing originIata) | Immediate `PROVIDER_ERROR` | Pass |
| Return-token HTTP 400 | Caught; **silent fallback** to outbound-only | User sees RT prices without knowing return enrichment failed |

**Assessment:** Error paths do not crash the app. Gaps: silent RT fallback, hydration noise in dev, autocomplete never shows a true empty match state.

---

## 5. Remaining production risks

| ID | Risk | Severity | Block v0.17.0? | Sprint |
|----|------|----------|----------------|--------|
| R1 | `departure_token` return requests return **HTTP 400**; no `serpapi-rt-*` packages in live RT | **High** | No (if RT limitation documented) | **11.4** — likely need original search params + token (SerpAPI examples include `departure_id` / dates / `type=1`) |
| R2 | Stale Next.js process ignores `.env.local` → silent **mock** flights | **High** (ops) | Process control | Ops note + restart checklist |
| R3 | Invalid IATA / bad routes can approach **15 s timeout** | Medium | No | 11.4 fail-fast |
| R4 | Flight card always says “Round-trip” | Medium | No | 11.4 |
| R5 | React hydration warning on results/home | Medium | No | 11.4 |
| R6 | DateTime density on cards | Low | No | Optional 11.4 |
| R7 | Mock hotels/transport pollute flight-centric searches | Medium | No | Later milestone |
| R8 | RT return lookups waste SerpAPI quota on 400s | Medium | No | Fixed with R1 |
| R9 | Autocomplete nonsense → popular list (no empty state) | Low | No | Optional |

---

## 6. Release readiness recommendation

### v0.17.0

**Conditional GO**, with release notes stating:

1. Live flights via SerpAPI (one-way) validated end-to-end.
2. Round-trip **prices** come from the initial Google Flights round-trip response; **return-leg schedule enrichment via `departure_token` is not yet reliable** (tracked for 11.4).
3. Default `SERPAPI_DEEP_SEARCH=false`.
4. Restart the Next.js server after any `.env.local` change.

### Do **not** block v0.17.0 for

- Datetime display polish  
- Autocomplete empty-state copy  
- Mock hotel destination mismatch  

### Must land in **Sprint 11.4** (before calling RT “production-complete”)

1. Fix `buildSerpApiReturnSearchParams` / return fetch to match SerpAPI’s documented/token playground shape (include route/date/`type` with token as needed); re-validate live until `serpapi-rt-*` appears.  
2. Stop burning quota on known-bad return calls once diagnosed.  
3. Fix hardcoded “Round-trip · per person” label.  
4. Investigate hydration error in `SectionHeading`.  

### Explicit non-goals of 11.3

- No architecture redesign  
- No new features  
- No Amadeus / orchestrator / shared model changes  

---

## Testing performed

1. Restarted `npm run dev` with SerpAPI env; confirmed mock → live transition.  
2. UI results pages: one-way MXP→CDG, round-trip MXP→CDG, domestic JFK→LAX.  
3. Provider script P1–P5 + E1–E3 + deep_search comparison → `docs/SPRINT_11_3_LIVE_RESULTS.json`.  
4. Direct `POST /api/search` probes for performance and empty IATA.  
5. Filters panel inspected; sort control present.  

API key never logged or committed.
