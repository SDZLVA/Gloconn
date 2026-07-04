# Glooconn

Travel planning web application — discover destinations, plan trips, and manage travel in one place.

**Repository:** [github.com/SDZLVA/Gloconn](https://github.com/SDZLVA/Gloconn)  
**Version:** 0.4.0 (Authentication — Google & email login, saved trips)

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

## Project structure

```
Gloconn/
├── app/                    # Routes and global styles
├── components/
│   ├── home/               # Home page sections
│   ├── layout/             # Shell, navbar, footer, brand
│   ├── auth/               # Login forms, Google sign-in, user menu
│   ├── search/             # Search form feature
│   ├── results/            # Search results cards, filters, sorting
│   ├── trips/              # Saved trips list and save button
│   └── ui/                 # Reusable UI primitives
├── hooks/                  # Custom React hooks (useAuth, useSearchForm, …)
├── lib/
│   ├── auth/               # Supabase clients, session helpers, middleware
│   ├── trips/              # Saved trips queries and server actions
│   ├── navigation.ts       # Nav and footer link config
│   ├── styles.ts           # Shared Tailwind class strings
│   └── utils.ts            # General helpers (e.g. cn)
├── types/
│   ├── search.ts           # Search-related types
│   ├── results.ts          # Search result types
│   └── index.ts            # Re-exports all types
└── docs/                   # Full project documentation
```

## Documentation

| File | Purpose |
|------|---------|
| [docs/PROJECT.md](./docs/PROJECT.md) | Overview, features, routes |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Planned features by phase |
| [docs/PROGRESS.md](./docs/PROGRESS.md) | Completed work log |
| [docs/TODO.md](./docs/TODO.md) | Active task list |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | Architecture decisions |
| [docs/AI_HANDOFF.md](./docs/AI_HANDOFF.md) | Guide for AI assistants |
| [PROJECT_RULES.md](./PROJECT_RULES.md) | Development guidelines |

## Current status

- **Live routes:** `/`, `/search/results`, `/login`, `/signup`, `/profile`, `/my-trips`
- **Auth:** Google OAuth and email/password via Supabase; protected `/profile` and `/my-trips`
- **Search card:** Destination autocomplete, passengers & rooms, dates, budget, travel style → results
- **Saved trips:** Save from search results; view and remove on My Trips
- **Planned routes:** `/destinations`, `/about`

See [docs/TODO.md](./docs/TODO.md) for next tasks.
