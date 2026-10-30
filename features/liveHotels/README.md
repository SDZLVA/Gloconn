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
