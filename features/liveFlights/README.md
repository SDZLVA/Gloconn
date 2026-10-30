# Live flights engine (Milestone 23)

A self-contained, removable "All live flights" section on the results page.
Glooconn's own results come from cached Aviasales prices; this section shows
a partner's LIVE search for the same route and dates, so a visitor never
hits a dead end.

## Switch it off / swap it

- Off: set `NEXT_PUBLIC_LIVE_FLIGHTS_ENGINE=off` in Vercel and redeploy
  without build cache.
- Remove completely: delete this folder and `app/live-flights/`, delete the
  `<LiveFlightsSection …/>` block and its imports in
  `components/results/SearchResultsPage.tsx`, and remove `LIVE_FLIGHTS_CSP`
  and `SAME_ORIGIN_FRAME_PATHS` from `lib/security/csp.ts`. Nothing else
  uses it.
- Another provider: add a file in `engines/` implementing `LiveFlightsEngine`
  and register it in `engines/index.ts`.

## Engines

- `travelpayouts-widget` — Travelpayouts White Label Web, Widget type
  (White Label ID 24018, project Glooconn, created 2026-10-29). Free; earns
  30% of Travelpayouts' reward per booking; bookings on low-cost airlines'
  own sites are not credited. The widget searches by itself when the page
  URL carries `flightSearch=<Aviasales search code>` (e.g. MIL2311PAR28111),
  read from its script (tpwgts.com/wl_web), not documented.
- It runs in an iframe of Glooconn's own page `/live-flights/frame`
  (frameable only by Glooconn). Embedded directly, its CSS reset
  (`@layer isolation`, declared after Tailwind's layers so it outranked
  them) broke the whole results page, and it rewrote the page URL, dropping
  Glooconn's search parameters. The frame reports its height by postMessage.

## Look (Milestone 26)

`engines/travelpayoutsSkin.ts` restyles the widget's own result cards in
Glooconn's theme (separate cards, flights left, price column with a
full-width brand-700 button right; stacked on phones) and hides its
"Direct flights" summary. The frame page adds the style to every shadow
root on a 400 ms timer because the widget re-renders. Styling only — the
widget's data is never read or re-rendered.

## Milestone 28 — Flights tab

- The home page has four tabs (Packages, Flights, Hotels, Mixed Transport).
  A Flights search (`productTypes=flights`) opens `components/live/LiveFlightsResultsPage`:
  only this engine's live list, Glooconn's own flight API is not called.
- The left filter card drives the widget's stops, baggage, airlines and **price**.
  Price: the widget's slider has no input, so `applyMaxPrice` drags it with
  synthetic pointer events (binary search on the label it shows). The search
  budget fills "Max price".
- To remove the engine, also point the Flights tab back at the Packages results
  (`app/search/results/page.tsx`, the `mode === "flights"` branch).
