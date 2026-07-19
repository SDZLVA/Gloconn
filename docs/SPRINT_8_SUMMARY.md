# Sprint 8 Summary — Flight API Production Hardening

**Status:** ✅ Complete  
**Branch:** `cursor/project-principles`  
**Dates:** July 2026  
**Product version:** 0.14.0  
**Release tag:** `v0.14.0`  
**Milestone:** Flight API v0.14.0  
**Flight API status:** Maintenance mode

---

## Objective

Strengthen the live Amadeus Flight API path for production readiness without changing provider contracts or mock-provider behavior.

---

## Hardening completed

| Area | What shipped |
|------|----------------|
| Request timeouts | `AbortSignal.timeout` on OAuth + authenticated fetch; clear `ProviderError` messages |
| 401 single retry | Clear token cache → refresh → retry once (no loops) |
| 429 handling | No retry; clear user message; Retry-After never exposed to UI |
| Centralized configuration | `AMADEUS_ENV=test\|production` → known hosts only; timeout envs via `lib/config` |
| Structured logging | Server-only console events: `provider`, `operation`, `httpStatus?`, `durationMs`, `errorCode?` |

---

## Configuration (central only)

| Variable | Role |
|----------|------|
| `AMADEUS_ENV` | `test` (default) or `production` — maps to known Amadeus hosts |
| `AMADEUS_API_KEY` / `AMADEUS_API_SECRET` | Required when live Amadeus is intended |
| `AMADEUS_OAUTH_TIMEOUT_MS` | Default `10000` |
| `AMADEUS_FETCH_TIMEOUT_MS` | Default `15000` |
| `USE_MOCK_PROVIDERS` / `FLIGHTS_PROVIDER` | Mock bypasses live credential validation |

Arbitrary Amadeus base URLs are **not** supported.

---

## Structured logging

Central helper: `lib/providers/flights/amadeus/log.ts`

| Operation | When |
|-----------|------|
| `oauth` | Token success / failure / timeout / 429 |
| `flightOffers` | Search success / failure / timeout / 429 |
| `unauthorizedRetry` | HTTP 401 before cache clear + single retry |

**Never logged:** access tokens, client id/secret, Authorization headers, request payloads, personal user data.

---

## Automated testing status

**Total: 115** tests — all passing (`npm test`).

| Coverage area | Examples |
|---------------|----------|
| Configuration | Env host selection, invalid env, missing credentials, timeout defaults/overrides, mock bypass |
| Timeouts | OAuth + fetch `TimeoutError` → clear ProviderError |
| 401 / 429 | Single retry; no 429 retry; Retry-After not in user messages |
| Logging | Expected events; sensitive values absent; retry/timeout paths |

---

## Manual Amadeus Sandbox checklist

Use Amadeus **test** credentials and `AMADEUS_ENV=test`. Keep CI on mocked fetch — this checklist is local/manual only.

### Setup

- [ ] Copy `.env.example` → `.env.local`
- [ ] Set `USE_MOCK_PROVIDERS=false`
- [ ] Set `FLIGHTS_PROVIDER=amadeus`
- [ ] Set `AMADEUS_ENV=test`
- [ ] Set valid `AMADEUS_API_KEY` and `AMADEUS_API_SECRET`
- [ ] Restart `npm run dev`

### OAuth

- [ ] First flight search obtains a token (server log: `operation: "oauth"`, no `errorCode`)
- [ ] Second search reuses cached token (no extra OAuth call in logs within TTL)
- [ ] Invalid credentials → clear provider/auth failure (no secrets in logs)

### Flight search

- [ ] One-way search returns mapped flights on results
- [ ] Round-trip search with return date returns mapped flights
- [ ] Missing/blank destination context still fails safely before/during provider path

### Resilience

- [ ] Invalid credentials rejected with clear error (not a hang)
- [ ] Timeout behavior: temporarily set a very low `AMADEUS_FETCH_TIMEOUT_MS` / `AMADEUS_OAUTH_TIMEOUT_MS` and confirm clear timeout errors + structured `errorCode: "TIMEOUT"` logs
- [ ] Mock/live switching: restore `USE_MOCK_PROVIDERS=true` → mock flights without requiring keys

### Observations to record

- [ ] Note any Amadeus response shape differences vs fixtures (`amadeus/__fixtures__/`)
- [ ] Note rate-limit / 429 behavior if encountered (Retry-After should stay out of UI copy)
- [ ] Note latency (`durationMs` in structured logs)

---

## Remaining technical debt

| Item | Status |
|------|--------|
| `currencyService` → registry DI without client importing Amadeus `server-only` | Still open (ADR-035) — intentionally not fixed in Sprint 8 |
| Partial provider failure (orchestrator) | Still open — out of Sprint 8 |
| Manual sandbox execution | Checklist above — not automated |

---

## What was intentionally out of Sprint 8

- Large DI / factory redesign
- Arbitrary Amadeus base URLs
- Logging frameworks / request IDs
- Provider contract or `FlightsProvider` interface changes
- Live Amadeus calls in CI

---

## Documentation updated (this step)

| File | Update |
|------|--------|
| `docs/API_FOUNDATION.md` | Hardening, config, logging, test counts |
| `docs/AI_HANDOFF.md` | Sprint 8 snapshot, env, do-nots |
| `docs/PROGRESS.md` | Sprint 8 completion log |
| `docs/CURRENT_STATE.md` | Version 0.14.0, Sprint 8 complete |
| `docs/ROADMAP.md` | Sprint 8 row; Flight API hardening milestone |
| `docs/TODO.md` | Sprint 8 checklist; backlog refresh |
| `docs/SPRINT_8_SUMMARY.md` | This file |
| `docs/PROJECT.md` | Version 0.14.0 overview |
| `package.json` | Version **0.14.0** |

**No production application code changed in this documentation step.**

---

## Milestone

**Flight API v0.14.0 — complete.** Flight API enters **maintenance mode**.

Hardening (timeouts, 401 retry, 429, config, logging) + automated coverage (115 tests) + manual sandbox plan documented.

Stable return point: git tag / GitHub Release **`v0.14.0`**.

See `docs/TODO.md` and `docs/CURRENT_STATE.md` for post–Sprint 8 backlog (outside active Flight API feature work).
