# Changelog

All notable product releases for Glooconn are listed here. Detailed notes live under [`docs/releases/`](./docs/releases/).

---

## [v0.18.0] — Live Hotels (July 2026)

**Milestone 12 complete.** Production-capable live hotel search via SerpAPI Google Hotels, behind the existing multi-provider architecture.

- SerpAPI Google Hotels adapter (`lib/providers/hotels/serpapi/`)
- Factory selection: `HOTELS_PROVIDER=serpapi` (mock default)
- Shared `SERPAPI_API_KEY` with flights — no duplicate config
- Live validation + production hardening (Sprints 12.1–12.4)
- **317** automated tests

**Details:** [docs/releases/v0.18.0.md](./docs/releases/v0.18.0.md)

**Known limitations:** requires `returnDate` for checkout; `children_ages` defaults to `8`; no hotel `rooms` param; page-1 results only.

---

## [v0.17.0] — Live Flights (July 2026)

**Milestone 11 complete.** Production-capable live flight search via SerpAPI Google Flights, behind the existing multi-provider architecture.

- Live one-way and round-trip flight search (SerpAPI)
- Full date-time mapping, currency robustness, round-trip `departure_token` path
- Operational validation (Sprints 11.1–11.3)
- **272** automated tests

**Details:** [docs/releases/v0.17.0.md](./docs/releases/v0.17.0.md)

**Known follow-up:** round-trip return-leg enrichment via `departure_token` (tracked for Milestone 12 / Sprint 11.4). Amadeus remains the long-term Enterprise flights provider.

---

## [v0.16.0] — Search Experience (July 2026)

**Milestone 10 complete.** Professional results UI, partial provider failure (`SearchResponse` + warnings), client filters/sort/ranking, search performance, destination autocomplete quality.

**Details:** [docs/releases/v0.16.0.md](./docs/releases/v0.16.0.md)

---

## [v0.15.0] — Multi-provider flights / SerpAPI adapter (July 2026)

SerpAPI Google Flights adapter + factory selection (`FLIGHTS_PROVIDER=serpapi`) + Provider Guide (ADR-036).

**Details:** [docs/releases/v0.15.0.md](./docs/releases/v0.15.0.md)

---

## Earlier Flight API releases

| Version | Focus | Notes |
|---------|--------|--------|
| v0.14.0 | Amadeus hardening | Timeouts, 401/429, config, logging — [Sprint 8](./docs/SPRINT_8_SUMMARY.md) |
| v0.13.0 | Flight API automated tests | Sprint 7 |
| v0.12.0 | Live Amadeus provider | Sprint 6 (`flight-api-v1`) |
