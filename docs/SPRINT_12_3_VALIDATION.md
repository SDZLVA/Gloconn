# Sprint 12.3 — Live SerpAPI Hotels Validation Report

**Status:** ✅ Complete  
**Branch:** `milestone-12-hotel-search`  
**Dates:** July 28, 2026  
**Nature:** Live validation — no architecture changes; one critical adapter fix only

**Raw evidence (redacted):**
- [SPRINT_12_3_LIVE_RESULTS.json](./SPRINT_12_3_LIVE_RESULTS.json)
- [SPRINT_12_3_H3_RERUN.json](./SPRINT_12_3_H3_RERUN.json)
- [SPRINT_12_3_API_SEARCH.json](./SPRINT_12_3_API_SEARCH.json) (POST `/api/search` response sample)

**Runner:** `scripts/sprint-12-3-live-validation.mts`

---

## Executive summary

Live SerpAPI Google Hotels integrates correctly through the locked architecture and maps into the shared `Hotel` model without orchestrator / service / model / UI redesign.

| Outcome | Detail |
|---------|--------|
| H1–H2, H4–H5 | **pass** — 20/20 mapped; EUR or USD as requested |
| H3 (children) | Initially **HTTP 400** (`children_ages` required) → **critical fix** → **pass** 18/20 |
| H6 obscure query | Still returned 20 fuzzy Google results (not empty) |
| E0 missing `returnDate` | **expected_error** — no invented checkout |
| E1 invalid API key | **expected_error** — 401 → ProviderError |
| C1 flights + hotels | **pass** — same `destinationId=paris`; hotels=20, flights=12 |
| POST `/api/search` | **HTTP 200** — live `serpapi-hotel-*` + `serpapi-*` flight ids |
| UI results page | Cards render name, € price, rating, amenities, nights |

**Recommendation: GO for Sprint 12.4**

---

## 1. Live Validation Report

### Configuration used

```env
USE_MOCK_PROVIDERS=false
HOTELS_PROVIDER=serpapi
FLIGHTS_PROVIDER=serpapi
SERPAPI_API_KEY=<configured — not recorded>
SERPAPI_DEEP_SEARCH=false
```

| Check | Result |
|-------|--------|
| Factory hotels | `serpapi` |
| Factory flights | `serpapi` |
| Key configured | ✅ (value never logged) |

### Scenario matrix

| ID | Scenario | Status | Mapped / raw | Currency | Latency |
|----|----------|--------|--------------|----------|---------|
| H1 | Paris — 3 nights, 2 adults | pass | 20 / 20 | EUR | ~3075 ms |
| H2 | Milan — 2 nights, 1 adult | pass | 20 / 20 | EUR | ~2075 ms |
| H3 | Rome — 5 nights, 2 adults + 1 child | pass* | 18 / 20 | EUR | ~3189 ms |
| H4 | Tokyo — 4 nights, 2 adults | pass | 20 / 20 | USD | ~1985 ms |
| H5 | New York — 1 night, 2 adults | pass | 20 / 20 | USD | ~2639 ms |
| H6 | Obscure query probe | pass† | 20 / 20 | EUR | ~3796 ms |
| E0 | Missing `returnDate` | expected_error | — | — | local |
| E1 | Invalid API key | expected_error | — | — | ~126 ms |
| C1 | Combined flights + hotels Paris | pass | 20 hotels + 12 flights | EUR | ~6–7 s total |

\* After `children_ages` fix (see Known Issues).  
† Google Hotels returns fuzzy matches for nonsense queries — not a true empty set.

### Search flow (architecture)

Confirmed end-to-end:

Search UI → `POST /api/search` → `searchTrips` → orchestrator → `HotelsProvider` (SerpAPI) → shared `Hotel` → UI cards.

No changes to SearchOrchestrator, SearchService, API contract, Hotel model, or ranking.

---

## 2. Hotel Mapping Validation

| Field | Live status | Notes |
|-------|-------------|-------|
| `id` | ✅ | Stable `serpapi-hotel-{hash}` |
| `destinationId` | ✅ | Matches request (`paris`, `milan`, `rome`, `tokyo`, `new-york`) |
| `name` | ✅ | Present on mapped offers |
| `price` | ✅ | Prefer `total_rate.extracted_lowest` (e.g. Paris €413 for 3 nights) |
| `currency` | ✅ | Echoes request (EUR / USD); no silent USD when EUR requested |
| `rating` | ✅ | `overall_rating` (0–5); some properties rate `0` when missing |
| `stars` | ⚠️ Partial | Often correct; many vacation rentals / hostels map to `0` when class absent |
| `amenities` | ✅ | String arrays render as chips |
| `nights` | ✅ | Computed from check-in/out (1 / 2 / 3 / 4 / 5 observed) |
| `location` | ⚠️ OK | Uses first `nearby_places` name — sometimes airport / landmark, not neighborhood |

