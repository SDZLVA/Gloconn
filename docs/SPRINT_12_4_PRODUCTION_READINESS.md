# Sprint 12.4 — Production Hardening Report

**Status:** ✅ Complete  
**Branch:** `milestone-12-hotel-search`  
**Product baseline:** v0.17.0 (flights) → preparing **v0.18.0** (hotels)  
**Date:** July 28, 2026  
**Nature:** Hardening only — no architecture changes, no new product features

**Prior validation:** [SPRINT_12_3_VALIDATION.md](./SPRINT_12_3_VALIDATION.md)

---

## Executive recommendation

**GO for Release Preparation (v0.18.0)** — SerpAPI Hotels adapter is production-hardened within the locked architecture. Mock remains default; live hotels enabled only via configuration. Release tagging and version bump are **out of scope** for this sprint.

---

## 1. Logging review

| Check | Result |
|-------|--------|
| API keys in logs | ✅ Never logged — closed event shape |
| Credentialed URLs | ✅ Not logged |
| Request bodies / PII | ✅ Not logged |
| Structured format | ✅ `[serpapi]` + `{ provider, operation, durationMs, httpStatus?, errorCode? }` |
| Hotels operation tag | ✅ `operation: "googleHotels"` (shared SerpAPI log module) |
| Production diagnostics | ✅ HTTP status + error codes (TIMEOUT, RATE_LIMITED, UNAUTHORIZED, NETWORK_ERROR, PROVIDER_ERROR) |

**Hardening change:** Removed duplicate `hotels/serpapi/log.ts`; hotels client now uses shared `lib/providers/flights/serpapi/log.ts` with extended `googleHotels` operation (behavior unchanged).

---

## 2. Error handling review

| Failure path | Handling | Verified |
|--------------|----------|----------|
| Missing API key | ProviderError before fetch | ✅ Unit + integration |
| Network failure | ProviderError + NETWORK_ERROR log | ✅ client.test |
| Timeout (15 s default) | ProviderError + TIMEOUT log | ✅ Shared httpTimeout helper |
| HTTP 401 | Auth ProviderError + UNAUTHORIZED | ✅ client + integration |
| HTTP 429 | Busy ProviderError + RATE_LIMITED | ✅ client.test |
| HTTP 4xx/5xx | Safe message from body.error | ✅ client.test (500) |
| Invalid JSON | ProviderError + PROVIDER_ERROR | ✅ client.test |
| Empty `properties[]` | `[]` (no throw) | ✅ mapper + integration |
| Incomplete properties | Dropped per-offer (`null`) | ✅ mapper.test |
| Unsupported currency | ProviderError | ✅ mapper.test |
| Missing `destinationId` | ProviderError (pre-HTTP) | ✅ provider + integration |
| Missing `returnDate` | ProviderError (no invented checkout) | ✅ query + provider + integration |
| Malformed response object | ProviderError | ✅ mapper.test |

All failures use existing `createProviderError` / `providerErrorFromFetchFailure` patterns.

---

## 3. Configuration review

| Item | Status |
|------|--------|
| `USE_MOCK_PROVIDERS` | Default `true` — mock hotels in CI/local |
| `HOTELS_PROVIDER=serpapi` | Factory selects live adapter |
| `SERPAPI_API_KEY` | Shared with flights — **no duplicate config** |
| `SERPAPI_DEEP_SEARCH` | Flights only (hotels engine ignores) |
| Config validation | Live hotels OR flights SerpAPI requires key |
| `.env.example` | Documents `HOTELS_PROVIDER` + shared SerpAPI key |

---

## 4. Code quality review

| Area | Action |
|------|--------|
| Duplicate SerpAPI log module | Removed — reuse flights log |
| Duplicate `SERPAPI_SEARCH_URL` / timeout | Hotels client imports from flights client |
| Duplicate currency/price helpers | Hotels `mappingHelpers` reuses flights `mapPrice`, `resolveFlightCurrency`, `DEFAULT_SERPAPI_CURRENCY` |
| Dead code | Removed `hotels/serpapi/log.ts` |
| Public behavior | Unchanged |

No new abstractions. Hotel-specific mapping (stars, nights, amenities, location) stays in hotels package.

---

## 5. Test review

| Suite | Coverage |
|-------|----------|
| `query.test.ts` | Params, children_ages, date validation, currency default |
| `mapper.test.ts` | Happy path, drops, currency, invalid raw |
| `provider.test.ts` | Orchestration, preconditions, error propagation |
| `client.test.ts` | HTTP success, 401, 429, 500, invalid JSON, network |
| `integration.test.ts` | **New** — factory → provider → mocked HTTP → Hotel[] |
| `factories.test.ts` (core) | **Extended** — hotels SerpAPI selection |
| `serpapiConfig.test.ts` | Live hotels key validation |

**Automated total:** 317 tests passing (was 305).

---

## 6. Documentation updated

- [SPRINT_12_4_PRODUCTION_READINESS.md](./SPRINT_12_4_PRODUCTION_READINESS.md) (this file)
- [CURRENT_STATE.md](./CURRENT_STATE.md)
- [API_FOUNDATION.md](./API_FOUNDATION.md)
- [Provider_Guide.md](./Provider_Guide.md) — hotels section
- [CHANGELOG.md](../CHANGELOG.md) — unreleased v0.18.0 entry
- [TODO.md](./TODO.md) — Milestone 12 progress
- [AI_HANDOFF.md](./AI_HANDOFF.md)

---

## 7. Production readiness checklist

| Item | Status |
|------|--------|
| Mock remains default | ✅ |
| Live provider enabled by configuration | ✅ `HOTELS_PROVIDER=serpapi` + key |
| Architecture unchanged | ✅ |
| No secrets committed | ✅ |
| Automated tests pass | ✅ 317 |
| TypeScript clean | ✅ `tsc --noEmit` |
| Documentation synchronized | ✅ |

---

## 8. Risks remaining (documented — not blockers for release prep)

| Risk | Severity | Notes |
|------|----------|-------|
| `children_ages` defaults to `8` | Medium | Until `SearchRequest` carries child ages |
| `stars === 0` on rentals | Low | UI shows blank star glyphs |
| `location` from nearby places | Low | May show airport/landmark |
| No hotel `rooms` param | Medium | API limitation |
| One-way needs `returnDate` | Medium | By design |
| Page 1 only | Low | No pagination |
| SerpAPI quota / latency | Medium | ~2–4 s typical |
| Mixed mock transport on live hotel search | Low | Pre-existing |

---

## 9. Recommendation

### **GO for Release Preparation (v0.18.0)**

Next step (separate sprint): version bump, release notes, tag — **not started in 12.4**.

**Operator env (live hotels):**

```env
USE_MOCK_PROVIDERS=false
HOTELS_PROVIDER=serpapi
FLIGHTS_PROVIDER=serpapi   # optional — independent per domain
SERPAPI_API_KEY=<secret>
SERPAPI_DEEP_SEARCH=false
```

Restart `npm run dev` after `.env.local` changes.
