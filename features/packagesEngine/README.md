# Packages engine (Milestone 40)

Builds the Packages tab: flights + hotels → budget-aware packages.

- Switch: server env `PACKAGES_ENGINE`
  - `travelpayouts-liteapi` (default): Travelpayouts (Aviasales) flight prices + LiteAPI live hotels.
  - `legacy`: the old path (FLIGHTS_PROVIDER / HOTELS_PROVIDER + lib/packages composer). Tests use this.
  - `off`: no packages.
- Hook: `lib/services/searchOrchestrator.ts` (flights + hotels searches only; scout/date-strip searches stay on the old path).
- `combine.ts` (pure, tested): totals are for the whole group — flight price per person × (adults + children) + hotel price for all rooms and nights. With a budget only packages at or under it are shown (best trip first); if none fits, the cheapest 5 are shown with `overBudget`. Without a budget: quality + price.
- New engine: add `engines/<name>.ts` implementing `PackagesEngine` (types.ts) and list it in `config.ts`.
