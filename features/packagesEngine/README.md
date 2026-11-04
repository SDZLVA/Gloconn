# Packages engine (Milestones 40 / 40b)

Builds the Packages tab. Switch with server env `PACKAGES_ENGINE`:

- `whitelabel-liteapi` (default): **hotel-led packages**. LiteAPI live hotels that leave room in the budget for flights; each package's page shows the live Travelpayouts White Label flights filtered to the money left (budget − hotel). Glooconn never reads White Label prices (Travelpayouts rules), so there is no single exact total. The Travelpayouts cached prices API is used only to estimate how much to set aside for flights (cheapest × travelers × 1.15; without data 40% of the budget). Logic: `stays.ts`.
- `travelpayouts-liteapi`: flight + hotel packages with exact totals from Travelpayouts cached flight prices + LiteAPI (`combine.ts`).
- `legacy`: old providers + lib/packages composer (tests use this).
- `off`: no packages.

Hook: `lib/services/searchOrchestrator.ts` (flights + hotels searches; scout/date-strip searches stay on the old path).
New engine: add `engines/<name>.ts` implementing `PackagesEngine` (types.ts) and list it in `config.ts`.
