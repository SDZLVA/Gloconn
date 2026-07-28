# Glooconn — Project Overview

## What is Glooconn?

Glooconn is a travel planning web application that helps users discover destinations, plan trips, and manage travel in one place. The product vision is similar in spirit to major travel platforms (e.g. Booking.com) but with its own brand identity, codebase, and feature roadmap.

**Repository:** [github.com/SDZLVA/Gloconn](https://github.com/SDZLVA/Gloconn)  
**Owner:** Shehan De Silva (@SDZLVA)  
**Current version:** **0.17.0** released (Live Flights) · **v0.18.0** prep (Live Hotels)  
**Milestones:** **11** ✅ Live Flights · **12** ✅ Hotel Search Integration (release tagging next). See [releases/v0.17.0.md](./releases/v0.17.0.md) · [../CHANGELOG.md](../CHANGELOG.md)

---

## Tech stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.2.9 |
| Language | TypeScript | 5.x |
| UI library | React | 19.2.4 |
| Styling | Tailwind CSS | 4.x |
| Linting | ESLint + eslint-config-next | 9.x |
| Font | Geist Sans / Geist Mono (via next/font) | — |

| Auth & database | Supabase | — |

Supabase handles Google OAuth, email/password auth, session cookies, and the `saved_trips` table.

---

## Project structure

```
Gloconn/
├── app/                    # Next.js App Router pages and global styles
│   ├── layout.tsx          # Root layout (wraps all pages in AppShell)
│   ├── page.tsx            # Home page
│   ├── search/
│   │   └── results/
│   │       └── page.tsx    # Search results (live or mock via providers)
│   └── globals.css         # Global CSS, brand colors, typography
├── components/
│   ├── home/               # Home page sections (HeroSection)
│   ├── layout/             # Site shell (AppShell, Navbar, Footer, BrandLogo)
│   ├── results/            # Search results feature (cards, filters, sort)
│   ├── search/             # Search form feature
│   │   ├── BudgetSelector.tsx
│   │   ├── DestinationAutocomplete.tsx
│   │   ├── SearchCard.tsx          # Card wrapper + heading (home page)
│   │   ├── SearchCardContainer.tsx # URL hydration for edit-search flow
│   │   ├── SearchForm.tsx          # Presentational form (UI only)
│   │   ├── SearchFormSection.tsx   # Grouped section + divider primitives
│   │   ├── SearchFormWithState.tsx # Hook + SearchForm convenience wrapper
│   │   ├── TravelDatesSelector.tsx
│   │   ├── TravelersSelector.tsx
│   │   └── TravelStyleSelector.tsx
│   └── ui/                 # Generic reusable UI (Button, Card, BudgetSlider, TravelCalendar, …)
├── hooks/                  # Custom React hooks (useSearchForm, useRecentDestinationSearches)
├── lib/
│   ├── config/             # Centralized env config (getAppConfig)
│   │   ├── load.ts         # Reads process.env into typed AppConfig
│   │   ├── validate.ts     # Required keys + warnings
│   │   └── parse.ts        # readEnv, readBooleanEnv helpers
│   ├── api/                # Env re-exports, errors, types, validation, HTTP responses
│   │   ├── errors.ts       # ApiError + factories (validation, provider, unknown)
│   │   ├── types.ts        # ServiceResult, ServiceState, runService()
│   │   ├── responses.ts    # ApiResponse, toJsonResponse() for Route Handlers
│   │   └── validation.ts   # validateSearchRequest()
│   ├── auth/               # Supabase clients, session helpers, middleware
│   ├── providers/          # Provider adapters (mock + external APIs)
│   │   ├── core/           # Interfaces, registry, factories (provider selection)
│   │   ├── destinations/ # mock ✅, google-maps (planned)
│   │   ├── search/         # Deprecated monolithic provider
│   │   ├── hotels/         # mock ✅, serpapi/ ✅ (live, v0.18.0 prep), booking (stub → mock)
│   │   ├── flights/        # mock ✅, serpapi/ ✅ (live, production-capable, v0.17.0), amadeus/ ✅ (long-term Enterprise)
│   │   ├── ground/         # mock ✅, omio (planned)
│   │   └── mock/           # Shared mock helpers (filter, pricing)
│   ├── services/           # Service layer — trip search is server-only
│   │   ├── context.ts      # getServiceProviders / setServiceProviders (DI)
│   │   ├── destinationService.ts
│   │   ├── searchService.ts       # server-only — called from POST /api/search
│   │   ├── iataResolution.ts      # Enrich SearchRequest with optional IATA codes
│   │   └── searchOrchestrator.ts  # Enrichment + flight IATA validation + providers
│   ├── trips/              # Saved trip queries and server actions
│   ├── budget/             # Currency options, limits, and budget formatting
│   ├── calendar/           # Date helpers for the travel calendar
│   ├── destinations.ts     # Backward-compatible destination re-exports
│   ├── destinations/       # Recent-search persistence (localStorage)
│   ├── results/            # Mock result data, filter, and sort helpers
│   ├── search/             # Search feature logic (split by responsibility)
│   │   ├── constants.ts    # Travel style and trip type options
│   │   ├── dates.ts        # Travel dates summary label
│   │   ├── travelers.ts    # Backward-compatible aliases for passengers helpers
│   │   ├── passengers.ts   # Passengers summary, limits, validation
│   │   ├── validation.ts   # Form validation
│   │   ├── request.ts      # SearchRequest builder (form → model → URL / API)
│   │   ├── payload.ts      # Legacy SearchData from form (delegates to request.ts)
│   │   ├── params.ts       # URL query param serialization for results
│   │   └── index.ts        # Public exports for the search feature
│   ├── navigation.ts       # Nav and footer link config
│   ├── styles.ts           # Shared Tailwind class strings
│   └── utils.ts            # General helpers
├── types/
│   ├── search-form.ts      # Form state, errors, actions, controller types
│   ├── models/             # Shared provider-independent domain models
│   │   ├── hotel.ts, flight.ts, bus.ts, train.ts
│   │   ├── destination.ts, restaurant.ts, attraction.ts
│   │   ├── traveler.ts, budget.ts
│   │   ├── search-request.ts, search-response.ts
│   │   └── index.ts
│   ├── search.ts           # SearchData payload; re-exports from search-form
│   ├── results.ts          # SearchResult union (models + type discriminator)
│   ├── destination.ts      # Re-export from models
│   ├── search-response.ts  # Re-export from models
│   └── index.ts            # Re-exports (import from @/types)
├── app/api/                # HTTP Route Handlers
│   └── search/route.ts     # POST /api/search — validated trip search
├── docs/                   # Project documentation (this folder)
└── public/                 # Static assets (reserved for future use)
```

---

## Current features

### Layout
- Sticky navigation bar with `BrandLogo` and links (Home, Destinations, My Trips, About)
- Responsive mobile hamburger menu
- Footer with link groups and copyright
- Consistent page width via `PageContainer`

### Home page
- Hero section with `SectionHeading`, subtitle, and centered search card
- Modern travel-themed design (brand blues, soft gradients, rounded cards)

### Search form (UI + client logic)
- **Architecture** — `useSearchForm` (logic) → `SearchForm` (UI) → `SearchCard` (home page chrome)
- **Layout** — grouped sections (Where, When, Trip details, Preferences) with responsive grids and dividers
- **From** — required origin autocomplete (departure city)
- **Destination** — required autocomplete via `destinationService` (mock provider by default)
- **Dates** — required travel calendar with round-trip / one-way toggle; return date required for round-trip
- **Travelers & rooms** — required dropdown with Adults, Children, Infants, and Rooms steppers
- **Budget** — required numeric input with currency selector (€0–€10,000)
- **Search for** — toggle stays, flights, and ground transport result types
- **Travel style** — Budget / Standard / Luxury radio group
- Submit builds a canonical `SearchRequest` via `lib/search/request.ts`
- Successful searches navigate to `/search/results` with URL query params

### Search results (providers via service layer)
- **Route:** `/search/results` — reads search criteria from URL query params
- **Data:** `postSearchTrips()` → `POST /api/search` → server `searchTrips()` / orchestrator
- **Live Flight Search:** SerpAPI when `FLIGHTS_PROVIDER=serpapi` (v0.17.0, production-capable)
- **Live Hotel Search:** SerpAPI when `HOTELS_PROVIDER=serpapi` (Milestone 12, production-capable when configured)
- **Cards:** Hotel, flight, bus, and train result cards
- **Filters / sorting / ranking:** Milestone 10 client quality + performance
- Buses / trains remain **mock** until a future milestone

### Live Flights (v0.17.0)
- Multi-provider `FlightsProvider`: mock · **serpapi** · amadeus
- Unified `Flight` model; SerpAPI maps full date-time and currencies
- Amadeus remains the long-term Enterprise flights path

### Live Hotels (Milestone 12 — v0.18.0 prep)
- Multi-provider `HotelsProvider`: mock · **serpapi** · booking (stub → mock)
- Unified `Hotel` model; SerpAPI Google Hotels maps price, rating, stars, amenities, nights
- Shared `SERPAPI_API_KEY` with flights; mock remains default

### Reusable UI primitives
- `Button`, `Card`, `InputField`, `FormField` (label + error)
- `BudgetSelector` — numeric budget input with € prefix and currency selector
- `BudgetSlider` — reusable range control (available; search form uses the numeric input)
- `Autocomplete` — generic accessible combobox (keyboard navigation, listbox)
- `TravelCalendar` — reusable date picker with single or range selection
- `NumberStepper` — +/- counter for bounded numeric values
- `PassengersSelector` — reusable dropdown for adults, children, infants, and rooms
- `SectionHeading` — consistent titles for heroes, cards, and sections
- `BrandLogo` — shared Glooconn wordmark for navbar and footer

---

## Pages and routes

| Route | Status | Description |
|-------|--------|-------------|
| `/` | ✅ Live | Home page with hero and search card |
| `/search/results` | ✅ Live | Search results; live flights and hotels when SerpAPI configured |
| `/destinations` | ⏳ Planned | Destination browsing (nav link exists, page not built) |
| `/my-trips` | ✅ Live | Saved trips list (protected, Supabase) |
| `/profile` | ✅ Live | User profile (protected) |
| `/login`, `/signup` | ✅ Live | Google and email authentication |
| `/about` | ⏳ Planned | About Glooconn (nav link exists, page not built) |

---

## Development commands

```bash
npm run dev         # Start development server → http://localhost:3000
npm run build       # Production build
npm run start       # Run production build locally
npm run lint        # Run ESLint
npm run typecheck   # TypeScript check
npm test            # Automated tests (317)
```

### Windows note
If PowerShell blocks `npm`, use `npm.cmd run dev` or set execution policy:
`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## Coding standards

See `PROJECT_RULES.md` in the project root for AI and developer guidelines. Key principles:

- Small, incremental changes
- TypeScript + Next.js App Router + Tailwind CSS
- Reusable components
- Beginner-friendly explanations
- Commit and push after each completed task

---

## Related documentation

| File | Purpose |
|------|---------|
| [ROADMAP.md](./ROADMAP.md) | Planned features by phase |
| [PROGRESS.md](./PROGRESS.md) | Week-by-week completed work |
| [TODO.md](./TODO.md) | Active and upcoming tasks |
| [DECISIONS.md](./DECISIONS.md) | Architecture and design decisions |
| [API_FOUNDATION.md](./API_FOUNDATION.md) | API layers, provider swap guide, naming |
| [Provider_Guide.md](./Provider_Guide.md) | How to add flights and hotels vendors |
| [AI_HANDOFF.md](./AI_HANDOFF.md) | Context for AI assistants continuing the project |
| [CURRENT_STATE.md](./CURRENT_STATE.md) | Latest release snapshot and active focus |
| [releases/v0.17.0.md](./releases/v0.17.0.md) | v0.17.0 Live Flights release |
| [releases/v0.16.0.md](./releases/v0.16.0.md) | v0.16.0 Milestone 10 Search Experience |
| [releases/v0.15.0.md](./releases/v0.15.0.md) | v0.15.0 multi-provider / SerpAPI adapter |
| [../CHANGELOG.md](../CHANGELOG.md) | Release history |
| [SPRINT_11_3_PRODUCTION_READINESS.md](./SPRINT_11_3_PRODUCTION_READINESS.md) | Milestone 11 readiness gate |
| [SPRINT_12_3_VALIDATION.md](./SPRINT_12_3_VALIDATION.md) | Milestone 12 live hotels validation |
| [SPRINT_12_4_PRODUCTION_READINESS.md](./SPRINT_12_4_PRODUCTION_READINESS.md) | Milestone 12 hotels hardening |
| [../PROJECT_PRINCIPLES.md](../PROJECT_PRINCIPLES.md) | Mission, vision, and decision-making rules |
