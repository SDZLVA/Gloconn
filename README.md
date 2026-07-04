# Glooconn

Travel planning web application — discover destinations, plan trips, and manage travel in one place.

**Repository:** [github.com/SDZLVA/Gloconn](https://github.com/SDZLVA/Gloconn)  
**Version:** 0.2.0 (Search card improvements — autocomplete, passengers & calendar)

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Linting | ESLint + eslint-config-next |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
│   ├── search/             # Search form feature
│   │   ├── DestinationAutocomplete.tsx
│   │   ├── SearchCard.tsx
│   │   ├── TravelersSelector.tsx
│   │   └── TravelStyleSelector.tsx
│   └── ui/                 # Reusable UI primitives
│       ├── Autocomplete.tsx
│       ├── NumberStepper.tsx
│       ├── PassengersSelector.tsx
│       └── …
├── hooks/                  # Custom React hooks
├── lib/
│   ├── destinations.ts     # Mock destination data (autocomplete)
│   ├── search/             # Search validation, payload, passengers, constants
│   ├── navigation.ts       # Nav and footer link config
│   ├── styles.ts           # Shared Tailwind class strings
│   └── utils.ts            # General helpers (e.g. cn)
├── types/
│   ├── search.ts           # Search-related types
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

- **Live route:** `/` (home page with enhanced search card)
- **Search card:** Destination autocomplete, passengers & rooms selector, dates, budget, travel style
- **Planned routes:** `/destinations`, `/my-trips`, `/about`
- **Backend / APIs:** None yet

See [docs/TODO.md](./docs/TODO.md) for next tasks.