**Vendor-only (correctly ignored):** `gps_coordinates`, images/thumbnails, `property_token`, `ads[]`.

**Dropped offers:** H3 dropped 2/20 (incomplete price/name) — expected mapper behavior.

---

## 3. UI Validation Summary

Live results page (Milan → Paris, Sep 15–18, hotels + flights, EUR 900):

| Check | Result |
|-------|--------|
| Cards render | ✅ Hotel + flight cards |
| Prices | ✅ e.g. hotel **€489**, flight **€131** |
| Ratings | ✅ e.g. **4.0** badge |
| Amenities | ✅ Chip list populated |
| Nights | ✅ **3 nights · per room** |
| Broken / empty cards | ❌ None observed on loaded results |
| Currency in summary | ✅ **Up to EUR 900** |
| Loading state | ✅ Skeleton then results |

**UI nuance:** When `stars === 0`, star glyphs are blank (by design of `★`.repeat(0)); rating badge still shows. Not a blocker.

---

## 4. Flight + Hotel Consistency Report

| Check | Result |
|-------|--------|
| Same destination label | ✅ Paris |
| Same `destinationId` | ✅ `paris` on hotels and flights |
| Same travel dates | ✅ Sep 15–18 check-in/out; flight sample `2026-09-15` |
| Partial failure | ❌ None on C1 / API search |
| Product mix | ✅ Hotels + flights both returned |

Round-trip flight return-token lookups still occasionally HTTP 400 (known M11 limitation) with outbound fallback — **does not break** hotel path or combined destination consistency.

---

## 5. Currency Validation Report

| Request | Response `search_parameters.currency` | Mapped `Hotel.currency` |
|---------|--------------------------------------|-------------------------|
| EUR (H1–H3, C1, API) | EUR | EUR |
| USD (H4–H5) | USD | USD |
| Missing budget currency | Defaults to **EUR** in query builder | (not USD) |

**No unintended USD fallback** when EUR was requested.

---

## 6. Error Handling Report

| Case | Behavior | Verdict |
|------|----------|---------|
| Missing `returnDate` | ProviderError: check-out required | ✅ Clear, no invented dates |
| Invalid API key | HTTP 401 → ProviderError auth message | ✅ |
| Children without ages (pre-fix) | HTTP 400 from SerpAPI | Fixed |
| Empty mapper input | `[]` (fixture / empty properties) | ✅ Covered in unit tests |
| Rate limit (429) | Mapped to busy ProviderError | ✅ Unit-tested (not live-triggered) |

---

## 7. Performance Observations

| Path | Observation |
|------|-------------|
| Hotels provider alone | ~2.0–3.8 s typical (page-1 Google Hotels) |
| Combined C1 | Hotels ~2.7 s + flights ~2.6 s (+ RT token retries) |
| UI end-to-end | Noticeable multi-second wait with skeleton loaders — acceptable for live |
| Fast API re-hit | One POST completed in <1 s (likely SerpAPI/Next warm cache) |

No optimization performed (out of scope).

---

## 8. Known Issues

1. **`children_ages` required by SerpAPI** — Sending `children` without ages caused HTTP 400. **Critical fix applied** in `query.ts`: default age `8` per child until `SearchRequest` carries ages. Documented in query module.
2. **`stars === 0` common** for rentals / missing class — UI shows no star glyphs; rating still present.
3. **`location` quality** — First nearby place can be an airport or landmark.
4. **Obscure queries are not empty** — Google Hotels fuzzy-matches; true empty sets are rare.
5. **No hotel `rooms` param** — `travelers.rooms` still not sent (API limitation).
6. **One-way hotel search** — Still requires `returnDate` (by design from 12.2).
7. **Page 1 only** — No pagination.

---

## 9. Recommendation

### **GO for Sprint 12.4**

Live hotels provider is production-capable for the current architecture, with documented limitations. Suggested 12.4 focus (not started here): production hardening / release packaging for live hotels (mirroring Milestone 11.3), optional child-age request field, and operator docs.

---

## Critical fix applied this sprint

| File | Change |
|------|--------|
| `lib/providers/hotels/serpapi/query.ts` | When `children > 0`, send `children_ages` defaulting to `8` per child |
| `lib/providers/hotels/serpapi/query.test.ts` | Coverage for ages |

Automated suite: **305 tests passing** after the fix.
