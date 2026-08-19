# Changelog

All notable product releases for Glooconn are listed here. Detailed notes live under [`docs/releases/`](./docs/releases/).

---

## [v0.20.0] — MVP Focus (August 2026)

**Milestone 14 — MVP Focus** (Sprints 14.1–14.4 complete).

- Focused first-search UI: Flights + Stays + Recommended Packages
- Hidden: Travel Style, Rooms, transport toggles/results/filters (architecture retained)
- Removed from UI: Destinations/About nav, fake booking CTAs
- UX polish: origin ↔ destination swap, dynamic budget label, trip-type wording, Browse Flights/Hotels hierarchy, mobile auth menu

**Milestone 15 — MVP Conversion** (Sprints 15.1–15.4 complete).

- **Price trust (Sprint 15.2):** Flight price explicitly labeled "per person"; hotel price labeled "N nights · 1 room"; package price labeled "Flight (per person) + hotel (N nights, 1 room) · est. total"; qualitative badges ("Top Pick" / "Good Match") replace opaque numeric score; zero-star hotels show "Unrated"
- **Recommended Package UX (Sprint 15.3):** Packages capped at 5 initially with "Show N more packages" toggle; "What's included" one-liner per card; result counts ("X flights · Y hotels") in sort bar; flight route context (LHR → CDG) on cards; one-way hotel warning; quality-aware "6+2" candidate pool
- **Flexible budget (Sprint 15.4):** Budget is now **optional** — empty input accepted; placeholder "Any budget"; no required asterisk; currency + input on same row on desktop
- **Budget compatibility warning (Sprint 15.4):** Banner above Recommended Packages when a budget is set but all same-currency packages exceed it; correctly suppressed when no currency matches (no FX conversion)
- **Flight price wording (M15 closeout):** Individual flight browse cards now read "per person" instead of bare "total"
- **552** automated tests; 0 vulnerabilities; typecheck clean; build clean

**Details:** [docs/releases/v0.20.0.md](./docs/releases/v0.20.0.md)

---

## [v0.19.0] — Travel Packages (August 2026)

**Milestone 13 complete.** Recommended flight + hotel packages via product-layer composition above existing providers (no PackagesProvider).

- Shared `TravelPackage` model
- Pure `PackageComposer` (`lib/packages/`) — deterministic scoring, currency match, candidate caps
- `SearchResponse.packages` composed in `SearchOrchestrator` after flights + hotels
- Recommended Packages UI hero section on results (hidden when empty)
- Live SerpAPI product validation + production hardening (Sprints 13.1–13.5)
- **358** automated tests

**Details:** [docs/releases/v0.19.0.md](./docs/releases/v0.19.0.md)

**Known limitations:** SerpAPI RT `departure_token` still falls back to outbound-only; package candidates skew budget; UI shows up to composer max (20).

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
