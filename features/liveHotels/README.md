# Live hotels engine (Milestone 29)

Stay22 map (`stay22.ts`), shown on the Hotels results page
(`components/live/LiveHotelsResultsPage.tsx`). Affiliate id `glooconn`
(public; override with `NEXT_PUBLIC_STAY22_AID`, `off` hides the map and the
page shows its "coming soon" note). CSP allows `frame-src https://www.stay22.com`.

Remove: delete this folder, the `mapUrl` block in LiveHotelsResultsPage, and
the Stay22 host in `lib/security/csp.ts`.

Note: the map is Stay22's own page in an iframe (another site), so Glooconn
cannot restyle it or drive it from the sidebar — only through its URL
parameters (dates, guests, colours, `max` price).

# Milestone 30 — LiteAPI (default engine)

- `NEXT_PUBLIC_HOTELS_ENGINE`: `liteapi` (default) | `stay22` | `off`. Stay22 is muted (kept in code).
- Server: `app/api/hotels/live/route.ts` → `liteapi/client.ts` (`POST /v3.0/hotels/rates`,
  header `X-API-Key`, key in `LITEAPI_API_KEY`). Only the free rates endpoint is used;
  results cached 10 min (memory + CDN), 10 searches/min per IP.
- Location: label "City, Country" → `cityName` + ISO `countryCode` (`liteapi/location.ts`).
  LiteAPI's place search costs $0.01/call and is not used.
- Mapping (`liteapi/map.ts`) reads fields loosely; preview deployments show a raw sample at
  `/api/hotels/live?...&debug=1`.
- UI: `components/live/hotels/*` — Booking.com-style cards, small map + "Filter by" on the left,
  full map with price pins (OpenStreetMap tiles, no library). Filters run in the browser.
- "See availability" needs a LiteAPI white-label site: set `NEXT_PUBLIC_LITEAPI_WHITELABEL_URL`.
  Without it the card says "Online booking coming soon".
