# Glooconn

Travel planning web application — discover destinations, plan trips, and manage travel in one place.

**Repository:** [github.com/SDZLVA/Gloconn](https://github.com/SDZLVA/Gloconn)  
**Version:** **v0.17.0** released (Live Flights) · **v0.18.0** prep (Live Hotels)  
**Milestones:** **11** ✅ Live Flights · **12** ✅ Hotel Search Integration (release tagging next)

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Auth & database | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) |
| Linting | ESLint + eslint-config-next |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Authentication setup (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local` and fill in your project URL and anon key.
3. In Supabase **Authentication → Providers**, enable **Google** (optional) and **Email**.
4. Add `http://localhost:3000/auth/callback` to **Redirect URLs** in Auth settings.
5. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor (creates `saved_trips` table).

Without `.env.local`, the app runs but sign-in and saved trips are disabled.

### Live flight search (SerpAPI)

By default the app uses **mock** travel providers. To enable **live flight search** via SerpAPI (production-capable path as of v0.17.0):

```env
USE_MOCK_PROVIDERS=false
FLIGHTS_PROVIDER=serpapi
SERPAPI_API_KEY=<your-key>
SERPAPI_DEEP_SEARCH=false
```

Restart the Next.js server after changing `.env.local`.

**Amadeus** remains the long-term Enterprise flights path (`FLIGHTS_PROVIDER=amadeus` + Amadeus keys). See [docs/Provider_Guide.md](./docs/Provider_Guide.md).

### Live hotel search (SerpAPI)

To enable **live hotel search** via SerpAPI Google Hotels (Milestone 12 — production-capable when configured):

```env
USE_MOCK_PROVIDERS=false
HOTELS_PROVIDER=serpapi
SERPAPI_API_KEY=<your-key>
```

Uses the same `SERPAPI_API_KEY` as flights. Hotels require a checkout date (`returnDate` on round-trip searches). See [docs/Provider_Guide.md](./docs/Provider_Guide.md).

### Windows note

If PowerShell blocks `npm`, use `npm.cmd run dev` or:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Automated test suite (317 tests) |

## Architecture overview

```
UI (search form / results)
  → postSearchTrips()
  → POST /api/search
  → searchTrips() [server-only]
  → orchestrateTripSearch()
       ├── IATA enrichment + flight airport validation
       └── Promise.allSettled(hotels | flights | transport)
  → SearchResponse (+ optional warnings)

Provider factory (per domain):
  FlightsProvider: mock (default) | serpapi (live) | amadeus (Enterprise)
  HotelsProvider:  mock (default) | serpapi (live) | booking (stub → mock)
       └── Query → HTTP → Mapper → shared Flight / Hotel model
```

- **Provider abstraction** — `FlightsProvider` / `HotelsProvider` / transport interfaces in `lib/providers/core/`
- **Unified domain models** — `types/models/flight.ts`, `types/models/hotel.ts` (vendor-agnostic)
- **Search orchestrator** — `lib/services/searchOrchestrator.ts`
- **Partial failure** — one domain can fail without blanking the search (ADR-037)

## Project structure

```
Gloconn/
├── app/                    # Routes, layouts, POST /api/search
├── components/             # UI (search, results, auth, layout, trips)
├── hooks/                  # useAuth, useSearchForm, …
├── lib/
│   ├── api/                # Errors, validation, HTTP helpers, search client
│   ├── auth/               # Supabase clients & session
│   ├── config/             # Centralized env (getAppConfig)
│   ├── providers/          # Domain adapters
│   │   ├── core/           # Interfaces, registry, factories
│   │   ├── flights/        # mock · amadeus · serpapi
│   │   ├── hotels/         # mock · serpapi (live)
│   │   ├── ground/         # mock (+ omio planned)
│   │   └── destinations/   # mock (+ google-maps planned)
│   ├── services/           # searchService, orchestrator, IATA enrichment
│   └── …
├── types/models/           # Shared domain models (Flight, SearchRequest, …)
└── docs/                   # Project documentation
```

## Documentation

| File | Purpose |
|------|---------|
| [CHANGELOG.md](./CHANGELOG.md) | Release history |
| [docs/PROJECT.md](./docs/PROJECT.md) | Overview, features, routes |
| [docs/CURRENT_STATE.md](./docs/CURRENT_STATE.md) | Latest release snapshot |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Product roadmap |
| [docs/PROGRESS.md](./docs/PROGRESS.md) | Completed work log |
| [docs/TODO.md](./docs/TODO.md) | Active tasks (v0.18.0 release prep) |
| [docs/API_FOUNDATION.md](./docs/API_FOUNDATION.md) | Provider architecture |
| [docs/Provider_Guide.md](./docs/Provider_Guide.md) | How to add a flights vendor |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | Architecture decisions (ADRs) |
| [docs/AI_HANDOFF.md](./docs/AI_HANDOFF.md) | Guide for AI assistants |
| [docs/releases/v0.17.0.md](./docs/releases/v0.17.0.md) | v0.17.0 Live Flights release notes |
| [PROJECT_RULES.md](./PROJECT_RULES.md) | Development guidelines |

## Current status

- **Released:** **v0.17.0** — Milestone **11** (Live Flights)
- **In progress:** **v0.18.0** release prep — Milestone **12** complete (Live Hotels)
- **Live Flight Search:** SerpAPI (`FLIGHTS_PROVIDER=serpapi`) — **production-capable**
- **Live Hotel Search:** SerpAPI (`HOTELS_PROVIDER=serpapi`) — **production-capable when configured**
- **Amadeus:** long-term Enterprise flights provider
- **Default mode:** mock providers (`USE_MOCK_PROVIDERS=true`) until live env is configured
- **Tests:** **317** automated tests (typecheck, lint, test, build green)
- **Live routes:** `/`, `/search/results`, `/login`, `/signup`, `/profile`, `/my-trips`
- **Auth:** Google OAuth and email/password via Supabase
- **Next:** v0.18.0 tag and release notes
- **Planned routes:** `/destinations`, `/about`

See [docs/CURRENT_STATE.md](./docs/CURRENT_STATE.md) and [docs/TODO.md](./docs/TODO.md).
