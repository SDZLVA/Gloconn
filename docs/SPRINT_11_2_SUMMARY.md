# Sprint 11.2 Summary — SerpAPI Production Hardening

**Status:** ✅ Complete  
**Branch:** `cursor/milestone-10-6-hardening-release`  
**Date:** July 25, 2026  
**Baseline:** v0.16.0 · Live validation: Sprint 11.1 / 11.1b  
**Nature:** Hardening of existing SerpAPI adapter only — **no architecture redesign**

---

## Objectives delivered

| Task | Outcome |
|------|---------|
| Full date-time mapping | Preserve `YYYY-MM-DD HH:mm` in `Flight.departureTime` / `arrivalTime` |
| Round-trip via `departure_token` | Second HTTP call per outbound token; map outbound×return packages |
| Currency robustness | Query defaults to EUR; response → request → EUR fallbacks |
| Tests | Updated + new coverage; **272** suite tests pass |
| Docs | This summary + foundation / current state / provider notes |

---

## Date-time approach (no shared model change)

`Flight.departureTime` / `arrivalTime` already allow **ISO 8601 or localized display strings**.

**Choice:** store SerpAPI local datetimes as `"2026-09-15 06:30"` via `formatSerpApiDateTime`.  
Fall back to `HH:mm` only when no date is present.

**UI impact:** `FlightResultCard` renders the string as-is (may show date + time). Compatible with mock `HH:mm` values.

---

## Round-trip behavior

Isolated inside `SerpApiFlightsProvider` (orchestrator unchanged):

1. Outbound search as before (`type=1` + `return_date`)
2. For up to **5** outbound options with `departure_token`, fetch returns
3. Map up to **3** return options per outbound into RT `Flight` packages:
   - Schedule = **outbound** (full datetime)
   - Price = **return** option (SerpAPI RT total)
   - Duration/stops = sum of both legs
   - Id prefix `serpapi-rt-`
4. If return fetch fails → outbound-only fallback for that offer

---

## Currency assumptions

| Case | Behavior |
|------|----------|
| Budget currency set | Sent on query; used as mapper fallback |
| Budget null | Query uses **EUR** (not SerpAPI’s USD default) |
| Response currency missing | Fall back request → EUR |
| Response currency unsupported (e.g. SEK) | Still `createProviderError` |

---

## Testing

- SerpAPI package: **71** tests  
- Full repo: **272** tests pass  
- `npm run typecheck` pass  

Covered: full date-time, RT pair mapper, `departure_token` provider flow, return-fetch failure fallback, currency fallbacks, return query builder.

---

## Non-goals (unchanged)

- Amadeus package edits  
- `Flight` / `SearchRequest` / orchestrator contract changes  
- Making SerpAPI the production default  
- Live SerpAPI in CI  
